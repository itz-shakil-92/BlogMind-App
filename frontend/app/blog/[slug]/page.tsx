"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import RecommendedPosts from "@/components/home/recommended-posts"
import CommentsSection from "@/components/blog/comments-section"
import PostActions from "@/components/blog/post-actions"
import { Calendar, Clock, ArrowLeft } from "lucide-react"
import { formatDate, getInitials } from "@/lib/utils"
import { api } from "@/lib/api-client"

export default function BlogPost() {
  const params = useParams()
  const slug = params.slug as string
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [readProgress, setReadProgress] = useState(0)
  const progressRecorded = useRef<Set<number>>(new Set())

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setLoading(true)
        const data = await api.getBlogBySlug(slug)
        setPost(data)

        // Record view
        try {
          await api.recordBlogView(data.id)
        } catch (viewError) {
          console.error("Failed to record view:", viewError)
        }
      } catch (error) {
        console.error("Failed to fetch blog post:", error)
        setError("Failed to load blog post")
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPost()
  }, [slug])

  useEffect(() => {
    if (!post) return

    const handleScroll = () => {
      if (!contentRef.current) return

      const contentElement = contentRef.current
      const contentHeight = contentElement.scrollHeight
      const contentTop = contentElement.getBoundingClientRect().top
      const contentBottom = contentElement.getBoundingClientRect().bottom
      const windowHeight = window.innerHeight

      // Calculate how much of the content is visible
      let visibleHeight = 0
      if (contentTop < 0) {
        visibleHeight = Math.min(contentBottom, windowHeight) - 0
      } else {
        visibleHeight = Math.min(contentBottom, windowHeight) - contentTop
      }

      // Calculate progress as percentage
      const progress = Math.min(Math.round((visibleHeight / contentHeight) * 100), 100)
      setReadProgress(progress)

      // Record progress at 25%, 50%, 75%, and 100%
      const progressPoints = [25, 50, 75, 100]
      for (const point of progressPoints) {
        if (progress >= point && !progressRecorded.current.has(point)) {
          progressRecorded.current.add(point)
          try {
            api.recordReadProgress(post.id, point)
          } catch (error) {
            console.error(`Failed to record ${point}% progress:`, error)
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [post])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-40 mb-6" />
          <Skeleton className="h-16 w-full mb-4" />
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="h-[400px] w-full mb-8 rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    notFound()
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://blogmind.com"}/blog/${post.slug}`

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center text-primary mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to all posts
      </Link>

      <article className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{post.title}</h1>

        <div className="flex items-center gap-4 mb-6">
          <Avatar>
            <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
            <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{post.author.name}</p>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3" />
              <span>{formatDate(post.published_at)}</span>
              <span className="mx-2">•</span>
              <Clock className="mr-1 h-3 w-3" />
              <span>{post.read_time} min read</span>
            </div>
          </div>
          <div className="ml-auto">
            <PostActions
              postId={post.id}
              slug={post.slug}
              initialLikes={post.likes_count || 0}
              initialIsLiked={post.is_liked || false}
              shareUrl={shareUrl}
            />
          </div>
        </div>

        <div className="relative w-full h-[400px] mb-8 rounded-lg overflow-hidden">
          <Image
            src={post.cover_image || "/placeholder.svg?height=800&width=1200"}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div
          ref={contentRef}
          className="blog-content prose prose-lg max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-8">
          <div className="flex flex-wrap gap-2">
            {post.tags &&
              post.tags.map((tag: { id: string; name: string; slug: string }) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm hover:bg-secondary/80"
                >
                  #{tag.name}
                </Link>
              ))}
          </div>
        </div>
      </article>

      <Separator className="my-12" />

      <div className="max-w-4xl mx-auto space-y-12">
        <CommentsSection blogId={post.id} blogSlug={post.slug} />

        <div>
          <h2 className="text-2xl font-bold mb-6">You might also like</h2>
          <RecommendedPosts />
        </div>
      </div>
    </div>
  )
}

