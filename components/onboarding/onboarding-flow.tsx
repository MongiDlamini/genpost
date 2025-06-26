"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { WelcomeStep } from "./steps/welcome-step"
import { SocialAccountsStep } from "./steps/social-accounts-step"
import { TeamSetupStep } from "./steps/team-setup-step"
import { PreferencesStep } from "./steps/preferences-step"
import { CompletionStep } from "./steps/completion-step"

export type OnboardingStep = "welcome" | "social" | "team" | "preferences" | "completion"

export interface OnboardingData {
  connectedAccounts: string[]
  teamName?: string
  teamType: "personal" | "business" | "agency"
  preferences: {
    emailNotifications: boolean
    marketingEmails: boolean
    timezone: string
  }
}

export function OnboardingFlow() {
  const { user } = useUser()
  const router = useRouter()

  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome")
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    connectedAccounts: [],
    teamType: "personal",
    preferences: {
      emailNotifications: true,
      marketingEmails: false,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  })

  const completeOnboarding = useMutation(api.users.completeOnboarding)
  const updateUserPreferences = useMutation(api.users.updateUserPreferences)

  const steps: OnboardingStep[] = ["welcome", "social", "team", "preferences", "completion"]
  const currentStepIndex = steps.indexOf(currentStep)
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100

  const updateOnboardingData = (updates: Partial<OnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex])
    }
  }

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex])
    }
  }

  const handleComplete = async () => {
    if (!user) return

    try {
      // Update user preferences
      await updateUserPreferences({
        clerkId: user.id,
        preferences: onboardingData.preferences,
      })

      // Mark onboarding as complete
      await completeOnboarding({ clerkId: user.id })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error completing onboarding:", error)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case "welcome":
        return <WelcomeStep onNext={handleNext} />
      case "social":
        return (
          <SocialAccountsStep
            connectedAccounts={onboardingData.connectedAccounts}
            onUpdate={(accounts) => updateOnboardingData({ connectedAccounts: accounts })}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case "team":
        return (
          <TeamSetupStep
            teamName={onboardingData.teamName}
            teamType={onboardingData.teamType}
            onUpdate={(updates) => updateOnboardingData(updates)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case "preferences":
        return (
          <PreferencesStep
            preferences={onboardingData.preferences}
            onUpdate={(preferences) => updateOnboardingData({ preferences })}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case "completion":
        return (
          <CompletionStep onboardingData={onboardingData} onComplete={handleComplete} onPrevious={handlePrevious} />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Getting Started</h1>
            <span className="text-sm text-gray-500">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {renderStep()}
      </div>
    </div>
  )
}
