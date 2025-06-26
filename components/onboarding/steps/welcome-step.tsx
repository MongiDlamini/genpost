"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Calendar, BarChart3, Users } from "lucide-react"

interface WelcomeStepProps {
  onNext: () => void
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const features = [
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Schedule posts across all your social platforms with AI-powered timing recommendations",
    },
    {
      icon: Sparkles,
      title: "AI Content Assistant",
      description: "Get content suggestions, hashtag recommendations, and performance insights",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track your performance with detailed analytics and actionable insights",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together with your team on content creation and scheduling",
    },
  ]

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
          <Sparkles className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Welcome to GenPost! 🎉</CardTitle>
        <p className="text-gray-600 mt-2">
          Let's get you set up to manage your social media like a pro. This will only take a few minutes.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-white rounded-lg">
                  <feature.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">What we'll set up:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Connect your social media accounts</li>
            <li>• Set up your team or personal workspace</li>
            <li>• Configure your preferences and timezone</li>
            <li>• Get you ready to create your first post</li>
          </ul>
        </div>

        <div className="flex justify-end">
          <Button onClick={onNext} size="lg">
            Let's Get Started
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
