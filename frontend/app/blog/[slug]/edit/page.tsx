import type { Metadata } from "next"
import { redirect, notFound } from "next/navigation"
import BlogForm from "@/components/blog/blog-form"
import { getServerSession } from "next-auth"
import apiClient from "@/lib/api-client"

export const metadata: Metadata = {
  title: "Edit Blog Post | BlogMind",
  description: "Edit your blog post",
}

async function getBlogPost(slug: string) {
  try {
    const response = await apiClient.get(`/blogs/${slug}`)
    return response.data
  } catch (error) {
    console.error("Failed to fetch blog post:", error)
    return null
  }
}

export default async function EditBlogPage({ params }: { params: { slug: string } }) {
  // Check if user is authenticated on the server
  const session = await getServerSession()

  if (!session) {
    redirect(`/login?redirect=/blog/${params.slug}/edit`)
  }

  const post = await getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="container max-w-screen-lg py-12">
      <BlogForm blog={post} />
    </div>
  )
}

