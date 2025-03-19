import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import BlogAnalytics from "@/components/analytics/blog-analytics"
import { cookies } from "next/headers"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Blog Analytics | BlogMind",
  description: "View analytics for your blog post",
}

export default async function BlogAnalyticsPage({ params }: { params: { slug: string } }) {
  // Check if user is authenticated on the server
  const cookieStore = cookies()
  const token = cookieStore.get("token")

  if (!token) {
    redirect(`/login?redirect=/blog/${params.slug}/analytics`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href={`/blog/${params.slug}`}>
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to post
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Blog Analytics</h1>
            <p className="text-muted-foreground">Analytics & Insights for your blog post</p>
          </div>
        </div>

        <BlogAnalytics slug={params.slug} />
      </div>
    </div>
  )
}

