import crypto from "crypto"

export interface TwitterWebhookEvent {
  for_user_id: string
  tweet_create_events?: Array<{
    id: string
    created_at: string
    text: string
    user: {
      id: string
      screen_name: string
      name: string
    }
  }>
  tweet_delete_events?: Array<{
    status: {
      id: string
      user_id: string
    }
    timestamp_ms: string
  }>
  follow_events?: Array<{
    type: "follow" | "unfollow"
    created_timestamp: string
    target: {
      id: string
      screen_name: string
    }
    source: {
      id: string
      screen_name: string
    }
  }>
  favorite_events?: Array<{
    id: string
    created_at: string
    favorited_status: {
      id: string
      user: {
        id: string
        screen_name: string
      }
    }
    user: {
      id: string
      screen_name: string
    }
  }>
}

export function verifyTwitterWebhook(signature: string, body: string, secret: string): boolean {
  const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("base64")

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(`sha256=${expectedSignature}`))
}

export function createTwitterChallengeResponse(crcToken: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(crcToken).digest("base64")
}
