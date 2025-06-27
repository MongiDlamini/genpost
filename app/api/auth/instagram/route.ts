import { type NextRequest, NextResponse } from "next/server"
import { generateInstagramAuthUrl } from "@/lib/social/instagram/auth"
import { auth } from "@clerk/nextjs/server"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const teamId = searchParams.get("teamId")
    const accountType = (searchParams.get("accountType") as "personal" | "business") || "personal"
    const returnUrl = searchParams.get("returnUrl")

    const authUrl = generateInstagramAuthUrl({
      userId,
      teamId: teamId || undefined,
      accountType,
      returnUrl: returnUrl || undefined,
    })

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("Instagram auth error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
