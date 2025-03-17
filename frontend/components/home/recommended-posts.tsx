"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { blogApi } from "@/lib/api-client"
import { formatDate } from "@/lib/utils"

interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  cover_image?: string
  published_at: string
  author: {
    name: string
  }
}

export default function RecommendedPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendedPosts = async () => {
      try {
        setLoading(true)
        // In a real app, this would use a recommendation algorithm
        // For now, just get some random posts
        const data = await blogApi.getBlogs({ limit: 4 })
        setPosts(data)
      } catch (error) {
        console.error("Failed to fetch recommended posts:", error)
        setPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendedPosts()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommended For You</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-16 w-16 rounded-md flex-shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (posts.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended For You</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="flex gap-3 group">
            <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={post.cover_image || "/placeholder.svg?height=100&width=100"}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h4>
              <p className="text-xs text-muted-foreground">{formatDate(post.published_at)}</p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}

