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
            <Image src="/blogmind-about.jpg" alt="BlogMind Team" fill className="object-cover" />
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
            
              <Card>
                <CardContent className="p-4">
                  <div className="relative w-full aspect-square rounded-full overflow-hidden mb-4">
                    <Image
                      src={`https://img.freepik.com/premium-photo/data-scientist-working-with-modern-technology_1288657-4500.jpg?semt=ais_hybrid`}
                      alt={`Team Member 1`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-lg text-center"><a href="https://www.linkedin.com/in/shakilkathat92/">Shakil Kathat</a></h3>
                  <p className="text-muted-foreground text-center">Software Engineer</p>
                </CardContent>
              </Card>
            
              <Card>
                <CardContent className="p-4">
                  <div className="relative w-full aspect-square rounded-full overflow-hidden mb-4">
                    <Image
                      src={`https://130e178e8f8ba617604b-8aedd782b7d22cfe0d1146da69a52436.ssl.cf1.rackcdn.com/from-silos-to-synergy-gen-ai-aligns-security-teams-showcase_image-8-a-27024.jpg`}
                      alt={`Team Member 2`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-lg text-center"><a href="https://www.linkedin.com/in/iamrahulmeena/">Rahul Meena</a></h3>
                  <p className="text-muted-foreground text-center">Software Engineer</p>
                </CardContent>
              </Card>


              <Card>
                <CardContent className="p-4">
                  <div className="relative w-full aspect-square rounded-full overflow-hidden mb-4">
                    <Image
                      src={`https://img.freepik.com/premium-photo/young-programmer-working-desk-office_495423-84390.jpg?semt=ais_hybrid`}
                      alt={`Team Member 3`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-lg text-center"><a href="https://www.linkedin.com/in/lokeshwarbhagat/">Lokeshwar Bhagat</a></h3>
                  <p className="text-muted-foreground text-center">Cyber Security Specialist</p>
                </CardContent>
              </Card>

          </div>
        </div>
      </div>
    </div>
  )
}

