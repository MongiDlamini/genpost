import type { NextRequest } from "next/server"

export function getRedirectUrl(req: NextRequest, defaultPath = "/dashboard"): string {
  const redirectUrl = req.nextUrl.searchParams.get("redirect_url")

  // Validate redirect URL to prevent open redirects
  if (redirectUrl && isValidRedirectUrl(redirectUrl)) {
    return redirectUrl
  }

  return defaultPath
}

export function isValidRedirectUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url, "http://localhost")
    // Only allow relative URLs or same-origin URLs
    return parsedUrl.pathname.startsWith("/") && !parsedUrl.pathname.startsWith("//")
  } catch {
    return false
  }
}

export function createAuthRedirect(req: NextRequest, path: string, preserveQuery = true): URL {
  const redirectUrl = new URL(path, req.url)

  if (preserveQuery && req.nextUrl.search) {
    redirectUrl.search = req.nextUrl.search
  }

  return redirectUrl
}
