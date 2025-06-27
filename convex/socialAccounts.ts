import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Connect Instagram account
export const connectInstagramAccount = mutation({
  args: {
    clerkId: v.string(),
    teamId: v.optional(v.id("teams")),
    platform: v.literal("instagram"),
    platformUserId: v.string(),
    username: v.string(),
    displayName: v.string(),
    profileImageUrl: v.optional(v.string()),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    tokenExpiresAt: v.optional(v.number()),
    accountType: v.union(v.literal("personal"), v.literal("business")),
    scopes: v.array(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    // Check if account already exists
    const existingAccount = await ctx.db
      .query("socialAccounts")
      .withIndex("by_user_platform", (q) => q.eq("userId", user._id).eq("platform", "instagram"))
      .filter((q) => q.eq(q.field("platformUserId"), args.platformUserId))
      .first()

    if (existingAccount) {
      // Update existing account
      await ctx.db.patch(existingAccount._id, {
        username: args.username,
        displayName: args.displayName,
        profileImageUrl: args.profileImageUrl,
        accessToken: args.accessToken, // TODO: Encrypt in production
        refreshToken: args.refreshToken, // TODO: Encrypt in production
        tokenExpiresAt: args.tokenExpiresAt,
        scopes: args.scopes,
        metadata: {
          ...existingAccount.metadata,
          ...args.metadata,
          accountType: args.accountType,
        },
        isActive: true,
        lastSyncAt: Date.now(),
        updatedAt: Date.now(),
      })

      return existingAccount._id
    }

    // Create new account
    const accountId = await ctx.db.insert("socialAccounts", {
      userId: user._id,
      teamId: args.teamId,
      platform: "instagram",
      platformUserId: args.platformUserId,
      username: args.username,
      displayName: args.displayName,
      profileImageUrl: args.profileImageUrl,
      accessToken: args.accessToken, // TODO: Encrypt in production
      refreshToken: args.refreshToken, // TODO: Encrypt in production
      tokenExpiresAt: args.tokenExpiresAt,
      scopes: args.scopes,
      metadata: {
        accountType: args.accountType,
        ...args.metadata,
      },
      isActive: true,
      lastSyncAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Log account connection activity
    await ctx.db.insert("activityLog", {
      userId: user._id,
      teamId: args.teamId,
      action: "account_connected",
      metadata: {
        platform: "instagram",
        username: args.username,
        accountType: args.accountType,
      },
      createdAt: Date.now(),
    })

    return accountId
  },
})

// Get user's Instagram accounts
export const getUserInstagramAccounts = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()

    if (!user) return []

    const accounts = await ctx.db
      .query("socialAccounts")
      .withIndex("by_user_platform", (q) => q.eq("userId", user._id).eq("platform", "instagram"))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect()

    // Remove sensitive data
    return accounts.map((account) => ({
      ...account,
      accessToken: undefined,
      refreshToken: undefined,
    }))
  },
})

// Update Instagram account token
export const updateInstagramToken = mutation({
  args: {
    accountId: v.id("socialAccounts"),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    tokenExpiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId)
    if (!account) {
      throw new Error("Account not found")
    }

    await ctx.db.patch(args.accountId, {
      accessToken: args.accessToken, // TODO: Encrypt in production
      refreshToken: args.refreshToken, // TODO: Encrypt in production
      tokenExpiresAt: args.tokenExpiresAt,
      lastSyncAt: Date.now(),
      updatedAt: Date.now(),
    })

    return args.accountId
  },
})

// Disconnect Instagram account
export const disconnectInstagramAccount = mutation({
  args: {
    accountId: v.id("socialAccounts"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    const account = await ctx.db.get(args.accountId)
    if (!account || account.userId !== user._id) {
      throw new Error("Account not found or access denied")
    }

    // Mark account as inactive
    await ctx.db.patch(args.accountId, {
      isActive: false,
      updatedAt: Date.now(),
    })

    // Log disconnection activity
    await ctx.db.insert("activityLog", {
      userId: user._id,
      teamId: account.teamId,
      action: "account_disconnected",
      metadata: {
        platform: "instagram",
        username: account.username,
      },
      createdAt: Date.now(),
    })

    return args.accountId
  },
})

// Connect Twitter account
export const connectTwitterAccount = mutation({
  args: {
    clerkId: v.string(),
    teamId: v.optional(v.id("teams")),
    platform: v.literal("twitter"),
    platformUserId: v.string(),
    username: v.string(),
    displayName: v.string(),
    profileImageUrl: v.optional(v.string()),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    tokenExpiresAt: v.optional(v.number()),
    scopes: v.array(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    // Check if account already exists
    const existingAccount = await ctx.db
      .query("socialAccounts")
      .withIndex("by_user_platform", (q) => q.eq("userId", user._id).eq("platform", "twitter"))
      .filter((q) => q.eq(q.field("platformUserId"), args.platformUserId))
      .first()

    if (existingAccount) {
      // Update existing account
      await ctx.db.patch(existingAccount._id, {
        username: args.username,
        displayName: args.displayName,
        profileImageUrl: args.profileImageUrl,
        accessToken: args.accessToken, // TODO: Encrypt in production
        refreshToken: args.refreshToken, // TODO: Encrypt in production
        tokenExpiresAt: args.tokenExpiresAt,
        scopes: args.scopes,
        metadata: {
          ...existingAccount.metadata,
          ...args.metadata,
        },
        isActive: true,
        lastSyncAt: Date.now(),
        updatedAt: Date.now(),
      })

      return existingAccount._id
    }

    // Create new account
    const accountId = await ctx.db.insert("socialAccounts", {
      userId: user._id,
      teamId: args.teamId,
      platform: "twitter",
      platformUserId: args.platformUserId,
      username: args.username,
      displayName: args.displayName,
      profileImageUrl: args.profileImageUrl,
      accessToken: args.accessToken, // TODO: Encrypt in production
      refreshToken: args.refreshToken, // TODO: Encrypt in production
      tokenExpiresAt: args.tokenExpiresAt,
      scopes: args.scopes,
      metadata: args.metadata,
      isActive: true,
      lastSyncAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Log account connection activity
    await ctx.db.insert("activityLog", {
      userId: user._id,
      teamId: args.teamId,
      action: "account_connected",
      metadata: {
        platform: "twitter",
        username: args.username,
      },
      createdAt: Date.now(),
    })

    return accountId
  },
})

// Get user's Twitter accounts
export const getUserTwitterAccounts = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()

    if (!user) return []

    const accounts = await ctx.db
      .query("socialAccounts")
      .withIndex("by_user_platform", (q) => q.eq("userId", user._id).eq("platform", "twitter"))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect()

    // Remove sensitive data
    return accounts.map((account) => ({
      ...account,
      accessToken: undefined,
      refreshToken: undefined,
    }))
  },
})

// Update Twitter account token
export const updateTwitterToken = mutation({
  args: {
    accountId: v.id("socialAccounts"),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    tokenExpiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId)
    if (!account) {
      throw new Error("Account not found")
    }

    await ctx.db.patch(args.accountId, {
      accessToken: args.accessToken, // TODO: Encrypt in production
      refreshToken: args.refreshToken, // TODO: Encrypt in production
      tokenExpiresAt: args.tokenExpiresAt,
      lastSyncAt: Date.now(),
      updatedAt: Date.now(),
    })

    return args.accountId
  },
})

// Disconnect Twitter account
export const disconnectTwitterAccount = mutation({
  args: {
    accountId: v.id("socialAccounts"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    const account = await ctx.db.get(args.accountId)
    if (!account || account.userId !== user._id) {
      throw new Error("Account not found or access denied")
    }

    // Mark account as inactive
    await ctx.db.patch(args.accountId, {
      isActive: false,
      updatedAt: Date.now(),
    })

    // Log disconnection activity
    await ctx.db.insert("activityLog", {
      userId: user._id,
      teamId: account.teamId,
      action: "account_disconnected",
      metadata: {
        platform: "twitter",
        username: account.username,
      },
      createdAt: Date.now(),
    })

    return args.accountId
  },
})

// Connect Facebook account
export const connectFacebookAccount = mutation({
  args: {
    clerkId: v.string(),
    teamId: v.optional(v.id("teams")),
    platform: v.literal("facebook"),
    platformUserId: v.string(),
    username: v.string(),
    displayName: v.string(),
    profileImageUrl: v.optional(v.string()),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    tokenExpiresAt: v.optional(v.number()),
    scopes: v.array(v.string()),
    metadata: v.optional(v.any()),
    pageData: v.optional(v.any()), // Facebook page information
  },
  handler: async (ctx, args) => {
    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    // Check if account already exists
    const existingAccount = await ctx.db
      .query("socialAccounts")
      .withIndex("by_user_platform", (q) => q.eq("userId", user._id).eq("platform", "facebook"))
      .filter((q) => q.eq(q.field("platformUserId"), args.platformUserId))
      .first()

    if (existingAccount) {
      // Update existing account
      await ctx.db.patch(existingAccount._id, {
        username: args.username,
        displayName: args.displayName,
        profileImageUrl: args.profileImageUrl,
        accessToken: args.accessToken, // TODO: Encrypt in production
        refreshToken: args.refreshToken, // TODO: Encrypt in production
        tokenExpiresAt: args.tokenExpiresAt,
        scopes: args.scopes,
        metadata: {
          ...existingAccount.metadata,
          ...args.metadata,
          pageData: args.pageData,
        },
        isActive: true,
        lastSyncAt: Date.now(),
        updatedAt: Date.now(),
      })

      return existingAccount._id
    }

    // Create new account
    const accountId = await ctx.db.insert("socialAccounts", {
      userId: user._id,
      teamId: args.teamId,
      platform: "facebook",
      platformUserId: args.platformUserId,
      username: args.username,
      displayName: args.displayName,
      profileImageUrl: args.profileImageUrl,
      accessToken: args.accessToken, // TODO: Encrypt in production
      refreshToken: args.refreshToken, // TODO: Encrypt in production
      tokenExpiresAt: args.tokenExpiresAt,
      scopes: args.scopes,
      metadata: {
        ...args.metadata,
        pageData: args.pageData,
      },
      isActive: true,
      lastSyncAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Log account connection activity
    await ctx.db.insert("activityLog", {
      userId: user._id,
      teamId: args.teamId,
      action: "account_connected",
      metadata: {
        platform: "facebook",
        username: args.username,
        pageData: args.pageData,
      },
      createdAt: Date.now(),
    })

    return accountId
  },
})

// Get user's Facebook accounts
export const getUserFacebookAccounts = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()

    if (!user) return []

    const accounts = await ctx.db
      .query("socialAccounts")
      .withIndex("by_user_platform", (q) => q.eq("userId", user._id).eq("platform", "facebook"))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect()

    // Remove sensitive data
    return accounts.map((account) => ({
      ...account,
      accessToken: undefined,
      refreshToken: undefined,
    }))
  },
})

// Update Facebook account token
export const updateFacebookToken = mutation({
  args: {
    accountId: v.id("socialAccounts"),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    tokenExpiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId)
    if (!account) {
      throw new Error("Account not found")
    }

    await ctx.db.patch(args.accountId, {
      accessToken: args.accessToken, // TODO: Encrypt in production
      refreshToken: args.refreshToken, // TODO: Encrypt in production
      tokenExpiresAt: args.tokenExpiresAt,
      lastSyncAt: Date.now(),
      updatedAt: Date.now(),
    })

    return args.accountId
  },
})

// Disconnect Facebook account
export const disconnectFacebookAccount = mutation({
  args: {
    accountId: v.id("socialAccounts"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    const account = await ctx.db.get(args.accountId)
    if (!account || account.userId !== user._id) {
      throw new Error("Account not found or access denied")
    }

    // Mark account as inactive
    await ctx.db.patch(args.accountId, {
      isActive: false,
      updatedAt: Date.now(),
    })

    // Log disconnection activity
    await ctx.db.insert("activityLog", {
      userId: user._id,
      teamId: account.teamId,
      action: "account_disconnected",
      metadata: {
        platform: "facebook",
        username: account.username,
      },
      createdAt: Date.now(),
    })

    return args.accountId
  },
})

// Get account by ID (for token management)
export const getAccountById = query({
  args: {
    accountId: v.id("socialAccounts"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    const account = await ctx.db.get(args.accountId)
    if (!account || account.userId !== user._id) {
      throw new Error("Account not found or access denied")
    }

    return account
  },
})
