"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { analyticsApi } from "@/lib/api-client"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface BlogAnalyticsProps {
  slug: string
}

export default function BlogAnalytics({ slug }: BlogAnalyticsProps) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState(30) // Default to 30 days
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const data = await analyticsApi.getBlogAnalytics(slug, timeframe)
        setAnalytics(data)
      } catch (error) {
        console.error("Failed to fetch blog analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [slug, timeframe])

  const handleTimeframeChange = (days: number) => {
    setTimeframe(days)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <Skeleton className="h-10 w-48" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
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
        <p className="text-muted-foreground mb-6">This blog post doesn't have any analytics data yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Views</CardTitle>
            <CardDescription>All-time page views</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.views.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Likes</CardTitle>
            <CardDescription>All-time likes received</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.likes.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Comments</CardTitle>
            <CardDescription>All-time comments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.comments.total}</p>
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
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Where your readers come from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.sources}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="source"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {analytics.sources.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [`${value} visits`, props.payload.source]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reading Stats</CardTitle>
            <CardDescription>How readers engage with your content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Average Read Percentage</p>
              <p className="text-2xl font-bold">{analytics.read_time.average_percentage.toFixed(0)}%</p>
              <div className="w-full bg-secondary h-2 mt-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: `${analytics.read_time.average_percentage}%` }}
                ></div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Completion Rate</p>
              <p className="text-2xl font-bold">{analytics.read_time.completion_rate.toFixed(0)}%</p>
              <div className="w-full bg-secondary h-2 mt-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: `${analytics.read_time.completion_rate}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

