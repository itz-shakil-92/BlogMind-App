"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { api } from "@/lib/api-client"

interface UserAnalytics {
  views: {
    total: number
    timeline: Array<{ date: string; views: number }>
  }
  likes: {
    total: number
    timeline: Array<{ date: string; likes: number }>
  }
  comments: {
    total: number
    timeline: Array<{ date: string; comments: number }>
  }
  posts: {
    total: number
    timeline: Array<{ date: string; posts: number }>
  }
  topPosts: Array<{
    id: string
    title: string
    slug: string
    views: number
  }>
  engagement: {
    rate: number
    timeline: Array<{ date: string; rate: number }>
  }
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const data = await api.getUserAnalytics()
        setAnalytics(data)
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
        setError("Failed to load analytics data. Please try again later.")

        // Mock data for development
        setAnalytics({
          views: {
            total: 5432,
            timeline: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              views: Math.floor(Math.random() * 200) + 50,
            })).reverse(),
          },
          likes: {
            total: 876,
            timeline: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              likes: Math.floor(Math.random() * 40) + 10,
            })).reverse(),
          },
          comments: {
            total: 324,
            timeline: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              comments: Math.floor(Math.random() * 15) + 5,
            })).reverse(),
          },
          posts: {
            total: 42,
            timeline: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              posts: i % 7 === 0 ? 1 : 0,
            })).reverse(),
          },
          topPosts: [
            { id: "1", title: "How to Build a Blog with Next.js", slug: "how-to-build-blog-nextjs", views: 1245 },
            {
              id: "2",
              title: "Understanding TypeScript Generics",
              slug: "understanding-typescript-generics",
              views: 987,
            },
            { id: "3", title: "React Server Components Explained", slug: "react-server-components", views: 765 },
            { id: "4", title: "The Future of Web Development", slug: "future-web-development", views: 654 },
            { id: "5", title: "CSS Grid vs Flexbox", slug: "css-grid-vs-flexbox", views: 543 },
          ],
          engagement: {
            rate: 68,
            timeline: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              rate: Math.floor(Math.random() * 30) + 50,
            })).reverse(),
          },
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error || "Failed to load analytics data."}
          <Button className="ml-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.views.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All-time page views</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.likes.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All-time likes received</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.comments.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All-time comments received</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.engagement.rate}%</div>
            <p className="text-xs text-muted-foreground">Average reader engagement</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
          <CardDescription>Views, likes, and comments trends</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="views">
            <TabsList>
              <TabsTrigger value="views">Views</TabsTrigger>
              <TabsTrigger value="likes">Likes</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
            </TabsList>
            <div className="h-[400px] mt-4">
              <TabsContent value="views">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.views.timeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="views" stroke="#3b82f6" />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="likes">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.likes.timeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="likes" stroke="#3b82f6" />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="comments">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.comments.timeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="comments" stroke="#3b82f6" />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="engagement">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.engagement.timeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="rate" stroke="#3b82f6" />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Posts</CardTitle>
            <CardDescription>Your most viewed blog posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topPosts.map((post, index) => (
                <div key={post.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-3">
                      {index + 1}
                    </div>
                    <a href={`/blog/${post.slug}`} className="hover:underline">
                      {post.title}
                    </a>
                  </div>
                  <div className="text-muted-foreground">{post.views.toLocaleString()} views</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publishing Activity</CardTitle>
            <CardDescription>Your blog posting frequency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.posts.timeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="posts" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

