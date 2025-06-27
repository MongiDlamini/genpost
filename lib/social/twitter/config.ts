export const TWITTER_CONFIG = {
  clientId: process.env.TWITTER_CLIENT_ID!,
  clientSecret: process.env.TWITTER_CLIENT_SECRET!,
  redirectUri: process.env.NEXT_PUBLIC_APP_URL + "/api/auth/twitter/callback",
  scope: "tweet.read tweet.write users.read follows.read follows.write offline.access",
  authUrl: "https://twitter.com/i/oauth2/authorize",
  tokenUrl: "https://api.twitter.com/2/oauth2/token",
  revokeUrl: "https://api.twitter.com/2/oauth2/revoke",
  apiUrl: "https://api.twitter.com/2",
}

export const TWITTER_SCOPES = [
  "tweet.read",
  "tweet.write",
  "users.read",
  "follows.read",
  "follows.write",
  "offline.access", // For refresh tokens
]

// Twitter API v2 field expansions
export const TWITTER_USER_FIELDS = [
  "id",
  "name",
  "username",
  "description",
  "profile_image_url",
  "public_metrics",
  "verified",
  "created_at",
  "location",
  "url",
  "entities",
]

export const TWITTER_TWEET_FIELDS = [
  "id",
  "text",
  "created_at",
  "author_id",
  "public_metrics",
  "context_annotations",
  "entities",
  "geo",
  "in_reply_to_user_id",
  "lang",
  "possibly_sensitive",
  "referenced_tweets",
  "reply_settings",
  "source",
  "withheld",
]

export const TWITTER_MEDIA_FIELDS = [
  "media_key",
  "type",
  "url",
  "duration_ms",
  "height",
  "preview_image_url",
  "public_metrics",
  "width",
  "alt_text",
]
