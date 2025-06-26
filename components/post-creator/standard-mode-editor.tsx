"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, ImageIcon, Send } from "lucide-react"
import { MediaUploader } from "./media-uploader"
import { PlatformPreviews } from "./platform-previews"

interface StandardModeEditorProps {
  selectedDate?: Date
}

export function StandardModeEditor({ selectedDate }: StandardModeEditorProps) {
  const [instagramContent, setInstagramContent] = useState("")
  const [twitterContent, setTwitterContent] = useState("")
  const [facebookContent, setFacebookContent] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [uploadedMedia, setUploadedMedia] = useState<string[]>([])

  const handleSchedulePost = () => {
    // TODO: Implement post scheduling logic
    console.log("Scheduling post:", {
      instagramContent,
      twitterContent,
      facebookContent,
      scheduledTime,
      uploadedMedia,
    })
  }

  const handlePostNow = () => {
    // TODO: Implement immediate posting logic
    console.log("Posting now:", {
      instagramContent,
      twitterContent,
      facebookContent,
      uploadedMedia,
    })
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
            <MediaUploader onMediaUpload={setUploadedMedia} maxFiles={10} mode="standard" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="instagram-content">Instagram Caption</Label>
              <Textarea
                id="instagram-content"
                placeholder="Write your Instagram post content here..."
                value={instagramContent}
                onChange={(e) => setInstagramContent(e.target.value)}
                className="min-h-[100px] mt-2"
              />
            </div>

            <div>
              <Label htmlFor="twitter-content">Twitter Caption</Label>
              <Textarea
                id="twitter-content"
                placeholder="Write your Twitter post content here..."
                value={twitterContent}
                onChange={(e) => setTwitterContent(e.target.value)}
                className="min-h-[80px] mt-2"
              />
            </div>

            <div>
              <Label htmlFor="facebook-content">Facebook Caption</Label>
              <Textarea
                id="facebook-content"
                placeholder="Write your Facebook post content here..."
                value={facebookContent}
                onChange={(e) => setFacebookContent(e.target.value)}
                className="min-h-[100px] mt-2"
              />
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
        <PlatformPreviews
          content=""
          media={uploadedMedia}
          mode="standard"
          platformContent={{
            instagram: instagramContent,
            twitter: twitterContent,
            facebook: facebookContent,
          }}
        />
      </div>
    </div>
  )
}
