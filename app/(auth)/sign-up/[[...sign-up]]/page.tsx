import { SignUp } from "@clerk/nextjs"
import Link from "next/link"
import { ArrowLeft, Check } from "lucide-react"

export default function SignUpPage() {
  const features = [
    "Schedule posts across Instagram, Twitter, and Facebook",
    "AI-powered content suggestions and optimization",
    "Visual calendar for content planning",
    "Team collaboration and sharing",
    "Analytics and performance insights",
  ]

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
      <main className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Features */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
                  Start managing your social media like a pro
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Join thousands of creators and businesses who trust GenPost to streamline their social media workflow.
                </p>
              </div>

              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <p className="text-gray-700 leading-relaxed">{feature}</p>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Free to start:</strong> No credit card required. Upgrade anytime as you grow.
                </p>
              </div>
            </div>

            {/* Right Side - Sign Up Form */}
            <div className="w-full max-w-md mx-auto">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Create your account</h2>
                  <p className="text-sm text-gray-600">Get started with GenPost in less than 2 minutes</p>
                </div>

                <SignUp
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "shadow-none border-none bg-transparent p-0",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton: "border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium",
                      socialButtonsBlockButtonText: "font-medium",
                      dividerLine: "bg-gray-200",
                      dividerText: "text-gray-500 text-sm",
                      formFieldLabel: "text-sm font-medium text-gray-700 mb-2",
                      formFieldInput:
                        "border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:border-transparent",
                      formButtonPrimary:
                        "bg-black hover:bg-gray-800 text-white font-medium py-2.5 rounded-md transition-colors",
                      footerActionLink: "text-black hover:text-gray-700 font-medium",
                      identityPreviewText: "text-sm text-gray-600",
                      identityPreviewEditButton: "text-black hover:text-gray-700",
                    },
                  }}
                  redirectUrl="/onboarding"
                  signInUrl="/sign-in"
                />
              </div>

              {/* Footer Links */}
              <div className="text-center mt-6 space-y-4">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/sign-in" className="font-medium text-black hover:text-gray-700">
                    Sign in
                  </Link>
                </p>
                <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                  <Link href="/privacy" className="hover:text-gray-700">
                    Privacy Policy
                  </Link>
                  <Link href="/terms" className="hover:text-gray-700">
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
