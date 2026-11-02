import axios, { AxiosResponse } from 'axios';
import * as dotenv from 'dotenv';
import moment from 'moment';
import { Query, UserDetails, Week, ContributionDay, ResponseOfApi } from 'src/interfaces/interface';

dotenv.config();

const REQUEST_TIMEOUT_MS = 3000;
const MAX_ORG_REPOSITORIES = 20;
const MAX_COMMITS_PER_REPOSITORY = 100;
const MAX_CONCURRENT_REPOSITORY_REQUESTS = 10;

const safeAxiosError = (error: unknown): { status?: number; code?: string } => {
    if (!axios.isAxiosError(error)) return {};
    return {
        status: error.response?.status,
        code: error.code,
    };
};

export class Fetcher {
    private readonly username: string;

    constructor(username: string) {
        this.username = username;
    }

    private getGraphQLQuery(from: string, to: string) {
        return {
            query: `
              query userInfo($LOGIN: String!, $FROM: DateTime!, $TO: DateTime!) {
                user(login: $LOGIN) {
                  name
                  contributionsCollection(from: $FROM, to: $TO) {
                    contributionCalendar {
                      weeks {
                        contributionDays {
                          contributionCount
                          date
                        }
                      }
                    }
                  }
                }
              }
            `,
            variables: {
                LOGIN: this.username,
                FROM: from,
                TO: to,
            },
        };
    }

    private async fetch(graphQLQuery: Query): Promise<AxiosResponse<ResponseOfApi>> {
        const token = process.env.TOKEN?.trim();
        if (!token) {
            throw new Error('GitHub TOKEN is not configured.');
        }

        return axios({
            url: 'https://api.github.com/graphql',
            method: 'POST',
            timeout: REQUEST_TIMEOUT_MS,
            maxContentLength: 1024 * 1024,
            maxBodyLength: 256 * 1024,
            headers: {
                Authorization: `Bearer ${token}`,
            },
            data: graphQLQuery,
        });
    }

    public async fetchContributions(
        days: number,
        customFromDate?: string,
        customToDate?: string,
    ): Promise<UserDetails | string> {
        let from = '';
        let to = '';

        if (customFromDate && customToDate) {
            from = moment(customFromDate).utc().toISOString(true);
            to = moment(customToDate).utc().toISOString(true);
        } else {
            const now = moment();
            from = moment(now).subtract(days, 'days').utc().toISOString();
            // Include the next day in case the server and GitHub use different time zones.
            to = moment(now).add(1, 'days').utc().toISOString();
        }

        try {
            const apiResponse = await this.fetch(this.getGraphQLQuery(from, to));

            if (apiResponse.data.errors) {
                console.error('GitHub GraphQL API returned errors:', apiResponse.data.errors);
                if (apiResponse.data.errors[0]?.type === 'RATE_LIMITED') {
                    return '💥 API rate limit exceeded. Please deploy your own instance.';
                }
                return "Can't fetch any contribution. Please check your username 😬";
            }

            if (apiResponse.data.data) {
                if (apiResponse.data.data.user === null) {
                    return "Can't fetch any contribution. Please check your username 😬";
                }

                const userData: UserDetails = {
                    contributions: [],
                    name: apiResponse.data.data.user.name,
                };
                const weeks =
                    apiResponse.data.data.user.contributionsCollection.contributionCalendar.weeks;

                weeks.forEach((week: Week) => {
                    week.contributionDays.forEach((contributionDay: ContributionDay) => {
                        contributionDay.date = moment(contributionDay.date, moment.ISO_8601)
                            .date()
                            .toString();
                        userData.contributions.push(contributionDay);
                    });
                });

                const length = userData.contributions.length;
                if (!(customFromDate && customToDate) && length > 0) {
                    if (userData.contributions[length - 1].contributionCount === 0) {
                        userData.contributions.pop();
                    }
                    const extra = userData.contributions.length - days;
                    if (extra > 0) userData.contributions.splice(0, extra);
                }

                return userData;
            }

            throw new Error('Unexpected GitHub GraphQL response structure.');
        } catch (error) {
            console.error('GitHub GraphQL request failed:', safeAxiosError(error));
            return "Can't fetch any contribution. Please check your username 😬";
        }
    }

    public async fetchOrganizationActivity(
        days: number,
        customFromDate?: string,
        customToDate?: string,
    ): Promise<UserDetails | string> {
        const toDate = customToDate ? moment(customToDate).utc() : moment().utc();
        const fromDate = customFromDate
            ? moment(customFromDate).utc()
            : moment(toDate).subtract(days - 1, 'days').startOf('day');
        const since = fromDate.clone().startOf('day').toISOString();
        const until = toDate.clone().endOf('day').toISOString();

        try {
            const token = process.env.TOKEN?.trim();
            if (!token) {
                return 'GitHub TOKEN is not configured. Please configure it in the deployment environment.';
            }

            const headers = {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
            };

            // Fetch one bounded page. Retrieving every page allowed one request
            // to trigger an unbounded amount of GitHub API work.
            const repositoryResponse = await axios.get(
                `https://api.github.com/orgs/${encodeURIComponent(this.username)}/repos`,
                {
                    headers,
                    params: { type: 'public', per_page: MAX_ORG_REPOSITORIES + 1, page: 1 },
                    timeout: REQUEST_TIMEOUT_MS,
                    maxContentLength: 2 * 1024 * 1024,
                },
            );

            if (!Array.isArray(repositoryResponse.data)) {
                throw new Error('Unexpected GitHub repository response.');
            }
            if (repositoryResponse.data.length > MAX_ORG_REPOSITORIES) {
                return `Organization activity is limited to ${MAX_ORG_REPOSITORIES} public repositories per request. Use a smaller organization or a dedicated instance.`;
            }

            const repositories: Array<{ name: string; full_name: string }> =
                repositoryResponse.data;
            const totals = new Map<string, number>();

            for (
                let date = fromDate.clone().startOf('day');
                date.isSameOrBefore(toDate, 'day');
                date.add(1, 'day')
            ) {
                totals.set(date.format('YYYY-MM-DD'), 0);
            }

            let commitLimitExceeded = false;
            const countRepositoryCommits = async (repository: {
                name: string;
                full_name: string;
            }) => {
                const response = await axios.get(
                    `https://api.github.com/repos/${repository.full_name}/commits`,
                    {
                        headers,
                        params: { since, until, per_page: MAX_COMMITS_PER_REPOSITORY, page: 1 },
                        timeout: REQUEST_TIMEOUT_MS,
                        maxContentLength: 2 * 1024 * 1024,
                    },
                );

                if (!Array.isArray(response.data)) {
                    throw new Error('Unexpected GitHub commit response.');
                }
                if (response.data.length >= MAX_COMMITS_PER_REPOSITORY) {
                    commitLimitExceeded = true;
                    return;
                }

                const commits: Array<{
                    commit: {
                        committer?: { date?: string };
                        author?: { date?: string };
                    };
                }> = response.data;

                for (const item of commits) {
                    const commitDate = item.commit.committer?.date ?? item.commit.author?.date;
                    if (!commitDate) continue;
                    const key = moment(commitDate).utc().format('YYYY-MM-DD');
                    if (totals.has(key)) {
                        totals.set(key, (totals.get(key) ?? 0) + 1);
                    }
                }
            };

            for (
                let index = 0;
                index < repositories.length;
                index += MAX_CONCURRENT_REPOSITORY_REQUESTS
            ) {
                await Promise.all(
                    repositories
                        .slice(index, index + MAX_CONCURRENT_REPOSITORY_REQUESTS)
                        .map(countRepositoryCommits),
                );
            }

            if (commitLimitExceeded) {
                return `Organization activity exceeded the limit of ${MAX_COMMITS_PER_REPOSITORY - 1} commits per repository. Use a shorter date range or a dedicated instance.`;
            }

            return {
                name: this.username,
                contributions: Array.from(totals.entries()).map(([date, contributionCount]) => ({
                    date: moment(date, 'YYYY-MM-DD').date().toString(),
                    contributionCount,
                })),
            };
        } catch (error) {
            console.error('GitHub organization API request failed:', safeAxiosError(error));
            return 'Unable to fetch organization activity. Check the organization name, GitHub API quota, and selected date range.';
        }
    }
}
