"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, Instagram, Twitter, Facebook, CheckCircle, ExternalLink } from "lucide-react"

interface SocialAccountsStepProps {
  connectedAccounts: string[]
  onUpdate: (accounts: string[]) => void
  onNext: () => void
  onPrevious: () => void
}

export function SocialAccountsStep({ connectedAccounts, onUpdate, onNext, onPrevious }: SocialAccountsStepProps) {
  const [isConnecting, setIsConnecting] = useState<string | null>(null)

  const platforms = [
    {
      id: "instagram",
      name: "Instagram",
      icon: Instagram,
      color: "bg-pink-500",
      description: "Share photos and stories with your followers",
      comingSoon: true,
    },
    {
      id: "twitter",
      name: "Twitter",
      icon: Twitter,
      color: "bg-blue-500",
      description: "Share quick updates and engage in conversations",
      comingSoon: true,
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: Facebook,
      color: "bg-indigo-500",
      description: "Connect with friends and share longer-form content",
      comingSoon: true,
    },
  ]

  const handleConnect = async (platformId: string) => {
    setIsConnecting(platformId)

    // Simulate connection process
    setTimeout(() => {
      if (!connectedAccounts.includes(platformId)) {
        onUpdate([...connectedAccounts, platformId])
      }
      setIsConnecting(null)
    }, 2000)
  }

  const handleDisconnect = (platformId: string) => {
    onUpdate(connectedAccounts.filter((id) => id !== platformId))
  }

  const isConnected = (platformId: string) => connectedAccounts.includes(platformId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect Your Social Accounts</CardTitle>
        <p className="text-gray-600">
          Connect your social media accounts to start scheduling posts. You can add more accounts later.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className={`p-4 border rounded-lg transition-all ${
                isConnected(platform.id) ? "border-green-200 bg-green-50" : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${platform.color}`}>
                    <platform.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{platform.name}</h3>
                      {platform.comingSoon && (
                        <Badge variant="outline" className="text-xs">
                          Coming Soon
                        </Badge>
                      )}
                      {isConnected(platform.id) && <CheckCircle className="h-4 w-4 text-green-600" />}
                    </div>
                    <p className="text-sm text-gray-600">{platform.description}</p>
                  </div>
                </div>

                <div>
                  {isConnected(platform.id) ? (
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Connected
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(platform.id)}
                        disabled={platform.comingSoon}
                      >
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleConnect(platform.id)}
                      disabled={isConnecting === platform.id || platform.comingSoon}
                      size="sm"
                    >
                      {isConnecting === platform.id ? (
                        "Connecting..."
                      ) : platform.comingSoon ? (
                        "Coming Soon"
                      ) : (
                        <>
                          Connect
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {connectedAccounts.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">No accounts connected yet</h4>
            <p className="text-sm text-yellow-800">
              While social platform integrations are coming soon, you can still explore GenPost's features and get
              familiar with the interface. Connect accounts later when they become available.
            </p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">🔒 Your data is secure</h4>
          <p className="text-sm text-blue-800">
            We use industry-standard OAuth 2.0 authentication. We never store your passwords and you can disconnect
            accounts at any time.
          </p>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button onClick={onNext}>
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
