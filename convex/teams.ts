import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import crypto from "crypto"

// Helper functions
function generateTeamSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50)
}

function getNextMonthTimestamp(): number {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return nextMonth.getTime()
}

function getRolePermissions(role: "admin" | "member" | "viewer") {
  switch (role) {
    case "admin":
      return {
        canCreatePosts: true,
        canEditPosts: true,
        canDeletePosts: true,
        canManageTeam: true,
        canInviteMembers: true,
        canViewAnalytics: true,
      }
    case "member":
      return {
        canCreatePosts: true,
        canEditPosts: true,
        canDeletePosts: false,
        canManageTeam: false,
        canInviteMembers: false,
        canViewAnalytics: true,
      }
    case "viewer":
      return {
        canCreatePosts: false,
        canEditPosts: false,
        canDeletePosts: false,
        canManageTeam: false,
        canInviteMembers: false,
        canViewAnalytics: true,
      }
  }
}

// Create a new team with enhanced schema
export const createTeam = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    clerkId: v.string(),
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

    // Generate unique slug
    const slug = generateTeamSlug(args.name)

    // Check if slug is unique
    const existingTeam = await ctx.db
      .query("teams")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first()

    if (existingTeam) {
      throw new Error("Team name already exists")
    }

    // Create team
    const teamId = await ctx.db.insert("teams", {
      name: args.name,
      description: args.description,
      slug,
      ownerId: user._id,
      subscription: {
        plan: "team_starter",
        status: "trialing",
        cancelAtPeriodEnd: false,
      },
      usage: {
        postsThisMonth: 0,
        postsLimit: 50, // Team starter limit
        membersLimit: 5,
        resetDate: getNextMonthTimestamp(),
      },
      settings: {
        allowMemberInvites: true,
        requireApproval: false,
        defaultRole: "member",
        allowPublicJoin: false,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Add owner as team member with full permissions
    await ctx.db.insert("teamMembers", {
      teamId,
      userId: user._id,
      role: "owner",
      status: "active",
      permissions: {
        canCreatePosts: true,
        canEditPosts: true,
        canDeletePosts: true,
        canManageTeam: true,
        canInviteMembers: true,
        canViewAnalytics: true,
      },
      joinedAt: Date.now(),
      lastActiveAt: Date.now(),
    })

    // Log team creation activity
    await ctx.db.insert("activityLog", {
      userId: user._id,
      teamId,
      action: "team_created",
      createdAt: Date.now(),
    })

    return teamId
  },
})

// Get teams for a user (existing function enhanced)
export const getUserTeams = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()

    if (!user) return []

    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect()

    const teams = await Promise.all(
      memberships.map(async (membership) => {
        const team = await ctx.db.get(membership.teamId)
        const owner = await ctx.db.get(team!.ownerId)
        return {
          ...team,
          role: membership.role,
          permissions: membership.permissions,
          status: membership.status,
          owner: owner?.name,
        }
      }),
    )

    return teams
  },
})

// Get team members (existing function enhanced)
export const getTeamMembers = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect()

    const members = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId)
        return {
          ...membership,
          user: {
            name: user?.name,
            email: user?.email,
            imageUrl: user?.imageUrl,
          },
        }
      }),
    )

    return members
  },
})

// Get pending invitations for a team (existing function enhanced)
export const getTeamInvitations = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const invitations = await ctx.db
      .query("teamInvitations")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect()

    const invitationsWithInviter = await Promise.all(
      invitations.map(async (invitation) => {
        const inviter = await ctx.db.get(invitation.invitedBy)
        return {
          ...invitation,
          inviterName: inviter?.name,
        }
      }),
    )

    return invitationsWithInviter
  },
})

// Get team with full details
export const getTeamDetails = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId)
    if (!team) return null

    // Get owner details
    const owner = await ctx.db.get(team.ownerId)

    // Get member count
    const memberCount = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_status", (q) => q.eq("teamId", args.teamId).eq("status", "active"))
      .collect()

    // Get pending invitations count
    const pendingInvitations = await ctx.db
      .query("teamInvitations")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect()

    return {
      ...team,
      owner: {
        name: owner?.name,
        email: owner?.email,
        imageUrl: owner?.imageUrl,
      },
      memberCount: memberCount.length,
      pendingInvitationsCount: pendingInvitations.length,
    }
  },
})

// Enhanced team invitation with permissions
export const inviteToTeam = mutation({
  args: {
    teamId: v.id("teams"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer")),
    message: v.optional(v.string()),
    invitedByClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify inviter has permission
    const inviter = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.invitedByClerkId))
      .first()

    if (!inviter) throw new Error("Inviter not found")

    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_user", (q) => q.eq("teamId", args.teamId).eq("userId", inviter._id))
      .first()

    if (!membership || !membership.permissions.canInviteMembers) {
      throw new Error("Insufficient permissions to invite members")
    }

    // Check team member limit
    const team = await ctx.db.get(args.teamId)
    if (!team) throw new Error("Team not found")

    const currentMembers = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_status", (q) => q.eq("teamId", args.teamId).eq("status", "active"))
      .collect()

    if (currentMembers.length >= team.usage.membersLimit) {
      throw new Error("Team member limit reached")
    }

    // Check if invitation already exists
    const existingInvite = await ctx.db
      .query("teamInvitations")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first()

    if (existingInvite) {
      throw new Error("Invitation already sent to this email")
    }

    // Set permissions based on role
    const permissions = getRolePermissions(args.role)

    // Generate invitation token
    const token = crypto.randomUUID()
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days

    const invitationId = await ctx.db.insert("teamInvitations", {
      teamId: args.teamId,
      email: args.email,
      role: args.role,
      permissions,
      invitedBy: inviter._id,
      token,
      status: "pending",
      message: args.message,
      expiresAt,
      createdAt: Date.now(),
    })

    // Log invitation activity
    await ctx.db.insert("activityLog", {
      userId: inviter._id,
      teamId: args.teamId,
      action: "user_invited",
      metadata: { email: args.email, role: args.role },
      createdAt: Date.now(),
    })

    return { invitationId, token }
  },
})
