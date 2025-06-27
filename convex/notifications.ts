import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const create = mutation({
  args: {
    userId: v.id("users"),
    teamId: v.optional(v.id("teams")),
    type: v.union(
      v.literal("team_invitation"),
      v.literal("post_published"),
      v.literal("post_failed"),
      v.literal("member_joined"),
      v.literal("usage_limit"),
      v.literal("subscription_expiring"),
      v.literal("system_announcement"),
      v.literal("token_refresh_failed"),
    ),
    title: v.string(),
    message: v.string(),
    actionUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      ...args,
      isRead: false,
      createdAt: Date.now(),
    })

    return notificationId
  },
})

export const getByUser = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")

    if (args.unreadOnly) {
      query = query.filter((q) => q.eq(q.field("isRead"), false))
    }

    if (args.limit) {
      return await query.take(args.limit)
    }

    return await query.collect()
  },
})

export const markAsRead = mutation({
  args: {
    id: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isRead: true,
      readAt: Date.now(),
    })
  },
})

export const markAllAsRead = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", args.userId).eq("isRead", false))
      .collect()

    for (const notification of notifications) {
      await ctx.db.patch(notification._id, {
        isRead: true,
        readAt: Date.now(),
      })
    }
  },
})
