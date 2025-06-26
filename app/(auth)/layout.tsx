import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication - GenPost",
  description: "Sign in or create your GenPost account",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-gray-50">{children}</div>
}
