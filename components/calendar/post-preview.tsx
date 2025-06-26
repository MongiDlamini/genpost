"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"

interface PostPreviewProps {
  post: {
    id: string
    platforms: string[]
    status: string
    content: string
    image?: string
  }
}

export function PostPreview({ post }: PostPreviewProps) {
  const platformColors = {
    instagram: "bg-pink-100 text-pink-800",
    twitter: "bg-blue-100 text-blue-800",
    facebook: "bg-indigo-100 text-indigo-800",
  }

  const statusColors = {
    scheduled: "bg-yellow-100 text-yellow-800",
    published: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  }

  return (
    <Card className="p-3">
      <CardContent className="p-0">
        <div className="flex items-start space-x-3">
          {post.image && (
            <Image
              src={post.image || "/placeholder.svg"}
              alt="Post preview"
              width={48}
              height={48}
              className="rounded-md object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 line-clamp-2 mb-2">{post.content}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {post.platforms.map((platform) => (
                  <Badge
                    key={platform}
                    variant="secondary"
                    className={`text-xs ${platformColors[platform as keyof typeof platformColors]}`}
                  >
                    {platform}
                  </Badge>
                ))}
                <Badge
                  variant="secondary"
                  className={`text-xs ${statusColors[post.status as keyof typeof statusColors]}`}
                >
                  {post.status}
                </Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
