import axios from 'axios';
import { createCipheriv, createDecipheriv, randomBytes, createHash, timingSafeEqual } from 'crypto';
import { Request, Response } from 'express';

const ACCESS_COOKIE = 'github_private_access';
const STATE_COOKIE = 'github_oauth_state';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = (maxAge: number) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
});

const cookieValue = (request: Request, name: string): string | undefined => {
    const cookies = request.headers.cookie?.split(';') ?? [];
    const prefix = `${name}=`;
    const entry = cookies.map((item) => item.trim()).find((item) => item.startsWith(prefix));
    return entry ? decodeURIComponent(entry.slice(prefix.length)) : undefined;
};

const cookieSecret = (): Buffer => {
    const secret = process.env.OAUTH_COOKIE_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error('OAUTH_COOKIE_SECRET must be configured with at least 32 characters.');
    }
    return createHash('sha256').update(secret).digest();
};

const encryptToken = (token: string): string => {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', cookieSecret(), iv);
    const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
    return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64url');
};

const decryptToken = (value?: string): string | undefined => {
    if (!value) return undefined;
    try {
        const payload = Buffer.from(value, 'base64url');
        if (payload.length < 29) return undefined;
        const decipher = createDecipheriv('aes-256-gcm', cookieSecret(), payload.subarray(0, 12));
        decipher.setAuthTag(payload.subarray(12, 28));
        return Buffer.concat([decipher.update(payload.subarray(28)), decipher.final()]).toString('utf8');
    } catch {
        return undefined;
    }
};

const appUrl = (request: Request): string =>
    (process.env.APP_URL || `${request.protocol}://${request.get('host')}`).replace(/\/$/, '');

const callbackUrl = (request: Request): string => `${appUrl(request)}/auth/github/callback`;

const redirectWithError = (response: Response, message: string): void => {
    response.redirect(`/?private_access_error=${encodeURIComponent(message)}`);
};

export const getOAuthToken = (request: Request): string | undefined =>
    decryptToken(cookieValue(request, ACCESS_COOKIE));

export class GitHubOAuth {
    public start(request: Request, response: Response): void {
        const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
        if (!clientId) {
            response.status(503).send('GitHub OAuth is not configured. Set GITHUB_OAUTH_CLIENT_ID, GITHUB_OAUTH_CLIENT_SECRET, APP_URL, and OAUTH_COOKIE_SECRET.');
            return;
        }

        try {
            const state = randomBytes(32).toString('hex');
            response.cookie(STATE_COOKIE, state, cookieOptions(10 * 60 * 1000));
            const authorize = new URL('https://github.com/login/oauth/authorize');
            authorize.searchParams.set('client_id', clientId);
            authorize.searchParams.set('redirect_uri', callbackUrl(request));
            authorize.searchParams.set('scope', 'read:user repo');
            authorize.searchParams.set('state', state);
            response.redirect(authorize.toString());
        } catch (error) {
            console.error('Failed to start GitHub OAuth:', error);
            response.status(500).send('Unable to start GitHub authorization.');
        }
    }

    public async callback(request: Request, response: Response): Promise<void> {
        const { code, state, error } = request.query;
        const savedState = cookieValue(request, STATE_COOKIE);
        response.clearCookie(STATE_COOKIE, { ...cookieOptions(0), maxAge: undefined });

        if (error) {
            redirectWithError(response, 'GitHub authorization was cancelled.');
            return;
        }
        if (typeof code !== 'string' || typeof state !== 'string' || !savedState) {
            redirectWithError(response, 'GitHub authorization response was incomplete.');
            return;
        }

        const provided = Buffer.from(state);
        const expected = Buffer.from(savedState);
        if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
            redirectWithError(response, 'GitHub authorization state did not match. Please try again.');
            return;
        }

        const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
        const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
        if (!clientId || !clientSecret) {
            redirectWithError(response, 'GitHub OAuth is not configured on this deployment.');
            return;
        }

        try {
            const tokenResponse = await axios.post(
                'https://github.com/login/oauth/access_token',
                { client_id: clientId, client_secret: clientSecret, code },
                { headers: { Accept: 'application/json' }, timeout: 10000 },
            );
            const token = tokenResponse.data?.access_token;
            if (typeof token !== 'string' || !token) {
                redirectWithError(response, 'GitHub did not return an access token.');
                return;
            }

            await axios.get('https://api.github.com/user', {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
                timeout: 10000,
            });

            response.cookie(ACCESS_COOKIE, encryptToken(token), cookieOptions(COOKIE_MAX_AGE));
            response.redirect('/?private_access=connected');
        } catch (caught) {
            console.error('GitHub OAuth callback failed:', caught);
            redirectWithError(response, 'Unable to complete GitHub authorization.');
        }
    }

    public status(request: Request, response: Response): void {
        response.setHeader('Cache-Control', 'no-store');
        response.json({ authenticated: Boolean(getOAuthToken(request)) });
    }

    public logout(_request: Request, response: Response): void {
        response.clearCookie(ACCESS_COOKIE, { ...cookieOptions(0), maxAge: undefined });
        response.redirect('/');
    }
}
