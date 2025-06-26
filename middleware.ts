import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// Define route matchers for different access levels
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/privacy",
  "/terms",
  "/help",
])

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"])
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"])

export default clerkMiddleware((auth, req) => {
  const { userId, sessionClaims } = auth()
  const currentUrl = new URL(req.url)

  // Allow public routes without authentication
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Redirect unauthenticated users to sign-in
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url)
    signInUrl.searchParams.set("redirect_url", currentUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Handle onboarding flow
  if (isOnboardingRoute(req)) {
    return NextResponse.next()
  }

  // Check if user has completed onboarding
  const hasCompletedOnboarding = sessionClaims?.metadata?.onboardingComplete

  // Redirect to onboarding if not completed (except for onboarding routes)
  if (!hasCompletedOnboarding && !isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL("/onboarding", req.url))
  }

  // Redirect authenticated users away from auth pages
  if (currentUrl.pathname.startsWith("/sign-in") || currentUrl.pathname.startsWith("/sign-up")) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Allow access to protected routes for authenticated users
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
