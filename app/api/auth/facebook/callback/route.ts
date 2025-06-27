import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { parseFacebookAuthState, exchangeFacebookCode, exchangeForLongLivedToken } from "@/lib/social/facebook/auth"
import { FacebookAPI } from "@/lib/social/facebook/api"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", request.url))
    }

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
      console.error("Facebook OAuth error:", error)
      const errorDescription = searchParams.get("error_description")
      return NextResponse.redirect(
        new URL(`/settings/social-accounts?error=${encodeURIComponent(errorDescription || error)}`, request.url),
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/settings/social-accounts?error=Missing authorization code or state", request.url),
      )
    }

    // Parse the state
    const authState = parseFacebookAuthState(state)
    if (authState.userId !== userId) {
      return NextResponse.redirect(new URL("/settings/social-accounts?error=Invalid authentication state", request.url))
    }

    // Exchange code for access token
    const tokenResponse = await exchangeFacebookCode(code)

    // Exchange for long-lived token
    const longLivedTokenResponse = await exchangeForLongLivedToken(tokenResponse.access_token)

    // Get user profile and pages
    const facebookAPI = new FacebookAPI(longLivedTokenResponse.access_token)
    const [userProfile, pages] = await Promise.all([facebookAPI.getUserProfile(), facebookAPI.getPages()])

    // Store each page as a separate account
    for (const page of pages) {
      await convex.mutation(api.socialAccounts.connectFacebookAccount, {
        clerkId: userId,
        teamId: authState.teamId,
        platform: "facebook",
        platformUserId: page.id,
        username: page.name,
        displayName: page.name,
        profileImageUrl: page.picture?.data?.url,
        accessToken: page.access_token, // Use page-specific token
        refreshToken: undefined, // Facebook doesn't use refresh tokens
        tokenExpiresAt: longLivedTokenResponse.expires_in
          ? Date.now() + longLivedTokenResponse.expires_in * 1000
          : undefined,
        scopes: ["pages_manage_posts", "pages_read_engagement", "pages_show_list"],
        metadata: {
          userProfile,
          pageData: {
            category: page.category,
            tasks: page.tasks,
            fanCount: page.fan_count,
            followersCount: page.followers_count,
          },
        },
        pageData: {
          category: page.category,
          tasks: page.tasks,
          fanCount: page.fan_count,
          followersCount: page.followers_count,
        },
      })
    }

    // Redirect back to the return URL or social accounts page
    const returnUrl = authState.returnUrl || "/settings/social-accounts"
    return NextResponse.redirect(new URL(`${returnUrl}?success=Facebook account connected`, request.url))
  } catch (error) {
    console.error("Facebook callback error:", error)
    return NextResponse.redirect(
      new URL(
        `/settings/social-accounts?error=${encodeURIComponent("Failed to connect Facebook account")}`,
        request.url,
      ),
    )
  }
}
