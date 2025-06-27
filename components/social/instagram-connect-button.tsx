"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Instagram, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface InstagramConnectButtonProps {
  accountType: "personal" | "business"
  teamId?: string
  isConnected?: boolean
  onDisconnect?: () => void
}

export function InstagramConnectButton({
  accountType,
  teamId,
  isConnected = false,
  onDisconnect,
}: InstagramConnectButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const { toast } = useToast()

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const params = new URLSearchParams({
        accountType,
        returnUrl: window.location.pathname,
      })

      if (teamId) {
        params.append("teamId", teamId)
      }

      window.location.href = `/api/auth/instagram?${params.toString()}`
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate Instagram connection",
        variant: "destructive",
      })
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    if (onDisconnect) {
      onDisconnect()
    }
  }

  if (isConnected) {
    return (
      <div className="flex items-center space-x-2">
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <Instagram className="h-3 w-3 mr-1" />
          Connected
        </Badge>
        <Button variant="outline" size="sm" onClick={handleDisconnect}>
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={handleConnect} disabled={isConnecting} size="sm">
      <Instagram className="h-4 w-4 mr-2" />
      {isConnecting ? "Connecting..." : `Connect ${accountType === "business" ? "Business" : "Personal"}`}
      <ExternalLink className="h-4 w-4 ml-2" />
    </Button>
  )
}
