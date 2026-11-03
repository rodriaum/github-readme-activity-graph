import { NextRequest, NextResponse } from "next/server"
import { fetchOrganizationActivity, fetchUserActivity } from "@/lib/github"
import { isValidGitHubLogin, parseGraphOptions } from "@/lib/graph-options"
import { invalidGraph, renderActivityGraph } from "@/lib/graph"
import { checkRateLimit } from "@/lib/rate-limit"

export const runtime = "nodejs"

function response(svg: string, status: number, cache = false) {
  return new NextResponse(svg, {
    status,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": cache ? "public, max-age=1800, s-maxage=1800, stale-while-revalidate=600" : "no-store, max-age=0",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer"
    }
  })
}

export async function GET(request: NextRequest) {
  const options = parseGraphOptions(Object.fromEntries(request.nextUrl.searchParams))
  const login = options.organization || options.username
  if (!isValidGitHubLogin(login)) return response(invalidGraph("Invalid GitHub username or organization."), 400)

  const forwarded = request.headers.get("x-forwarded-for")
  const clientIp = request.headers.get("x-real-ip") || forwarded?.split(",")[0]?.trim() || "unknown"
  const retryAfter = checkRateLimit(`${options.organization ? "organization" : "user"}:${clientIp}`, Boolean(options.organization))
  if (retryAfter > 0) {
    return new NextResponse(invalidGraph("Rate limit exceeded. Please try again later."), {
      status: 429,
      headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "no-store", "Retry-After": String(retryAfter), "X-Content-Type-Options": "nosniff" }
    })
  }

  try {
    const data = options.organization
      ? await fetchOrganizationActivity(login, options.days, options.from, options.to)
      : await fetchUserActivity(login, options.days, options.from, options.to)
    return response(renderActivityGraph(data, options), 200, true)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate this activity graph."
    const status = message.includes("TOKEN is not configured") ? 503 : message.includes("rate limit") ? 429 : 400
    return response(invalidGraph(message), status)
  }
}
