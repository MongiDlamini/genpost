export const FACEBOOK_CONFIG = {
  clientId: process.env.FACEBOOK_CLIENT_ID!,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`,
  authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
  tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
  apiUrl: "https://graph.facebook.com/v18.0",
  scope:
    "pages_manage_posts,pages_read_engagement,pages_show_list,pages_manage_metadata,pages_read_user_content,instagram_basic,instagram_content_publish",
  webhookSecret: process.env.FACEBOOK_WEBHOOK_SECRET!,
  verifyToken: process.env.FACEBOOK_VERIFY_TOKEN!,
} as const

export const FACEBOOK_API_VERSION = "v18.0"
export const FACEBOOK_GRAPH_URL = `https://graph.facebook.com/${FACEBOOK_API_VERSION}`

export const FACEBOOK_SCOPES = [
  "pages_manage_posts", // Required for posting to pages
  "pages_read_engagement", // Required for reading page insights
  "pages_show_list", // Required for getting list of pages
  "public_profile", // Required for basic profile info
  "email", // Optional: for user email
  "instagram_basic", // Required for basic Instagram info
  "instagram_content_publish", // Required for publishing Instagram content
]

// Facebook Page permissions
export const FACEBOOK_PAGE_SCOPES = [
  "pages_manage_posts",
  "pages_read_engagement",
  "pages_manage_metadata",
  "pages_read_user_content",
]

// Facebook Graph API field expansions
export const FACEBOOK_USER_FIELDS = [
  "id",
  "name",
  "email",
  "picture",
  "accounts", // Pages the user manages
]

export const FACEBOOK_PAGE_FIELDS = [
  "id",
  "name",
  "username",
  "about",
  "category",
  "category_list",
  "cover",
  "description",
  "emails",
  "fan_count",
  "followers_count",
  "link",
  "location",
  "phone",
  "picture",
  "verification_status",
  "website",
  "access_token",
]

export const FACEBOOK_POST_FIELDS = [
  "id",
  "message",
  "story",
  "created_time",
  "updated_time",
  "type",
  "status_type",
  "permalink_url",
  "full_picture",
  "picture",
  "attachments",
  "likes.summary(true)",
  "comments.summary(true)",
  "shares",
  "reactions.summary(true)",
  "insights.metric(post_impressions,post_engaged_users,post_clicks)",
]

export const FACEBOOK_MEDIA_FIELDS = [
  "id",
  "created_time",
  "description",
  "media_type",
  "media_url",
  "permalink_url",
  "thumbnail_url",
  "timestamp",
]
