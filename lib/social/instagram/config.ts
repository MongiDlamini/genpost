export const INSTAGRAM_CONFIG = {
  // Instagram Basic Display API
  basicDisplay: {
    clientId: process.env.INSTAGRAM_CLIENT_ID!,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
    redirectUri: process.env.NEXT_PUBLIC_APP_URL + "/api/auth/instagram/callback",
    scope: "user_profile,user_media",
    authUrl: "https://api.instagram.com/oauth/authorize",
    tokenUrl: "https://api.instagram.com/oauth/access_token",
    apiUrl: "https://graph.instagram.com",
  },
  // Instagram Graph API (for business accounts)
  graph: {
    clientId: process.env.INSTAGRAM_GRAPH_CLIENT_ID!,
    clientSecret: process.env.INSTAGRAM_GRAPH_CLIENT_SECRET!,
    redirectUri: process.env.NEXT_PUBLIC_APP_URL + "/api/auth/instagram-business/callback",
    scope: "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement",
    authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
    apiUrl: "https://graph.facebook.com/v18.0",
  },
}

export const INSTAGRAM_SCOPES = {
  basic: ["user_profile", "user_media"],
  business: ["instagram_basic", "instagram_content_publish", "pages_show_list", "pages_read_engagement"],
}
