"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, ArrowLeft, Bell, Globe } from "lucide-react"

interface PreferencesStepProps {
  preferences: {
    emailNotifications: boolean
    marketingEmails: boolean
    timezone: string
  }
  onUpdate: (preferences: { emailNotifications: boolean; marketingEmails: boolean; timezone: string }) => void
  onNext: () => void
  onPrevious: () => void
}

export function PreferencesStep({ preferences, onUpdate, onNext, onPrevious }: PreferencesStepProps) {
  const timezones = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "Europe/Paris", label: "Paris (CET)" },
    { value: "Asia/Tokyo", label: "Tokyo (JST)" },
    { value: "Australia/Sydney", label: "Sydney (AEST)" },
    { value: "UTC", label: "UTC" },
  ]

  const updatePreference = (key: keyof typeof preferences, value: boolean | string) => {
    onUpdate({
      ...preferences,
      [key]: value,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customize Your Experience</CardTitle>
        <p className="text-gray-600">
          Set your preferences to get the most out of GenPost. You can change these later.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Bell className="h-5 w-5 text-gray-600" />
              <h3 className="font-medium text-gray-900">Notifications</h3>
            </div>
            <div className="space-y-4 ml-7">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-gray-600">
                    Get notified about post scheduling, failures, and team activity
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => updatePreference("emailNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing-emails">Marketing Emails</Label>
                  <p className="text-sm text-gray-600">Receive updates about new features, tips, and best practices</p>
                </div>
                <Switch
                  id="marketing-emails"
                  checked={preferences.marketingEmails}
                  onCheckedChange={(checked) => updatePreference("marketingEmails", checked)}
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="h-5 w-5 text-gray-600" />
              <h3 className="font-medium text-gray-900">Timezone</h3>
            </div>
            <div className="ml-7">
              <Label htmlFor="timezone">Your Timezone</Label>
              <Select value={preferences.timezone} onValueChange={(value) => updatePreference("timezone", value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select your timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                This helps us schedule your posts at the right time and show accurate analytics.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tip</h4>
          <p className="text-sm text-blue-800">
            Enable email notifications to stay on top of your social media game. We'll only send you important updates
            and you can customize these settings anytime.
          </p>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button onClick={onNext}>
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
