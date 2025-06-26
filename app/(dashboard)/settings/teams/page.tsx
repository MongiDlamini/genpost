"use client"

import { useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateTeamDialog } from "@/components/teams/create-team-dialog"
import { TeamMembersList } from "@/components/teams/team-members-list"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"

export default function TeamsPage() {
  const { user } = useUser()
  const teams = useQuery(api.teams.getUserTeams, user ? { clerkId: user.id } : "skip")

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
            <p className="text-gray-600">Manage your teams and collaborate with others</p>
          </div>
          <CreateTeamDialog />
        </div>

        {teams && teams.length > 0 ? (
          <div className="space-y-6">
            {teams.map((team) => (
              <Card key={team._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>{team.name}</span>
                      </CardTitle>
                      {team.description && <p className="text-sm text-gray-600 mt-1">{team.description}</p>}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{team.plan}</Badge>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {team.role}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <TeamMembersList teamId={team._id} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first team to start collaborating with others on your social media content.
              </p>
              <CreateTeamDialog />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
