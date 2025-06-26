import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  // Users table - stores user profile information
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    onboardingComplete: v.boolean(),
    preferences: v.object({
      emailNotifications: v.boolean(),
      pushNotifications: v.boolean(),
      marketingEmails: v.boolean(),
      timezone: v.string(),
    }),
    subscription: v.object({
      plan: v.union(v.literal("free"), v.literal("starter"), v.literal("pro"), v.literal("enterprise")),
      status: v.union(v.literal("active"), v.literal("cancelled"), v.literal("past_due"), v.literal("trialing")),
      currentPeriodEnd: v.optional(v.number()),
      cancelAtPeriodEnd: v.boolean(),
    }),
    usage: v.object({
      postsThisMonth: v.number(),
      postsLimit: v.number(),
      resetDate: v.number(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // Teams table - stores team information
  teams: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    slug: v.string(), // URL-friendly team identifier
    ownerId: v.id("users"),
    subscription: v.object({
      plan: v.union(v.literal("team_starter"), v.literal("team_pro"), v.literal("team_enterprise")),
      status: v.union(v.literal("active"), v.literal("cancelled"), v.literal("past_due"), v.literal("trialing")),
      currentPeriodEnd: v.optional(v.number()),
      cancelAtPeriodEnd: v.boolean(),
    }),
    usage: v.object({
      postsThisMonth: v.number(),
      postsLimit: v.number(),
      membersLimit: v.number(),
      resetDate: v.number(),
    }),
    settings: v.object({
      allowMemberInvites: v.boolean(),
      requireApproval: v.boolean(),
      defaultRole: v.union(v.literal("member"), v.literal("admin")),
      allowPublicJoin: v.boolean(),
    }),
    branding: v.optional(
      v.object({
        logoUrl: v.optional(v.string()),
        primaryColor: v.optional(v.string()),
        customDomain: v.optional(v.string()),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_slug", ["slug"]),

  // Team members table - stores team membership information
  teamMembers: defineTable({
    teamId: v.id("teams"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member"), v.literal("viewer")),
    status: v.union(v.literal("active"), v.literal("pending"), v.literal("suspended"), v.literal("left")),
    permissions: v.object({
      canCreatePosts: v.boolean(),
      canEditPosts: v.boolean(),
      canDeletePosts: v.boolean(),
      canManageTeam: v.boolean(),
      canInviteMembers: v.boolean(),
      canViewAnalytics: v.boolean(),
    }),
    invitedBy: v.optional(v.id("users")),
    joinedAt: v.number(),
    lastActiveAt: v.optional(v.number()),
  })
    .index("by_team", ["teamId"])
    .index("by_user", ["userId"])
    .index("by_team_user", ["teamId", "userId"])
    .index("by_team_status", ["teamId", "status"]),

  // Team invitations table - stores pending team invitations
  teamInvitations: defineTable({
    teamId: v.id("teams"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer")),
    permissions: v.object({
      canCreatePosts: v.boolean(),
      canEditPosts: v.boolean(),
      canDeletePosts: v.boolean(),
      canManageTeam: v.boolean(),
      canInviteMembers: v.boolean(),
      canViewAnalytics: v.boolean(),
    }),
    invitedBy: v.id("users"),
    token: v.string(),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("expired"), v.literal("cancelled")),
    message: v.optional(v.string()), // Optional invitation message
    expiresAt: v.number(),
    acceptedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_token", ["token"])
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  // Social accounts table - stores connected social media accounts
  socialAccounts: defineTable({
    userId: v.id("users"),
    teamId: v.optional(v.id("teams")), // If account is shared with team
    platform: v.union(v.literal("instagram"), v.literal("twitter"), v.literal("facebook")),
    platformUserId: v.string(),
    username: v.string(),
    displayName: v.string(),
    profileImageUrl: v.optional(v.string()),
    accessToken: v.string(), // Encrypted
    refreshToken: v.optional(v.string()), // Encrypted
    tokenExpiresAt: v.optional(v.number()),
    scopes: v.array(v.string()),
    isActive: v.boolean(),
    lastSyncAt: v.optional(v.number()),
    metadata: v.optional(v.any()), // Platform-specific data
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_team", ["teamId"])
    .index("by_platform", ["platform"])
    .index("by_user_platform", ["userId", "platform"]),

  // Activity log table - stores team and user activity
  activityLog: defineTable({
    userId: v.id("users"),
    teamId: v.optional(v.id("teams")),
    action: v.union(
      v.literal("user_joined"),
      v.literal("user_left"),
      v.literal("user_invited"),
      v.literal("team_created"),
      v.literal("team_updated"),
      v.literal("member_added"),
      v.literal("member_removed"),
      v.literal("role_changed"),
      v.literal("post_created"),
      v.literal("post_scheduled"),
      v.literal("post_published"),
      v.literal("account_connected"),
      v.literal("account_disconnected"),
    ),
    targetUserId: v.optional(v.id("users")), // User affected by the action
    metadata: v.optional(v.any()), // Additional action data
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_team", ["teamId"])
    .index("by_action", ["action"])
    .index("by_created_at", ["createdAt"]),

  // Notifications table - stores user notifications
  notifications: defineTable({
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
    ),
    title: v.string(),
    message: v.string(),
    actionUrl: v.optional(v.string()),
    isRead: v.boolean(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    readAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "isRead"])
    .index("by_team", ["teamId"]),
})
