import { ConvexTokenManager } from "./convex-integration"
import { InstagramAPI } from "@/lib/social/instagram/api"
import { TwitterAPI } from "@/lib/social/twitter/api"
import { FacebookAPI } from "@/lib/social/facebook/api"

export interface TokenRefreshResult {
  success: boolean
  error?: string
  newToken?: string
  newRefreshToken?: string
  expiresAt?: number
}

export interface SocialAccount {
  _id: string
  platform: "instagram" | "twitter" | "facebook"
  platformUserId: string
  username: string
  accessToken: string
  refreshToken?: string
  tokenExpiresAt?: number
  isActive: boolean
}

export class OAuthTokenManager {
  private static instance: OAuthTokenManager
  private convexManager: ConvexTokenManager
  private refreshPromises: Map<string, Promise<TokenRefreshResult>> = new Map()

  private constructor() {
    this.convexManager = new ConvexTokenManager()
  }

  static getInstance(): OAuthTokenManager {
    if (!OAuthTokenManager.instance) {
      OAuthTokenManager.instance = new OAuthTokenManager()
    }
    return OAuthTokenManager.instance
  }

  /**
   * Check if a token needs refresh (expires within 5 minutes)
   */
  private needsRefresh(expiresAt?: number): boolean {
    if (!expiresAt) return false
    const bufferTime = 5 * 60 * 1000 // 5 minutes in milliseconds
    return Date.now() + bufferTime >= expiresAt
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getValidToken(accountId: string): Promise<string | null> {
    try {
      const account = await this.convexManager.getSocialAccount(accountId)
      if (!account || !account.isActive) {
        console.log(`Account ${accountId} not found or inactive`)
        return null
      }

      // Check if token needs refresh
      if (this.needsRefresh(account.tokenExpiresAt)) {
        console.log(`Token for account ${accountId} needs refresh`)
        const refreshResult = await this.refreshToken(account)

        if (refreshResult.success && refreshResult.newToken) {
          return refreshResult.newToken
        } else {
          console.error(`Failed to refresh token for account ${accountId}:`, refreshResult.error)
          return null
        }
      }

      return account.accessToken
    } catch (error) {
      console.error(`Error getting valid token for account ${accountId}:`, error)
      return null
    }
  }

  /**
   * Refresh a token for a specific account
   */
  async refreshToken(account: SocialAccount): Promise<TokenRefreshResult> {
    const cacheKey = `${account.platform}-${account._id}`

    // Check if refresh is already in progress
    if (this.refreshPromises.has(cacheKey)) {
      console.log(`Token refresh already in progress for ${cacheKey}`)
      return await this.refreshPromises.get(cacheKey)!
    }

    // Start refresh process
    const refreshPromise = this.performTokenRefresh(account)
    this.refreshPromises.set(cacheKey, refreshPromise)

    try {
      const result = await refreshPromise
      return result
    } finally {
      // Clean up promise cache
      this.refreshPromises.delete(cacheKey)
    }
  }

  /**
   * Perform the actual token refresh based on platform
   */
  private async performTokenRefresh(account: SocialAccount): Promise<TokenRefreshResult> {
    try {
      console.log(`Refreshing ${account.platform} token for account ${account._id}`)

      let result: TokenRefreshResult

      switch (account.platform) {
        case "instagram":
          result = await this.refreshInstagramToken(account)
          break
        case "twitter":
          result = await this.refreshTwitterToken(account)
          break
        case "facebook":
          result = await this.refreshFacebookToken(account)
          break
        default:
          return { success: false, error: `Unsupported platform: ${account.platform}` }
      }

      // Update database if refresh was successful
      if (result.success && result.newToken) {
        await this.convexManager.updateTokens(account._id, {
          accessToken: result.newToken,
          refreshToken: result.newRefreshToken,
          tokenExpiresAt: result.expiresAt,
        })

        console.log(`Successfully refreshed token for ${account.platform} account ${account._id}`)
      } else {
        console.error(`Failed to refresh token for ${account.platform} account ${account._id}:`, result.error)

        // If refresh failed, mark account as inactive
        await this.convexManager.markAccountInactive(account._id, result.error || "Token refresh failed")
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      console.error(`Token refresh error for account ${account._id}:`, error)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Refresh Instagram token (long-lived token)
   */
  private async refreshInstagramToken(account: SocialAccount): Promise<TokenRefreshResult> {
    try {
      const instagramAPI = new InstagramAPI(account.accessToken, "personal")
      const refreshResult = await instagramAPI.refreshLongLivedToken()

      if (refreshResult.access_token) {
        const expiresAt = Date.now() + refreshResult.expires_in * 1000
        return {
          success: true,
          newToken: refreshResult.access_token,
          expiresAt,
        }
      }

      return { success: false, error: "No access token in refresh response" }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Instagram refresh failed" }
    }
  }

  /**
   * Refresh Twitter token (OAuth 2.0 with refresh token)
   */
  private async refreshTwitterToken(account: SocialAccount): Promise<TokenRefreshResult> {
    try {
      if (!account.refreshToken) {
        return { success: false, error: "No refresh token available" }
      }

      const twitterAPI = new TwitterAPI(account.accessToken)
      const refreshResult = await twitterAPI.refreshAccessToken(account.refreshToken)

      if (refreshResult.access_token) {
        const expiresAt = Date.now() + refreshResult.expires_in * 1000
        return {
          success: true,
          newToken: refreshResult.access_token,
          newRefreshToken: refreshResult.refresh_token,
          expiresAt,
        }
      }

      return { success: false, error: "No access token in refresh response" }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Twitter refresh failed" }
    }
  }

  /**
   * Refresh Facebook token (long-lived token)
   */
  private async refreshFacebookToken(account: SocialAccount): Promise<TokenRefreshResult> {
    try {
      const facebookAPI = new FacebookAPI(account.accessToken)
      const refreshResult = await facebookAPI.extendAccessToken()

      if (refreshResult.access_token) {
        const expiresAt = Date.now() + refreshResult.expires_in * 1000
        return {
          success: true,
          newToken: refreshResult.access_token,
          expiresAt,
        }
      }

      return { success: false, error: "No access token in refresh response" }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Facebook refresh failed" }
    }
  }

  /**
   * Refresh all tokens for a user
   */
  async refreshAllUserTokens(userId: string): Promise<{ success: number; failed: number; errors: string[] }> {
    const accounts = await this.convexManager.getUserSocialAccounts(userId)
    const results = { success: 0, failed: 0, errors: [] as string[] }

    for (const account of accounts) {
      if (this.needsRefresh(account.tokenExpiresAt)) {
        const result = await this.refreshToken(account)
        if (result.success) {
          results.success++
        } else {
          results.failed++
          results.errors.push(`${account.platform}: ${result.error}`)
        }
      }
    }

    return results
  }

  /**
   * Revoke tokens for an account (logout)
   */
  async revokeToken(accountId: string): Promise<boolean> {
    try {
      const account = await this.convexManager.getSocialAccount(accountId)
      if (!account) return false

      // Platform-specific token revocation
      switch (account.platform) {
        case "instagram":
          // Instagram doesn't have a revoke endpoint, just deactivate
          break
        case "twitter":
          const twitterAPI = new TwitterAPI(account.accessToken)
          await twitterAPI.revokeToken()
          break
        case "facebook":
          const facebookAPI = new FacebookAPI(account.accessToken)
          await facebookAPI.revokeToken()
          break
      }

      // Mark account as inactive in database
      await this.convexManager.markAccountInactive(accountId, "Token revoked by user")
      return true
    } catch (error) {
      console.error(`Error revoking token for account ${accountId}:`, error)
      return false
    }
  }
}
