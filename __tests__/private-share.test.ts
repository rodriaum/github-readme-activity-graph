import { createPrivateShareToken, readPrivateShareToken } from '../src/private-share';

describe('private activity share tokens', () => {
    beforeEach(() => {
        process.env.PRIVATE_SHARE_SECRET = 'test-private-share-secret-with-at-least-32-characters';
    });

    afterEach(() => {
        delete process.env.PRIVATE_SHARE_SECRET;
    });

    it('round-trips contribution counts without exposing an OAuth token', () => {
        const data = {
            name: 'StudioLoad',
            contributions: [
                { date: '26', contributionCount: 7 },
                { date: '27', contributionCount: 2 },
            ],
        };

        const token = createPrivateShareToken(data, 'StudioLoad', 'organization');
        const decoded = readPrivateShareToken(token);

        expect(decoded).toEqual({
            ...data,
            subject: 'StudioLoad',
            type: 'organization',
        });
        expect(token).not.toContain('access_token');
    });

    it('rejects a modified token', () => {
        const token = createPrivateShareToken(
            { name: 'rodriaum', contributions: [{ date: '26', contributionCount: 3 }] },
            'rodriaum',
            'user',
        );
        const changedToken = token.slice(0, -1) + (token.endsWith('A') ? 'B' : 'A');

        expect(readPrivateShareToken(changedToken)).toBeUndefined();
    });

    it('rejects tokens that exceed the allowed length', () => {
        expect(readPrivateShareToken('a'.repeat(16001))).toBeUndefined();
    });
});
