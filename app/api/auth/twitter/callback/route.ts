import { type NextRequest, NextResponse } from "next/server"
import { parseTwitterAuthState, exchangeTwitterCode } from "@/lib/social/twitter/auth"
import { TwitterAPI } from "@/lib/social/twitter/api"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
      const errorDescription = searchParams.get("error_description")
      console.error("Twitter OAuth error:", error, errorDescription)
      return NextResponse.redirect(
        new URL(`/settings/social-accounts?error=${encodeURIComponent(errorDescription || error)}`, request.url),
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL("/settings/social-accounts?error=Missing authorization code", request.url))
    }

    // Get code verifier from cookie
    const codeVerifier = request.cookies.get("twitter_code_verifier")?.value
    if (!codeVerifier) {
      return NextResponse.redirect(new URL("/settings/social-accounts?error=Missing code verifier", request.url))
    }

    // Parse auth state
    const authState = parseTwitterAuthState(state)

    // Exchange code for token
    const tokenResponse = await exchangeTwitterCode(code, codeVerifier)

    // Get user profile from Twitter
    const twitterAPI = new TwitterAPI(tokenResponse.access_token)
    const profile = await twitterAPI.getUserProfile()

    // Calculate token expiration
    const tokenExpiresAt = tokenResponse.expires_in ? Date.now() + tokenResponse.expires_in * 1000 : undefined

    // Save account to database
    await convex.mutation(api.socialAccounts.connectTwitterAccount, {
      clerkId: authState.userId,
      teamId: authState.teamId,
      platform: "twitter",
      platformUserId: profile.id,
      username: profile.username,
      displayName: profile.name,
      profileImageUrl: profile.profile_image_url,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      tokenExpiresAt,
      scopes: tokenResponse.scope?.split(" ") || [],
      metadata: {
        verified: profile.verified,
        description: profile.description,
        location: profile.location,
        url: profile.url,
        createdAt: profile.created_at,
        publicMetrics: profile.public_metrics,
      },
    })

    // Clear code verifier cookie
    const response = NextResponse.redirect(
      new URL(`${authState.returnUrl || "/settings/social-accounts"}?success=twitter`, request.url),
    )
    response.cookies.delete("twitter_code_verifier")

    return response
  } catch (error) {
    console.error("Twitter callback error:", error)

    // Clear code verifier cookie on error
    const response = NextResponse.redirect(
      new URL(
        `/settings/social-accounts?error=${encodeURIComponent("Failed to connect Twitter account")}`,
        request.url,
      ),
    )
    response.cookies.delete("twitter_code_verifier")

    return response
  }
}
