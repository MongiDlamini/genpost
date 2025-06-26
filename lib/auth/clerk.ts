import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export async function requireAuth() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return userId
}

export async function getCurrentUser() {
  const user = await currentUser()
  return user
}

export function getAuthConfig() {
  return {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
    secretKey: process.env.CLERK_SECRET_KEY!,
  }
}
