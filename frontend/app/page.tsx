import Hero from "@/components/home/hero"
import SearchBar from "@/components/home/search-bar"
import CategoryFilter from "@/components/home/category-filter"
import FeaturedPosts from "@/components/home/featured-posts"
import BlogList from "@/components/blog/blog-list"
import RecommendedPosts from "@/components/home/recommended-posts"
import Newsletter from "@/components/home/newsletter"

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <Hero />
      <SearchBar />
      <CategoryFilter />
      <FeaturedPosts />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 my-12">
        <div className="lg:col-span-2">
          <BlogList />
        </div>
        <div className="space-y-8">
          <RecommendedPosts />
          <Newsletter />
        </div>
      </div>
    </div>
  )
}

