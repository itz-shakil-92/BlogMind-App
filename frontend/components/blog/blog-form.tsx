"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { blogApi, uploadApi } from "@/lib/api-client"
import { ArrowLeft, Upload } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
}

interface Tag {
  id: string
  name: string
  slug: string
}

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  slug: string
  category_id: string
  tags: Tag[]
  cover_image?: string
}

interface BlogFormProps {
  blog?: BlogPost
}

export default function BlogForm({ blog }: BlogFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    title: blog?.title || "",
    excerpt: blog?.excerpt || "",
    content: blog?.content || "",
    category_id: blog?.category_id || "",
    tags: blog?.tags ? blog.tags.map((tag) => tag.name).join(", ") : "",
    cover_image: blog?.cover_image || "",
  })

  // Fetch categories only once when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true)
        const categoriesData = await blogApi.getCategories()
        console.log("Fetched categories:", categoriesData)
        setCategories(categoriesData)

        // Set default category if none is selected and categories are available
        if (!formData.category_id && categoriesData.length > 0) {
          setFormData((prev) => ({ ...prev, category_id: categoriesData[0].id }))
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        // Fallback categories for development
        const fallbackCategories = [
          { id: "1", name: "Technology", slug: "technology" },
          { id: "2", name: "Lifestyle", slug: "lifestyle" },
          { id: "3", name: "Health", slug: "health" },
          { id: "4", name: "Business", slug: "business" },
          { id: "5", name: "Travel", slug: "travel" },
        ]
        setCategories(fallbackCategories)

        if (!formData.category_id) {
          setFormData((prev) => ({ ...prev, category_id: fallbackCategories[0].id }))
        }
      } finally {
        setCategoriesLoading(false)
      }
    }

    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    console.log("Selected category:", value)
    setFormData((prev) => ({ ...prev, category_id: value }))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)

      // Upload the blog image
      const result = await uploadApi.uploadBlogImage(file)

      // Update the form data with the new image URL
      setFormData((prev) => ({ ...prev, cover_image: result.image_url }))

      toast({
        title: "Image uploaded",
        description: "Your cover image has been uploaded successfully.",
      })
    } catch (error) {
      console.error("Failed to upload image:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const validateImageUrl = (url: string) => {
    if (!url) return true // Empty URL is valid (no image)

    try {
      new URL(url)
      return true
    } catch (e) {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate required fields
    if (!formData.title || !formData.excerpt || !formData.content || !formData.category_id) {
      setError("Title, excerpt, content, and category are required")
      setIsLoading(false)
      return
    }

    // Validate image URL if provided
    if (formData.cover_image && !validateImageUrl(formData.cover_image)) {
      setError("Please enter a valid image URL")
      setIsLoading(false)
      return
    }

    try {
      console.log("Submitting form data:", formData)

      const tagArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)

      const payload = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category_id: formData.category_id,
        tags: tagArray,
        published: true,
        cover_image: formData.cover_image || undefined,
      }

      console.log("Submitting payload:", payload)

      let response
      if (blog) {
        response = await blogApi.updateBlog(blog.id, payload)
        toast({
          title: "Blog post updated",
          description: "Your blog post has been updated successfully.",
        })
      } else {
        response = await blogApi.createBlog(payload)
        toast({
          title: "Blog post created",
          description: "Your blog post has been created successfully.",
        })
      }

      router.push(`/blog/${response.slug}`)
    } catch (error: any) {
      console.error("Blog submission error:", error)
      setError(error.response?.data?.detail || "Failed to save blog post")
      toast({
        title: "Error",
        description: "Failed to save blog post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {blog && (
        <Button variant="ghost" className="mb-6" asChild>
          <Link href={`/blog/${blog.slug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to post
          </Link>
        </Button>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{blog ? "Edit Blog Post" : "Create New Blog Post"}</CardTitle>
          <CardDescription>{blog ? "Update your blog post" : "Share your thoughts with the world"}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea id="excerpt" name="excerpt" value={formData.excerpt} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={10}
              />
            </div>
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? "Uploading..." : "Upload Image"}
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>
              {formData.cover_image && (
                <div className="mt-2">
                  <img
                    src={formData.cover_image || "/placeholder.svg"}
                    alt="Cover preview"
                    className="h-40 object-cover rounded-md"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=400&width=600"
                    }}
                  />
                </div>
              )}
              <div className="mt-2">
                <Label htmlFor="cover_image">Or provide an image URL</Label>
                <Input
                  id="cover_image"
                  name="cover_image"
                  value={formData.cover_image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category_id">Category</Label>
                {categoriesLoading ? (
                  <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
                ) : (
                  <Select
                    value={formData.category_id}
                    onValueChange={handleSelectChange}
                    defaultValue={categories.length > 0 ? categories[0].id : undefined}
                  >
                    <SelectTrigger id="category_id">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="tech, programming, web"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (blog ? "Updating..." : "Creating...") : blog ? "Update post" : "Create post"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

