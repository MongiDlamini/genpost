"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Twitter, Users, MessageSquare, Calendar, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@clerk/nextjs"

interface TwitterAccount {
  _id: Id<"socialAccounts">
  username: string
  displayName: string
  profileImageUrl?: string
  metadata?: {
    verified?: boolean
    description?: string
    location?: string
    url?: string
    createdAt?: string
    publicMetrics?: {
      followers_count: number
      following_count: number
      tweet_count: number
      listed_count: number
    }
  }
  lastSyncAt?: number
}

interface TwitterAccountCardProps {
  account: TwitterAccount
}

export function TwitterAccountCard({ account }: TwitterAccountCardProps) {
  const { user } = useUser()
  const { toast } = useToast()
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const disconnectAccount = useMutation(api.socialAccounts.disconnectTwitterAccount)

  const handleDisconnect = async () => {
    if (!user) return

    setIsDisconnecting(true)
    try {
      await disconnectAccount({
        accountId: account._id,
        clerkId: user.id,
      })

      toast({
        title: "Account disconnected",
        description: "Twitter account has been disconnected successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect Twitter account",
        variant: "destructive",
      })
    } finally {
      setIsDisconnecting(false)
    }
  }

  const formatNumber = (num?: number) => {
    if (!num) return "0"
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={account.profileImageUrl || "/placeholder.svg"} />
              <AvatarFallback>
                <Twitter className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg flex items-center space-x-2">
                <span>@{account.username}</span>
                {account.metadata?.verified && <CheckCircle className="h-4 w-4 text-blue-500" />}
              </CardTitle>
              <p className="text-sm text-gray-600">{account.displayName}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Twitter className="h-3 w-3 mr-1" />
                  Twitter
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={isDisconnecting}>
            {isDisconnecting ? "Disconnecting..." : "Disconnect"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {account.metadata?.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{account.metadata.description}</p>
        )}

        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center mb-1">
              <MessageSquare className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-lg font-semibold">{formatNumber(account.metadata?.publicMetrics?.tweet_count)}</div>
            <div className="text-xs text-gray-500">Tweets</div>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-lg font-semibold">
              {formatNumber(account.metadata?.publicMetrics?.followers_count)}
            </div>
            <div className="text-xs text-gray-500">Followers</div>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-lg font-semibold">
              {formatNumber(account.metadata?.publicMetrics?.following_count)}
            </div>
            <div className="text-xs text-gray-500">Following</div>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-lg font-semibold">{formatNumber(account.metadata?.publicMetrics?.listed_count)}</div>
            <div className="text-xs text-gray-500">Lists</div>
          </div>
        </div>

        {account.metadata?.location && <div className="mt-4 text-sm text-gray-600">📍 {account.metadata.location}</div>}

        {account.lastSyncAt && (
          <div className="flex items-center justify-center mt-4 text-xs text-gray-500">
            <Calendar className="h-3 w-3 mr-1" />
            Last synced {new Date(account.lastSyncAt).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
