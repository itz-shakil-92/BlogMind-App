"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { blogApi } from "@/lib/api-client"
import { Skeleton } from "@/components/ui/skeleton"

interface Category {
  id: string
  name: string
  slug: string
}

export default function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(searchParams?.get("category") || "all")

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const categoriesData = await blogApi.getCategories()
        // Add 'All' category to the beginning
        setCategories([{ id: "all", name: "All", slug: "all" }, ...categoriesData])
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        // Fallback categories if API fails
        setCategories([
          { id: "all", name: "All", slug: "all" },
          { id: "technology", name: "Technology", slug: "technology" },
          { id: "lifestyle", name: "Lifestyle", slug: "lifestyle" },
          { id: "health", name: "Health", slug: "health" },
          { id: "business", name: "Business", slug: "business" },
          { id: "travel", name: "Travel", slug: "travel" },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleCategoryClick = (categorySlug: string) => {
    setActiveCategory(categorySlug)

    // Create a new URLSearchParams object based on the current params
    const params = new URLSearchParams(searchParams?.toString())

    if (categorySlug === "all") {
      // Remove category parameter if 'All' is selected
      params.delete("category")
    } else {
      // Update or add the category parameter
      params.set("category", categorySlug)
    }

    router.push(`/?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className="my-6 overflow-x-auto pb-2">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="my-6 overflow-x-auto pb-2">
      <div className="flex gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.slug ? "default" : "outline"}
            onClick={() => handleCategoryClick(category.slug)}
            className="whitespace-nowrap"
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  )
}

