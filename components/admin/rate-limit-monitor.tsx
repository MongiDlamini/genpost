"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertTriangle, CheckCircle, Clock } from "lucide-react"

interface RateLimitStatus {
  platform: string
  endpoint: string
  remaining: number
  limit: number
  resetTime: number
  status: "healthy" | "warning" | "critical"
}

export function RateLimitMonitor() {
  const [rateLimits, setRateLimits] = useState<RateLimitStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchRateLimits = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/rate-limits")
      const data = await response.json()
      setRateLimits(data.rateLimits || [])
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error fetching rate limits:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRateLimits()
    const interval = setInterval(fetchRateLimits, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "critical":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const formatResetTime = (resetTime: number) => {
    const now = Date.now()
    const diff = resetTime - now
    if (diff <= 0) return "Now"

    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  const getUsagePercentage = (remaining: number, limit: number) => {
    return ((limit - remaining) / limit) * 100
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Rate Limit Monitor</h2>
          <p className="text-muted-foreground">Monitor API rate limits across all social media platforms</p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</span>
          )}
          <Button onClick={fetchRateLimits} disabled={isLoading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rateLimits.map((rateLimit, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base capitalize">{rateLimit.platform}</CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusIcon(rateLimit.status)}
                  <Badge variant={rateLimit.status === "healthy" ? "default" : "destructive"}>{rateLimit.status}</Badge>
                </div>
              </div>
              <CardDescription>{rateLimit.endpoint}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Usage</span>
                  <span>
                    {rateLimit.limit - rateLimit.remaining}/{rateLimit.limit}
                  </span>
                </div>
                <Progress value={getUsagePercentage(rateLimit.remaining, rateLimit.limit)} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Remaining</p>
                  <p className="font-medium">{rateLimit.remaining}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Resets in</p>
                  <p className="font-medium">{formatResetTime(rateLimit.resetTime)}</p>
                </div>
              </div>

              {rateLimit.status === "critical" && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">Rate limit nearly exhausted. New requests may be delayed.</p>
                </div>
              )}

              {rateLimit.status === "warning" && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">Rate limit usage is high. Monitor closely.</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {rateLimits.length === 0 && !isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No rate limit data available</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
