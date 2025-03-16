import type { Metadata } from "next"
import LoginForm from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Login | BlogMind",
  description: "Login to your BlogMind account",
}

export default function LoginPage() {
  return (
    <div className="container max-w-screen-sm py-12">
      <LoginForm />
    </div>
  )
}

