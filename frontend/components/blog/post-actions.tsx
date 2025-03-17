"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Heart, Share2, Facebook, Twitter, Linkedin, LinkIcon, BarChart } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api-client"

interface PostActionsProps {
  postId: string
  slug: string
  initialLikes: number
  initialIsLiked: boolean
  shareUrl: string
  showAnalytics?: boolean
}

export default function PostActions({
  postId,
  slug,
  initialLikes = 0,
  initialIsLiked = false,
  shareUrl,
  showAnalytics = false,
}: PostActionsProps) {
  const { toast } = useToast()
  const { isAuthenticated, user } = useAuth()
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isLiking, setIsLiking] = useState(false)

  const handleLike = async () => {
    if (!isAuthenticated) {
      window.location.href = `/login?redirect=/blog/${slug}`
      return
    }

    try {
      setIsLiking(true)
      await api.likeBlog(slug)
      setIsLiked(!isLiked)
      setLikes(isLiked ? likes - 1 : likes + 1)

      toast({
        title: isLiked ? "Post unliked" : "Post liked",
        description: isLiked ? "You have unliked this post" : "You have liked this post",
      })
    } catch (error) {
      console.error("Failed to like post:", error)
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLiking(false)
    }
  }

  const handleShare = async (platform: string) => {
    const shareText = "Check out this amazing blog post!"
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedText = encodeURIComponent(shareText)

    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    }

    if (platform === "copy") {
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast({
          title: "Link copied",
          description: "Link copied to clipboard!",
        })
      } catch (err) {
        console.error("Failed to copy: ", err)
        toast({
          title: "Error",
          description: "Failed to copy link. Please try again.",
          variant: "destructive",
        })
      }
      return
    }

    window.open(urls[platform], "_blank")
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        className={cn(isLiked && "text-red-500")}
        disabled={isLiking}
      >
        <Heart className={cn("h-4 w-4 mr-2", isLiked && "fill-current")} />
        {likes}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleShare("facebook")}>
            <Facebook className="h-4 w-4 mr-2" />
            Facebook
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("twitter")}>
            <Twitter className="h-4 w-4 mr-2" />
            Twitter
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("linkedin")}>
            <Linkedin className="h-4 w-4 mr-2" />
            LinkedIn
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("copy")}>
            <LinkIcon className="h-4 w-4 mr-2" />
            Copy Link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showAnalytics && user && (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/blog/${slug}/analytics`}>
            <BarChart className="h-4 w-4 mr-2" />
            Analytics
          </Link>
        </Button>
      )}
    </div>
  )
}

