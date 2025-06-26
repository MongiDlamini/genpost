"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowLeft, Sparkles, Calendar, BarChart3 } from "lucide-react"
import type { OnboardingData } from "../onboarding-flow"

interface CompletionStepProps {
  onboardingData: OnboardingData
  onComplete: () => void
  onPrevious: () => void
}

export function CompletionStep({ onboardingData, onComplete, onPrevious }: CompletionStepProps) {
  const nextSteps = [
    {
      icon: Calendar,
      title: "Create Your First Post",
      description: "Start by creating and scheduling your first social media post",
      action: "Create Post",
    },
    {
      icon: BarChart3,
      title: "Explore Analytics",
      description: "Check out your analytics dashboard to track performance",
      action: "View Analytics",
    },
    {
      icon: Sparkles,
      title: "Try AI Features",
      description: "Use our AI assistant to generate content ideas and optimize posts",
      action: "Try AI",
    },
  ]

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl">You're All Set! 🎉</CardTitle>
        <p className="text-gray-600 mt-2">
          Welcome to GenPost! Your account is configured and ready to help you manage your social media like a pro.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gray-50 border rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Your Setup Summary</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Workspace Type</span>
              <Badge variant="secondary">{onboardingData.teamType}</Badge>
            </div>
            {onboardingData.teamName && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Team Name</span>
                <span className="text-sm font-medium">{onboardingData.teamName}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Connected Accounts</span>
              <span className="text-sm font-medium">
                {onboardingData.connectedAccounts.length > 0
                  ? `${onboardingData.connectedAccounts.length} account${onboardingData.connectedAccounts.length > 1 ? "s" : ""}`
                  : "None (coming soon)"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Timezone</span>
              <span className="text-sm font-medium">{onboardingData.preferences.timezone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email Notifications</span>
              <Badge variant={onboardingData.preferences.emailNotifications ? "default" : "secondary"}>
                {onboardingData.preferences.emailNotifications ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-4">Recommended Next Steps</h3>
          <div className="space-y-3">
            {nextSteps.map((step, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <step.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{step.title}</h4>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
                <Button variant="outline" size="sm">
                  {step.action}
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">🚀 Ready to get started?</h4>
          <p className="text-sm text-blue-800">
            You can always update your settings, connect more accounts, or invite team members from your dashboard. Need
            help? Check out our help center or contact support.
          </p>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button onClick={onComplete} size="lg">
            Enter GenPost
            <Sparkles className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
