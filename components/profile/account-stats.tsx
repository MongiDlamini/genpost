"use client"

import { useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, Calendar, TrendingUp } from "lucide-react"

export function AccountStats() {
  const { user } = useUser()
  const userStats = useQuery(api.users.getUserStats, user ? { clerkId: user.id } : "skip")
  const userTeams = useQuery(api.teams.getUserTeams, user ? { clerkId: user.id } : "skip")

  if (!user || !userStats) {
    return <div>Loading...</div>
  }

  const stats = [
    {
      title: "Posts Created",
      value: userStats.postsCount,
      icon: BarChart3,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Scheduled Posts",
      value: userStats.scheduledPostsCount,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Teams",
      value: userStats.teamsCount,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Days Active",
      value: Math.floor((Date.now() - userStats.joinedAt) / (1000 * 60 * 60 * 24)),
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.title} className="text-center">
                <div className={`inline-flex p-3 rounded-full ${stat.bgColor} mb-2`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.title}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {userTeams && userTeams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Team Memberships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userTeams.map((team) => (
                <div key={team._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{team.name}</h4>
                    {team.description && <p className="text-sm text-gray-600">{team.description}</p>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{team.plan}</Badge>
                    <Badge
                      variant="secondary"
                      className={
                        team.role === "owner"
                          ? "bg-purple-100 text-purple-800"
                          : team.role === "admin"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }
                    >
                      {team.role}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
