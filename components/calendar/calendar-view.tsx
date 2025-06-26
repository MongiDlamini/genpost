"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { PostPreview } from "./post-preview"
import { CreatePostDialog } from "./create-post-dialog"

export function CalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Mock data for scheduled posts
  const scheduledPosts = [
    {
      id: "1",
      date: new Date(),
      platforms: ["instagram", "twitter", "facebook"],
      status: "scheduled",
      content: "Check out our latest product update! 🚀",
      image: "/placeholder.svg?height=100&width=100",
    },
  ]

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      setShowCreateDialog(true)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold">Content Calendar</CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border w-full"
              components={{
                DayContent: ({ date }) => {
                  const postsForDate = scheduledPosts.filter((post) => post.date.toDateString() === date.toDateString())
                  return (
                    <div className="relative w-full h-full p-1">
                      <span className="text-sm">{date.getDate()}</span>
                      {postsForDate.length > 0 && (
                        <div className="absolute bottom-0 right-0 w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                  )
                },
              }}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                {selectedDate ? selectedDate.toLocaleDateString() : "Select a date"}
              </h3>
              {selectedDate && (
                <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Post
                </Button>
              )}
            </div>

            {selectedDate && (
              <div className="space-y-3">
                {scheduledPosts
                  .filter((post) => post.date.toDateString() === selectedDate.toDateString())
                  .map((post) => (
                    <PostPreview key={post.id} post={post} />
                  ))}
                {scheduledPosts.filter((post) => post.date.toDateString() === selectedDate.toDateString()).length ===
                  0 && <p className="text-sm text-muted-foreground">No posts scheduled for this date</p>}
              </div>
            )}
          </div>
        </div>

        <CreatePostDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} selectedDate={selectedDate} />
      </CardContent>
    </Card>
  )
}
