import { SignIn } from "@clerk/nextjs"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Welcome Section */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
            <p className="mt-3 text-base text-gray-600 leading-relaxed">
              Sign in to your GenPost account to continue managing your social media
            </p>
          </div>

          {/* Clerk Sign In Component */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-none bg-transparent p-0",
                  headerTitle: "text-2xl font-semibold text-gray-900 mb-2",
                  headerSubtitle: "text-sm text-gray-600 mb-6",
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
              redirectUrl="/dashboard"
              signUpUrl="/sign-up"
            />
          </div>

          {/* Footer Links */}
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/sign-up" className="font-medium text-black hover:text-gray-700">
                Sign up for free
              </Link>
            </p>
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
              <Link href="/privacy" className="hover:text-gray-700">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-gray-700">
                Terms of Service
              </Link>
              <Link href="/help" className="hover:text-gray-700">
                Help
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
