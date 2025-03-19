import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
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
  // Check if user is authenticated on the server
  const cookieStore = cookies()
  const token = cookieStore.get("token")

  if (!token) {
    redirect("/login?redirect=/search")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SearchResults searchParams={searchParams} />
    </div>
  )
}

