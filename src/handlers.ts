import { Utilities } from './utils';
import { Request, Response } from 'express';
import { Fetcher } from './fetcher';
import { invalidUserSvg } from './svgs';
import { UserDetails } from './interfaces/interface';
import path from 'path';
import { getOAuthToken } from './auth';

export class Handlers {
    public getRoot(_req: Request, res: Response) {
        res.sendFile(path.resolve(process.cwd(), 'index.html'));
    }

    public async getGraph(req: Request, res: Response) {
        try {
            const utils = new Utilities(req.query);

            const organization = typeof req.query.organization === 'string'
                ? req.query.organization.trim()
                : '';
            const fetcher = new Fetcher(organization || utils.username);
            const queryOptions = utils.queryOptions();
            const accessToken = getOAuthToken(req);
            const fetchCalendarData = organization
                ? await fetcher.fetchOrganizationActivity(
                      queryOptions.days,
                      queryOptions.from,
                      queryOptions.to,
                      accessToken,
                  )
                : await fetcher.fetchContributions(
                      queryOptions.days,
                      queryOptions.from,
                      queryOptions.to,
                      accessToken,
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
            const accessToken = getOAuthToken(req);
            const fetchCalendarData: UserDetails | string = organization
                ? await fetcher.fetchOrganizationActivity(utils.queryOptions().days, undefined, undefined, accessToken)
                : await fetcher.fetchContributions(utils.queryOptions().days, undefined, undefined, accessToken);

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
