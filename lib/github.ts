import type { ActivityData, ContributionDay } from "./types"

const apiUrl = "https://api.github.com"
const requestTimeout = 5000
const maxRepositories = 20
const maxCommitsPerRepository = 100
const concurrency = 5

type GitHubGraphQLResponse = {
  data?: {
    user: {
      name: string | null
      contributionsCollection: {
        contributionCalendar: {
          weeks: {
            contributionDays: { date: string; contributionCount: number }[]
          }[]
        }
      }
    } | null
  }
  errors?: { message: string; type?: string }[]
}

const getToken = () => {
  const token = process.env.TOKEN?.trim()
  if (!token) throw new Error("GitHub TOKEN is not configured.")
  return token
}

const githubHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
})

export async function fetchUserActivity(
  login: string,
  days: number,
  from?: string,
  to?: string
): Promise<ActivityData> {
  const end = to ? new Date(`${to}T23:59:59.999Z`) : new Date()

  const start = from
    ? new Date(`${from}T00:00:00.000Z`)
    : new Date(end.getTime() - (days - 1) * 86_400_000)

  const response = await fetch(`${apiUrl}/graphql`, {
    method: "POST",
    headers: { ...githubHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `query ActivityGraph($login: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $login) {
          name
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }`,
      variables: { login, from: start.toISOString(), to: end.toISOString() },
    }),
    signal: AbortSignal.timeout(requestTimeout),
    cache: "no-store",
  })

  if (!response.ok)
    throw new Error(`GitHub API request failed with status ${response.status}.`)

  const payload = (await response.json()) as GitHubGraphQLResponse

  if (payload.errors?.length) {
    const rateLimited = payload.errors.some(
      (error) => error.type === "RATE_LIMITED"
    )
    throw new Error(
      rateLimited
        ? "GitHub API rate limit exceeded."
        : "GitHub could not retrieve this contribution calendar."
    )
  }

  const user = payload.data?.user

  if (!user) throw new Error("GitHub user was not found.")

  const contributions =
    user.contributionsCollection.contributionCalendar.weeks.flatMap((week) =>
      week.contributionDays.map((day) => ({
        date: day.date.slice(8, 10),
        contributionCount: day.contributionCount,
      }))
    )

  return { name: user.name, contributions: contributions.slice(-days) }
}

type GitHubRepository = { full_name: string }
type GitHubCommit = {
  commit: { committer?: { date?: string }; author?: { date?: string } }
}

async function fetchJson<T>(url: string, maxBytes: number): Promise<T> {
  const response = await fetch(url, {
    headers: githubHeaders(),
    signal: AbortSignal.timeout(requestTimeout),
    cache: "no-store",
  })

  if (!response.ok)
    throw new Error(`GitHub API request failed with status ${response.status}.`)

  const length = Number(response.headers.get("content-length") ?? 0)

  if (length > maxBytes)
    throw new Error("GitHub API response exceeded the configured size limit.")

  return (await response.json()) as T
}

export async function fetchOrganizationActivity(
  login: string,
  days: number,
  from?: string,
  to?: string
): Promise<ActivityData> {

  const contributions: ContributionDay[] = []
  return { name: login, contributions }

  /*
  const end = to ? new Date(`${to}T23:59:59.999Z`) : new Date()

  const start = from
    ? new Date(`${from}T00:00:00.000Z`)
    : new Date(end.getTime() - (days - 1) * 86_400_000)

  const since = start.toISOString()
  const until = end.toISOString()

  const repositories = await fetchJson<GitHubRepository[]>(
    `${apiUrl}/orgs/${encodeURIComponent(login)}/repos?type=public&per_page=${maxRepositories + 1}&page=1`,
    2 * 1024 * 1024
  )

  if (!Array.isArray(repositories))
    throw new Error("GitHub returned an invalid repository response.")

  if (repositories.length > maxRepositories)
    throw new Error(
      `Organization activity is limited to ${maxRepositories} public repositories per request.`
    )

  const totals = new Map<string, number>()
  const cursor = new Date(start)

  cursor.setUTCHours(0, 0, 0, 0)

  while (cursor <= end) {
    totals.set(cursor.toISOString().slice(0, 10), 0)
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  let exceeded = false

  for (let index = 0; index < repositories.length; index += concurrency) {
    const batch = repositories.slice(index, index + concurrency)

    const results = await Promise.all(
      batch.map((repository) =>
        fetchJson<GitHubCommit[]>(
          `${apiUrl}/repos/${repository.full_name}/commits?since=${encodeURIComponent(since)}&until=${encodeURIComponent(until)}&per_page=${maxCommitsPerRepository}&page=1`,
          2 * 1024 * 1024
        )
      )
    )

    for (const commits of results) {
      if (!Array.isArray(commits))
        throw new Error("GitHub returned an invalid commit response.")

      if (commits.length >= maxCommitsPerRepository)
        exceeded = true

      for (const item of commits) {
        const date = item.commit.committer?.date ?? item.commit.author?.date

        if (!date)
          continue

        const timestamp = Date.parse(date)

        if (!Number.isFinite(timestamp))
          continue

        const key = new Date(timestamp).toISOString().slice(0, 10)

        if (totals.has(key))
          totals.set(key, (totals.get(key) ?? 0) + 1)
      }
    }
  }
  if (exceeded)
    throw new Error(
      `Organization activity exceeded the limit of ${maxCommitsPerRepository - 1} commits per repository.`
    )

  const contributions: ContributionDay[] = Array.from(
    totals,
    ([date, contributionCount]) => ({
      date: date.slice(8, 10),
      contributionCount,
    })
  )
  return { name: login, contributions }
   */
}
