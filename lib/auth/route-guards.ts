import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export async function requireAuth() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return userId
}

export async function requireOnboarding() {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const hasCompletedOnboarding = sessionClaims?.metadata?.onboardingComplete

  if (!hasCompletedOnboarding) {
    redirect("/onboarding")
  }

  return userId
}

export async function redirectIfAuthenticated(redirectTo = "/dashboard") {
  const { userId } = await auth()

  if (userId) {
    redirect(redirectTo)
  }
}

export async function getAuthState() {
  const { userId, sessionClaims } = await auth()

  return {
    isAuthenticated: !!userId,
    userId,
    hasCompletedOnboarding: sessionClaims?.metadata?.onboardingComplete || false,
    userMetadata: sessionClaims?.metadata || {},
  }
}
