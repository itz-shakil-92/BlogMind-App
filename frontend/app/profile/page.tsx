import type { Metadata } from "next"
import { redirect } from "next/navigation"
import ProfileForm from "@/components/profile/profile-form"
import { cookies } from "next/headers"

export const metadata: Metadata = {
  title: "Profile | BlogMind",
  description: "Manage your profile settings",
}

export default async function ProfilePage() {
  // Check if user is authenticated on the server
  const cookieStore = cookies()
  const token = cookieStore.get("token")

  if (!token) {
    redirect("/login?redirect=/profile")
  }

  return (
    <div className="container max-w-screen-lg py-12">
      <ProfileForm />
    </div>
  )
}

