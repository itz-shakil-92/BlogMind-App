import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import apiClient from "@/lib/api-client"

export const metadata: Metadata = {
  title: "Categories | BlogMind",
  description: "Browse blog posts by category",
}

async function getCategories() {
  try {
    const response = await apiClient.get("/categories")
    return response.data
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    // Fallback categories
    return [
      { id: "technology", name: "Technology", count: 15 },
      { id: "lifestyle", name: "Lifestyle", count: 12 },
      { id: "health", name: "Health", count: 8 },
      { id: "business", name: "Business", count: 10 },
      { id: "travel", name: "Travel", count: 7 },
    ]
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Categories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category: { id: string; name: string; count: number }) => (
          <Link key={category.id} href={`/search?category=${category.id}`}>
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {category.count} {category.count === 1 ? "post" : "posts"}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

