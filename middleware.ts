// ✅ Root-level Middleware (or src/middleware.ts if you use the /src pattern)

/**
 * authMiddleware handles:
 * • Injecting auth context for `auth()`, `currentUser()`, etc.
 * • Protecting private routes (auto-redirect to /sign-in)
 *
 * Docs → https://clerk.com/docs/nextjs/middleware
 */
import { clerkMiddleware } from "@clerk/nextjs/server"

export default clerkMiddleware({
  // Routes that anyone can visit without being signed-in
  publicRoutes: ["/", "/sign-in(.*)", "/sign-up(.*)", "/api/public/(.*)", "/favicon.ico"],
})

/**
 * Next.js “matcher” — run this middleware on every route
 * except _next static files and built assets.
 */
export const config = {
  matcher: [
    /*
     * Skip all routes that start with:
     *  - _next (static files)
     *  - favicon.ico
     *  - assets with an extension (e.g. .png, .css)
     */
    "/((?!.+\\.[\\w]+$|_next).*)",
  ],
}
