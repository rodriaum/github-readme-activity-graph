import { Utilities } from './utils';
import { Request, Response } from 'express';
import { Fetcher } from './fetcher';
import { invalidUserSvg } from './svgs';
import { UserDetails } from './interfaces/interface';
import path from 'path';
import { getOAuthToken } from './auth';
import { createPrivateShareToken, readPrivateShareToken } from './private-share';

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
            const subject = organization || utils.username;
            const type = organization ? 'organization' : 'user';
            const shared = readPrivateShareToken(
                typeof req.query.private_data === 'string' ? req.query.private_data : undefined,
            );
            if (req.query.private_data && (!shared || shared.subject !== subject || shared.type !== type)) {
                res.setHeader('Cache-Control', 'no-store, max-age=0');
                res.set('Content-Type', 'image/svg+xml');
                res.status(400).send(invalidUserSvg('Invalid private activity link'));
                return;
            }

            const fetcher = new Fetcher(subject);
            const queryOptions = utils.queryOptions();
            const accessToken = getOAuthToken(req);
            const fetchCalendarData = shared
                ? { name: shared.name, contributions: shared.contributions }
                : organization
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
            utils.setHttpHeader(
                res,
                shared ? header.maxAge : accessToken ? 'no-store, max-age=0' : header.maxAge,
            );

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
            const subject = organization || utils.username;
            const type = organization ? 'organization' : 'user';
            const shared = readPrivateShareToken(
                typeof req.query.private_data === 'string' ? req.query.private_data : undefined,
            );
            if (req.query.private_data && (!shared || shared.subject !== subject || shared.type !== type)) {
                res.status(400).json({ error: 'Invalid private activity link.' });
                return;
            }

            const accessToken = getOAuthToken(req);
            const fetchCalendarData: UserDetails | string = shared
                ? { name: shared.name, contributions: shared.contributions }
                : organization
                  ? await new Fetcher(subject).fetchOrganizationActivity(
                        utils.queryOptions().days, undefined, undefined, accessToken,
                    )
                  : await new Fetcher(subject).fetchContributions(
                        utils.queryOptions().days, undefined, undefined, accessToken,
                    );

            if (typeof fetchCalendarData === 'object') {
                res.setHeader('Cache-Control', shared ? 'public, max-age=1800' : 'no-store, max-age=0');
                res.status(200).json(fetchCalendarData);
            } else {
                res.setHeader('Cache-Control', 'no-store, max-age=0');
                res.status(502).json({ error: fetchCalendarData });
            }
        } catch (error) {
            console.error('Failed to fetch graph data:', error);
            res.status(500).json({ error: 'Something unexpected happened while fetching graph data.' });
        }
    }

    public async getPrivateShare(req: Request, res: Response) {
        try {
            const organization = typeof req.query.organization === 'string'
                ? req.query.organization.trim()
                : '';
            const username = typeof req.query.username === 'string' ? req.query.username.trim() : '';
            if ((!organization && !username) || (organization && username)) {
                res.status(400).json({ error: 'Provide exactly one username or organization.' });
                return;
            }

            const accessToken = getOAuthToken(req);
            if (!accessToken) {
                res.status(401).json({ error: 'Connect your GitHub account before sharing private stats.' });
                return;
            }

            const type = organization ? 'organization' : 'user';
            const subject = organization || username;
            const options = new Utilities(req.query).queryOptions();
            const fetcher = new Fetcher(subject);
            const data = organization
                ? await fetcher.fetchOrganizationActivity(options.days, options.from, options.to, accessToken)
                : await fetcher.fetchContributions(options.days, options.from, options.to, accessToken);

            if (typeof data === 'string') {
                res.status(502).json({ error: data });
                return;
            }

            const privateData = createPrivateShareToken(data, subject, type);
            res.setHeader('Cache-Control', 'no-store, max-age=0');
            res.status(200).json({ privateData });
        } catch (error) {
            console.error('Failed to create private activity share:', error);
            res.status(500).json({
                error: 'Private sharing is not configured. Set PRIVATE_SHARE_SECRET to a random secret with at least 32 characters.',
            });
        }
    }
}
