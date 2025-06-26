import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { PostCreator } from "@/components/post-creator/post-creator"

interface CreatePageProps {
  searchParams: {
    mode?: "quick" | "standard"
    date?: string
  }
}

export default async function CreatePage({ searchParams }: CreatePageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const mode = searchParams.mode || "standard"
  const selectedDate = searchParams.date ? new Date(searchParams.date) : undefined

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <PostCreator mode={mode} selectedDate={selectedDate} />
      </div>
    </div>
  )
}
