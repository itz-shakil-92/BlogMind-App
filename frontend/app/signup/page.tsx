import type { Metadata } from "next"
import Link from "next/link"
import SignupForm from "@/components/auth/signup-form"

export const metadata: Metadata = {
  title: "Sign Up | BlogMind",
  description: "Create a new BlogMind account",
}

export default function SignupPage() {
  return (
    <div className="container max-w-md py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Create an Account</h1>
        <p className="text-muted-foreground mt-2">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
      <SignupForm />
    </div>
  )
}

