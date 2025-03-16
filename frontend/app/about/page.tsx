import type { Metadata } from "next"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "About | BlogMind",
  description: "Learn more about BlogMind",
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">About BlogMind</h1>

        <div className="prose prose-lg dark:prose-invert">
          <p className="lead">
            BlogMind is a modern blogging platform that connects readers with great writers and thought-provoking
            content.
          </p>

          <div className="relative w-full h-[300px] my-8 rounded-lg overflow-hidden">
            <Image src="/placeholder.svg?height=600&width=1200" alt="BlogMind Team" fill className="object-cover" />
          </div>

          <h2>Our Mission</h2>
          <p>
            We believe in the power of sharing knowledge and experiences. Our platform is designed to make it easy for
            writers to reach their audience and for readers to discover content that matters to them.
          </p>

          <h2>Our Values</h2>
          <ul>
            <li>Quality Content: We prioritize well-researched and thoughtful articles</li>
            <li>Community: We foster meaningful discussions and connections</li>
            <li>Accessibility: We make knowledge accessible to everyone</li>
            <li>Innovation: We continuously improve our platform</li>
          </ul>

          <h2>The Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose mt-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="relative w-full aspect-square rounded-full overflow-hidden mb-4">
                    <Image
                      src={`/placeholder.svg?text=Team${i}`}
                      alt={`Team Member ${i}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-lg text-center">Team Member {i}</h3>
                  <p className="text-muted-foreground text-center">Position</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

