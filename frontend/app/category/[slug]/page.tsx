import type { Metadata } from "next"
import { notFound } from "next/navigation"
import BlogList from "@/components/blog/blog-list"
import apiClient from "@/lib/api-client"

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  try {
    const category = await getCategory(params.slug)

    return {
      title: `${category.name} | BlogMind`,
      description: `Browse all posts in the ${category.name} category`,
    }
  } catch (error) {
    return {
      title: "Category | BlogMind",
      description: "Browse posts by category",
    }
  }
}

async function getCategory(slug: string) {
  try {
    const response = await apiClient.get(`/categories/${slug}`)
    return response.data
  } catch (error) {
    console.error("Failed to fetch category:", error)
    throw error
  }
}

async function getCategoryPosts(slug: string) {
  try {
    const response = await apiClient.get(`/blogs?category=${slug}`)
    return response.data
  } catch (error) {
    console.error("Failed to fetch category posts:", error)
    return []
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  let category
  let posts

  try {
    category = await getCategory(params.slug)
    posts = await getCategoryPosts(params.slug)
  } catch (error) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Posts in {category.name}</h1>
      <BlogList initialPosts={posts} category={params.slug} />
    </div>
  )
}

