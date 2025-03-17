"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface AnalyticsData {
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
  traffic: Array<{ source: string; visits: number }>
  readTime: {
    average: number
    completion: number
  }
}

interface BlogAnalyticsProps {
  data: AnalyticsData
}

export default function BlogAnalytics({ data }: BlogAnalyticsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Views</CardTitle>
            <CardDescription>All-time page views</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.views.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Likes</CardTitle>
            <CardDescription>All-time likes received</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.likes.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Comments</CardTitle>
            <CardDescription>All-time comments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.comments.total}</p>
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
            <div className="h-[300px] mt-4">
              <TabsContent value="views">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.views.timeline}>
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
                  <LineChart data={data.likes.timeline}>
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
                  <LineChart data={data.comments.timeline}>
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
                <BarChart data={data.traffic}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="source" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visits" fill="#3b82f6" />
                </BarChart>
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
              <p className="text-sm font-medium">Average Read Time</p>
              <p className="text-2xl font-bold">{data.readTime.average} minutes</p>
            </div>
            <div>
              <p className="text-sm font-medium">Completion Rate</p>
              <p className="text-2xl font-bold">{data.readTime.completion}%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

