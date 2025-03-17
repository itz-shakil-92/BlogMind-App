import type { Metadata } from "next"
import SearchResults from "@/components/search/search-results"

export const metadata: Metadata = {
  title: "Search | BlogMind",
  description: "Search for blog posts",
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; sort?: string }
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <SearchResults searchParams={searchParams} />
    </div>
  )
}

