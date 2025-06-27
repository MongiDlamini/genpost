import { type NextRequest, NextResponse } from "next/server"
import { parseInstagramAuthState, exchangeInstagramCode } from "@/lib/social/instagram/auth"
import { InstagramAPI } from "@/lib/social/instagram/api"
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
      console.error("Instagram OAuth error:", error, errorDescription)
      return NextResponse.redirect(
        new URL(`/settings/social-accounts?error=${encodeURIComponent(errorDescription || error)}`, request.url),
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL("/settings/social-accounts?error=Missing authorization code", request.url))
    }

    // Parse auth state
    const authState = parseInstagramAuthState(state)

    // Exchange code for token
    const tokenResponse = await exchangeInstagramCode(code, authState.accountType)

    // Get user profile from Instagram
    const instagramAPI = new InstagramAPI(tokenResponse.access_token, authState.accountType)
    const profile = await instagramAPI.getUserProfile()

    // Calculate token expiration (Instagram tokens are long-lived)
    const tokenExpiresAt = tokenResponse.expires_in
      ? Date.now() + tokenResponse.expires_in * 1000
      : Date.now() + 60 * 24 * 60 * 60 * 1000 // 60 days default

    // Save account to database
    await convex.mutation(api.socialAccounts.connectInstagramAccount, {
      clerkId: authState.userId,
      teamId: authState.teamId,
      platform: "instagram",
      platformUserId: profile.id,
      username: profile.username,
      displayName: profile.username,
      profileImageUrl: undefined, // Instagram Basic Display doesn't provide profile image
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      tokenExpiresAt,
      accountType: authState.accountType,
      scopes: authState.accountType === "personal" ? ["user_profile", "user_media"] : ["instagram_basic"],
      metadata: {
        accountType: authState.accountType,
        mediaCount: profile.media_count,
        followersCount: profile.followers_count,
        followsCount: profile.follows_count,
      },
    })

    // Redirect to success page
    const redirectUrl = authState.returnUrl || "/settings/social-accounts"
    return NextResponse.redirect(new URL(`${redirectUrl}?success=instagram`, request.url))
  } catch (error) {
    console.error("Instagram callback error:", error)
    return NextResponse.redirect(
      new URL(
        `/settings/social-accounts?error=${encodeURIComponent("Failed to connect Instagram account")}`,
        request.url,
      ),
    )
  }
}
