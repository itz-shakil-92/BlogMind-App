"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { blogApi, commentApi } from "@/lib/api-client"
import { formatDate } from "@/lib/utils"
import { PenSquare, Trash2, BarChart2 } from "lucide-react"

export default function DashboardContent() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("my-blogs")
  const [blogs, setBlogs] = useState<any[]>([])
  const [likedBlogs, setLikedBlogs] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        if (activeTab === "my-blogs") {
          const data = await blogApi.getUserBlogs()
          setBlogs(data)
        } else if (activeTab === "liked-blogs") {
          const data = await blogApi.getLikedBlogs()
          setLikedBlogs(data)
        } else if (activeTab === "my-comments") {
          const data = await commentApi.getUserComments()
          setComments(data)
        }
      } catch (error) {
        console.error(`Failed to fetch ${activeTab}:`, error)
        toast({
          title: "Error",
          description: `Failed to load ${activeTab.replace("-", " ")}. Please try again.`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activeTab, toast])

  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return

    try {
      await blogApi.deleteBlog(blogId)
      setBlogs(blogs.filter((blog) => blog.id !== blogId))
      toast({
        title: "Blog deleted",
        description: "Your blog post has been deleted successfully.",
      })
    } catch (error) {
      console.error("Failed to delete blog:", error)
      toast({
        title: "Error",
        description: "Failed to delete blog post. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Manage your blog posts, comments, and more</p>
        </div>
        <Button asChild>
          <Link href="/blog/new">
            <PenSquare className="h-4 w-4 mr-2" />
            Write New Blog
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="my-blogs" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-blogs">My Blogs</TabsTrigger>
          <TabsTrigger value="liked-blogs">Liked Blogs</TabsTrigger>
          <TabsTrigger value="my-comments">My Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="my-blogs" className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <Skeleton className="h-24 w-24 rounded-md flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-24" />
                          <div className="flex gap-2">
                            <Skeleton className="h-9 w-9 rounded-md" />
                            <Skeleton className="h-9 w-9 rounded-md" />
                            <Skeleton className="h-9 w-9 rounded-md" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">You haven't written any blog posts yet.</p>
                <Button asChild>
                  <Link href="/blog/new">Write Your First Blog</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {blogs.map((blog) => (
                <Card key={blog.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={blog.cover_image || "/placeholder.svg?height=100&width=100"}
                          alt={blog.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">{blog.title}</h3>
                        <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{blog.excerpt}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="text-sm text-muted-foreground">
                            {formatDate(blog.published_at || blog.created_at)}
                            <span className="mx-2">•</span>
                            <span>
                              {blog.views_count} view{blog.views_count !== 1 && "s"}
                            </span>
                            <span className="mx-2">•</span>
                            <span>
                              {blog.likes_count} like{blog.likes_count !== 1 && "s"}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/blog/${blog.slug}`}>View</Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/blog/${blog.slug}/edit`}>Edit</Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/blog/${blog.slug}/analytics`}>
                                <BarChart2 className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteBlog(blog.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="liked-blogs" className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <Skeleton className="h-24 w-24 rounded-md flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-9 w-20 rounded-md" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : likedBlogs.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">You haven't liked any blog posts yet.</p>
                <Button asChild>
                  <Link href="/">Explore Blogs</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {likedBlogs.map((blog) => (
                <Card key={blog.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={blog.cover_image || "/placeholder.svg?height=100&width=100"}
                          alt={blog.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">{blog.title}</h3>
                        <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{blog.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            By {blog.author.name} • {formatDate(blog.published_at || blog.created_at)}
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/blog/${blog.slug}`}>Read</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-comments" className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-9 w-20 rounded-md" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">You haven't commented on any blog posts yet.</p>
                <Button asChild>
                  <Link href="/">Explore Blogs</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">
                        <Link href={`/blog/${comment.blog.slug}`} className="hover:text-primary transition-colors">
                          {comment.blog.title}
                        </Link>
                      </h3>
                      <p className="text-muted-foreground">{comment.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">{formatDate(comment.created_at)}</div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/blog/${comment.blog.slug}`}>View Post</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

