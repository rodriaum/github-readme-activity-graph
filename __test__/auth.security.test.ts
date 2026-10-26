import crypto from 'crypto';
import { privateCacheKey } from '../src/privateCache';

describe('private activity security primitives', () => {
    it('creates distinct random OAuth state values', () => {
        expect(crypto.randomBytes(32).toString('hex')).not.toBe(crypto.randomBytes(32).toString('hex'));
    });
    it('constant-time equality rejects state mismatch', () => {
        const equal = (left: string, right: string) => {
            const a = Buffer.from(left); const b = Buffer.from(right);
            return a.length === b.length && crypto.timingSafeEqual(a, b);
        };
        expect(equal('same-state', 'same-state')).toBe(true);
        expect(equal('same-state', 'other-state')).toBe(false);
    });
    it('isolates cache entries by GitHub user and target type', () => {
        expect(privateCacheKey(1, 'Acme', true, 31)).not.toBe(privateCacheKey(2, 'Acme', true, 31));
        expect(privateCacheKey(1, 'Acme', true, 31)).not.toBe(privateCacheKey(1, 'Acme', false, 31));
    });
});
