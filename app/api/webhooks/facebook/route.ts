import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const VERIFY_TOKEN = "cD2lpeowM4QpWNMKZS8agGC7yLvdxwwBplZ5Mq4j6tk"

// GET request handler for webhook verification
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const mode = searchParams.get("hub.mode")
    const token = searchParams.get("hub.verify_token")
    const challenge = searchParams.get("hub.challenge")

    console.log("Facebook webhook verification request:", { mode, token, challenge })

    // Check if mode and token are valid
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Facebook webhook verified successfully")
      return new Response(challenge, { status: 200 })
    } else {
      console.error("Facebook webhook verification failed:", { mode, token })
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  } catch (error) {
    console.error("Facebook webhook verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST request handler for webhook events
export async function POST(request: NextRequest) {
  try {
    const appSecret = process.env.FACEBOOK_APP_SECRET
    if (!appSecret) {
      console.error("FACEBOOK_APP_SECRET environment variable not set")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Get the signature from headers
    const signature = request.headers.get("x-hub-signature-256")
    if (!signature) {
      console.error("Missing X-Hub-Signature-256 header")
      return NextResponse.json({ error: "Missing signature" }, { status: 403 })
    }

    // Get raw body for signature verification
    const body = await request.text()

    // Calculate expected signature
    const expectedSignature = "sha256=" + crypto.createHmac("sha256", appSecret).update(body).digest("hex")

    // Use timing-safe comparison
    const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))

    if (!isValid) {
      console.error("Invalid signature:", { received: signature, expected: expectedSignature })
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
    }

    // Parse the webhook payload
    let payload
    try {
      payload = JSON.parse(body)
    } catch (parseError) {
      console.error("Failed to parse webhook payload:", parseError)
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
    }

    // Log the webhook event
    console.log("Facebook webhook event received:", {
      timestamp: new Date().toISOString(),
      object: payload.object,
      entries: payload.entry?.length || 0,
    })

    // Process webhook events
    if (payload.object === "page") {
      for (const entry of payload.entry || []) {
        console.log("Processing page entry:", {
          pageId: entry.id,
          time: new Date(entry.time * 1000).toISOString(),
          changes: entry.changes?.length || 0,
          messaging: entry.messaging?.length || 0,
        })

        // Handle page feed changes
        if (entry.changes) {
          for (const change of entry.changes) {
            console.log("Page change event:", {
              field: change.field,
              value: change.value,
            })

            // Handle different types of changes
            switch (change.field) {
              case "feed":
                console.log("Page feed change:", change.value)
                break
              case "mention":
                console.log("Page mention:", change.value)
                break
              case "name":
                console.log("Page name change:", change.value)
                break
              default:
                console.log("Unknown page change:", change)
            }
          }
        }

        // Handle Messenger events
        if (entry.messaging) {
          for (const messagingEvent of entry.messaging) {
            console.log("Messenger event:", {
              senderId: messagingEvent.sender?.id,
              recipientId: messagingEvent.recipient?.id,
              timestamp: new Date(messagingEvent.timestamp).toISOString(),
              hasMessage: !!messagingEvent.message,
              hasPostback: !!messagingEvent.postback,
            })
          }
        }
      }
    }

    // Respond with success
    return new Response("EVENT_RECEIVED", { status: 200 })
  } catch (error) {
    console.error("Facebook webhook processing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
