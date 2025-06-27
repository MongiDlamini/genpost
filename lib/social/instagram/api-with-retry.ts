import { SocialApiClient } from "@/lib/api-client/social-api-client"
import { InstagramAPI } from "./api"

export class InstagramAPIWithRetry extends InstagramAPI {
  private apiClient: SocialApiClient

  constructor(accessToken: string, accountType: "personal" | "business", accountId: string) {
    super(accessToken, accountType)
    this.apiClient = SocialApiClient.createInstagramClient(accountId)
  }

  /**
   * Get user profile with rate limiting and retry logic
   */
  async getUserProfileWithRetry() {
    return await this.apiClient.makeRequest(async (token) => {
      const api = new InstagramAPI(token, this.accountType)
      return await api.getUserProfile()
    })
  }

  /**
   * Get user media with rate limiting and retry logic
   */
  async getUserMediaWithRetry(limit = 25) {
    return await this.apiClient.makeRequest(async (token) => {
      const api = new InstagramAPI(token, this.accountType)
      return await api.getUserMedia(limit)
    })
  }

  /**
   * Publish photo with rate limiting and retry logic
   */
  async publishPhotoWithRetry(imageUrl: string, caption?: string) {
    return await this.apiClient.makeRequest(
      async (token) => {
        const api = new InstagramAPI(token, this.accountType)
        return await api.publishPhoto(imageUrl, caption)
      },
      {
        customRetryConfig: {
          maxRetries: 5, // More retries for publishing
          baseDelayMs: 2000, // Longer base delay
        },
      },
    )
  }

  /**
   * Publish carousel with rate limiting and retry logic
   */
  async publishCarouselWithRetry(mediaItems: Array<{ imageUrl: string; isVideo?: boolean }>) {
    return await this.apiClient.makeRequest(
      async (token) => {
        const api = new InstagramAPI(token, this.accountType)
        return await api.publishCarousel(mediaItems)
      },
      {
        customRetryConfig: {
          maxRetries: 5,
          baseDelayMs: 3000, // Even longer for carousel
        },
      },
    )
  }

  /**
   * Get media insights with rate limiting and retry logic
   */
  async getMediaInsightsWithRetry(mediaId: string) {
    return await this.apiClient.makeRequest(async (token) => {
      const api = new InstagramAPI(token, this.accountType)
      return await api.getMediaInsights(mediaId)
    })
  }

  /**
   * Batch get insights for multiple media items
   */
  async batchGetMediaInsights(mediaIds: string[]) {
    const requests = mediaIds.map((mediaId) => ({
      id: mediaId,
      requestFn: async (token: string) => {
        const api = new InstagramAPI(token, this.accountType)
        return await api.getMediaInsights(mediaId)
      },
    }))

    return await this.apiClient.makeBatchRequests(requests, {
      batchSize: 3, // Smaller batches for insights
      delayBetweenBatches: 2000,
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
