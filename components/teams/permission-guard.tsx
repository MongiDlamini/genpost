"use client"

import type React from "react"

import { useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Shield } from "lucide-react"

interface PermissionGuardProps {
  teamId: Id<"teams">
  permission:
    | "canCreatePosts"
    | "canEditPosts"
    | "canDeletePosts"
    | "canManageTeam"
    | "canInviteMembers"
    | "canViewAnalytics"
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGuard({ teamId, permission, children, fallback }: PermissionGuardProps) {
  const { user } = useUser()

  const hasPermission = useQuery(
    api.permissions.checkTeamPermission,
    user ? { clerkId: user.id, teamId, permission } : "skip",
  )

  if (hasPermission === undefined) {
    return <div>Loading...</div>
  }

  if (!hasPermission) {
    return (
      fallback || (
        <div className="text-center py-8">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">You don't have permission to access this feature.</p>
        </div>
      )
    )
  }

  return <>{children}</>
}
