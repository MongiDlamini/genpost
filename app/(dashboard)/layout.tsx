import type React from "react"
import type { Metadata } from "next"
import { requireOnboarding } from "@/lib/auth/route-guards"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export const metadata: Metadata = {
  title: "Dashboard - GenPost",
  description: "Manage your social media content",
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Ensure user is authenticated and has completed onboarding
  await requireOnboarding()

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      {children}
    </div>
  )
}
