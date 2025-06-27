"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Instagram, Twitter, Facebook, AlertCircle, CheckCircle, Zap, Users, TrendingUp } from "lucide-react"
import { InstagramConnectButton } from "./instagram-connect-button"
import { InstagramAccountCard } from "./instagram-account-card"
import { TwitterConnectButton } from "./twitter-connect-button"
import { TwitterAccountCard } from "./twitter-account-card"
import { FacebookConnectButton } from "./facebook-connect-button"
import { FacebookAccountCard } from "./facebook-account-card"
import { SocialAccountStats } from "./social-account-stats"
import { ConnectionStatus } from "./connection-status"

export function SocialAccountManager() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState("overview")

  // Fetch all social accounts
  const instagramAccounts = useQuery(api.socialAccounts.getUserInstagramAccounts, user ? { clerkId: user.id } : "skip")
  const twitterAccounts = useQuery(api.socialAccounts.getUserTwitterAccounts, user ? { clerkId: user.id } : "skip")
  const facebookAccounts = useQuery(api.socialAccounts.getUserFacebookAccounts, user ? { clerkId: user.id } : "skip")

  if (!user) return null

  const totalAccounts =
    (instagramAccounts?.length || 0) + (twitterAccounts?.length || 0) + (facebookAccounts?.length || 0)

  const platforms = [
    {
      id: "instagram",
      name: "Instagram",
      icon: Instagram,
      color: "bg-pink-500",
      accounts: instagramAccounts || [],
      description: "Share photos and stories with your followers",
      features: ["Photo Posts", "Story Posts", "Reels", "IGTV"],
      limits: "200 requests/hour (Basic), 4800 requests/hour (Graph API)",
    },
    {
      id: "twitter",
      name: "Twitter",
      icon: Twitter,
      color: "bg-blue-500",
      accounts: twitterAccounts || [],
      description: "Share quick updates and engage in conversations",
      features: ["Tweets", "Threads", "Media Upload", "Polls"],
      limits: "300 requests/15 minutes",
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: Facebook,
      color: "bg-indigo-500",
      accounts: facebookAccounts || [],
      description: "Connect with friends and share longer-form content",
      features: ["Page Posts", "Photo/Video Posts", "Events", "Stories"],
      limits: "600-4800 requests/hour",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Social Accounts</h1>
            <p className="text-gray-600 mt-1">Manage your connected social media accounts and monitor their status</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-sm">
              {totalAccounts} {totalAccounts === 1 ? "Account" : "Accounts"} Connected
            </Badge>
            <ConnectionStatus />
          </div>
        </div>

        {/* Quick Stats */}
        <SocialAccountStats
          instagramAccounts={instagramAccounts || []}
          twitterAccounts={twitterAccounts || []}
          facebookAccounts={facebookAccounts || []}
        />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="instagram">Instagram</TabsTrigger>
            <TabsTrigger value="twitter">Twitter</TabsTrigger>
            <TabsTrigger value="facebook">Facebook</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {totalAccounts === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-gray-100 p-6 mb-4">
                    <Users className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No accounts connected</h3>
                  <p className="text-gray-600 text-center mb-6 max-w-md">
                    Connect your social media accounts to start scheduling and managing your posts across platforms.
                  </p>
                  <div className="flex space-x-3">
                    <InstagramConnectButton accountType="personal" />
                    <TwitterConnectButton />
                    <FacebookConnectButton />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {platforms.map((platform) => (
                  <Card key={platform.id} className="relative overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${platform.color}`}>
                            <platform.icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{platform.name}</CardTitle>
                            <p className="text-sm text-gray-600">{platform.accounts.length} connected</p>
                          </div>
                        </div>
                        {platform.accounts.length > 0 ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">{platform.description}</p>

                      {platform.accounts.length > 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Status</span>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Active
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Rate Limit</span>
                              <span className="text-gray-900">85% available</span>
                            </div>
                            <Progress value={85} className="h-2" />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          {platform.id === "instagram" && <InstagramConnectButton accountType="personal" />}
                          {platform.id === "twitter" && <TwitterConnectButton />}
                          {platform.id === "facebook" && <FacebookConnectButton />}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Instagram Tab */}
          <TabsContent value="instagram" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Instagram Accounts</h2>
                <p className="text-gray-600">Manage your Instagram connections and settings</p>
              </div>
              <div className="flex space-x-2">
                <InstagramConnectButton accountType="personal" />
                <InstagramConnectButton accountType="business" />
              </div>
            </div>

            {instagramAccounts && instagramAccounts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {instagramAccounts.map((account) => (
                  <InstagramAccountCard key={account._id} account={account} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Instagram className="h-12 w-12 text-pink-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Instagram accounts</h3>
                  <p className="text-gray-600 text-center mb-6">
                    Connect your Instagram accounts to start sharing photos and stories.
                  </p>
                  <div className="flex space-x-3">
                    <InstagramConnectButton accountType="personal" />
                    <InstagramConnectButton accountType="business" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instagram Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Instagram Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    "Photo Posts",
                    "Story Posts",
                    "Reels",
                    "IGTV",
                    "Shopping Tags",
                    "Insights",
                    "Comments",
                    "Direct Messages",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Twitter Tab */}
          <TabsContent value="twitter" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Twitter Accounts</h2>
                <p className="text-gray-600">Manage your Twitter connections and settings</p>
              </div>
              <TwitterConnectButton />
            </div>

            {twitterAccounts && twitterAccounts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {twitterAccounts.map((account) => (
                  <TwitterAccountCard key={account._id} account={account} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Twitter className="h-12 w-12 text-blue-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Twitter accounts</h3>
                  <p className="text-gray-600 text-center mb-6">
                    Connect your Twitter account to start sharing tweets and engaging with your audience.
                  </p>
                  <TwitterConnectButton />
                </CardContent>
              </Card>
            )}

            {/* Twitter Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Twitter Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    "Tweets",
                    "Threads",
                    "Media Upload",
                    "Polls",
                    "Spaces",
                    "Analytics",
                    "Lists",
                    "Direct Messages",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Facebook Tab */}
          <TabsContent value="facebook" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Facebook Pages</h2>
                <p className="text-gray-600">Manage your Facebook page connections and settings</p>
              </div>
              <FacebookConnectButton />
            </div>

            {facebookAccounts && facebookAccounts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {facebookAccounts.map((account) => (
                  <FacebookAccountCard key={account._id} account={account} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Facebook className="h-12 w-12 text-indigo-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Facebook pages</h3>
                  <p className="text-gray-600 text-center mb-6">
                    Connect your Facebook pages to start sharing posts and engaging with your community.
                  </p>
                  <FacebookConnectButton />
                </CardContent>
              </Card>
            )}

            {/* Facebook Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Facebook Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    "Page Posts",
                    "Photo/Video Posts",
                    "Events",
                    "Stories",
                    "Live Video",
                    "Insights",
                    "Messenger",
                    "Ads Integration",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
