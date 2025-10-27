"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Pin, 
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { showSuccessToast, showErrorToast } from "@/lib/toastUtils"
import CommentSection from "./CommentSection"

interface Feed {
  id: string
  title: string
  content: string
  feed_type: "announcement" | "event" | "general" | "academic"
  priority: "low" | "normal" | "high" | "urgent"
  is_pinned: boolean
  is_public: boolean
  tags: string[]
  attachments: string[]
  created_at: string
  updated_at: string
  author: {
    id: string
    name: string
    email: string
    user_type: "student" | "professor"
  }
  likes_count: number
  comments_count: number
  shares_count: number
  is_liked: boolean
  is_shared: boolean
}

interface FeedCardProps {
  feed: Feed
  onLike: (feedId: string) => void
  onShare: (feedId: string) => void
  onDelete?: (feedId: string) => void
  onEdit?: (feedId: string, updatedData: any) => void
  currentUser: any
}

export default function FeedCard({ feed, onLike, onShare, onDelete, onEdit, currentUser }: FeedCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 border-red-200"
      case "high": return "bg-orange-100 text-orange-800 border-orange-200"
      case "normal": return "bg-blue-100 text-blue-800 border-blue-200"
      case "low": return "bg-gray-100 text-gray-800 border-gray-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "announcement": return "bg-purple-100 text-purple-800 border-purple-200"
      case "event": return "bg-green-100 text-green-800 border-green-200"
      case "academic": return "bg-indigo-100 text-indigo-800 border-indigo-200"
      case "general": return "bg-gray-100 text-gray-800 border-gray-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
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

  const isAuthor = currentUser?.id === feed.author.id

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${feed.is_pinned ? 'border-primary/30 bg-primary/5' : 'border-border'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/image1.jpeg" alt={feed.author.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getAuthorInitials(feed.author.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-card-foreground">{feed.author.name}</h3>
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                  {feed.author.user_type === "professor" ? "Professor" : "Student"}
                </Badge>
                {feed.is_pinned && (
                  <Pin className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(feed.created_at)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={`text-xs ${getPriorityColor(feed.priority)}`}>
              {feed.priority.toUpperCase()}
            </Badge>
            <Badge className={`text-xs ${getTypeColor(feed.feed_type)}`}>
              {feed.feed_type}
            </Badge>
            
            {isAuthor && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowActions(!showActions)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
                
                {showActions && (
                  <div className="absolute right-0 top-8 bg-card border border-border rounded-md shadow-lg z-10 min-w-[120px]">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setShowActions(false)
                          // TODO: Open edit modal
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setShowActions(false)
                          if (confirm("Are you sure you want to delete this post?")) {
                            onDelete(feed.id)
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Title */}
        <h2 className="text-xl font-semibold text-card-foreground">{feed.title}</h2>
        
        {/* Content */}
        <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {feed.content}
        </div>

        {/* Tags */}
        {feed.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {feed.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs border-border">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Attachments */}
        {feed.attachments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-card-foreground">Attachments:</h4>
            <div className="flex flex-wrap gap-2">
              {feed.attachments.map((attachment, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs border-border"
                  onClick={() => window.open(attachment, '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  File {index + 1}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(feed.id)}
              className={`flex items-center space-x-2 ${
                feed.is_liked 
                  ? 'text-red-600 hover:text-red-700' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Heart className={`w-4 h-4 ${feed.is_liked ? 'fill-current' : ''}`} />
              <span>{feed.likes_count}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{feed.comments_count}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare(feed.id)}
              className={`flex items-center space-x-2 ${
                feed.is_shared 
                  ? 'text-green-600 hover:text-green-700' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>{feed.shares_count}</span>
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <CommentSection feedId={feed.id} />
        )}
      </CardContent>
    </Card>
  )
}
