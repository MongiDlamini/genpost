import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { PostStatusHandler } from "@/lib/webhooks/post-status-handler"

const VERIFY_TOKEN = "cD2lpeowM4QpWNMKZS8agGC7yLvdxwwBplZ5Mq4j6tk"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get("hub.mode")
    const token = searchParams.get("hub.verify_token")
    const challenge = searchParams.get("hub.challenge")

    console.log("Instagram webhook verification attempt:", {
      mode,
      token: token ? "***" : null,
      challenge: challenge ? "***" : null,
      timestamp: new Date().toISOString(),
    })

    if (mode !== "subscribe") {
      console.log("Instagram webhook verification failed: Invalid mode:", mode)
      return NextResponse.json({ error: "Invalid hub.mode" }, { status: 403 })
    }

    if (token !== VERIFY_TOKEN) {
      console.log("Instagram webhook verification failed: Invalid verify token")
      return NextResponse.json({ error: "Invalid verify token" }, { status: 403 })
    }

    console.log("Instagram webhook verification successful")
    return new NextResponse(challenge, { status: 200 })
  } catch (error) {
    console.error("Instagram webhook verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get("X-Hub-Signature-256")

    console.log("Instagram webhook event received:", {
      hasSignature: !!signature,
      bodyLength: rawBody.length,
      timestamp: new Date().toISOString(),
    })

    if (!signature) {
      console.log("Instagram webhook rejected: Missing X-Hub-Signature-256 header")
      return NextResponse.json({ error: "Missing signature header" }, { status: 403 })
    }

    const appSecret = process.env.FACEBOOK_APP_SECRET || process.env.META_APP_SECRET
    if (!appSecret) {
      console.error("Instagram webhook error: Missing FACEBOOK_APP_SECRET or META_APP_SECRET environment variable")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const expectedSignature = "sha256=" + crypto.createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex")

    const isValidSignature = crypto.timingSafeEqual(
      Buffer.from(signature, "utf8"),
      Buffer.from(expectedSignature, "utf8"),
    )

    if (!isValidSignature) {
      console.log("Instagram webhook rejected: Invalid signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
    }

    let webhookData
    try {
      webhookData = JSON.parse(rawBody)
    } catch (parseError) {
      console.error("Instagram webhook error: Invalid JSON payload:", parseError)
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
    }

    console.log("Instagram webhook event data:", {
      object: webhookData.object,
      entryCount: webhookData.entry?.length || 0,
      timestamp: new Date().toISOString(),
    })

    // Process webhook events using PostStatusHandler
    const postStatusHandler = new PostStatusHandler()

    if (webhookData.entry && Array.isArray(webhookData.entry)) {
      for (const entry of webhookData.entry) {
        console.log("Processing Instagram webhook entry:", {
          id: entry.id,
          time: entry.time,
          changes: entry.changes?.length || 0,
          messaging: entry.messaging?.length || 0,
        })

        // Handle post status updates
        await postStatusHandler.handleInstagramWebhook(entry)
      }
    }

    console.log("Instagram webhook processed successfully")
    return new NextResponse("EVENT_RECEIVED", { status: 200 })
  } catch (error) {
    console.error("Instagram webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
