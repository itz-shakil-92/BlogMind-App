"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import apiClient from "@/lib/api-client"
import { formatDate } from "@/lib/utils"

interface Post {
  id: string
  slug: string
  title: string
  cover_image?: string
  published_at: string
  read_time: number
}

export default function RecommendedPosts() {
  const [recommendedPosts, setRecommendedPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendedPosts = async () => {
      try {
        const response = await apiClient.get("/blogs/recommended")
        setRecommendedPosts(response.data)
      } catch (error) {
        console.error("Failed to fetch recommended posts:", error)
        // Fallback to mock data if API fails
        setRecommendedPosts([
          {
            id: "4",
            slug: "machine-learning-basics",
            title: "Machine Learning: The Basics",
            cover_image: "/placeholder.svg?height=200&width=200",
            published_at: new Date().toISOString(),
            read_time: 8,
          },
          {
            id: "5",
            slug: "python-for-beginners",
            title: "Python Programming for Beginners",
            cover_image: "/placeholder.svg?height=200&width=200",
            published_at: new Date().toISOString(),
            read_time: 6,
          },
          {
            id: "6",
            slug: "data-science-career",
            title: "Starting a Career in Data Science",
            cover_image: "/placeholder.svg?height=200&width=200",
            published_at: new Date().toISOString(),
            read_time: 7,
          },
          {
            id: "7",
            slug: "cloud-computing-intro",
            title: "Introduction to Cloud Computing",
            cover_image: "/placeholder.svg?height=200&width=200",
            published_at: new Date().toISOString(),
            read_time: 5,
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendedPosts()
  }, [])

  if (loading) {
    return (
      <div className="bg-secondary/50 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Recommended For You</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="flex gap-3">
                <Skeleton className="w-20 h-20 rounded-md flex-shrink-0" />
                <div className="py-1 flex-1">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-secondary/50 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Recommended For You</h2>
      <div className="space-y-4">
        {recommendedPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <div className="flex gap-3">
              <div className="relative w-20 h-20 flex-shrink-0">
                <Image
                  src={post.cover_image || "/placeholder.svg?height=200&width=200"}
                  alt={post.title}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <CardContent className="p-0 py-1 flex-1">
                <Link href={`/blog/${post.slug}`}>
                  <h3 className="font-medium line-clamp-2 hover:text-primary transition-colors">{post.title}</h3>
                </Link>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDate(post.published_at)} • {post.read_time} min read
                </p>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

