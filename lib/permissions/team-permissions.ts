// Permission types
export type Permission =
  | "canCreatePosts"
  | "canEditPosts"
  | "canDeletePosts"
  | "canManageTeam"
  | "canInviteMembers"
  | "canViewAnalytics"

export type Role = "owner" | "admin" | "member" | "viewer"

// Role hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY: Record<Role, number> = {
  viewer: 1,
  member: 2,
  admin: 3,
  owner: 4,
}

// Default permissions for each role
export const ROLE_PERMISSIONS: Record<Role, Record<Permission, boolean>> = {
  owner: {
    canCreatePosts: true,
    canEditPosts: true,
    canDeletePosts: true,
    canManageTeam: true,
    canInviteMembers: true,
    canViewAnalytics: true,
  },
  admin: {
    canCreatePosts: true,
    canEditPosts: true,
    canDeletePosts: true,
    canManageTeam: true,
    canInviteMembers: true,
    canViewAnalytics: true,
  },
  member: {
    canCreatePosts: true,
    canEditPosts: true,
    canDeletePosts: false,
    canManageTeam: false,
    canInviteMembers: false,
    canViewAnalytics: true,
  },
  viewer: {
    canCreatePosts: false,
    canEditPosts: false,
    canDeletePosts: false,
    canManageTeam: false,
    canInviteMembers: false,
    canViewAnalytics: true,
  },
}

// Check if user has permission
export function hasPermission(
  userRole: Role,
  userPermissions: Record<Permission, boolean>,
  requiredPermission: Permission,
): boolean {
  return userPermissions[requiredPermission] || false
}

// Check if user can perform action on another user
export function canManageUser(managerRole: Role, targetRole: Role): boolean {
  // Owner can manage everyone
  if (managerRole === "owner") return true

  // Admin can manage members and viewers, but not other admins or owner
  if (managerRole === "admin") {
    return targetRole === "member" || targetRole === "viewer"
  }

  // Members and viewers cannot manage anyone
  return false
}

// Get available roles that a user can assign
export function getAssignableRoles(userRole: Role): Role[] {
  switch (userRole) {
    case "owner":
      return ["admin", "member", "viewer"]
    case "admin":
      return ["member", "viewer"]
    default:
      return []
  }
}
