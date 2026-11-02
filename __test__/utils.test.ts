import express from 'express';
import request from 'supertest';
import { Utilities, isValidGitHubLogin } from '../src/utils';
import { fakeQueryString, fakeQueryStringRes, options } from './fakeInputs';
import { Handlers } from '../src/handlers';
import { createGraph } from '../src/createChart';
import { Fetcher } from '../src/fetcher';

describe('Utilities Test', () => {
    const handlers = new Handlers();

    beforeEach(() => {
        jest.spyOn(Fetcher.prototype, 'fetchContributions').mockResolvedValue({
            name: 'Test User',
            contributions: [{ date: '1', contributionCount: 1 }],
        });
        jest.spyOn(Utilities.prototype, 'buildGraph').mockImplementation(async (data) => ({
            finalGraph: '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
            header: {
                maxAge: typeof data === 'object'
                    ? 'public, max-age=1800'
                    : 'no-store, max-age=0',
            },
        }));
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('Query Options', () => {
        expect(
            fakeQueryString.map((arg) => {
                const utils = new Utilities(arg);
                return utils.queryOptions();
            }),
        ).toEqual(fakeQueryStringRes);
    });

    it('falls back to a safe range when custom dates exceed the allowed window', () => {
        const queryOptions = new Utilities({
            username: 'rodriaum',
            from: '2025-01-01',
            to: '2025-12-31',
        }).queryOptions();

        expect(queryOptions.from).toBe('');
        expect(queryOptions.to).toBe('');
        expect(queryOptions.days).toBe(31);
    });

    it('validates GitHub logins before making upstream requests', () => {
        expect(isValidGitHubLogin('rodriaum')).toBe(true);
        expect(isValidGitHubLogin('valid-org-123')).toBe(true);
        expect(isValidGitHubLogin('')).toBe(false);
        expect(isValidGitHubLogin('-invalid')).toBe(false);
        expect(isValidGitHubLogin('invalid-')).toBe(false);
        expect(isValidGitHubLogin('name/other')).toBe(false);
    });

    it('rejects non-hex custom colors and clamps custom titles', () => {
        const utils = new Utilities({
            username: 'rodriaum',
            bg_color: 'fff" onload="alert(1)',
            custom_title: '<script>alert(1)</script>'.repeat(20),
        });
        const queryOptions = utils.queryOptions();

        expect(queryOptions.colors.bgColor).toBe('ffcfe9');
        expect(queryOptions.custom_title).toHaveLength(120);
    });

    const fakeServer = () => {
        const app = express();
        app.use(express.urlencoded({ extended: false }));
        return app;
    };

    describe('GET /graph with valid username', () => {
        test('returns an SVG response without calling the live GitHub API', async () => {
            const app = fakeServer();
            app.get('/graph', handlers.getGraph);

            const response = await request(app)
                .get('/graph?username=rodriaum')
                .expect('Content-Type', 'image/svg+xml; charset=utf-8')
                .expect('Cache-Control', 'public, max-age=1800')
                .expect(200);

            expect(response.text).toContain('<svg');
            expect(Fetcher.prototype.fetchContributions).toHaveBeenCalledTimes(1);
        });
    });

    describe('GET /graph with invalid username', () => {
        test('returns a non-cached error SVG without calling GitHub', async () => {
            const app = fakeServer();
            app.get('/graph', handlers.getGraph);

            const response = await request(app)
                .get('/graph?username=')
                .expect('Content-Type', 'image/svg+xml; charset=utf-8')
                .expect('Cache-Control', 'no-store, max-age=0')
                .expect(200);

            expect(response.text).toContain('<svg');
            expect(Fetcher.prototype.fetchContributions).not.toHaveBeenCalled();
        });
    });

    it('Graph Generation', async () => {
        expect.assertions(1);

        const days = [
            { contributionCount: 2, date: '1' },
            { contributionCount: 3, date: '2' },
            { contributionCount: 10, date: '3' },
            { contributionCount: 12, date: '4' },
            { contributionCount: 14, date: '5' },
        ];
        const graph: Promise<string> = await createGraph('line', options, {
            labels: days.map((day) => day.date),
            series: [{ value: days.map((day) => day.contributionCount) }],
        });
        expect(graph).toMatchSnapshot();
    });
});
