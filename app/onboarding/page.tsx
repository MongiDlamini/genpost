import { requireAuth } from "@/lib/auth/route-guards"
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow"

export default async function OnboardingPage() {
  // Ensure user is authenticated
  await requireAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <OnboardingFlow />
    </div>
  )
}
