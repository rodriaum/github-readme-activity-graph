import { NextFunction, Request, Response } from 'express';
import { invalidUserSvg } from './svgs';

interface RateLimitEntry {
    windowStartedAt: number;
    count: number;
}

const WINDOW_MS = 60_000;
const USER_REQUESTS_PER_WINDOW = 30;
const ORGANIZATION_REQUESTS_PER_WINDOW = 3;
const MAX_TRACKED_CLIENTS = 10_000;

const requests = new Map<string, RateLimitEntry>();
let requestsSinceCleanup = 0;

/**
 * Process-local protection against repeated expensive graph generation.
 * On serverless platforms use the provider's shared rate limiter or Redis
 * as an additional layer because each instance has its own memory.
 */
export const rateLimitGraphRequests = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    const now = Date.now();
    const isOrganizationRequest =
        typeof req.query.organization === 'string' &&
        req.query.organization.trim().length > 0;
    const scope = isOrganizationRequest ? 'organization' : 'user';
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${scope}:${clientIp}`;
    const maxRequests = isOrganizationRequest
        ? ORGANIZATION_REQUESTS_PER_WINDOW
        : USER_REQUESTS_PER_WINDOW;

    requestsSinceCleanup += 1;
    if (requestsSinceCleanup >= 100) {
        requestsSinceCleanup = 0;
        for (const [entryKey, entry] of requests.entries()) {
            if (now - entry.windowStartedAt >= WINDOW_MS) {
                requests.delete(entryKey);
            }
        }
    }

    let entry = requests.get(key);
    if (!entry || now - entry.windowStartedAt >= WINDOW_MS) {
        if (!entry && requests.size >= MAX_TRACKED_CLIENTS) {
            const oldestKey = requests.keys().next().value;
            if (oldestKey) requests.delete(oldestKey);
        }
        entry = { windowStartedAt: now, count: 0 };
        requests.set(key, entry);
    }

    entry.count += 1;
    if (entry.count > maxRequests) {
        const retryAfter = Math.max(
            1,
            Math.ceil((entry.windowStartedAt + WINDOW_MS - now) / 1000),
        );

        res.setHeader('Retry-After', String(retryAfter));
        res.setHeader('Cache-Control', 'no-store, max-age=0');

        if (req.path === '/graph') {
            res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'");
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.status(429).type('image/svg+xml').send(
                invalidUserSvg('Rate limit exceeded. Please try again later.'),
            );
            return;
        }

        res.status(429).json({
            error: 'Rate limit exceeded. Please try again later.',
            retryAfter,
        });
        return;
    }

    next();
};
