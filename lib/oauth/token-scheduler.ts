import { OAuthTokenManager } from "./token-manager"
import { ConvexTokenManager } from "./convex-integration"

export interface SchedulerConfig {
  intervalMinutes: number
  maxRetries: number
  retryDelayMinutes: number
}

export interface RefreshStats {
  totalAccounts: number
  successfulRefreshes: number
  failedRefreshes: number
  skippedRefreshes: number
  errors: string[]
}

export class TokenRefreshScheduler {
  private static instance: TokenRefreshScheduler
  private tokenManager: OAuthTokenManager
  private convexManager: ConvexTokenManager
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false
  private config: SchedulerConfig

  private constructor(config: Partial<SchedulerConfig> = {}) {
    this.tokenManager = OAuthTokenManager.getInstance()
    this.convexManager = new ConvexTokenManager()
    this.config = {
      intervalMinutes: config.intervalMinutes || 30,
      maxRetries: config.maxRetries || 3,
      retryDelayMinutes: config.retryDelayMinutes || 2,
    }
  }

  static getInstance(config?: Partial<SchedulerConfig>): TokenRefreshScheduler {
    if (!TokenRefreshScheduler.instance) {
      TokenRefreshScheduler.instance = new TokenRefreshScheduler(config)
    }
    return TokenRefreshScheduler.instance
  }

  /**
   * Start the token refresh scheduler
   */
  start(): void {
    if (this.isRunning) {
      console.log("Token refresh scheduler is already running")
      return
    }

    console.log(`Starting token refresh scheduler (interval: ${this.config.intervalMinutes} minutes)`)
    this.isRunning = true

    // Run immediately on start
    this.runRefreshCycle().catch((error) => {
      console.error("Initial token refresh cycle failed:", error)
    })

    // Schedule recurring refreshes
    this.intervalId = setInterval(
      () => {
        this.runRefreshCycle().catch((error) => {
          console.error("Scheduled token refresh cycle failed:", error)
        })
      },
      this.config.intervalMinutes * 60 * 1000,
    )
  }

  /**
   * Stop the token refresh scheduler
   */
  stop(): void {
    if (!this.isRunning) {
      console.log("Token refresh scheduler is not running")
      return
    }

    console.log("Stopping token refresh scheduler")
    this.isRunning = false

    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  /**
   * Run a single refresh cycle
   */
  private async runRefreshCycle(): Promise<RefreshStats> {
    console.log("Starting token refresh cycle")
    const startTime = Date.now()

    try {
      const accounts = await this.convexManager.getAccountsNeedingRefresh()
      const stats: RefreshStats = {
        totalAccounts: accounts.length,
        successfulRefreshes: 0,
        failedRefreshes: 0,
        skippedRefreshes: 0,
        errors: [],
      }

      console.log(`Found ${accounts.length} accounts that may need token refresh`)

      // Process accounts in batches to avoid overwhelming APIs
      const batchSize = 5
      for (let i = 0; i < accounts.length; i += batchSize) {
        const batch = accounts.slice(i, i + batchSize)
        await Promise.all(batch.map((account) => this.refreshAccountWithRetry(account, stats)))
      }

      const duration = Date.now() - startTime
      console.log(`Token refresh cycle completed in ${duration}ms:`, stats)

      // Log any errors
      if (stats.errors.length > 0) {
        console.error("Token refresh errors:", stats.errors)
      }

      return stats
    } catch (error) {
      console.error("Token refresh cycle failed:", error)
      throw error
    }
  }

  /**
   * Refresh a single account with retry logic
   */
  private async refreshAccountWithRetry(account: any, stats: RefreshStats): Promise<void> {
    let lastError: string | undefined

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = await this.tokenManager.refreshToken(account)

        if (result.success) {
          stats.successfulRefreshes++
          console.log(`Successfully refreshed token for ${account.platform} account ${account._id}`)
          return
        } else {
          lastError = result.error

          // Check if this is a permanent failure (user revoked access, etc.)
          if (this.isPermanentError(result.error)) {
            console.log(`Permanent error for account ${account._id}, not retrying: ${result.error}`)
            break
          }

          // Wait before retry (exponential backoff)
          if (attempt < this.config.maxRetries) {
            const delayMs = this.config.retryDelayMinutes * Math.pow(2, attempt - 1) * 60 * 1000
            console.log(
              `Retrying token refresh for account ${account._id} in ${delayMs}ms (attempt ${attempt + 1}/${this.config.maxRetries})`,
            )
            await new Promise((resolve) => setTimeout(resolve, delayMs))
          }
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : "Unknown error"
        console.error(`Token refresh attempt ${attempt} failed for account ${account._id}:`, error)

        if (attempt < this.config.maxRetries) {
          const delayMs = this.config.retryDelayMinutes * Math.pow(2, attempt - 1) * 60 * 1000
          await new Promise((resolve) => setTimeout(resolve, delayMs))
        }
      }
    }

    // All retries failed
    stats.failedRefreshes++
    stats.errors.push(`${account.platform} account ${account._id}: ${lastError}`)

    // Send notification to user about failed refresh
    await this.convexManager.createNotification(account.userId, {
      type: "token_refresh_failed",
      title: "Social Account Connection Issue",
      message: `We couldn't refresh your ${account.platform} account connection. Please reconnect your account.`,
      actionUrl: "/settings/social-accounts",
      metadata: { accountId: account._id, platform: account.platform },
    })
  }

  /**
   * Check if an error indicates a permanent failure
   */
  private isPermanentError(error?: string): boolean {
    if (!error) return false

    const permanentErrors = [
      "invalid_grant",
      "unauthorized_client",
      "access_denied",
      "user_revoked_access",
      "app_not_authorized",
      "invalid_client",
    ]

    return permanentErrors.some((permError) => error.toLowerCase().includes(permError.toLowerCase()))
  }

  /**
   * Get scheduler status
   */
  getStatus(): { isRunning: boolean; config: SchedulerConfig; nextRun?: Date } {
    const nextRun =
      this.isRunning && this.intervalId ? new Date(Date.now() + this.config.intervalMinutes * 60 * 1000) : undefined

    return {
      isRunning: this.isRunning,
      config: this.config,
      nextRun,
    }
  }

  /**
   * Force run a refresh cycle manually
   */
  async forceRefresh(): Promise<RefreshStats> {
    console.log("Forcing token refresh cycle")
    return await this.runRefreshCycle()
  }
}
