import type { Metadata } from "next"
import { notFound } from "next/navigation"
import BlogList from "@/components/blog/blog-list"
import apiClient from "@/lib/api-client"

interface TagPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  try {
    const tag = await getTag(params.slug)

    return {
      title: `${tag.name} | BlogMind`,
      description: `Browse all posts tagged with ${tag.name}`,
    }
  } catch (error) {
    return {
      title: "Tag | BlogMind",
      description: "Browse posts by tag",
    }
  }
}

async function getTag(slug: string) {
  try {
    const response = await apiClient.get(`/tags/${slug}`)
    return response.data
  } catch (error) {
    console.error("Failed to fetch tag:", error)
    throw error
  }
}

async function getTaggedPosts(slug: string) {
  try {
    const response = await apiClient.get(`/blogs?tag=${slug}`)
    return response.data
  } catch (error) {
    console.error("Failed to fetch tagged posts:", error)
    return []
  }
}

export default async function TagPage({ params }: TagPageProps) {
  let tag
  let posts

  try {
    tag = await getTag(params.slug)
    posts = await getTaggedPosts(params.slug)
  } catch (error) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Posts tagged with #{tag.name}</h1>
      <BlogList initialPosts={posts} tag={params.slug} />
    </div>
  )
}

