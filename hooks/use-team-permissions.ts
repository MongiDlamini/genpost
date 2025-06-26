"use client"

import { useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

export function useTeamPermissions(teamId: Id<"teams">) {
  const { user } = useUser()

  const userRole = useQuery(api.permissions.getUserTeamRole, user ? { clerkId: user.id, teamId } : "skip")

  const checkPermission = (permission: string) => {
    if (!userRole) return false
    return userRole.permissions[permission as keyof typeof userRole.permissions] || false
  }

  return {
    role: userRole?.role,
    permissions: userRole?.permissions,
    checkPermission,
    canCreatePosts: checkPermission("canCreatePosts"),
    canEditPosts: checkPermission("canEditPosts"),
    canDeletePosts: checkPermission("canDeletePosts"),
    canManageTeam: checkPermission("canManageTeam"),
    canInviteMembers: checkPermission("canInviteMembers"),
    canViewAnalytics: checkPermission("canViewAnalytics"),
    isLoading: userRole === undefined,
  }
}
