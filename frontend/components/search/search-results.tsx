"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import BlogList from "@/components/blog/blog-list"
import { blogApi } from "@/lib/api-client"

interface SearchResultsProps {
  searchParams?: {
    q?: string
    category?: string
    sort?: string
  }
}

export default function SearchResults({ searchParams = {} }: SearchResultsProps) {
  const router = useRouter()
  const params = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(params?.get("q") || "")
  const [category, setCategory] = useState(params?.get("category") || "")
  const [sort, setSort] = useState(params?.get("sort") || "desc")
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const [resultsLoading, setResultsLoading] = useState(true)

  // Fetch categories once on component mount
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

  // Fetch search results when URL parameters change
  useEffect(() => {
    const fetchResults = async () => {
      setResultsLoading(true)
      try {
        const searchParams: any = {}

        if (params?.get("q")) {
          searchParams.search = params.get("q")
        }

        if (params?.get("category")) {
          searchParams.category = params.get("category")
        }

        if (params?.get("sort")) {
          searchParams.sort = params.get("sort")
        }

        console.log("Searching with params:", searchParams)
        const results = await blogApi.getBlogs(searchParams)
        setPosts(results)
      } catch (error) {
        console.error("Search error:", error)
        setPosts([])
      } finally {
        setResultsLoading(false)
      }
    }

    fetchResults()
  }, [params])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Build the query string
    const queryParams = new URLSearchParams()
    if (searchQuery) queryParams.set("q", searchQuery)
    if (category) queryParams.set("category", category)
    if (sort) queryParams.set("sort", sort)

    router.push(`/search?${queryParams.toString()}`)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-6">
          {params?.get("q") ? `Search results for "${params.get("q")}"` : "Search for blog posts"}
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
                      <SelectItem value="all">All Categories</SelectItem>
                      {loading ? (
                        <SelectItem value="loading" disabled>
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

      <BlogList initialPosts={posts} searchQuery={params?.get("q") || ""} category={params?.get("category") || ""} />
    </div>
  )
}

