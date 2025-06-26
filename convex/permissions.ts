import { v } from "convex/values"
import { query, mutation } from "./_generated/server"

// Check if user has permission for a team action
export const checkTeamPermission = query({
  args: {
    clerkId: v.string(),
    teamId: v.id("teams"),
    permission: v.union(
      v.literal("canCreatePosts"),
      v.literal("canEditPosts"),
      v.literal("canDeletePosts"),
      v.literal("canManageTeam"),
      v.literal("canInviteMembers"),
      v.literal("canViewAnalytics"),
    ),
  },
  handler: async (ctx, args) => {
    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()

    if (!user) return false

    // Get team membership
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_user", (q) => q.eq("teamId", args.teamId).eq("userId", user._id))
      .first()

    if (!membership || membership.status !== "active") return false

    // Check permission
    return membership.permissions[args.permission] || false
  },
})

// Get user's role and permissions for a team
export const getUserTeamRole = query({
  args: {
    clerkId: v.string(),
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()

    if (!user) return null

    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_user", (q) => q.eq("teamId", args.teamId).eq("userId", user._id))
      .first()

    if (!membership || membership.status !== "active") return null

    return {
      role: membership.role,
      permissions: membership.permissions,
      status: membership.status,
    }
  },
})

// Update team member role and permissions
export const updateMemberRole = mutation({
  args: {
    teamId: v.id("teams"),
    targetUserId: v.id("users"),
    newRole: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer")),
    updatedByClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get updater
    const updater = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.updatedByClerkId))
      .first()

    if (!updater) throw new Error("Updater not found")

    // Check updater permissions
    const updaterMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_user", (q) => q.eq("teamId", args.teamId).eq("userId", updater._id))
      .first()

    if (!updaterMembership || !updaterMembership.permissions.canManageTeam) {
      throw new Error("Insufficient permissions to update member roles")
    }

    // Get target member
    const targetMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_user", (q) => q.eq("teamId", args.teamId).eq("userId", args.targetUserId))
      .first()

    if (!targetMembership) throw new Error("Target member not found")

    // Prevent role changes that would violate hierarchy
    if (updaterMembership.role !== "owner") {
      // Non-owners cannot change owner or admin roles
      if (targetMembership.role === "owner" || targetMembership.role === "admin") {
        throw new Error("Cannot modify this member's role")
      }
      // Non-owners cannot assign admin role
      if (args.newRole === "admin") {
        throw new Error("Cannot assign admin role")
      }
    }

    // Prevent owner from changing their own role
    if (targetMembership.role === "owner" && updater._id === args.targetUserId) {
      throw new Error("Owner cannot change their own role")
    }

    // Get new permissions based on role
    const newPermissions = getRolePermissions(args.newRole)

    // Update member role and permissions
    await ctx.db.patch(targetMembership._id, {
      role: args.newRole,
      permissions: newPermissions,
    })

    // Log role change activity
    await ctx.db.insert("activityLog", {
      userId: updater._id,
      teamId: args.teamId,
      targetUserId: args.targetUserId,
      action: "role_changed",
      metadata: {
        oldRole: targetMembership.role,
        newRole: args.newRole,
      },
      createdAt: Date.now(),
    })

    return targetMembership._id
  },
})

// Remove team member
export const removeMember = mutation({
  args: {
    teamId: v.id("teams"),
    targetUserId: v.id("users"),
    removedByClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get remover
    const remover = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.removedByClerkId))
      .first()

    if (!remover) throw new Error("Remover not found")

    // Check remover permissions
    const removerMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_user", (q) => q.eq("teamId", args.teamId).eq("userId", remover._id))
      .first()

    if (!removerMembership || !removerMembership.permissions.canManageTeam) {
      throw new Error("Insufficient permissions to remove members")
    }

    // Get target member
    const targetMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_user", (q) => q.eq("teamId", args.teamId).eq("userId", args.targetUserId))
      .first()

    if (!targetMembership) throw new Error("Target member not found")

    // Prevent removing owner or higher-level members
    if (removerMembership.role !== "owner") {
      if (targetMembership.role === "owner" || targetMembership.role === "admin") {
        throw new Error("Cannot remove this member")
      }
    }

    // Prevent owner from removing themselves
    if (targetMembership.role === "owner") {
      throw new Error("Owner cannot be removed from team")
    }

    // Update member status to "left"
    await ctx.db.patch(targetMembership._id, {
      status: "left",
    })

    // Log member removal activity
    await ctx.db.insert("activityLog", {
      userId: remover._id,
      teamId: args.teamId,
      targetUserId: args.targetUserId,
      action: "member_removed",
      metadata: {
        removedRole: targetMembership.role,
      },
      createdAt: Date.now(),
    })

    return targetMembership._id
  },
})

// Helper function to get role permissions
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
