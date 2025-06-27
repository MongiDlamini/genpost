import { SocialApiClient } from "@/lib/api-client/social-api-client"
import { FacebookAPI } from "./api"

export class FacebookAPIWithRetry extends FacebookAPI {
  private apiClient: SocialApiClient

  constructor(accessToken: string, accountId: string) {
    super(accessToken)
    this.apiClient = SocialApiClient.createFacebookClient(accountId)
  }

  /**
   * Get user pages with rate limiting and retry logic
   */
  async getUserPagesWithRetry() {
    return await this.apiClient.makeRequest(async (token) => {
      const api = new FacebookAPI(token)
      return await api.getPages()
    })
  }

  /**
   * Create post with rate limiting and retry logic
   */
  async createPostWithRetry(
    pageId: string,
    pageAccessToken: string,
    content: {
      message?: string
      link?: string
      picture?: string
      scheduled_publish_time?: number
      published?: boolean
    },
  ) {
    return await this.apiClient.makeRequest(
      async () => {
        const api = new FacebookAPI(pageAccessToken)
        return await api.createPost(pageId, pageAccessToken, content)
      },
      {
        requiresAuth: false, // We're using page access token directly
        customRetryConfig: {
          maxRetries: 4,
          baseDelayMs: 2000,
        },
      },
    )
  }

  /**
   * Upload photo with rate limiting and retry logic
   */
  async uploadPhotoWithRetry(
    pageId: string,
    pageAccessToken: string,
    photoData: {
      source: File | Blob
      message?: string
      scheduled_publish_time?: number
      published?: boolean
    },
  ) {
    return await this.apiClient.makeRequest(
      async () => {
        const api = new FacebookAPI(pageAccessToken)
        return await api.uploadPhoto(pageId, pageAccessToken, photoData)
      },
      {
        requiresAuth: false,
        customRetryConfig: {
          maxRetries: 5,
          baseDelayMs: 3000,
          maxDelayMs: 120000, // 2 minutes max for uploads
        },
      },
    )
  }

  /**
   * Get page posts with rate limiting and retry logic
   */
  async getPagePostsWithRetry(
    pageId: string,
    pageAccessToken: string,
    options: {
      limit?: number
      since?: string
      until?: string
    } = {},
  ) {
    return await this.apiClient.makeRequest(async () => {
      const api = new FacebookAPI(pageAccessToken)
      return await api.getPagePosts(pageId, pageAccessToken, options)
    })
  }

  /**
   * Get page insights with rate limiting and retry logic
   */
  async getPageInsightsWithRetry(
    pageId: string,
    pageAccessToken: string,
    metrics: string[] = ["page_fans", "page_impressions"],
    period: "day" | "week" | "days_28" = "day",
  ) {
    return await this.apiClient.makeRequest(async () => {
      const api = new FacebookAPI(pageAccessToken)
      return await api.getPageInsights(pageId, pageAccessToken, metrics, period)
    })
  }

  /**
   * Batch get insights for multiple pages
   */
  async batchGetPageInsights(
    pages: Array<{
      pageId: string
      pageAccessToken: string
      id: string
    }>,
    metrics: string[] = ["page_fans", "page_impressions"],
  ) {
    const requests = pages.map((page) => ({
      id: page.id,
      requestFn: async () => {
        const api = new FacebookAPI(page.pageAccessToken)
        return await api.getPageInsights(page.pageId, page.pageAccessToken, metrics)
      },
    }))

    return await this.apiClient.makeBatchRequests(requests, {
      batchSize: 4,
      delayBetweenBatches: 1500,
      requiresAuth: false,
    })
  }

  /**
   * Check if we can make requests
   */
  canMakeRequest(): boolean {
    return this.apiClient.canMakeRequest()
  }

  /**
   * Get rate limit status
   */
  getRateLimitStatus() {
    return this.apiClient.getRateLimitStatus()
  }
}
