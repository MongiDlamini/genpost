"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { InviteMemberDialog } from "./invite-member-dialog"
import { RoleManagement } from "./role-management"
import { PermissionGuard } from "./permission-guard"
import { Users, Mail } from "lucide-react"

interface TeamMembersListProps {
  teamId: Id<"teams">
}

export function TeamMembersList({ teamId }: TeamMembersListProps) {
  const members = useQuery(api.teams.getTeamMembers, { teamId })
  const invitations = useQuery(api.teams.getTeamInvitations, { teamId })

  if (!members || !invitations) {
    return <div>Loading...</div>
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800"
      case "admin":
        return "bg-blue-100 text-blue-800"
      case "member":
        return "bg-green-100 text-green-800"
      case "viewer":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Team Members ({members.length})</span>
          </CardTitle>
          <PermissionGuard teamId={teamId} permission="canInviteMembers">
            <InviteMemberDialog teamId={teamId} />
          </PermissionGuard>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={member.user.imageUrl || "/placeholder.svg"} />
                    <AvatarFallback>{member.user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{member.user.name}</p>
                    <p className="text-sm text-gray-500">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className={getRoleBadgeColor(member.role)}>
                    {member.role}
                  </Badge>
                  {member.status === "pending" && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Pending Invitations ({invitations.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation._id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{invitation.email}</p>
                    <p className="text-sm text-gray-500">
                      Invited by {invitation.inviterName} • Expires{" "}
                      {new Date(invitation.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary" className={getRoleBadgeColor(invitation.role)}>
                    {invitation.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <PermissionGuard teamId={teamId} permission="canManageTeam">
        <RoleManagement teamId={teamId} />
      </PermissionGuard>
    </div>
  )
}
