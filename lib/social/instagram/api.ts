import { INSTAGRAM_CONFIG } from "./config"

export interface InstagramUser {
  id: string
  username: string
  account_type?: "PERSONAL" | "BUSINESS" | "CREATOR"
  media_count?: number
  followers_count?: number
  follows_count?: number
}

export interface InstagramMedia {
  id: string
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"
  media_url: string
  thumbnail_url?: string
  caption?: string
  permalink: string
  timestamp: string
  like_count?: number
  comments_count?: number
}

export interface InstagramBusinessAccount {
  id: string
  name: string
  username: string
  profile_picture_url: string
  followers_count: number
  media_count: number
  biography?: string
  website?: string
}

export class InstagramAPI {
  private accessToken: string
  private accountType: "personal" | "business"

  constructor(accessToken: string, accountType: "personal" | "business") {
    this.accessToken = accessToken
    this.accountType = accountType
  }

  private get baseUrl() {
    return this.accountType === "business" ? INSTAGRAM_CONFIG.graph.apiUrl : INSTAGRAM_CONFIG.basicDisplay.apiUrl
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Instagram API error: ${response.status} ${error}`)
    }

    return await response.json()
  }

  async getUserProfile(): Promise<InstagramUser> {
    if (this.accountType === "personal") {
      return await this.makeRequest("/me?fields=id,username,media_count")
    } else {
      // For business accounts, we need to get the Instagram business account ID first
      const pages = await this.makeRequest("/me/accounts?fields=instagram_business_account")
      const instagramAccount = pages.data?.[0]?.instagram_business_account

      if (!instagramAccount) {
        throw new Error("No Instagram business account found")
      }

      return await this.makeRequest(
        `/${instagramAccount.id}?fields=id,username,account_type,media_count,followers_count,follows_count`,
      )
    }
  }

  async getUserMedia(limit = 25): Promise<InstagramMedia[]> {
    if (this.accountType === "personal") {
      const response = await this.makeRequest(
        `/me/media?fields=id,media_type,media_url,thumbnail_url,caption,permalink,timestamp&limit=${limit}`,
      )
      return response.data || []
    } else {
      // Get Instagram business account ID first
      const user = await this.getUserProfile()
      const response = await this.makeRequest(
        `/${user.id}/media?fields=id,media_type,media_url,thumbnail_url,caption,permalink,timestamp,like_count,comments_count&limit=${limit}`,
      )
      return response.data || []
    }
  }

  async publishPhoto(imageUrl: string, caption?: string): Promise<{ id: string }> {
    if (this.accountType === "personal") {
      throw new Error("Publishing not supported for personal Instagram accounts")
    }

    // Get Instagram business account ID
    const user = await this.getUserProfile()

    // Step 1: Create media container
    const containerResponse = await this.makeRequest(`/${user.id}/media`, {
      method: "POST",
      body: JSON.stringify({
        image_url: imageUrl,
        caption: caption || "",
      }),
    })

    const containerId = containerResponse.id

    // Step 2: Publish the media
    const publishResponse = await this.makeRequest(`/${user.id}/media_publish`, {
      method: "POST",
      body: JSON.stringify({
        creation_id: containerId,
      }),
    })

    return { id: publishResponse.id }
  }

  async publishCarousel(mediaItems: Array<{ imageUrl: string; isVideo?: boolean }>): Promise<{ id: string }> {
    if (this.accountType === "personal") {
      throw new Error("Publishing not supported for personal Instagram accounts")
    }

    const user = await this.getUserProfile()

    // Step 1: Create media containers for each item
    const containerIds = await Promise.all(
      mediaItems.map(async (item) => {
        const response = await this.makeRequest(`/${user.id}/media`, {
          method: "POST",
          body: JSON.stringify({
            image_url: item.imageUrl,
            is_carousel_item: true,
          }),
        })
        return response.id
      }),
    )

    // Step 2: Create carousel container
    const carouselResponse = await this.makeRequest(`/${user.id}/media`, {
      method: "POST",
      body: JSON.stringify({
        media_type: "CAROUSEL",
        children: containerIds.join(","),
      }),
    })

    // Step 3: Publish the carousel
    const publishResponse = await this.makeRequest(`/${user.id}/media_publish`, {
      method: "POST",
      body: JSON.stringify({
        creation_id: carouselResponse.id,
      }),
    })

    return { id: publishResponse.id }
  }

  async getMediaInsights(mediaId: string): Promise<any> {
    if (this.accountType === "personal") {
      throw new Error("Insights not available for personal Instagram accounts")
    }

    return await this.makeRequest(
      `/${mediaId}/insights?metric=engagement,impressions,reach,saved,video_views,likes,comments,shares`,
    )
  }

  async getAccountInsights(period: "day" | "week" | "days_28" = "day"): Promise<any> {
    if (this.accountType === "personal") {
      throw new Error("Insights not available for personal Instagram accounts")
    }

    const user = await this.getUserProfile()
    return await this.makeRequest(
      `/${user.id}/insights?metric=impressions,reach,profile_views,website_clicks&period=${period}`,
    )
  }
}
