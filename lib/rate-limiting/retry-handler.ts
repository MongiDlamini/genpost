export interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  multiplier: number
  jitter: boolean
  retryCondition?: (error: any) => boolean
}

export interface RetryResult<T> {
  success: boolean
  data?: T
  error?: any
  attempts: number
  totalDelay: number
}

export class RetryHandler {
  private config: RetryConfig

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxAttempts: 3,
      baseDelay: 1000, // 1 second
      maxDelay: 30000, // 30 seconds
      multiplier: 2,
      jitter: true,
      retryCondition: this.defaultRetryCondition,
      ...config,
    }
  }

  async execute<T>(operation: () => Promise<T>): Promise<RetryResult<T>> {
    let lastError: any
    let totalDelay = 0

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        const data = await operation()
        return {
          success: true,
          data,
          attempts: attempt,
          totalDelay,
        }
      } catch (error) {
        lastError = error

        // Check if we should retry
        if (attempt === this.config.maxAttempts || !this.shouldRetry(error)) {
          break
        }

        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempt)
        totalDelay += delay

        console.log(`Retry attempt ${attempt} failed, retrying in ${delay}ms:`, error.message)
        await this.sleep(delay)
      }
    }

    return {
      success: false,
      error: lastError,
      attempts: this.config.maxAttempts,
      totalDelay,
    }
  }

  private shouldRetry(error: any): boolean {
    if (this.config.retryCondition) {
      return this.config.retryCondition(error)
    }
    return this.defaultRetryCondition(error)
  }

  private defaultRetryCondition(error: any): boolean {
    // Retry on network errors, timeouts, and 5xx server errors
    if (error.code === "ECONNRESET" || error.code === "ETIMEDOUT" || error.code === "ENOTFOUND") {
      return true
    }

    // Retry on HTTP 5xx errors and rate limit errors
    if (error.response?.status >= 500 || error.response?.status === 429) {
      return true
    }

    // Retry on specific platform errors
    if (error.message?.includes("Rate limit exceeded")) {
      return true
    }

    // Don't retry on 4xx client errors (except 429)
    if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
      return false
    }

    return true
  }

  private calculateDelay(attempt: number): number {
    const exponentialDelay = this.config.baseDelay * Math.pow(this.config.multiplier, attempt - 1)
    let delay = Math.min(exponentialDelay, this.config.maxDelay)

    // Add jitter to prevent thundering herd
    if (this.config.jitter) {
      const jitterAmount = Math.random() * 100 // 0-100ms jitter
      delay += jitterAmount
    }

    return Math.floor(delay)
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// Platform-specific retry handlers
export const instagramRetryHandler = new RetryHandler({
  maxAttempts: 3,
  baseDelay: 2000,
  maxDelay: 30000,
  multiplier: 2,
  jitter: true,
  retryCondition: (error) => {
    // Instagram-specific retry conditions
    if (error.response?.status === 400 && error.response?.data?.error?.code === 24) {
      // Instagram publishing limit reached - don't retry
      return false
    }

    if (error.response?.status === 400 && error.response?.data?.error?.message?.includes("duplicate")) {
      // Duplicate content - don't retry
      return false
    }

    // Use default retry logic for other errors
    return new RetryHandler().shouldRetry(error)
  },
})

export const twitterRetryHandler = new RetryHandler({
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 60000, // Twitter rate limits can be longer
  multiplier: 2,
  jitter: true,
  retryCondition: (error) => {
    // Twitter-specific retry conditions
    if (error.response?.status === 403 && error.response?.data?.errors?.[0]?.code === 187) {
      // Duplicate tweet - don't retry
      return false
    }

    if (error.response?.status === 401) {
      // Authentication error - don't retry
      return false
    }

    // Use default retry logic for other errors
    return new RetryHandler().shouldRetry(error)
  },
})

export const facebookRetryHandler = new RetryHandler({
  maxAttempts: 3,
  baseDelay: 1500,
  maxDelay: 45000,
  multiplier: 2,
  jitter: true,
  retryCondition: (error) => {
    // Facebook-specific retry conditions
    if (error.response?.status === 400 && error.response?.data?.error?.code === 100) {
      // Invalid parameter - don't retry
      return false
    }

    if (error.response?.status === 400 && error.response?.data?.error?.code === 190) {
      // Invalid access token - don't retry
      return false
    }

    // Use default retry logic for other errors
    return new RetryHandler().shouldRetry(error)
  },
})
