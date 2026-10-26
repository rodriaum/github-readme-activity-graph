import { Request, Response } from 'express';
import path from 'path';
import { authStatus, beginOAuth, finishOAuth, getPrivateAccess, logout } from './auth';
import { Fetcher } from './fetcher';
import { UserDetails } from './interfaces/interface';
import { getPrivateCache, privateCacheKey, setPrivateCache } from './privateCache';
import { invalidUserSvg } from './svgs';
import { Utilities } from './utils';

export class Handlers {
    public getRoot(_req: Request, res: Response) {
        res.sendFile(path.resolve(process.cwd(), 'index.html'));
    }

    public async getGraph(req: Request, res: Response) {
        const includePrivate = req.query.include_private === 'true';

        if (includePrivate) {
            res.setHeader('Cache-Control', 'private, no-store, max-age=0');
        }

        try {
            const utils = new Utilities(req.query);
            const organization =
                typeof req.query.organization === 'string' ? req.query.organization.trim() : '';
            const fetcher = new Fetcher(organization || utils.username);
            const queryOptions = utils.queryOptions();
            let fetchCalendarData: UserDetails | string;

            if (includePrivate) {
                const auth = await getPrivateAccess(req);

                if (!auth) {
                    res.setHeader('Cache-Control', 'no-store');
                    res.status(401).send(
                        invalidUserSvg('Sign in with GitHub to include private activity.'),
                    );
                    return;
                }

                const cacheKey = privateCacheKey(
                    auth.githubId,
                    organization || utils.username,
                    Boolean(organization),
                    queryOptions.days,
                    queryOptions.from,
                    queryOptions.to,
                );
                const cached = getPrivateCache(cacheKey);

                fetchCalendarData =
                    cached ??
                    (organization
                        ? await fetcher.fetchOrganizationActivity(
                              queryOptions.days,
                              queryOptions.from,
                              queryOptions.to,
                              auth.accessToken,
                          )
                        : await fetcher.fetchContributions(
                              queryOptions.days,
                              queryOptions.from,
                              queryOptions.to,
                              auth.accessToken,
                          ));

                if (!cached && typeof fetchCalendarData === 'object') {
                    setPrivateCache(cacheKey, fetchCalendarData);
                }
            } else {
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

            utils.setHttpHeader(
                res,
                includePrivate ? 'private, no-store, max-age=0' : header.maxAge,
            );

            res.status(200).send(finalGraph);
        } catch {
            res.setHeader('Cache-Control', 'no-store, max-age=0');
            res.set('Content-Type', 'image/svg+xml');
            res.send(invalidUserSvg('Something unexpected happened. Please try again later.'));
        }
    }

    public async getData(req: Request, res: Response) {
        const includePrivate = req.query.include_private === 'true';

        if (includePrivate) {
            res.setHeader('Cache-Control', 'private, no-store, max-age=0');
        }

        try {
            const utils = new Utilities(req.query);
            const organization =
                typeof req.query.organization === 'string' ? req.query.organization.trim() : '';
            const fetcher = new Fetcher(organization || utils.username);
            const options = utils.queryOptions();
            let fetchCalendarData: UserDetails | string;

            if (includePrivate) {
                const auth = await getPrivateAccess(req);

                if (!auth) {
                    res.status(401).json({
                        error: 'Sign in with GitHub to include private activity.',
                    });
                    return;
                }

                const cacheKey = privateCacheKey(
                    auth.githubId,
                    organization || utils.username,
                    Boolean(organization),
                    options.days,
                    options.from,
                    options.to,
                );
                const cached = getPrivateCache(cacheKey);

                fetchCalendarData =
                    cached ??
                    (organization
                        ? await fetcher.fetchOrganizationActivity(
                              options.days,
                              options.from,
                              options.to,
                              auth.accessToken,
                          )
                        : await fetcher.fetchContributions(
                              options.days,
                              options.from,
                              options.to,
                              auth.accessToken,
                          ));

                if (!cached && typeof fetchCalendarData === 'object') {
                    setPrivateCache(cacheKey, fetchCalendarData);
                }
            } else {
                fetchCalendarData = organization
                    ? await fetcher.fetchOrganizationActivity(options.days)
                    : await fetcher.fetchContributions(options.days);
            }

            if (typeof fetchCalendarData === 'object') {
                if (includePrivate) {
                    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
                }

                res.status(200).json(fetchCalendarData);
            } else {
                res.status(502).json({ error: fetchCalendarData });
            }
        } catch (error) {
            console.error('Failed to fetch graph data:', error);
            res.status(500).json({
                error: 'Something unexpected happened while fetching graph data.',
            });
        }
    }

    public getAuthStatus(req: Request, res: Response) {
        return authStatus(req, res);
    }

    public beginOAuth(req: Request, res: Response) {
        return beginOAuth(req, res);
    }

    public finishOAuth(req: Request, res: Response) {
        return finishOAuth(req, res);
    }

    public logout(req: Request, res: Response) {
        return logout(req, res);
    }
}
