"use client"

import { useEffect, useState } from "react"
import { useParams, notFound, useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import BlogForm from "@/components/blog/blog-form"
import { blogApi } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"

export default function EditBlogPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()
  const [blog, setBlog] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const slug = params.slug as string

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setIsLoading(true)
        const data = await blogApi.getBlogBySlug(slug)
        setBlog(data)

        // Check if user is the author
        if (user && data.author.id !== user.id) {
          router.push(`/blog/${slug}`)
        }
      } catch (error) {
        console.error("Failed to fetch blog:", error)
        notFound()
      } finally {
        setIsLoading(false)
      }
    }

    // Only fetch if user is authenticated
    if (!loading) {
      if (!isAuthenticated) {
        router.push(`/login?redirect=/blog/${slug}/edit`)
      } else {
        fetchBlog()
      }
    }
  }, [slug, user, isAuthenticated, loading, router])

  if (loading || isLoading) {
    return (
      <div className="container max-w-screen-lg py-12">
        <Skeleton className="h-12 w-48 mb-6" />
        <Skeleton className="h-[600px] w-full rounded-md" />
      </div>
    )
  }

  if (!blog) {
    return notFound()
  }

  return (
    <div className="container max-w-screen-lg py-12">
      <BlogForm blog={blog} />
    </div>
  )
}

