"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api-client"
import { formatDate } from "@/lib/utils"
import { PenSquare, BarChart2 } from "lucide-react"
import AnalyticsDashboard from "./analytics-dashboard"

interface Post {
  id: string
  slug: string
  title: string
  published_at: string
  read_time: number
}

interface Comment {
  id: string
  content: string
  created_at: string
  blog: {
    id: string
    slug: string
    title: string
  }
}

interface DashboardStats {
  posts: {
    count: number
    items: Post[]
  }
  likedPosts: {
    count: number
    items: Post[]
  }
  comments: {
    count: number
    items: Comment[]
  }
}

export default function DashboardContent() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("posts")
  const [stats, setStats] = useState<DashboardStats>({
    posts: { count: 0, items: [] },
    likedPosts: { count: 0, items: [] },
    comments: { count: 0, items: [] },
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const [postsRes, likesRes, commentsRes] = await Promise.all([
          api.getUserBlogs(),
          api.getLikedBlogs(),
          api.getUserComments(),
        ])

        setStats({
          posts: {
            count: postsRes.length,
            items: postsRes,
          },
          likedPosts: {
            count: likesRes.length,
            items: likesRes,
          },
          comments: {
            count: commentsRes.length,
            items: commentsRes,
          },
        })
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        setError("Failed to load dashboard data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        <Skeleton className="h-12 w-full mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/blog/new">
              <PenSquare className="h-4 w-4 mr-2" />
              New Post
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Posts</CardTitle>
            <CardDescription>{stats.posts.count} published posts</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Liked Posts</CardTitle>
            <CardDescription>{stats.likedPosts.count} posts liked</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Comments</CardTitle>
            <CardDescription>{stats.comments.count} comments made</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="posts">Your Posts</TabsTrigger>
          <TabsTrigger value="liked">Liked Posts</TabsTrigger>
          <TabsTrigger value="comments">Your Comments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4 mt-6">
          {stats.posts.items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">You haven't published any posts yet.</p>
              <Button asChild>
                <Link href="/blog/new">Create Your First Post</Link>
              </Button>
            </div>
          ) : (
            stats.posts.items.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link href={`/blog/${post.slug}`}>
                        <h3 className="text-lg font-semibold hover:text-primary">{post.title}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(post.published_at)} • {post.read_time} min read
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/blog/${post.slug}/edit`}>Edit</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/blog/${post.slug}/analytics`}>
                          <BarChart2 className="h-4 w-4 mr-2" />
                          Analytics
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="liked" className="space-y-4 mt-6">
          {stats.likedPosts.items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">You haven't liked any posts yet.</p>
            </div>
          ) : (
            stats.likedPosts.items.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="text-lg font-semibold hover:text-primary">{post.title}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDate(post.published_at)} • {post.read_time} min read
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="comments" className="space-y-4 mt-6">
          {stats.comments.items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">You haven't made any comments yet.</p>
            </div>
          ) : (
            stats.comments.items.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="p-4">
                  <p className="text-muted-foreground">{comment.content}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    On:{" "}
                    <Link href={`/blog/${comment.blog.slug}`} className="hover:text-primary">
                      {comment.blog.title}
                    </Link>{" "}
                    • {formatDate(comment.created_at)}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}

