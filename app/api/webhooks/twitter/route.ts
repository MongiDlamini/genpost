import { type NextRequest, NextResponse } from "next/server"
import {
  verifyTwitterWebhook,
  createTwitterChallengeResponse,
  type TwitterWebhookEvent,
} from "@/lib/social/twitter/webhook"
import { PostStatusHandler } from "@/lib/webhooks/post-status-handler"

const TWITTER_WEBHOOK_SECRET = process.env.TWITTER_WEBHOOK_SECRET!

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const crcToken = searchParams.get("crc_token")

  if (!crcToken) {
    return NextResponse.json({ error: "Missing crc_token" }, { status: 400 })
  }

  try {
    const responseToken = createTwitterChallengeResponse(crcToken, TWITTER_WEBHOOK_SECRET)
    return NextResponse.json({ response_token: `sha256=${responseToken}` })
  } catch (error) {
    console.error("Twitter webhook challenge error:", error)
    return NextResponse.json({ error: "Invalid challenge" }, { status: 400 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-twitter-webhooks-signature")
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 })
    }

    const body = await request.text()

    if (!verifyTwitterWebhook(signature, body, TWITTER_WEBHOOK_SECRET)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event: TwitterWebhookEvent = JSON.parse(body)

    console.log("Twitter webhook event received:", {
      for_user_id: event.for_user_id,
      tweet_create_events: event.tweet_create_events?.length || 0,
      tweet_delete_events: event.tweet_delete_events?.length || 0,
      follow_events: event.follow_events?.length || 0,
      favorite_events: event.favorite_events?.length || 0,
    })

    // Process webhook events using PostStatusHandler
    const postStatusHandler = new PostStatusHandler()
    await postStatusHandler.handleTwitterWebhook(event)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Twitter webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
