import crypto from 'crypto';
import { UserDetails } from './interfaces/interface';

interface CacheItem {
    value: UserDetails;
    expiresAt: number;
}

const cache = new Map<string, CacheItem>();
const TTL_MS = 10 * 60 * 1000;
const MAX_ENTRIES = 500;

export function privateCacheKey(
    ownerId: number,
    target: string,
    organization: boolean,
    days: number,
    from?: string,
    to?: string,
): string {
    return crypto
        .createHash('sha256')
        .update(
            JSON.stringify([
                ownerId,
                target.toLowerCase(),
                organization,
                days,
                from || '',
                to || '',
            ]),
        )
        .digest('hex');
}

export function getPrivateCache(key: string): UserDetails | null {
    const item = cache.get(key);

    if (!item) {
        return null;
    }

    if (item.expiresAt <= Date.now()) {
        cache.delete(key);
        return null;
    }

    return item.value;
}

export function setPrivateCache(key: string, value: UserDetails): void {
    if (cache.size >= MAX_ENTRIES) {
        const oldestKey = cache.keys().next().value;

        if (oldestKey) {
            cache.delete(oldestKey);
        }
    }

    cache.set(key, { value, expiresAt: Date.now() + TTL_MS });
}
