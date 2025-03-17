"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import apiClient from "@/lib/api-client"
import { formatDate } from "@/lib/utils"

interface Author {
  id: string
  name: string
  avatar?: string
}

interface Category {
  id: string
  name: string
}

interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  cover_image?: string
  published_at: string
  category: Category
  author: Author
}

export default function FeaturedPosts() {
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        const response = await apiClient.get("/blogs/featured")
        setFeaturedPosts(response.data)
      } catch (error) {
        console.error("Failed to fetch featured posts:", error)
        // Fallback to mock data if API fails
        setFeaturedPosts([
          {
            id: "1",
            slug: "getting-started-with-ai",
            title: "Getting Started with AI in 2023",
            excerpt: "Learn the basics of artificial intelligence and how to get started with AI projects.",
            cover_image: "/placeholder.svg?height=600&width=800",
            published_at: new Date().toISOString(),
            category: { id: "1", name: "Technology" },
            author: { id: "1", name: "John Doe", avatar: "/placeholder.svg" },
          },
          {
            id: "2",
            slug: "web-development-trends",
            title: "Web Development Trends in 2023",
            excerpt: "Discover the latest trends and technologies in web development this year.",
            cover_image: "/placeholder.svg?height=600&width=800",
            published_at: new Date().toISOString(),
            category: { id: "2", name: "Technology" },
            author: { id: "2", name: "Jane Smith", avatar: "/placeholder.svg" },
          },
          {
            id: "3",
            slug: "remote-work-productivity",
            title: "Boosting Productivity While Working Remotely",
            excerpt: "Tips and strategies to stay productive when working from home.",
            cover_image: "/placeholder.svg?height=600&width=800",
            published_at: new Date().toISOString(),
            category: { id: "3", name: "Business" },
            author: { id: "3", name: "Mike Johnson", avatar: "/placeholder.svg" },
          },
        ])
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="my-12">
      <h2 className="text-2xl font-bold mb-6">Featured Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <div className="relative h-48">
              <Image
                src={post.cover_image || "/placeholder.svg?height=600&width=800"}
                alt={post.title}
                fill
                className="object-cover"
              />
              <Badge className="absolute top-2 right-2">{post.category.name}</Badge>
            </div>
            <CardContent className="p-4">
              <Link href={`/blog/${post.slug}`}>
                <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">{post.title}</h3>
              </Link>
              <p className="text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src={post.author.avatar || "/placeholder.svg?height=100&width=100"}
                      alt={post.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-sm">{post.author.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{formatDate(post.published_at)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

