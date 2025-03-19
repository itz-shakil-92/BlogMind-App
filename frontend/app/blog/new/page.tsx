import type { Metadata } from "next"
import { redirect } from "next/navigation"
import BlogForm from "@/components/blog/blog-form"
import { cookies } from "next/headers"

export const metadata: Metadata = {
  title: "Create Blog Post | BlogMind",
  description: "Create a new blog post",
}

export default async function NewBlogPage() {
  // Check if user is authenticated on the server
  const cookieStore = cookies()
  const token = cookieStore.get("token")

  if (!token) {
    redirect("/login?redirect=/blog/new")
  }

  return (
    <div className="container max-w-screen-lg py-12">
      <BlogForm />
    </div>
  )
}

