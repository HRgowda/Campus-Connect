"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Send, MessageCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import axiosInstance from "@/lib/axios"
import { showSuccessToast, showErrorToast } from "@/lib/toastUtils"

interface Comment {
  id: string
  content: string
  created_at: string
  updated_at: string
  author: {
    id: string
    name: string
    email: string
    user_type: "student" | "professor"
  }
  feed_id: string
}

interface CommentSectionProps {
  feedId: string
}

export default function CommentSection({ feedId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [feedId])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get(`/feeds/${feedId}/comments`)
      setComments(response.data)
    } catch (err) {
      console.error("Failed to fetch comments:", err)
      showErrorToast("Failed to load comments")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      setSubmitting(true)
      const response = await axiosInstance.post(`/feeds/${feedId}/comment`, {
        content: newComment.trim()
      })
      
      setComments(prev => [response.data, ...prev])
      setNewComment("")
      showSuccessToast("Comment added successfully!")
    } catch (err) {
      console.error("Failed to add comment:", err)
      showErrorToast("Failed to add comment. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return "Recently"
    }
  }

  const getAuthorInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2)
  }

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="flex space-x-2">
        <Input
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1"
          disabled={submitting}
        />
        <Button
          type="submit"
          size="sm"
          disabled={!newComment.trim() || submitting}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>

      {/* Comments List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-4">
            <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="border-border">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/image1.jpeg" alt={comment.author.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {getAuthorInitials(comment.author.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm text-card-foreground">
                        {comment.author.name}
                      </span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {comment.author.user_type === "professor" ? "Professor" : "Student"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
