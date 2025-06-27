import { SocialApiClient } from "@/lib/api-client/social-api-client"
import { TwitterAPI } from "./api"

export class TwitterAPIWithRetry extends TwitterAPI {
  private apiClient: SocialApiClient
  private uploadClient: SocialApiClient

  constructor(accessToken: string, accountId: string) {
    super(accessToken)
    this.apiClient = SocialApiClient.createTwitterClient(accountId, "standard")
    this.uploadClient = SocialApiClient.createTwitterClient(accountId, "upload")
  }

  /**
   * Get user profile with rate limiting and retry logic
   */
  async getUserProfileWithRetry(userId?: string) {
    return await this.apiClient.makeRequest(async (token) => {
      const api = new TwitterAPI(token)
      return await api.getUserProfile(userId)
    })
  }

  /**
   * Create tweet with rate limiting and retry logic
   */
  async createTweetWithRetry(options: {
    text: string
    media_ids?: string[]
    reply?: { in_reply_to_tweet_id: string }
    quote_tweet_id?: string
  }) {
    return await this.apiClient.makeRequest(
      async (token) => {
        const api = new TwitterAPI(token)
        return await api.createTweet(options)
      },
      {
        customRetryConfig: {
          maxRetries: 3,
          baseDelayMs: 1500,
        },
        isRetryableError: (error) => {
          // Don't retry duplicate tweets
          if (error.message.includes("duplicate")) {
            return false
          }
          return true
        },
      },
    )
  }

  /**
   * Upload media with rate limiting and retry logic
   */
  async uploadMediaWithRetry(mediaData: Buffer, mediaType: string, altText?: string) {
    return await this.uploadClient.makeRequest(
      async (token) => {
        const api = new TwitterAPI(token)
        return await api.uploadMedia(mediaData, mediaType, altText)
      },
      {
        customRetryConfig: {
          maxRetries: 5,
          baseDelayMs: 2000,
          maxDelayMs: 60000, // Longer max delay for uploads
        },
      },
    )
  }

  /**
   * Get user tweets with rate limiting and retry logic
   */
  async getUserTweetsWithRetry(
    userId: string,
    options: {
      max_results?: number
      since_id?: string
      until_id?: string
    } = {},
  ) {
    return await this.apiClient.makeRequest(async (token) => {
      const api = new TwitterAPI(token)
      return await api.getUserTweets(userId, options)
    })
  }

  /**
   * Search tweets with rate limiting and retry logic
   */
  async searchTweetsWithRetry(
    query: string,
    options: {
      max_results?: number
      next_token?: string
    } = {},
  ) {
    return await this.apiClient.makeRequest(async (token) => {
      const api = new TwitterAPI(token)
      return await api.searchTweets(query, options)
    })
  }

  /**
   * Batch upload multiple media files
   */
  async batchUploadMedia(
    mediaFiles: Array<{
      data: Buffer
      type: string
      altText?: string
      id: string
    }>,
  ) {
    const requests = mediaFiles.map((file) => ({
      id: file.id,
      requestFn: async (token: string) => {
        const api = new TwitterAPI(token)
        return await api.uploadMedia(file.data, file.type, file.altText)
      },
    }))

    return await this.uploadClient.makeBatchRequests(requests, {
      batchSize: 2, // Smaller batches for uploads
      delayBetweenBatches: 3000,
    })
  }

  /**
   * Check if we can make requests
   */
  canMakeRequest(): boolean {
    return this.apiClient.canMakeRequest()
  }

  /**
   * Check if we can upload media
   */
  canUploadMedia(): boolean {
    return this.uploadClient.canMakeRequest()
  }

  /**
   * Get rate limit status for standard API
   */
  getRateLimitStatus() {
    return this.apiClient.getRateLimitStatus()
  }

  /**
   * Get rate limit status for upload API
   */
  getUploadRateLimitStatus() {
    return this.uploadClient.getRateLimitStatus()
  }
}
