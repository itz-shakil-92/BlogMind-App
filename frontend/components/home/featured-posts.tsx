"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  category: {
    id: string
    name: string
  }
  author: {
    id: string
    name: string
    avatar?: string
  }
}

export default function FeaturedPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        setLoading(true)
        // Get the most recent posts
        const data = await blogApi.getBlogs({ limit: 3, sort: "desc" })
        setPosts(data)
      } catch (error) {
        console.error("Failed to fetch featured posts:", error)
        // Fallback data
        setPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedPosts()
  }, [])

  if (loading) {
    return (
      <div className="my-12">
        <h2 className="text-2xl font-bold mb-6">Featured Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return null
  }

  return (
    <div className="my-12">
      <h2 className="text-2xl font-bold mb-6">Featured Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <Link href={`/blog/${post.slug}`}>
              <div className="relative h-48 w-full">
                <Image
                  src={post.cover_image || "/placeholder.svg?height=400&width=600"}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
                <Badge className="absolute top-2 left-2">{post.category.name}</Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors">{post.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{post.author.name}</span>
                  <span>{formatDate(post.published_at)}</span>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}

