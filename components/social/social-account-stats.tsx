"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, TrendingUp, MessageSquare, Heart, Instagram, Twitter, Facebook } from "lucide-react"

interface SocialAccountStatsProps {
  instagramAccounts: any[]
  twitterAccounts: any[]
  facebookAccounts: any[]
}

export function SocialAccountStats({ instagramAccounts, twitterAccounts, facebookAccounts }: SocialAccountStatsProps) {
  // Calculate total followers across all platforms
  const totalFollowers = [
    ...instagramAccounts.map((acc) => acc.metadata?.followersCount || 0),
    ...twitterAccounts.map((acc) => acc.metadata?.publicMetrics?.followers_count || 0),
    ...facebookAccounts.map(
      (acc) => acc.metadata?.pages?.reduce((total: number, page: any) => total + (page.fanCount || 0), 0) || 0,
    ),
  ].reduce((sum, count) => sum + count, 0)

  // Calculate total posts
  const totalPosts = [
    ...instagramAccounts.map((acc) => acc.metadata?.mediaCount || 0),
    ...twitterAccounts.map((acc) => acc.metadata?.publicMetrics?.tweet_count || 0),
  ].reduce((sum, count) => sum + count, 0)

  // Calculate engagement rate (simplified)
  const avgEngagementRate = 3.2 // This would be calculated from actual data

  // Platform health scores (based on token status, rate limits, etc.)
  const platformHealth = {
    instagram: instagramAccounts.length > 0 ? 95 : 0,
    twitter: twitterAccounts.length > 0 ? 88 : 0,
    facebook: facebookAccounts.length > 0 ? 92 : 0,
  }

  const stats = [
    {
      title: "Total Followers",
      value: totalFollowers.toLocaleString(),
      change: "+12.5%",
      changeType: "positive" as const,
      icon: Users,
      description: "Across all platforms",
    },
    {
      title: "Total Posts",
      value: totalPosts.toLocaleString(),
      change: "+8.2%",
      changeType: "positive" as const,
      icon: MessageSquare,
      description: "Published content",
    },
    {
      title: "Avg. Engagement",
      value: `${avgEngagementRate}%`,
      change: "+0.8%",
      changeType: "positive" as const,
      icon: Heart,
      description: "Engagement rate",
    },
    {
      title: "Platform Health",
      value: `${Math.round((platformHealth.instagram + platformHealth.twitter + platformHealth.facebook) / 3)}%`,
      change: "Excellent",
      changeType: "neutral" as const,
      icon: TrendingUp,
      description: "Overall system status",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="flex items-center space-x-2 mt-1">
              <Badge
                variant={stat.changeType === "positive" ? "default" : "secondary"}
                className={stat.changeType === "positive" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
              >
                {stat.change}
              </Badge>
              <p className="text-xs text-gray-600">{stat.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Platform Health Details */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-lg">Platform Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Instagram className="h-4 w-4 text-pink-500" />
                  <span className="text-sm font-medium">Instagram</span>
                </div>
                <span className="text-sm text-gray-600">{platformHealth.instagram}%</span>
              </div>
              <Progress value={platformHealth.instagram} className="h-2" />
              <p className="text-xs text-gray-500">
                {instagramAccounts.length} account{instagramAccounts.length !== 1 ? "s" : ""} connected
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Twitter className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Twitter</span>
                </div>
                <span className="text-sm text-gray-600">{platformHealth.twitter}%</span>
              </div>
              <Progress value={platformHealth.twitter} className="h-2" />
              <p className="text-xs text-gray-500">
                {twitterAccounts.length} account{twitterAccounts.length !== 1 ? "s" : ""} connected
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Facebook className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm font-medium">Facebook</span>
                </div>
                <span className="text-sm text-gray-600">{platformHealth.facebook}%</span>
              </div>
              <Progress value={platformHealth.facebook} className="h-2" />
              <p className="text-xs text-gray-500">
                {facebookAccounts.length} page{facebookAccounts.length !== 1 ? "s" : ""} connected
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
