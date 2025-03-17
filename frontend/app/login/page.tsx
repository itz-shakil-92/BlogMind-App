import type { Metadata } from "next"
import Link from "next/link"
import LoginForm from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Login | BlogMind",
  description: "Login to your BlogMind account",
}

export default function LoginPage() {
  return (
    <div className="container max-w-md py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-muted-foreground mt-2">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
      <LoginForm />
    </div>
  )
}

