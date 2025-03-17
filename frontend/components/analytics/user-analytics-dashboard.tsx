"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { analyticsApi } from "@/lib/api-client"
import { formatDate } from "@/lib/utils"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function UserAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState(30) // Default to 30 days

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const data = await analyticsApi.getUserAnalytics(timeframe)
        setAnalytics(data)
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeframe])

  const handleTimeframeChange = (days: number) => {
    setTimeframe(days)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">View insights about your blog performance</p>
          </div>
          <Skeleton className="h-10 w-48" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        <Skeleton className="h-[400px] w-full" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No analytics data available</h2>
        <p className="text-muted-foreground mb-6">
          Start creating and publishing blog posts to see your analytics data.
        </p>
        <Button asChild>
          <Link href="/blog/new">Create Your First Blog</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">View insights about your blog performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant={timeframe === 7 ? "default" : "outline"} onClick={() => handleTimeframeChange(7)}>
            7 Days
          </Button>
          <Button variant={timeframe === 30 ? "default" : "outline"} onClick={() => handleTimeframeChange(30)}>
            30 Days
          </Button>
          <Button variant={timeframe === 90 ? "default" : "outline"} onClick={() => handleTimeframeChange(90)}>
            90 Days
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.total_posts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.total_views}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.total_likes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.total_comments}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Engagement Over Time</CardTitle>
          <CardDescription>Views, likes, and comments trends</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="views">
            <TabsList>
              <TabsTrigger value="views">Views</TabsTrigger>
              <TabsTrigger value="likes">Likes</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>
            <div className="h-[400px] mt-4">
              <TabsContent value="views">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.views_timeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="likes">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.likes_timeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="comments">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.comments_timeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" />
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
              {analytics.top_posts.map((post: any) => (
                <div key={post.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <Link href={`/blog/${post.slug}`} className="font-medium hover:text-primary transition-colors">
                    {post.title}
                  </Link>
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>{formatDate(post.published_at)}</span>
                    <span>{post.views} views</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Posts by Engagement</CardTitle>
            <CardDescription>Likes and comments per post</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.top_posts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" tick={false} />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(index) => analytics.top_posts[index]?.title || ""}
                    formatter={(value, name) => [value, name === "likes" ? "Likes" : "Comments"]}
                  />
                  <Bar dataKey="likes" fill="#3b82f6" name="Likes" />
                  <Bar dataKey="comments" fill="#10b981" name="Comments" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

