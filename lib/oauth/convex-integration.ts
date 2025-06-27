import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

export class ConvexTokenManager {
  private convex: ConvexHttpClient

  constructor() {
    this.convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
  }

  /**
   * Get a social account by ID
   */
  async getSocialAccount(accountId: string) {
    try {
      return await this.convex.query(api.socialAccounts.getById, { id: accountId })
    } catch (error) {
      console.error("Error getting social account:", error)
      return null
    }
  }

  /**
   * Get all social accounts for a user
   */
  async getUserSocialAccounts(userId: string) {
    try {
      return await this.convex.query(api.socialAccounts.getByUser, { userId })
    } catch (error) {
      console.error("Error getting user social accounts:", error)
      return []
    }
  }

  /**
   * Get accounts that need token refresh
   */
  async getAccountsNeedingRefresh() {
    try {
      const bufferTime = 60 * 60 * 1000 // 1 hour buffer
      const cutoffTime = Date.now() + bufferTime

      return await this.convex.query(api.socialAccounts.getAccountsNeedingRefresh, {
        cutoffTime,
      })
    } catch (error) {
      console.error("Error getting accounts needing refresh:", error)
      return []
    }
  }

  /**
   * Update tokens for an account
   */
  async updateTokens(
    accountId: string,
    tokens: {
      accessToken: string
      refreshToken?: string
      tokenExpiresAt?: number
    },
  ) {
    try {
      await this.convex.mutation(api.socialAccounts.updateTokens, {
        id: accountId,
        ...tokens,
      })
    } catch (error) {
      console.error("Error updating tokens:", error)
      throw error
    }
  }

  /**
   * Mark an account as inactive
   */
  async markAccountInactive(accountId: string, reason: string) {
    try {
      await this.convex.mutation(api.socialAccounts.markInactive, {
        id: accountId,
        reason,
      })
    } catch (error) {
      console.error("Error marking account inactive:", error)
      throw error
    }
  }

  /**
   * Create a notification for the user
   */
  async createNotification(
    userId: string,
    notification: {
      type: string
      title: string
      message: string
      actionUrl?: string
      metadata?: any
    },
  ) {
    try {
      await this.convex.mutation(api.notifications.create, {
        userId,
        ...notification,
      })
    } catch (error) {
      console.error("Error creating notification:", error)
      throw error
    }
  }
}
