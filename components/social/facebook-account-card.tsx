"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Facebook, Users, FileText, Calendar, Building } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@clerk/nextjs"

interface FacebookPage {
  id: string
  name: string
  username?: string
  category: string
  fanCount?: number
  followersCount?: number
  link: string
  picture?: string
}

interface FacebookAccount {
  _id: Id<"socialAccounts">
  username: string
  displayName: string
  profileImageUrl?: string
  metadata?: {
    email?: string
    pages?: FacebookPage[]
    pagesCount?: number
  }
  lastSyncAt?: number
}

interface FacebookAccountCardProps {
  account: FacebookAccount
}

export function FacebookAccountCard({ account }: FacebookAccountCardProps) {
  const { user } = useUser()
  const { toast } = useToast()
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [showPages, setShowPages] = useState(false)

  const disconnectAccount = useMutation(api.socialAccounts.disconnectFacebookAccount)

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
        description: "Facebook account has been disconnected successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect Facebook account",
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

  const totalFans = account.metadata?.pages?.reduce((total, page) => total + (page.fanCount || 0), 0) || 0
  const totalFollowers = account.metadata?.pages?.reduce((total, page) => total + (page.followersCount || 0), 0) || 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={account.profileImageUrl || "/placeholder.svg"} />
              <AvatarFallback>
                <Facebook className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{account.displayName}</CardTitle>
              <p className="text-sm text-gray-600">{account.metadata?.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                  <Facebook className="h-3 w-3 mr-1" />
                  Facebook
                </Badge>
                {account.metadata?.pagesCount && <Badge variant="outline">{account.metadata.pagesCount} pages</Badge>}
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={isDisconnecting}>
            {isDisconnecting ? "Disconnecting..." : "Disconnect"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center mb-4">
          <div>
            <div className="flex items-center justify-center mb-1">
              <Building className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-lg font-semibold">{account.metadata?.pagesCount || 0}</div>
            <div className="text-xs text-gray-500">Pages</div>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-lg font-semibold">{formatNumber(totalFans)}</div>
            <div className="text-xs text-gray-500">Total Fans</div>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-lg font-semibold">{formatNumber(totalFollowers)}</div>
            <div className="text-xs text-gray-500">Total Followers</div>
          </div>
        </div>

        {account.metadata?.pages && account.metadata.pages.length > 0 && (
          <div>
            <Button variant="outline" size="sm" onClick={() => setShowPages(!showPages)} className="w-full mb-3">
              <FileText className="h-4 w-4 mr-2" />
              {showPages ? "Hide" : "Show"} Pages ({account.metadata.pages.length})
            </Button>

            {showPages && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {account.metadata.pages.map((page) => (
                  <div key={page.id} className="flex items-center justify-between p-2 border rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={page.picture || "/placeholder.svg"} />
                        <AvatarFallback>
                          <Building className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{page.name}</p>
                        <p className="text-xs text-gray-500">{page.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium">{formatNumber(page.fanCount)} fans</p>
                      <p className="text-xs text-gray-500">{formatNumber(page.followersCount)} followers</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
