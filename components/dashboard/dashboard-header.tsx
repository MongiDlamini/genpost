"use client"

import { UserButton } from "@clerk/nextjs"
import { Bell, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function DashboardHeader() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-semibold text-gray-900">
              GenPost
            </Link>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Beta
            </Badge>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/analytics" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Analytics
            </Link>
            <Link href="/history" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              History
            </Link>
            <Link href="/settings" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Settings
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Button size="sm" asChild>
              <Link href="/create">
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Link>
            </Button>

            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>

            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </header>
  )
}
