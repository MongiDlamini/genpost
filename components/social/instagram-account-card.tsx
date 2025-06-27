"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Instagram, Users, ImageIcon, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@clerk/nextjs"

interface InstagramAccount {
  _id: Id<"socialAccounts">
  username: string
  displayName: string
  profileImageUrl?: string
  metadata?: {
    accountType: "personal" | "business"
    mediaCount?: number
    followersCount?: number
    followsCount?: number
  }
  lastSyncAt?: number
}

interface InstagramAccountCardProps {
  account: InstagramAccount
}

export function InstagramAccountCard({ account }: InstagramAccountCardProps) {
  const { user } = useUser()
  const { toast } = useToast()
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const disconnectAccount = useMutation(api.socialAccounts.disconnectInstagramAccount)

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
        description: "Instagram account has been disconnected successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect Instagram account",
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
                <Instagram className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">@{account.username}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="bg-pink-100 text-pink-800">
                  <Instagram className="h-3 w-3 mr-1" />
                  {account.metadata?.accountType || "personal"}
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
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center mb-1">
              <ImageIcon className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-lg font-semibold">{formatNumber(account.metadata?.mediaCount)}</div>
            <div className="text-xs text-gray-500">Posts</div>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-lg font-semibold">{formatNumber(account.metadata?.followersCount)}</div>
            <div className="text-xs text-gray-500">Followers</div>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-lg font-semibold">{formatNumber(account.metadata?.followsCount)}</div>
            <div className="text-xs text-gray-500">Following</div>
          </div>
        </div>

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
