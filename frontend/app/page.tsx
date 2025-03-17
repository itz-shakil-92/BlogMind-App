import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <div className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 -z-10" />
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Welcome to BlogMind</h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              A modern blog platform with smart recommendations powered by AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/signup">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

