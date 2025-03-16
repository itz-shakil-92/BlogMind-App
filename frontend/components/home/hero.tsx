"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

export default function Hero() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 -z-10" />
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Discover stories that matter to you</h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            BlogMind uses AI to recommend content tailored to your interests. Explore trending topics or dive deep into
            your favorite subjects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link href="/categories">Start Reading</Link>
            </Button>
            {!isAuthenticated && (
              <Button variant="outline" size="lg" asChild>
                <Link href="/signup">Create Account</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

