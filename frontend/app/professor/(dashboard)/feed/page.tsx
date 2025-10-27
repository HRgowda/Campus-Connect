"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Search, 
  Filter, 
  Heart, 
  MessageCircle, 
  Share2, 
  Pin, 
  Calendar,
  User,
  MoreHorizontal,
  Edit,
  Trash2
} from "lucide-react"
import { useAtom } from "jotai"
import { userAtom } from "@/app/atoms/atoms"
import axiosInstance from "@/lib/axios"
import { showSuccessToast, showErrorToast } from "@/lib/toastUtils"
import CreateFeedModal from "@/components/feed/CreateFeedModal"
import FeedCard from "@/components/feed/FeedCard"

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

interface FeedListResponse {
  feeds: Feed[]
  total: number
  page: number
  per_page: number
  has_next: boolean
  has_prev: boolean
}

export default function ProfessorFeedPage() {
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [user] = useAtom(userAtom)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const fetchFeeds = async (page = 1) => {
    try {
      setLoading(true)
      const params: any = {
        page,
        per_page: 10,
        sort_by: "created_at",
        sort_order: "desc"
      }

      if (searchTerm) params.search = searchTerm
      if (selectedType !== "all") params.feed_type = selectedType
      if (selectedPriority !== "all") params.priority = selectedPriority

      const response = await axiosInstance.get<FeedListResponse>("/feeds", { params })
      setFeeds(response.data.feeds)
      setTotalPages(Math.ceil(response.data.total / response.data.per_page))
      setCurrentPage(page)
    } catch (err) {
      console.error("Failed to fetch feeds:", err)
      setError(true)
      showErrorToast("Failed to load feeds. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeeds()
  }, [searchTerm, selectedType, selectedPriority])

  const handleCreateFeed = async (feedData: any) => {
    try {
      await axiosInstance.post("/feeds", feedData)
      showSuccessToast("Feed created successfully!")
      setIsCreateModalOpen(false)
      fetchFeeds(1) // Refresh the first page
    } catch (err) {
      console.error("Failed to create feed:", err)
      showErrorToast("Failed to create feed. Please try again.")
    }
  }

  const handleLike = async (feedId: string) => {
    try {
      const response = await axiosInstance.post(`/feeds/${feedId}/like`)
      const isLiked = response.data.is_liked
      
      setFeeds(prevFeeds => 
        prevFeeds.map(feed => 
          feed.id === feedId 
            ? { 
                ...feed, 
                is_liked: isLiked,
                likes_count: isLiked ? feed.likes_count + 1 : feed.likes_count - 1
              }
            : feed
        )
      )
    } catch (err) {
      console.error("Failed to like feed:", err)
      showErrorToast("Failed to like feed. Please try again.")
    }
  }

  const handleShare = async (feedId: string) => {
    try {
      await axiosInstance.post(`/feeds/${feedId}/share`)
      showSuccessToast("Feed shared successfully!")
      
      setFeeds(prevFeeds => 
        prevFeeds.map(feed => 
          feed.id === feedId 
            ? { 
                ...feed, 
                is_shared: true,
                shares_count: feed.shares_count + 1
              }
            : feed
        )
      )
    } catch (err) {
      console.error("Failed to share feed:", err)
      showErrorToast("Failed to share feed. Please try again.")
    }
  }

  const handleDeleteFeed = async (feedId: string) => {
    try {
      await axiosInstance.delete(`/feeds/${feedId}`)
      showSuccessToast("Feed deleted successfully!")
      setFeeds(prevFeeds => prevFeeds.filter(feed => feed.id !== feedId))
    } catch (err) {
      console.error("Failed to delete feed:", err)
      showErrorToast("Failed to delete feed. Please try again.")
    }
  }

  const handleEditFeed = async (feedId: string, updatedData: any) => {
    try {
      const response = await axiosInstance.put(`/feeds/${feedId}`, updatedData)
      showSuccessToast("Feed updated successfully!")
      
      setFeeds(prevFeeds => 
        prevFeeds.map(feed => 
          feed.id === feedId ? response.data : feed
        )
      )
    } catch (err) {
      console.error("Failed to update feed:", err)
      showErrorToast("Failed to update feed. Please try again.")
    }
  }

  if (loading && feeds.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Loading campus feeds...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campus Feed</h1>
          <p className="text-muted-foreground mt-1">
            Share announcements, events, and important updates with the campus community
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Post
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-border"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feeds List */}
      <div className="space-y-4">
        {feeds.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">
                Start sharing important updates and announcements with the campus community!
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          feeds.map((feed) => (
            <FeedCard
              key={feed.id}
              feed={feed}
              onLike={handleLike}
              onShare={handleShare}
              onDelete={handleDeleteFeed}
              onEdit={handleEditFeed}
              currentUser={user}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => fetchFeeds(currentPage - 1)}
            disabled={currentPage === 1}
            className="border-border"
          >
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => fetchFeeds(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="border-border"
          >
            Next
          </Button>
        </div>
      )}

      {/* Create Feed Modal */}
      <CreateFeedModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateFeed}
      />
    </div>
  )
}
