import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import DashboardContent from "@/components/dashboard/dashboard-content"

export const metadata: Metadata = {
  title: "Dashboard | BlogMind",
  description: "Manage your blog posts and account",
}

export default async function DashboardPage() {
  // Check if user is authenticated on the server
  const cookieStore = await cookies()
  const token = await cookieStore.get("token")

  if (!token) {
    redirect("/login?redirect=/dashboard")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardContent />
    </div>
  )
}

