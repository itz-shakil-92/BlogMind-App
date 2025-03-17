import type { Metadata } from "next"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import BlogAnalytics from "@/components/analytics/blog-analytics"
import { getServerSession } from "next-auth"
import apiClient from "@/lib/api-client"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Blog Analytics | BlogMind",
  description: "View analytics for your blog post",
}

async function getBlogPost(slug: string) {
  try {
    const response = await apiClient.get(`/blogs/${slug}`)
    return response.data
  } catch (error) {
    console.error("Failed to fetch blog post:", error)
    return null
  }
}

async function getBlogAnalytics(slug: string) {
  try {
    const response = await apiClient.get(`/blogs/${slug}/analytics`)
    return response.data
  } catch (error) {
    console.error("Failed to fetch blog analytics:", error)

    // Mock data for demo
    return {
      views: {
        total: 1234,
        timeline: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          views: Math.floor(Math.random() * 100) + 50,
        })).reverse(),
      },
      likes: {
        total: 89,
        timeline: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          likes: Math.floor(Math.random() * 20) + 5,
        })).reverse(),
      },
      comments: {
        total: 42,
        timeline: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          comments: Math.floor(Math.random() * 10) + 2,
        })).reverse(),
      },
      traffic: [
        { source: "Direct", visits: 523 },
        { source: "Social", visits: 429 },
        { source: "Search", visits: 185 },
        { source: "Referral", visits: 97 },
      ],
      readTime: {
        average: 4.2,
        completion: 68,
      },
    }
  }
}

export default async function BlogAnalyticsPage({ params }: { params: { slug: string } }) {
  // Check if user is authenticated on the server
  const session = await getServerSession()

  if (!session) {
    redirect(`/login?redirect=/blog/${params.slug}/analytics`)
  }

  const post = await getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  const analytics = await getBlogAnalytics(params.slug)

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
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <p className="text-muted-foreground">Analytics & Insights</p>
          </div>
        </div>

        <BlogAnalytics data={analytics} />
      </div>
    </div>
  )
}

