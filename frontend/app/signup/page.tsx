import type { Metadata } from "next"
import SignUpForm from "@/components/auth/signup-form"

export const metadata: Metadata = {
  title: "Sign Up | BlogMind",
  description: "Create a new BlogMind account",
}

export default function SignUpPage() {
  return (
    <div className="container max-w-screen-sm py-12">
      <SignUpForm />
    </div>
  )
}

