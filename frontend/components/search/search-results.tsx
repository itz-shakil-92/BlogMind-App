"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import BlogList from "@/components/blog/blog-list"
import { blogApi } from "@/lib/api-client"

interface SearchResultsProps {
  searchParams: {
    q?: string
    category?: string
    sort?: string
  }
}

export default function SearchResults({ searchParams }: SearchResultsProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState(searchParams.q || "")
  const [category, setCategory] = useState(searchParams.category || "")
  const [sort, setSort] = useState(searchParams.sort || "desc")
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await blogApi.getCategories()
        setCategories(data)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Build the query string
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (category) params.set("category", category)
    if (sort) params.set("sort", sort)

    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-6">
          {searchParams.q ? `Search results for "${searchParams.q}"` : "Search for blog posts"}
        </h1>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for blog posts..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {loading ? (
                        <SelectItem value="" disabled>
                          Loading categories...
                        </SelectItem>
                      ) : (
                        categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.slug}>
                            {cat.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort">Sort By</Label>
                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger id="sort">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Newest First</SelectItem>
                      <SelectItem value="asc">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full">
                Search
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <BlogList searchQuery={searchParams.q} category={searchParams.category} tag={undefined} />
    </div>
  )
}

