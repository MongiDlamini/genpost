"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Shield, UserMinus, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RoleManagementProps {
  teamId: Id<"teams">
}

export function RoleManagement({ teamId }: RoleManagementProps) {
  const { user } = useUser()
  const { toast } = useToast()

  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [newRole, setNewRole] = useState<"admin" | "member" | "viewer">("member")

  const members = useQuery(api.teams.getTeamMembers, { teamId })
  const userRole = useQuery(api.permissions.getUserTeamRole, user ? { clerkId: user.id, teamId } : "skip")

  const updateMemberRole = useMutation(api.permissions.updateMemberRole)
  const removeMember = useMutation(api.permissions.removeMember)

  const handleRoleUpdate = async (targetUserId: Id<"users">, role: "admin" | "member" | "viewer") => {
    if (!user) return

    try {
      await updateMemberRole({
        teamId,
        targetUserId,
        newRole: role,
        updatedByClerkId: user.id,
      })

      toast({
        title: "Role updated",
        description: "Member role has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update role",
        variant: "destructive",
      })
    }
  }

  const handleRemoveMember = async (targetUserId: Id<"users">) => {
    if (!user) return

    try {
      await removeMember({
        teamId,
        targetUserId,
        removedByClerkId: user.id,
      })

      toast({
        title: "Member removed",
        description: "Member has been removed from the team.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove member",
        variant: "destructive",
      })
    }
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

  const canManageRole = (targetRole: string) => {
    if (!userRole) return false

    // Owner can manage everyone except themselves
    if (userRole.role === "owner") {
      return targetRole !== "owner"
    }

    // Admin can manage members and viewers
    if (userRole.role === "admin") {
      return targetRole === "member" || targetRole === "viewer"
    }

    return false
  }

  const getAvailableRoles = () => {
    if (!userRole) return []

    switch (userRole.role) {
      case "owner":
        return ["admin", "member", "viewer"]
      case "admin":
        return ["member", "viewer"]
      default:
        return []
    }
  }

  if (!members || !userRole) {
    return <div>Loading...</div>
  }

  // Check if user has permission to manage team
  if (!userRole.permissions.canManageTeam) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">You don't have permission to manage team members.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Role Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member._id} className="flex items-center justify-between p-4 border rounded-lg">
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

              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className={getRoleBadgeColor(member.role)}>
                  {member.role}
                </Badge>

                {canManageRole(member.role) && (
                  <div className="flex items-center space-x-2">
                    <Select
                      value={member.role}
                      onValueChange={(value: "admin" | "member" | "viewer") => handleRoleUpdate(member.userId, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableRoles().map((role) => (
                          <SelectItem key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {member.user.name} from the team? They will lose access to
                            all team content and settings.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveMember(member.userId)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remove Member
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
