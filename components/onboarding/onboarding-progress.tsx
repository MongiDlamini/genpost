"use client"

import { useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export function OnboardingProgress() {
  const { user } = useUser()
  const userData = useQuery(api.users.getUserProfile, user ? { clerkId: user.id } : "skip")

  if (!userData || userData.onboardingComplete) {
    return null
  }

  const completedSteps = [
    userData.name ? "profile" : null,
    userData.socialAccounts.length > 0 ? "social" : null,
    userData.teams.length > 0 ? "team" : null,
    userData.preferences.timezone !== "UTC" ? "preferences" : null,
  ].filter(Boolean)

  const totalSteps = 4
  const progress = (completedSteps.length / totalSteps) * 100

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">Complete Your Setup</h3>
            </div>
            <p className="text-sm text-blue-800 mb-3">Finish setting up your account to unlock all GenPost features</p>
            <Progress value={progress} className="h-2 bg-blue-200" />
            <p className="text-xs text-blue-700 mt-1">
              {completedSteps.length} of {totalSteps} steps completed
            </p>
          </div>
          <Button asChild size="sm" className="ml-4">
            <Link href="/onboarding">
              Continue Setup
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
