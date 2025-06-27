import Link from "next/link"
import { ArrowLeft, Mail, MessageCircle, Book, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
            <Link href="/" className="text-xl font-semibold text-gray-900">
              GenPost
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help & Support</h1>
          <p className="text-xl text-gray-600">Get the help you need to make the most of GenPost</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Book className="h-5 w-5 text-blue-600" />
                <span>Getting Started</span>
              </CardTitle>
              <CardDescription>Learn the basics of using GenPost</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900">Quick Start Guide</h4>
                <p className="text-sm text-gray-600">Connect your social accounts and create your first post</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Account Setup</h4>
                <p className="text-sm text-gray-600">Set up your profile and team settings</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Social Media Integration</h4>
                <p className="text-sm text-gray-600">Connect Instagram, Twitter, and Facebook accounts</p>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-green-600" />
                <span>Features</span>
              </CardTitle>
              <CardDescription>Explore GenPost's powerful features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900">Post Scheduling</h4>
                <p className="text-sm text-gray-600">Schedule posts across multiple platforms</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Content Calendar</h4>
                <p className="text-sm text-gray-600">Organize your content with our visual calendar</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Team Collaboration</h4>
                <p className="text-sm text-gray-600">Work together with your team members</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Support */}
        <Card>
          <CardHeader>
            <CardTitle>Need More Help?</CardTitle>
            <CardDescription>Can't find what you're looking for? Get in touch with our support team.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>Email Support</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <MessageCircle className="h-4 w-4" />
                <span>Live Chat</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <Phone className="h-4 w-4" />
                <span>Schedule Call</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">How do I connect my social media accounts?</h3>
              <p className="text-gray-600">
                Go to Settings → Social Accounts and click the "Connect" button for each platform you want to use.
                You'll be redirected to authenticate with each platform.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Can I schedule posts for multiple platforms at once?
              </h3>
              <p className="text-gray-600">
                Yes! When creating a post, you can select multiple platforms and GenPost will optimize the content for
                each platform's requirements.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">How many team members can I invite?</h3>
              <p className="text-gray-600">
                The number of team members depends on your plan. Check your account settings for current limits and
                upgrade options.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
