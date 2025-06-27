import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const create = mutation({
  args: {
    userId: v.id("users"),
    teamId: v.optional(v.id("teams")),
    title: v.optional(v.string()),
    content: v.string(),
    mediaUrls: v.array(v.string()),
    platforms: v.array(v.union(v.literal("instagram"), v.literal("twitter"), v.literal("facebook"))),
    scheduledFor: v.optional(v.number()),
    settings: v.object({
      mode: v.union(v.literal("standard"), v.literal("quick")),
      autoPost: v.boolean(),
      trackEngagement: v.boolean(),
    }),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const postId = await ctx.db.insert("posts", {
      ...args,
      status: args.scheduledFor ? "scheduled" : "draft",
      platformPosts: args.platforms.map((platform) => ({
        platform,
        status: "pending" as const,
      })),
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
        lastUpdated: Date.now(),
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return postId
  },
})

export const getById = query({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

export const getByPlatformId = query({
  args: {
    platformPostId: v.string(),
    platform: v.union(v.literal("instagram"), v.literal("twitter"), v.literal("facebook")),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db.query("posts").collect()

    for (const post of posts) {
      const platformPost = post.platformPosts.find(
        (p) => p.platform === args.platform && p.platformPostId === args.platformPostId,
      )
      if (platformPost) {
        return post
      }
    }

    return null
  },
})

export const updateStatus = mutation({
  args: {
    id: v.id("posts"),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("publishing"),
      v.literal("published"),
      v.literal("failed"),
      v.literal("cancelled"),
    ),
    publishedAt: v.optional(v.number()),
    error: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    })
  },
})

export const updateEngagement = mutation({
  args: {
    platformPostId: v.string(),
    platform: v.union(v.literal("instagram"), v.literal("twitter"), v.literal("facebook")),
    engagementType: v.union(v.literal("like"), v.literal("comment"), v.literal("share"), v.literal("view")),
    increment: v.number(),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db.query("posts").collect()

    for (const post of posts) {
      const platformPost = post.platformPosts.find(
        (p) => p.platform === args.platform && p.platformPostId === args.platformPostId,
      )

      if (platformPost) {
        const currentEngagement = post.engagement
        const updatedEngagement = { ...currentEngagement }

        switch (args.engagementType) {
          case "like":
            updatedEngagement.likes = Math.max(0, currentEngagement.likes + args.increment)
            break
          case "comment":
            updatedEngagement.comments = Math.max(0, currentEngagement.comments + args.increment)
            break
          case "share":
            updatedEngagement.shares = Math.max(0, currentEngagement.shares + args.increment)
            break
          case "view":
            updatedEngagement.views = Math.max(0, currentEngagement.views + args.increment)
            break
        }

        updatedEngagement.lastUpdated = Date.now()

        await ctx.db.patch(post._id, {
          engagement: updatedEngagement,
          updatedAt: Date.now(),
        })

        break
      }
    }
  },
})

export const getScheduledPosts = query({
  args: {
    userId: v.optional(v.id("users")),
    teamId: v.optional(v.id("teams")),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("posts")

    if (args.userId) {
      query = query.filter((q) => q.eq(q.field("userId"), args.userId))
    }

    if (args.teamId) {
      query = query.filter((q) => q.eq(q.field("teamId"), args.teamId))
    }

    const posts = await query.collect()

    return posts.filter(
      (post) => post.scheduledFor && post.scheduledFor >= args.startDate && post.scheduledFor <= args.endDate,
    )
  },
})
