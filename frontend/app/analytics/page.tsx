import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import UserAnalyticsDashboard from "@/components/analytics/user-analytics-dashboard"

export const metadata: Metadata = {
  title: "Analytics | BlogMind",
  description: "View your blog analytics",
}

export default async function AnalyticsPage() {
  // Check if user is authenticated on the server
  const cookieStore = cookies()
  const token = cookieStore.get("token")

  if (!token) {
    redirect("/login?redirect=/analytics")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <UserAnalyticsDashboard />
    </div>
  )
}

