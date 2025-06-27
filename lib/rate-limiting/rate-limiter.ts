export interface RateLimit {
  limit: number
  remaining: number
  resetTime: number
  windowStart: number
}

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  keyGenerator?: (identifier: string) => string
}

export class RateLimiter {
  private limits = new Map<string, RateLimit>()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  async checkLimit(identifier: string): Promise<{ allowed: boolean; limit: RateLimit }> {
    const key = this.config.keyGenerator ? this.config.keyGenerator(identifier) : identifier
    const now = Date.now()

    let limit = this.limits.get(key)

    if (!limit || now >= limit.resetTime) {
      // Initialize or reset the window
      limit = {
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
        windowStart: now,
      }
      this.limits.set(key, limit)
    }

    // Sliding window calculation
    const windowProgress = (now - limit.windowStart) / this.config.windowMs
    const allowedRequests = Math.floor(this.config.maxRequests * windowProgress)
    const usedRequests = this.config.maxRequests - limit.remaining

    if (usedRequests >= allowedRequests && limit.remaining <= 0) {
      return { allowed: false, limit }
    }

    // Consume a request
    limit.remaining = Math.max(0, limit.remaining - 1)
    this.limits.set(key, limit)

    return { allowed: true, limit }
  }

  updateFromHeaders(identifier: string, headers: Record<string, string>): void {
    const key = this.config.keyGenerator ? this.config.keyGenerator(identifier) : identifier

    const limit = Number.parseInt(headers["x-rate-limit-limit"] || headers["x-ratelimit-limit"] || "0")
    const remaining = Number.parseInt(headers["x-rate-limit-remaining"] || headers["x-ratelimit-remaining"] || "0")
    const reset = Number.parseInt(headers["x-rate-limit-reset"] || headers["x-ratelimit-reset"] || "0")

    if (limit > 0) {
      const resetTime = reset * 1000 // Convert to milliseconds
      this.limits.set(key, {
        limit,
        remaining,
        resetTime,
        windowStart: Date.now(),
      })
    }
  }

  getStatus(identifier: string): RateLimit | null {
    const key = this.config.keyGenerator ? this.config.keyGenerator(identifier) : identifier
    return this.limits.get(key) || null
  }

  getAllStatus(): Map<string, RateLimit> {
    return new Map(this.limits)
  }

  clearLimits(): void {
    this.limits.clear()
  }
}

// Platform-specific rate limiters
export const instagramRateLimiter = new RateLimiter({
  maxRequests: 200, // Instagram Basic Display API: 200 requests per hour
  windowMs: 60 * 60 * 1000, // 1 hour
  keyGenerator: (accountId: string) => `instagram:${accountId}`,
})

export const instagramGraphRateLimiter = new RateLimiter({
  maxRequests: 4800, // Instagram Graph API: 4800 requests per hour
  windowMs: 60 * 60 * 1000, // 1 hour
  keyGenerator: (accountId: string) => `instagram-graph:${accountId}`,
})

export const twitterRateLimiter = new RateLimiter({
  maxRequests: 300, // Twitter API v2: 300 requests per 15 minutes
  windowMs: 15 * 60 * 1000, // 15 minutes
  keyGenerator: (accountId: string) => `twitter:${accountId}`,
})

export const twitterUploadRateLimiter = new RateLimiter({
  maxRequests: 300, // Twitter Upload API: 300 requests per 15 minutes
  windowMs: 15 * 60 * 1000, // 15 minutes
  keyGenerator: (accountId: string) => `twitter-upload:${accountId}`,
})

export const facebookRateLimiter = new RateLimiter({
  maxRequests: 600, // Facebook Graph API: 600 requests per hour (app-level)
  windowMs: 60 * 60 * 1000, // 1 hour
  keyGenerator: (accountId: string) => `facebook:${accountId}`,
})

export const facebookPageRateLimiter = new RateLimiter({
  maxRequests: 4800, // Facebook Pages API: 4800 requests per hour
  windowMs: 60 * 60 * 1000, // 1 hour
  keyGenerator: (pageId: string) => `facebook-page:${pageId}`,
})
