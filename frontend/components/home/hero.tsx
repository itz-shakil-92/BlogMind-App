import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <div className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 -z-10" />
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Discover, Learn, and Share Knowledge</h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Join our community of writers and readers. Explore trending topics or share your expertise with the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link href="/blog/new">Start Writing</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/categories">Explore Topics</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

