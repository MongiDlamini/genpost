"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { User, Mail, Calendar, Save } from "lucide-react"

export function ProfileForm() {
  const { user, isLoaded } = useUser()
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const userData = useQuery(api.users.getUser, user ? { clerkId: user.id } : "skip")
  const updateProfile = useMutation(api.users.updateUserProfile)
  const createUser = useMutation(api.users.createUser)

  useEffect(() => {
    if (user && isLoaded) {
      setName(user.fullName || user.firstName || "")

      // Create user in Convex if doesn't exist
      if (!userData) {
        createUser({
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          name: user.fullName || user.firstName || "",
          imageUrl: user.imageUrl,
        }).catch(console.error)
      }
    }
  }, [user, isLoaded, userData, createUser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !name.trim()) return

    setIsLoading(true)
    try {
      // Update in Clerk
      await user.update({
        firstName: name.trim(),
      })

      // Update in Convex
      await updateProfile({
        clerkId: user.id,
        name: name.trim(),
        imageUrl: user.imageUrl,
      })

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoaded || !user) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Profile Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.imageUrl || "/placeholder.svg"} />
              <AvatarFallback className="text-lg">{name.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">Profile Picture</h3>
              <p className="text-sm text-gray-600">
                Your profile picture is managed through your authentication provider.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative mt-2">
                <Input id="email" value={user.emailAddresses[0]?.emailAddress || ""} disabled className="pr-10" />
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed here. Manage it in your account settings.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading || !name.trim()}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
