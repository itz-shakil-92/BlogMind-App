"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { blogApi } from "@/lib/api-client"
import { formatDate } from "@/lib/utils"

interface Author {
  id: string
  name: string
  avatar?: string
}

interface Category {
  id: string
  name: string
  slug: string
}

interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  cover_image?: string
  published_at: string
  read_time: number
  category: Category
  author: Author
}

interface BlogListProps {
  initialPosts?: Post[]
  category?: string
  tag?: string
  searchQuery?: string
}

export default function BlogList({ initialPosts, category, tag, searchQuery }: BlogListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts || [])
  const [loading, setLoading] = useState(!initialPosts)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (!initialPosts) {
      const fetchPosts = async () => {
        try {
          setLoading(true)
          const params: Record<string, string | number> = {
            page: 1,
            limit: 10,
          }

          if (category) params.category = category
          if (tag) params.tag = tag
          if (searchQuery) params.search = searchQuery

          const data = await blogApi.getBlogs(params)
          setPosts(Array.isArray(data) ? data : [])
          setHasMore(data.length >= 10)
        } catch (error) {
          console.error("Failed to fetch posts:", error)
          // Fallback to mock data if API fails
          const mockPosts = [
            {
              id: "1",
              slug: "getting-started-with-ai",
              title: "Getting Started with AI in 2023",
              excerpt: "Learn the basics of artificial intelligence and how to get started with AI projects.",
              cover_image: "/placeholder.svg?height=600&width=800",
              published_at: new Date().toISOString(),
              read_time: 5,
              category: { id: "1", name: "Technology", slug: "technology" },
              author: { id: "1", name: "John Doe", avatar: "/placeholder.svg" },
            },
            {
              id: "2",
              slug: "web-development-trends",
              title: "Web Development Trends in 2023",
              excerpt: "Discover the latest trends and technologies in web development this year.",
              cover_image: "/placeholder.svg?height=600&width=800",
              published_at: new Date().toISOString(),
              read_time: 7,
              category: { id: "2", name: "Technology", slug: "technology" },
              author: { id: "2", name: "Jane Smith", avatar: "/placeholder.svg" },
            },
            {
              id: "3",
              slug: "remote-work-productivity",
              title: "Boosting Productivity While Working Remotely",
              excerpt: "Tips and strategies to stay productive when working from home.",
              cover_image: "/placeholder.svg?height=600&width=800",
              published_at: new Date().toISOString(),
              read_time: 6,
              category: { id: "3", name: "Business", slug: "business" },
              author: { id: "3", name: "Mike Johnson", avatar: "/placeholder.svg" },
            },
          ]
          setPosts(mockPosts)
          setHasMore(false)
        } finally {
          setLoading(false)
        }
      }

      fetchPosts()
    } else {
      setPosts(initialPosts)
      setHasMore(false)
    }
  }, [initialPosts, category, tag, searchQuery])

  const loadMore = async () => {
    if (!hasMore || initialPosts) return

    try {
      const nextPage = page + 1
      const params: Record<string, string | number> = {
        page: nextPage,
        limit: 10,
      }

      if (category) params.category = category
      if (tag) params.tag = tag
      if (searchQuery) params.search = searchQuery

      const data = await blogApi.getBlogs(params)

      if (Array.isArray(data) && data.length > 0) {
        setPosts((prev) => [...prev, ...data])
        setPage(nextPage)
        setHasMore(data.length >= 10)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error("Failed to load more posts:", error)
      setHasMore(false)
    }
  }

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <Skeleton className="w-full md:w-1/3 h-48" />
                <CardContent className="flex-1 p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-32" />
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No posts found</h2>
        <p className="text-muted-foreground mb-6">
          {searchQuery
            ? `No results found for "${searchQuery}"`
            : category
              ? `No posts found in this category`
              : tag
                ? `No posts found with this tag`
                : "No posts available at the moment"}
        </p>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="relative w-full md:w-1/3 h-48">
                <Image
                  src={post.cover_image || "/placeholder.svg?height=600&width=800"}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
                <Badge className="absolute top-2 left-2">{post.category.name}</Badge>
              </div>
              <CardContent className="flex-1 p-4">
                <Link href={`/blog/${post.slug}`}>
                  <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">{post.title}</h3>
                </Link>
                <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center justify-between mt-auto">
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
                  <div className="text-sm text-muted-foreground">
                    <span>{formatDate(post.published_at)}</span>
                    <span className="mx-2">•</span>
                    <span>{post.read_time} min read</span>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button onClick={loadMore} variant="outline">
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}

