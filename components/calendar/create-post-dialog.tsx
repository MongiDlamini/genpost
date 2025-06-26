"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

interface CreatePostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate?: Date
}

export function CreatePostDialog({ open, onOpenChange, selectedDate }: CreatePostDialogProps) {
  const router = useRouter()

  const handleModeSelect = (mode: "quick" | "standard") => {
    onOpenChange(false)
    const dateParam = selectedDate ? `?date=${selectedDate.toISOString()}` : ""
    router.push(`/create?mode=${mode}${dateParam}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
            onClick={() => handleModeSelect("quick")}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Quick Mode</CardTitle>
                  <CardDescription>Fast posting in under 60 seconds</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Single caption for all platforms</li>
                <li>• One image across all channels</li>
                <li>• Simplified scheduling</li>
              </ul>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-purple-200"
            onClick={() => handleModeSelect("standard")}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Settings className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Standard Mode</CardTitle>
                  <CardDescription>Full customization with AI assistance</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Platform-specific customization</li>
                <li>• AI content suggestions</li>
                <li>• Advanced scheduling options</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
