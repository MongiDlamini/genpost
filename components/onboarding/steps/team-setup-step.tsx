"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowRight, ArrowLeft, User, Building, Users } from "lucide-react"

interface TeamSetupStepProps {
  teamName?: string
  teamType: "personal" | "business" | "agency"
  onUpdate: (updates: { teamName?: string; teamType: "personal" | "business" | "agency" }) => void
  onNext: () => void
  onPrevious: () => void
}

export function TeamSetupStep({ teamName, teamType, onUpdate, onNext, onPrevious }: TeamSetupStepProps) {
  const [localTeamName, setLocalTeamName] = useState(teamName || "")

  const teamTypes = [
    {
      id: "personal" as const,
      title: "Personal",
      description: "Just for me - managing my own social media",
      icon: User,
      features: ["Personal dashboard", "Individual analytics", "Basic scheduling"],
    },
    {
      id: "business" as const,
      title: "Business",
      description: "Small business or brand with a team",
      icon: Building,
      features: ["Team collaboration", "Brand management", "Advanced analytics"],
    },
    {
      id: "agency" as const,
      title: "Agency",
      description: "Managing multiple clients and brands",
      icon: Users,
      features: ["Client management", "Multi-brand support", "White-label options"],
    },
  ]

  const handleContinue = () => {
    onUpdate({
      teamName: localTeamName.trim() || undefined,
      teamType,
    })
    onNext()
  }

  const selectedType = teamTypes.find((type) => type.id === teamType)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Up Your Workspace</CardTitle>
        <p className="text-gray-600">Tell us about how you'll be using GenPost so we can customize your experience.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-medium">What type of workspace is this?</Label>
          <RadioGroup value={teamType} onValueChange={(value) => onUpdate({ teamType: value as any })} className="mt-3">
            <div className="space-y-3">
              {teamTypes.map((type) => (
                <div key={type.id} className="flex items-start space-x-3">
                  <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
                  <div className="flex-1">
                    <label htmlFor={type.id} className="cursor-pointer">
                      <div className="flex items-center space-x-3 mb-2">
                        <type.icon className="h-5 w-5 text-gray-600" />
                        <div>
                          <h3 className="font-medium text-gray-900">{type.title}</h3>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                      </div>
                      <div className="ml-8">
                        <ul className="text-xs text-gray-500 space-y-1">
                          {type.features.map((feature, index) => (
                            <li key={index}>• {feature}</li>
                          ))}
                        </ul>
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {teamType !== "personal" && (
          <div>
            <Label htmlFor="team-name" className="text-base font-medium">
              {teamType === "business" ? "Business" : "Agency"} Name (Optional)
            </Label>
            <Input
              id="team-name"
              value={localTeamName}
              onChange={(e) => setLocalTeamName(e.target.value)}
              placeholder={`Enter your ${teamType} name`}
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-1">
              You can create teams and invite members later in your settings.
            </p>
          </div>
        )}

        {selectedType && (
          <div className="bg-gray-50 border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Perfect for {selectedType.title.toLowerCase()} use!</h4>
            <p className="text-sm text-gray-600">
              {teamType === "personal" &&
                "You'll have access to all the tools you need to manage your personal social media presence effectively."}
              {teamType === "business" &&
                "You'll be able to collaborate with your team, manage your brand consistently, and track performance across all platforms."}
              {teamType === "agency" &&
                "You'll have advanced features for managing multiple clients, white-label options, and comprehensive reporting tools."}
            </p>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button onClick={handleContinue}>
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
