"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { formatDate, getInitials } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api-client"

interface User {
  id: string
  name: string
  avatar?: string
}

interface Comment {
  id: string
  content: string
  created_at: string
  user: User
}

interface CommentsProps {
  blogId: string
  blogSlug: string
}

export default function CommentsSection({ blogId, blogSlug }: CommentsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuth()
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState("")
  const [loadingComments, setLoadingComments] = useState(true)

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoadingComments(true)
        const commentsData = await api.getComments(blogSlug)
        setComments(commentsData)
      } catch (error) {
        console.error("Failed to fetch comments:", error)
        setError("Failed to load comments. Please try again.")
        setComments([])
      } finally {
        setLoadingComments(false)
      }
    }

    fetchComments()
  }, [blogSlug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      router.push(`/login?redirect=/blog/${blogSlug}`)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const newComment = await api.addComment(blogId, commentText)

      // Add the new comment to the list
      setComments([
        ...comments,
        {
          ...newComment,
          user: {
            id: user!.id,
            name: user!.name,
            avatar: user!.avatar,
          },
          created_at: new Date().toISOString(),
        },
      ])

      setCommentText("")
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully.",
      })
    } catch (error: any) {
      setError(error.response?.data?.detail || "Failed to post comment")
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      await api.deleteComment(commentId)
      setComments(comments.filter((comment) => comment.id !== commentId))
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully.",
      })
    } catch (error: any) {
      setError(error.response?.data?.detail || "Failed to delete comment")
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loadingComments) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Comments</h2>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Comments ({comments.length})</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={isAuthenticated ? "Write a comment..." : "Please login to comment"}
          required
          disabled={!isAuthenticated || isLoading}
          rows={3}
        />
        <Button type="submit" disabled={!isAuthenticated || isLoading}>
          {isLoading ? "Posting..." : "Post comment"}
        </Button>
      </form>

      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <Avatar>
                <AvatarImage src={comment.user.avatar || ""} alt={comment.user.name} />
                <AvatarFallback>{getInitials(comment.user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{comment.user.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">{formatDate(comment.created_at)}</span>
                  </div>
                  {user && user.id === comment.user.id && (
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(comment.id)}>
                      Delete
                    </Button>
                  )}
                </div>
                <p className="text-muted-foreground">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

