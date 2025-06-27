import { type NextRequest, NextResponse } from "next/server"
import { generateTwitterAuthUrl, generateCodeVerifier } from "@/lib/social/twitter/auth"
import { auth } from "@clerk/nextjs/server"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const teamId = searchParams.get("teamId")
    const returnUrl = searchParams.get("returnUrl")

    // Generate code verifier for PKCE
    const codeVerifier = generateCodeVerifier()

    const authUrl = generateTwitterAuthUrl({
      userId,
      teamId: teamId || undefined,
      returnUrl: returnUrl || undefined,
      codeVerifier,
    })

    // Store code verifier in session/cookie for callback
    const response = NextResponse.redirect(authUrl)
    response.cookies.set("twitter_code_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
    })

    return response
  } catch (error) {
    console.error("Twitter auth error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
