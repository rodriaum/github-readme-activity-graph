import axios from 'axios';
import crypto from 'crypto';
import { Request, Response } from 'express';
import { Collection, MongoClient } from 'mongodb';

interface OAuthUser { githubId: number; login: string; accessToken: string; updatedAt: Date; }
interface StoredOAuthUser extends OAuthUser { tokenEncrypted?: boolean; }
interface OAuthSession { sessionId: string; githubId: number; csrfToken: string; expiresAt: Date; }
let clientPromise: Promise<MongoClient> | undefined;

async function getCollection<T extends object>(name: string): Promise<Collection<T>> {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not configured.');
    if (!clientPromise) {
        const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
        clientPromise = client.connect().catch((error) => { clientPromise = undefined; throw error; });
    }
    return (await clientPromise).db(process.env.MONGODB_DATABASE || 'activity_graph').collection<T>(name);
}
function cookie(name: string, value: string, maxAge: number): string {
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}
function readCookies(req: Request): Record<string, string> {
    const result: Record<string, string> = {};
    for (const part of (req.headers.cookie || '').split(';')) {
        const index = part.indexOf('=');
        if (index < 0) continue;
        const key = part.slice(0, index).trim();
        try { result[key] = decodeURIComponent(part.slice(index + 1).trim()); } catch { /* Ignore malformed cookies. */ }
    }
    return result;
}
function secureEquals(left: string, right: string): boolean {
    const a = Buffer.from(left); const b = Buffer.from(right);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}
export async function beginOAuth(_req: Request, res: Response): Promise<void> {
    const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
    const callbackUrl = process.env.OAUTH_CALLBACK_URL;
    if (!clientId || !callbackUrl) { res.status(503).send('Private activity login is not configured.'); return; }
    const state = crypto.randomBytes(32).toString('hex');
    res.setHeader('Cache-Control', 'no-store'); res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Set-Cookie', cookie('activity_oauth_state', state, 600));
    const target = new URL('https://github.com/login/oauth/authorize');
    target.searchParams.set('client_id', clientId); target.searchParams.set('redirect_uri', callbackUrl);
    target.searchParams.set('scope', 'read:user,repo,read:org'); target.searchParams.set('state', state);
    // GitHub OAuth Apps use state for callback binding; PKCE is not consistently supported for OAuth Apps.
    res.redirect(302, target.toString());
}
export async function finishOAuth(req: Request, res: Response): Promise<void> {
    const cookies = readCookies(req);
    const state = typeof req.query.state === 'string' ? req.query.state : '';
    const code = typeof req.query.code === 'string' ? req.query.code : '';
    res.setHeader('Cache-Control', 'no-store'); res.setHeader('Referrer-Policy', 'no-referrer');
    const clearState = cookie('activity_oauth_state', '', 0);
    if (!state || !code || !cookies.activity_oauth_state || !secureEquals(state, cookies.activity_oauth_state)) {
        res.setHeader('Set-Cookie', clearState); res.status(400).send('Invalid OAuth callback. Please retry login.'); return;
    }
    const clientId = process.env.GITHUB_OAUTH_CLIENT_ID; const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
    const callbackUrl = process.env.OAUTH_CALLBACK_URL;
    if (!clientId || !clientSecret || !callbackUrl) {
        res.setHeader('Set-Cookie', clearState); res.status(503).send('Private activity login is not configured.'); return;
    }
    try {
        const tokenResult = await axios.post('https://github.com/login/oauth/access_token',
            new URLSearchParams({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: callbackUrl }).toString(),
            { headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 10000 });
        const accessToken = tokenResult.data?.access_token;
        if (typeof accessToken !== 'string' || !accessToken) throw new Error('GitHub did not return an access token.');
        const profile = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github+json' }, timeout: 10000,
        });
        const githubId = Number(profile.data?.id); const login = profile.data?.login;
        if (!Number.isSafeInteger(githubId) || githubId <= 0 || typeof login !== 'string' || !/^[a-zA-Z0-9-]{1,39}$/.test(login)) {
            throw new Error('GitHub returned an invalid profile.');
        }
        const tokenKey = process.env.OAUTH_TOKEN_ENCRYPTION_KEY; let storedToken = accessToken; let tokenEncrypted = false;
        if (tokenKey) {
            const key = crypto.createHash('sha256').update(tokenKey).digest(); const iv = crypto.randomBytes(12);
            const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
            const encrypted = Buffer.concat([cipher.update(accessToken, 'utf8'), cipher.final()]);
            storedToken = `enc:v1:${iv.toString('base64url')}:${cipher.getAuthTag().toString('base64url')}:${encrypted.toString('base64url')}`;
            tokenEncrypted = true;
        } else if (process.env.NODE_ENV === 'production') throw new Error('OAUTH_TOKEN_ENCRYPTION_KEY is required in production.');
        await (await getCollection<StoredOAuthUser>('oauth_users')).updateOne(
            { githubId }, { $set: { githubId, login, accessToken: storedToken, updatedAt: new Date(), tokenEncrypted } }, { upsert: true });
        const sessionId = crypto.randomBytes(32).toString('base64url'); const csrfToken = crypto.randomBytes(32).toString('base64url');
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await (await getCollection<OAuthSession>('oauth_sessions')).insertOne({ sessionId, githubId, csrfToken, expiresAt });
        await (await getCollection<OAuthSession>('oauth_sessions')).createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
        res.append('Set-Cookie', clearState);
        res.append('Set-Cookie', cookie('activity_session', sessionId, 30 * 24 * 60 * 60));
        res.redirect(302, '/');
    } catch (error) {
        console.error('GitHub OAuth callback failed:', error instanceof Error ? error.message : 'unknown error');
        res.setHeader('Set-Cookie', clearState); res.status(502).send('Could not authenticate with GitHub. Please try again.');
    }
}
function decryptToken(storedToken: string): string {
    if (!storedToken.startsWith('enc:v1:')) return storedToken;
    const tokenKey = process.env.OAUTH_TOKEN_ENCRYPTION_KEY;
    if (!tokenKey) throw new Error('OAUTH_TOKEN_ENCRYPTION_KEY is not configured.');
    const [, , ivPart, tagPart, encryptedPart] = storedToken.split(':');
    const key = crypto.createHash('sha256').update(tokenKey).digest();
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ivPart, 'base64url'), key);
    decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));
    return Buffer.concat([decipher.update(Buffer.from(encryptedPart, 'base64url')), decipher.final()]).toString('utf8');
}
export async function getSessionUser(req: Request): Promise<{ githubId: number; login: string; accessToken: string; csrfToken: string } | null> {
    const sessionId = readCookies(req).activity_session;
    if (!sessionId || !/^[A-Za-z0-9_-]{40,64}$/.test(sessionId)) return null;
    const session = await (await getCollection<OAuthSession>('oauth_sessions')).findOne({ sessionId, expiresAt: { $gt: new Date() } });
    if (!session) return null;
    const user = await (await getCollection<StoredOAuthUser>('oauth_users')).findOne({ githubId: session.githubId });
    if (!user) return null;
    return { githubId: user.githubId, login: user.login, accessToken: decryptToken(user.accessToken), csrfToken: session.csrfToken };
}
export async function authStatus(req: Request, res: Response): Promise<void> {
    res.setHeader('Cache-Control', 'no-store');
    try { const user = await getSessionUser(req); res.json(user ? { authenticated: true, login: user.login, csrfToken: user.csrfToken } : { authenticated: false }); }
    catch { res.status(503).json({ authenticated: false, error: 'Authentication storage unavailable.' }); }
}
export async function logout(req: Request, res: Response): Promise<void> {
    res.setHeader('Cache-Control', 'no-store');
    try {
        const user = await getSessionUser(req); const csrf = req.headers['x-csrf-token']; const origin = req.headers.origin;
        const expectedOrigin = process.env.APP_ORIGIN;
        if (!user || typeof csrf !== 'string' || !secureEquals(csrf, user.csrfToken) || (expectedOrigin && origin && origin !== expectedOrigin)) {
            res.status(403).json({ error: 'Invalid session or CSRF token.' }); return;
        }
        const sessionId = readCookies(req).activity_session;
        await (await getCollection<OAuthSession>('oauth_sessions')).deleteOne({ sessionId });
        res.setHeader('Set-Cookie', cookie('activity_session', '', 0)); res.status(200).json({ authenticated: false });
    } catch { res.status(503).json({ error: 'Could not log out safely. Please retry.' }); }
}
export async function getPrivateAccess(req: Request): Promise<{ githubId: number; login: string; accessToken: string } | null> {
    try { const user = await getSessionUser(req); return user ? { githubId: user.githubId, login: user.login, accessToken: user.accessToken } : null; }
    catch { return null; }
}
