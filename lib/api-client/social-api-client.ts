import type { RateLimiter } from "@/lib/rate-limiting/rate-limiter"
import type { RetryHandler } from "@/lib/rate-limiting/retry-handler"
import type { OAuthTokenManager } from "@/lib/oauth/token-manager"
import { fetch } from "node-fetch"
import type { RetryConfig } from "@/lib/rate-limiting/retry-config"

export interface ApiClientConfig {
  platform: "instagram" | "twitter" | "facebook"
  accountId: string
  retryConfig?: Partial<RetryConfig>
  rateLimitIdentifier?: string
  rateLimiter: RateLimiter
  retryHandler: RetryHandler
  tokenManager: OAuthTokenManager
  baseURL: string
}

export interface ApiRequest {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  endpoint: string
  data?: any
  headers?: Record<string, string>
  accountId: string
}

export interface ApiResponse<T = any> {
  data: T
  status: number
  headers: Record<string, string>
  rateLimit?: {
    limit: number
    remaining: number
    resetTime: number
  }
}

/**
 * Unified API client with rate limiting and retry logic
 * Handles authentication, rate limiting, and error recovery for all platforms
 */
export class SocialApiClient {
  private config: ApiClientConfig

  constructor(config: ApiClientConfig) {
    this.config = config
  }

  async request<T = any>(request: ApiRequest): Promise<ApiResponse<T>> {
    // Check rate limit
    const rateLimitCheck = await this.config.rateLimiter.checkLimit(request.accountId)
    if (!rateLimitCheck.allowed) {
      const waitTime = rateLimitCheck.limit.resetTime - Date.now()
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds.`)
    }

    // Execute request with retry logic
    const result = await this.config.retryHandler.execute(async () => {
      // Get fresh access token
      const token = await this.config.tokenManager.getValidToken(request.accountId)
      if (!token) {
        throw new Error("No valid access token available")
      }

      // Make the API request
      const response = await fetch(`${this.config.baseURL}${request.endpoint}`, {
        method: request.method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...request.headers,
        },
        body: request.data ? JSON.stringify(request.data) : undefined,
      })

      // Update rate limit from response headers
      this.config.rateLimiter.updateFromHeaders(request.accountId, {
        "x-rate-limit-limit": response.headers.get("x-rate-limit-limit") || "",
        "x-rate-limit-remaining": response.headers.get("x-rate-limit-remaining") || "",
        "x-rate-limit-reset": response.headers.get("x-rate-limit-reset") || "",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const error = new Error(`API request failed: ${response.status} ${response.statusText}`)
        ;(error as any).response = {
          status: response.status,
          statusText: response.statusText,
          data: errorData,
        }
        throw error
      }

      const data = await response.json()
      const headers: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        headers[key] = value
      })

      return {
        data,
        status: response.status,
        headers,
        rateLimit: {
          limit: Number.parseInt(headers["x-rate-limit-limit"] || "0"),
          remaining: Number.parseInt(headers["x-rate-limit-remaining"] || "0"),
          resetTime: Number.parseInt(headers["x-rate-limit-reset"] || "0") * 1000,
        },
      }
    })

    if (!result.success) {
      throw result.error
    }

    return result.data!
  }

  async batchRequest<T = any>(requests: ApiRequest[]): Promise<ApiResponse<T>[]> {
    const results: ApiResponse<T>[] = []

    // Process requests with proper spacing to respect rate limits
    for (const request of requests) {
      try {
        const response = await this.request<T>(request)
        results.push(response)

        // Add small delay between requests to prevent overwhelming the API
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Batch request failed for ${request.endpoint}:`, error)
        // Continue with other requests even if one fails
      }
    }

    return results
  }

  getRateLimitStatus(accountId: string) {
    return this.config.rateLimiter.getStatus(accountId)
  }

  getAllRateLimitStatus() {
    return this.config.rateLimiter.getAllStatus()
  }
}
