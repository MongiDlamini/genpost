"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import { QuickModeEditor } from "./quick-mode-editor"
import { StandardModeEditor } from "./standard-mode-editor"

interface PostCreatorProps {
  mode: "quick" | "standard"
  selectedDate?: Date
}

export function PostCreator({ mode, selectedDate }: PostCreatorProps) {
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Calendar
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Post</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={mode === "quick" ? "default" : "secondary"}>
                {mode === "quick" ? "Quick Mode" : "Standard Mode"}
              </Badge>
              {selectedDate && <Badge variant="outline">{selectedDate.toLocaleDateString()}</Badge>}
            </div>
          </div>
        </div>

        <Button variant="outline" onClick={() => setIsGeneratingAI(true)} disabled={isGeneratingAI}>
          <Sparkles className="h-4 w-4 mr-2" />
          {isGeneratingAI ? "Generating..." : "AI Assist"}
        </Button>
      </div>

      {mode === "quick" ? (
        <QuickModeEditor selectedDate={selectedDate} />
      ) : (
        <StandardModeEditor selectedDate={selectedDate} />
      )}
    </div>
  )
}
