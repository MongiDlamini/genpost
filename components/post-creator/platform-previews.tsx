"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Instagram, Twitter, Facebook } from "lucide-react"
import Image from "next/image"

interface PlatformPreviewsProps {
  content: string
  media: string[]
  mode: "quick" | "standard"
  platformContent?: {
    instagram?: string
    twitter?: string
    facebook?: string
  }
}

export function PlatformPreviews({ content, media, mode, platformContent }: PlatformPreviewsProps) {
  const platforms = [
    {
      name: "Instagram",
      icon: Instagram,
      color: "bg-pink-100 text-pink-800",
      content: platformContent?.instagram || content,
      maxLength: 2200,
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-blue-100 text-blue-800",
      content: platformContent?.twitter || content,
      maxLength: 280,
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-indigo-100 text-indigo-800",
      content: platformContent?.facebook || content,
      maxLength: 63206,
    },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Platform Previews</h3>

      {platforms.map((platform) => (
        <Card key={platform.name}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <platform.icon className="h-5 w-5" />
                <span>{platform.name}</span>
              </div>
              <Badge variant="secondary" className={platform.color}>
                {platform.content.length}/{platform.maxLength}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {media.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {media.slice(0, platform.name === "Twitter" ? 4 : 10).map((image, index) => (
                    <Image
                      key={index}
                      src={image || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-24 object-cover rounded-md"
                    />
                  ))}
                </div>
              )}

              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {platform.content || "Your post content will appear here..."}
                </p>
              </div>

              {platform.content.length > platform.maxLength && (
                <p className="text-sm text-red-600">Content exceeds {platform.name} character limit</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
