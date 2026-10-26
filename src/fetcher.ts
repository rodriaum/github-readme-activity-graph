import axios, { AxiosResponse } from 'axios';
import * as dotenv from 'dotenv';
import moment from 'moment';
import { Query, UserDetails, Week, ContributionDay, ResponseOfApi } from 'src/interfaces/interface';

dotenv.config();

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

    private async fetch(graphQLQuery: Query, accessToken?: string): Promise<AxiosResponse<ResponseOfApi>> {
        return axios({
            url: 'https://api.github.com/graphql',
            method: 'POST',
            headers: {
                Authorization: `bearer ${accessToken || process.env.TOKEN}`,
            },
            data: graphQLQuery,
        });
    }

    public async fetchContributions(
        days: number,
        customFromDate?: string,
        customToDate?: string,
        accessToken?: string,
    ): Promise<UserDetails | string> {
        let from = '',
            to = '';
        if (customFromDate && customToDate) {
            from = moment(customFromDate).utc().toISOString(true);
            to = moment(customToDate).utc().toISOString(true);
        } else {
            const now = moment();
            from = moment(now).subtract(days, 'days').utc().toISOString();
            // also include the next day in case our server is behind in time with respect to GitHub
            to = moment(now).add(1, 'days').utc().toISOString();
        }

        try {
            const apiResponse = await this.fetch(this.getGraphQLQuery(from, to), accessToken);

            if (apiResponse.data.errors) {
                console.error('API Error: ', apiResponse.data.errors);
                if (apiResponse.data.errors[0].type === 'RATE_LIMITED') {
                    console.log('GraphQL Error: API rate limit exceeded');
                    return 'API rate limit exceeded. Please deploy your own instance.';
                } else {
                    return `Can't fetch any contribution. Please check your username.`;
                }
            } else if (apiResponse.data.data) {
                if (apiResponse.data.data.user === null)
                    return `Can't fetch any contribution. Please check your username.`;
                else {
                    const userData: UserDetails = {
                        contributions: [],
                        name: apiResponse.data.data.user.name,
                    };
                    //filtering the week data from API response
                    const weeks =
                        apiResponse.data.data.user.contributionsCollection.contributionCalendar
                            .weeks;
                    // get day-contribution data
                    weeks.map((week: Week) =>
                        week.contributionDays.map((contributionDay: ContributionDay) => {
                            contributionDay.date = moment(contributionDay.date, moment.ISO_8601)
                                .date()
                                .toString();
                            userData.contributions.push(contributionDay);
                        }),
                    );

                    // if 32nd entry is 0 means:
                    // either the day hasn't really started
                    // or the user hasn't contributed today
                    const length = userData.contributions.length;
                    if (!(customFromDate && customToDate)) {
                        if (userData.contributions[length - 1].contributionCount === 0) {
                            userData.contributions.pop();
                        }
                        const extra = userData.contributions.length - days;
                        userData.contributions.splice(0, extra);
                    }
                    return userData;
                }
            } else {
                console.error('Unexpected API response structure');
                throw new Error('Unexpected API response structure');
            }
        } catch (error) {
            console.log('error: ', error);
            return `Can't fetch any contribution. Please check your username.`;
        }
    }
    public async fetchOrganizationActivity(
        days: number,
        customFromDate?: string,
        customToDate?: string,
        accessToken?: string,
    ): Promise<UserDetails | string> {
        const toDate = customToDate ? moment(customToDate).utc() : moment().utc();
        const fromDate = customFromDate
            ? moment(customFromDate).utc()
            : moment(toDate).subtract(days - 1, 'days').startOf('day');
        const since = fromDate.clone().startOf('day').toISOString();
        const until = toDate.clone().endOf('day').toISOString();

        try {
            const headers = {
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            };
            const repositories: Array<{ name: string; full_name: string }> = [];
            let repositoryPage = 1;

            while (true) {
                const response = await axios.get(
                    `https://api.github.com/orgs/${encodeURIComponent(this.username)}/repos`,
                    {
                        headers,
                        params: { type: accessToken ? 'all' : 'public', per_page: 100, page: repositoryPage },
                    },
                );
                const listed = response.data as Array<{ name: string; full_name: string; permissions?: { pull?: boolean } }>;
                repositories.push(...listed.filter((repository) => !accessToken || repository.permissions?.pull === true));
                if (response.data.length < 100) break;
                repositoryPage += 1;
            }

            const totals = new Map<string, number>();
            for (
                let date = fromDate.clone().startOf('day');
                date.isSameOrBefore(toDate, 'day');
                date.add(1, 'day')
            ) {
                totals.set(date.format('YYYY-MM-DD'), 0);
            }

            const countRepositoryCommits = async (repository: { name: string; full_name: string }) => {
                let page = 1;
                while (true) {
                    let response;
                    try {
                        response = await axios.get(
                            `https://api.github.com/repos/${repository.full_name}/commits`,
                            { headers, params: { since, until, per_page: 100, page } },
                        );
                    } catch (error) {
                        if (accessToken && axios.isAxiosError(error) && [403, 404].includes(error.response?.status || 0)) {
                            break;
                        }
                        throw error;
                    }
                    const commits: Array<{
                        commit: { committer?: { date?: string }; author?: { date?: string } };
                    }> = response.data;

                    for (const item of commits) {
                        const commitDate = item.commit.committer?.date ?? item.commit.author?.date;
                        if (!commitDate) continue;
                        const key = moment(commitDate).utc().format('YYYY-MM-DD');
                        if (totals.has(key)) totals.set(key, (totals.get(key) ?? 0) + 1);
                    }
                    if (commits.length < 100) break;
                    page += 1;
                }
            };

            for (let index = 0; index < repositories.length; index += 5) {
                await Promise.all(repositories.slice(index, index + 5).map(countRepositoryCommits));
            }

            return {
                name: this.username,
                contributions: Array.from(totals.entries()).map(([date, contributionCount]) => ({
                    date: moment(date, 'YYYY-MM-DD').date().toString(),
                    contributionCount,
                })),
            };
        } catch (error) {
            console.error('Failed to fetch organization activity:', error);
            return `Can't fetch activity for GitHub organization '${this.username}'. Check the organization name, token permissions, and API rate limit.`;
        }
    }

}
