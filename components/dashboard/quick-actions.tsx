"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Users, Calendar, Zap } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  // Mock data
  const monthlyUsage = { used: 23, limit: 50 }
  const usagePercentage = (monthlyUsage.used / monthlyUsage.limit) * 100

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" asChild>
            <Link href="/create?mode=quick">
              <Zap className="h-4 w-4 mr-2" />
              Quick Post
            </Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/create?mode=standard">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Post
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Monthly Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Posts this month</span>
              <span className="font-medium">
                {monthlyUsage.used} / {monthlyUsage.limit}
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            <div className="flex items-center justify-between">
              <Badge variant="secondary">Starter Plan</Badge>
              <Button variant="link" size="sm" className="h-auto p-0" asChild>
                <Link href="/settings/billing">Upgrade</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">This Week</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm">Engagement</span>
            </div>
            <span className="text-sm font-medium text-green-600">+12%</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Reach</span>
            </div>
            <span className="text-sm font-medium">2.4K</span>
          </div>
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href="/analytics">View Analytics</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
