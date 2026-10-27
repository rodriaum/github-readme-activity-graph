import { Utilities } from './utils';
import { Request, Response } from 'express';
import { Fetcher } from './fetcher';
import { invalidUserSvg } from './svgs';
import { UserDetails } from './interfaces/interface';
import path from 'path';
import { readFile } from 'fs/promises';

export class Handlers {
    public async getRoot(_req: Request, res: Response) {
        const html = await readFile(path.resolve(process.cwd(), 'index.html'), 'utf8');
        const origin = (process.env.ORIGIN_URL || 'https://github-act-graph.rodriaum.com').replace(/\\/+$/, '');

        res.type('html').send(html.replace('__ORIGIN_URL__', origin));
    }

    public async getGraph(req: Request, res: Response) {
        try {
            const utils = new Utilities(req.query);

            const organization = typeof req.query.organization === 'string'
                ? req.query.organization.trim()
                : '';
            const fetcher = new Fetcher(organization || utils.username);
            const queryOptions = utils.queryOptions();
            const fetchCalendarData = organization
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

            const { finalGraph, header } = await utils.buildGraph(fetchCalendarData);
            utils.setHttpHeader(res, header.maxAge);

            res.status(200).send(finalGraph);
        } catch (error) {
            res.setHeader('Cache-Control', 'no-store, max-age=0');
            res.set('Content-Type', 'image/svg+xml');
            res.send(invalidUserSvg('Something unexpected happened 💥'));
        }
    }

    public async getData(req: Request, res: Response) {
        try {
            const utils = new Utilities(req.query);
            const organization = typeof req.query.organization === 'string'
                ? req.query.organization.trim()
                : '';
            const fetcher = new Fetcher(organization || utils.username);
            const fetchCalendarData: UserDetails | string = organization
                ? await fetcher.fetchOrganizationActivity(utils.queryOptions().days)
                : await fetcher.fetchContributions(utils.queryOptions().days);

            if (typeof fetchCalendarData === 'object') {
                res.status(200).json(fetchCalendarData);
            } else {
                res.status(502).json({ error: fetchCalendarData });
            }
        } catch (error) {
            console.error('Failed to fetch graph data:', error);
            res.status(500).json({ error: 'Something unexpected happened while fetching graph data.' });
        }
    }
}
