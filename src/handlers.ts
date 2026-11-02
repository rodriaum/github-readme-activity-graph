import { Utilities, isValidGitHubLogin } from './utils';
import { Request, Response } from 'express';
import { Fetcher } from './fetcher';
import { invalidUserSvg } from './svgs';
import { UserDetails } from './interfaces/interface';
import path from 'path';
import { readFile } from 'fs/promises';

const INVALID_LOGIN_MESSAGE = 'Invalid GitHub username or organization. Please check the GitHub login.';

export class Handlers {
    public async getRoot(_req: Request, res: Response) {
        const html = await readFile(path.resolve(process.cwd(), 'index.html'), 'utf8');
        const origin = (process.env.ORIGIN_URL || 'https://github-act-graph.rodriaum.com').replace(/\/+$/, '');

        res.type('html').send(html.replace('__ORIGIN_URL__', origin));
    }

    public async getGraph(req: Request, res: Response) {
        try {
            const utils = new Utilities(req.query);
            const organization = typeof req.query.organization === 'string'
                ? req.query.organization.trim()
                : '';
            const login = organization || utils.username;
            const queryOptions = utils.queryOptions();

            let fetchCalendarData: UserDetails | string;
            if (!isValidGitHubLogin(login)) {
                fetchCalendarData = INVALID_LOGIN_MESSAGE;
            } else {
                const fetcher = new Fetcher(login);
                fetchCalendarData = organization
                    ? await fetcher.fetchOrganizationActivity(
                          queryOptions.days,
                          queryOptions.from,
                          queryOptions.to,
                      )
                    : await fetcher.fetchContributions(
                          queryOptions.days,
                          queryOptions.from,
                          queryOptions.to,
                      );
            }

            const { finalGraph, header } = await utils.buildGraph(fetchCalendarData);
            utils.setHttpHeader(res, header.maxAge);
            res.status(200).send(finalGraph);
        } catch {
            res.setHeader('Cache-Control', 'no-store, max-age=0');
            res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'");
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.type('image/svg+xml');
            res.status(500).send(invalidUserSvg('Something unexpected happened 💥'));
        }
    }

    public async getData(req: Request, res: Response) {
        try {
            const utils = new Utilities(req.query);
            const organization = typeof req.query.organization === 'string'
                ? req.query.organization.trim()
                : '';
            const login = organization || utils.username;
            const queryOptions = utils.queryOptions();

            let fetchCalendarData: UserDetails | string;
            if (!isValidGitHubLogin(login)) {
                fetchCalendarData = INVALID_LOGIN_MESSAGE;
            } else {
                const fetcher = new Fetcher(login);
                fetchCalendarData = organization
                    ? await fetcher.fetchOrganizationActivity(
                          queryOptions.days,
                          queryOptions.from,
                          queryOptions.to,
                      )
                    : await fetcher.fetchContributions(
                          queryOptions.days,
                          queryOptions.from,
                          queryOptions.to,
                      );
            }

            if (typeof fetchCalendarData === 'object') {
                res.setHeader('Cache-Control', 'public, max-age=300');
                res.status(200).json(fetchCalendarData);
            } else {
                res.setHeader('Cache-Control', 'no-store, max-age=0');
                res.status(400).json({ error: fetchCalendarData });
            }
        } catch {
            res.setHeader('Cache-Control', 'no-store, max-age=0');
            res.status(500).json({ error: 'Something unexpected happened while fetching graph data.' });
        }
    }
}
