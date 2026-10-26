import { createHmac, timingSafeEqual } from 'crypto';
import { UserDetails } from './interfaces/interface';

export interface PrivateShareData extends UserDetails {
    subject: string;
    type: 'user' | 'organization';
}

const shareSecret = (): string => {
    const secret = process.env.PRIVATE_SHARE_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error('PRIVATE_SHARE_SECRET must be configured with at least 32 characters.');
    }
    return secret;
};

export const createPrivateShareToken = (
    data: UserDetails,
    subject: string,
    type: 'user' | 'organization',
): string => {
    const payload = Buffer.from(
        JSON.stringify({
            name: data.name,
            contributions: data.contributions,
            subject,
            type,
        }),
    ).toString('base64url');
    const signature = createHmac('sha256', shareSecret()).update(payload).digest('base64url');
    return `${payload}.${signature}`;
};

export const readPrivateShareToken = (value?: string): PrivateShareData | undefined => {
    if (!value || value.length > 16000) return undefined;
    const [payload, signature, extra] = value.split('.');
    if (!payload || !signature || extra) return undefined;

    try {
        const expected = createHmac('sha256', shareSecret()).update(payload).digest();
        const actual = Buffer.from(signature, 'base64url');
        if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return undefined;

        const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as PrivateShareData;
        if (
            typeof parsed.name !== 'string' ||
            typeof parsed.subject !== 'string' ||
            !['user', 'organization'].includes(parsed.type) ||
            !Array.isArray(parsed.contributions) ||
            parsed.contributions.length > 90 ||
            !parsed.contributions.every(
                (day) =>
                    typeof day.date === 'string' &&
                    typeof day.contributionCount === 'number' &&
                    Number.isFinite(day.contributionCount) &&
                    day.contributionCount >= 0,
            )
        ) {
            return undefined;
        }

        return parsed;
    } catch {
        return undefined;
    }
};
