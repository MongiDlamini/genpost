"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ImageIcon, Send } from "lucide-react"
import { MediaUploader } from "./media-uploader"
import { PlatformPreviews } from "./platform-previews"

interface QuickModeEditorProps {
  selectedDate?: Date
}

export function QuickModeEditor({ selectedDate }: QuickModeEditorProps) {
  const [content, setContent] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [uploadedMedia, setUploadedMedia] = useState<string[]>([])

  const handleSchedulePost = () => {
    // TODO: Implement post scheduling logic
    console.log("Scheduling post:", { content, scheduledTime, uploadedMedia })
  }

  const handlePostNow = () => {
    // TODO: Implement immediate posting logic
    console.log("Posting now:", { content, uploadedMedia })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ImageIcon className="h-5 w-5" />
              <span>Media</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MediaUploader onMediaUpload={setUploadedMedia} maxFiles={1} mode="quick" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="content">Caption</Label>
              <Textarea
                id="content"
                placeholder="Write your post content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] mt-2"
              />
              <p className="text-sm text-muted-foreground mt-2">This caption will be used across all platforms</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-pink-100 text-pink-800">
                Instagram
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Twitter
              </Badge>
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                Facebook
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Scheduling</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="schedule-time">Schedule for</Label>
              <Input
                id="schedule-time"
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="mt-2"
              />
            </div>

            <div className="flex space-x-3">
              <Button onClick={handlePostNow} className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                Post Now
              </Button>
              <Button variant="outline" onClick={handleSchedulePost} disabled={!scheduledTime} className="flex-1">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <PlatformPreviews content={content} media={uploadedMedia} mode="quick" />
      </div>
    </div>
  )
}
