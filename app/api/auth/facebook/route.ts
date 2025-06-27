import { type NextRequest, NextResponse } from "next/server"
import { generateFacebookAuthUrl } from "@/lib/social/facebook/auth"
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

    const authUrl = generateFacebookAuthUrl({
      userId,
      teamId: teamId || undefined,
      returnUrl: returnUrl || undefined,
    })

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("Facebook auth error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
