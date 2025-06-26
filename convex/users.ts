import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Helper function to get next month timestamp
function getNextMonthTimestamp(): number {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return nextMonth.getTime()
}

// Create or update user from Clerk
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        updatedAt: Date.now(),
      })
      return existingUser._id
    }

    // Create new user with default preferences and subscription
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      onboardingComplete: false,
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        timezone: "UTC",
      },
      subscription: {
        plan: "free",
        status: "active",
        cancelAtPeriodEnd: false,
      },
      usage: {
        postsThisMonth: 0,
        postsLimit: 10, // Free plan limit
        resetDate: getNextMonthTimestamp(),
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Log user creation activity
    await ctx.db.insert("activityLog", {
      userId,
      action: "user_joined",
      createdAt: Date.now(),
    })

    return userId
  },
})

// Update user profile
export const updateUserProfile = mutation({
  args: {
    clerkId: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    const updates: any = {
      updatedAt: Date.now(),
    }

    if (args.name !== undefined) {
      updates.name = args.name
    }

    if (args.imageUrl !== undefined) {
      updates.imageUrl = args.imageUrl
    }

    await ctx.db.patch(user._id, updates)
    return user._id
  },
})

// Update user preferences
export const updateUserPreferences = mutation({
  args: {
    clerkId: v.string(),
    preferences: v.object({
      emailNotifications: v.optional(v.boolean()),
      pushNotifications: v.optional(v.boolean()),
      marketingEmails: v.optional(v.boolean()),
      timezone: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    const updatedPreferences = {
      ...user.preferences,
      ...args.preferences,
    }

    await ctx.db.patch(user._id, {
      preferences: updatedPreferences,
      updatedAt: Date.now(),
    })

    return user._id
  },
})

// Mark onboarding as complete
export const completeOnboarding = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    await ctx.db.patch(user._id, {
      onboardingComplete: true,
      updatedAt: Date.now(),
    })

    return user._id
  },
})

// Get user with full profile data
export const getUserProfile = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()

    if (!user) return null

    // Get team memberships
    const teamMemberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect()

    // Get teams data
    const teams = await Promise.all(
      teamMemberships.map(async (membership) => {
        const team = await ctx.db.get(membership.teamId)
        return {
          ...team,
          role: membership.role,
          permissions: membership.permissions,
        }
      }),
    )

    // Get connected social accounts
    const socialAccounts = await ctx.db
      .query("socialAccounts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect()

    // Get unread notifications count
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", user._id).eq("isRead", false))
      .collect()

    return {
      ...user,
      teams,
      socialAccounts: socialAccounts.map((account) => ({
        ...account,
        accessToken: undefined, // Don't expose tokens
        refreshToken: undefined,
      })),
      unreadNotificationsCount: unreadNotifications.length,
    }
  },
})

export const getUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()
  },
})

// Get user stats
export const getUserStats = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()

    if (!user) return null

    // Get team memberships
    const teamMemberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect()

    // Get connected social accounts
    const socialAccounts = await ctx.db
      .query("socialAccounts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect()

    return {
      joinedAt: user.createdAt,
      teamsCount: teamMemberships.length,
      socialAccountsCount: socialAccounts.length,
      postsCount: user.usage.postsThisMonth,
      scheduledPostsCount: 0, // TODO: Implement when posts schema is added
      subscription: user.subscription,
      usage: user.usage,
    }
  },
})
