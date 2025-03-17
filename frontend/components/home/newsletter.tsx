"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import apiClient from "@/lib/api-client"

export default function Newsletter() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)

    try {
      await apiClient.post("/newsletter/subscribe", { email })
      setIsSubmitted(true)
      toast({
        title: "Subscription successful!",
        description: "Thank you for subscribing to our newsletter.",
      })
    } catch (error) {
      console.error("Failed to subscribe to newsletter:", error)
      toast({
        title: "Subscription failed",
        description: "Failed to subscribe. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-secondary/50 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-2">Newsletter</h2>
      <p className="text-muted-foreground mb-4">Get the latest posts and updates delivered to your inbox.</p>

      {isSubmitted ? (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span>Thanks for subscribing!</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Input
              placeholder="Your email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              <Mail className="h-4 w-4 mr-2" />
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

