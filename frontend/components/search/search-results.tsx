"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import BlogList from "@/components/blog/blog-list"
import { Search, SortAsc, SortDesc } from "lucide-react"

interface SearchResultsProps {
  searchParams: {
    q?: string
    category?: string
    sort?: string
  }
}

export default function SearchResults({ searchParams }: SearchResultsProps) {
  const router = useRouter()
  const [search, setSearch] = useState(searchParams.q || "")
  const [category, setCategory] = useState(searchParams.category || "")
  const [sort, setSort] = useState(searchParams.sort || "latest")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateSearchParams()
  }

  const updateSearchParams = () => {
    const params = new URLSearchParams()
    if (search) params.set("q", search)
    if (category) params.set("category", category)
    if (sort) params.set("sort", sort)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">
          {searchParams.q
            ? `Search results for "${searchParams.q}"`
            : searchParams.category
              ? `Posts in ${searchParams.category}`
              : "All Posts"}
        </h1>
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={category}
            onValueChange={(value) => {
              setCategory(value)
              setTimeout(updateSearchParams, 0)
            }}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="lifestyle">Lifestyle</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="travel">Travel</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              setSort(sort === "latest" ? "oldest" : "latest")
              setTimeout(updateSearchParams, 0)
            }}
            className="flex-shrink-0"
          >
            {sort === "latest" ? <SortDesc className="h-4 w-4 mr-2" /> : <SortAsc className="h-4 w-4 mr-2" />}
            {sort === "latest" ? "Latest" : "Oldest"}
          </Button>
          <Button type="submit" className="flex-shrink-0">
            Search
          </Button>
        </form>
      </div>

      <BlogList searchQuery={searchParams.q} category={searchParams.category} />
    </div>
  )
}

