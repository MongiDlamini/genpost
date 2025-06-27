import { FACEBOOK_GRAPH_URL } from "./config"

export interface FacebookPage {
  id: string
  name: string
  access_token: string
  category: string
  tasks: string[]
  fan_count?: number
  followers_count?: number
  picture?: {
    data: {
      url: string
    }
  }
}

export interface FacebookPost {
  id: string
  message?: string
  story?: string
  created_time: string
  updated_time?: string
  permalink_url?: string
  full_picture?: string
  attachments?: any
  reactions?: any
  comments?: any
  shares?: any
}

export class FacebookAPI {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  /**
   * Get user's Facebook pages
   */
  async getPages(): Promise<FacebookPage[]> {
    const response = await fetch(
      `${FACEBOOK_GRAPH_URL}/me/accounts?fields=id,name,access_token,category,tasks,fan_count,followers_count,picture&access_token=${this.accessToken}`,
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to get Facebook pages: ${error}`)
    }

    const data = await response.json()
    return data.data || []
  }

  /**
   * Get page information
   */
  async getPage(pageId: string, pageAccessToken: string): Promise<FacebookPage> {
    const response = await fetch(
      `${FACEBOOK_GRAPH_URL}/${pageId}?fields=id,name,category,fan_count,followers_count,picture&access_token=${pageAccessToken}`,
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to get Facebook page: ${error}`)
    }

    return await response.json()
  }

  /**
   * Create a post on a Facebook page
   */
  async createPost(
    pageId: string,
    pageAccessToken: string,
    content: {
      message?: string
      link?: string
      picture?: string
      name?: string
      caption?: string
      description?: string
      scheduled_publish_time?: number
      published?: boolean
    },
  ): Promise<{ id: string; post_id?: string }> {
    const formData = new FormData()

    Object.entries(content).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString())
      }
    })

    const response = await fetch(`${FACEBOOK_GRAPH_URL}/${pageId}/feed`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pageAccessToken}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create Facebook post: ${error}`)
    }

    return await response.json()
  }

  /**
   * Upload photo to Facebook page
   */
  async uploadPhoto(
    pageId: string,
    pageAccessToken: string,
    photoData: {
      source: File | Blob
      message?: string
      alt_text_custom?: string
      scheduled_publish_time?: number
      published?: boolean
    },
  ): Promise<{ id: string; post_id?: string }> {
    const formData = new FormData()
    formData.append("source", photoData.source)

    if (photoData.message) formData.append("message", photoData.message)
    if (photoData.alt_text_custom) formData.append("alt_text_custom", photoData.alt_text_custom)
    if (photoData.scheduled_publish_time) {
      formData.append("scheduled_publish_time", photoData.scheduled_publish_time.toString())
    }
    if (photoData.published !== undefined) {
      formData.append("published", photoData.published.toString())
    }

    const response = await fetch(`${FACEBOOK_GRAPH_URL}/${pageId}/photos`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pageAccessToken}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to upload Facebook photo: ${error}`)
    }

    return await response.json()
  }

  /**
   * Upload video to Facebook page
   */
  async uploadVideo(
    pageId: string,
    pageAccessToken: string,
    videoData: {
      source: File | Blob
      title?: string
      description?: string
      scheduled_publish_time?: number
      published?: boolean
    },
  ): Promise<{ id: string }> {
    const formData = new FormData()
    formData.append("source", videoData.source)

    if (videoData.title) formData.append("title", videoData.title)
    if (videoData.description) formData.append("description", videoData.description)
    if (videoData.scheduled_publish_time) {
      formData.append("scheduled_publish_time", videoData.scheduled_publish_time.toString())
    }
    if (videoData.published !== undefined) {
      formData.append("published", videoData.published.toString())
    }

    const response = await fetch(`${FACEBOOK_GRAPH_URL}/${pageId}/videos`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pageAccessToken}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to upload Facebook video: ${error}`)
    }

    return await response.json()
  }

  /**
   * Get page posts
   */
  async getPagePosts(
    pageId: string,
    pageAccessToken: string,
    options: {
      limit?: number
      since?: string
      until?: string
      fields?: string
    } = {},
  ): Promise<FacebookPost[]> {
    const params = new URLSearchParams({
      access_token: pageAccessToken,
      fields:
        options.fields ||
        "id,message,story,created_time,updated_time,permalink_url,full_picture,attachments,reactions.summary(true),comments.summary(true),shares",
      limit: (options.limit || 25).toString(),
    })

    if (options.since) params.append("since", options.since)
    if (options.until) params.append("until", options.until)

    const response = await fetch(`${FACEBOOK_GRAPH_URL}/${pageId}/posts?${params.toString()}`)

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to get Facebook page posts: ${error}`)
    }

    const data = await response.json()
    return data.data || []
  }

  /**
   * Delete a post
   */
  async deletePost(postId: string, pageAccessToken: string): Promise<{ success: boolean }> {
    const response = await fetch(`${FACEBOOK_GRAPH_URL}/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${pageAccessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to delete Facebook post: ${error}`)
    }

    return await response.json()
  }

  /**
   * Get page insights
   */
  async getPageInsights(
    pageId: string,
    pageAccessToken: string,
    metrics: string[] = ["page_fans", "page_impressions", "page_engaged_users"],
    period: "day" | "week" | "days_28" = "day",
    since?: string,
    until?: string,
  ): Promise<any[]> {
    const params = new URLSearchParams({
      access_token: pageAccessToken,
      metric: metrics.join(","),
      period,
    })

    if (since) params.append("since", since)
    if (until) params.append("until", until)

    const response = await fetch(`${FACEBOOK_GRAPH_URL}/${pageId}/insights?${params.toString()}`)

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to get Facebook page insights: ${error}`)
    }

    const data = await response.json()
    return data.data || []
  }

  /**
   * Get post insights
   */
  async getPostInsights(
    postId: string,
    pageAccessToken: string,
    metrics: string[] = ["post_impressions", "post_engaged_users", "post_clicks"],
  ): Promise<any[]> {
    const params = new URLSearchParams({
      access_token: pageAccessToken,
      metric: metrics.join(","),
    })

    const response = await fetch(`${FACEBOOK_GRAPH_URL}/${postId}/insights?${params.toString()}`)

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to get Facebook post insights: ${error}`)
    }

    const data = await response.json()
    return data.data || []
  }

  /**
   * Get user profile information
   */
  async getUserProfile(): Promise<{
    id: string
    name: string
    email?: string
    picture?: { data: { url: string } }
  }> {
    const response = await fetch(
      `${FACEBOOK_GRAPH_URL}/me?fields=id,name,email,picture&access_token=${this.accessToken}`,
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to get Facebook user profile: ${error}`)
    }

    return await response.json()
  }
}
