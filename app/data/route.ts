import { NextRequest, NextResponse } from "next/server"
import { fetchOrganizationActivity, fetchUserActivity } from "@/lib/github"
import { isValidGitHubLogin, parseGraphOptions } from "@/lib/graph-options"
import { checkRateLimit } from "@/lib/rate-limit"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const options = parseGraphOptions(
    Object.fromEntries(request.nextUrl.searchParams)
  )
  const login = options.organization || options.username
  if (!isValidGitHubLogin(login)) {
    return NextResponse.json(
      { error: "Invalid GitHub username or organization." },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      }
    )
  }

  const forwarded = request.headers.get("x-forwarded-for")
  const clientIp =
    request.headers.get("x-real-ip") ||
    forwarded?.split(",")[0]?.trim() ||
    "unknown"
  const retryAfter = checkRateLimit(
    `${options.organization ? "organization" : "user"}:${clientIp}`,
    Boolean(options.organization)
  )
  if (retryAfter > 0) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later.", retryAfter },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(retryAfter),
        },
      }
    )
  }

  try {
    const data = options.organization
      ? await fetchOrganizationActivity(
          login,
          options.days,
          options.from,
          options.to
        )
      : await fetchUserActivity(login, options.days, options.from, options.to)
    return NextResponse.json(data, {
      headers: {
        "Cache-Control":
          "public, max-age=300, s-maxage=300, stale-while-revalidate=120",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve activity data."
    const status = message.includes("TOKEN is not configured")
      ? 503
      : message.includes("rate limit")
        ? 429
        : 400
    return NextResponse.json(
      { error: message },
      {
        status,
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      }
    )
  }
}
