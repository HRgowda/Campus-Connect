"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Tag } from "lucide-react"
import { showSuccessToast, showErrorToast } from "@/lib/toastUtils"

interface CreateFeedModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (feedData: any) => void
}

export default function CreateFeedModal({ isOpen, onClose, onSubmit }: CreateFeedModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    feed_type: "general",
    priority: "normal",
    is_pinned: false,
    is_public: true,
    tags: [] as string[],
    attachments: [] as string[]
  })
  const [newTag, setNewTag] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      showErrorToast("Please fill in all required fields")
      return
    }

    try {
      setSubmitting(true)
      await onSubmit(formData)
      
      // Reset form
      setFormData({
        title: "",
        content: "",
        feed_type: "general",
        priority: "normal",
        is_pinned: false,
        is_public: true,
        tags: [],
        attachments: []
      })
      setNewTag("")
    } catch (err) {
      console.error("Failed to create feed:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-card-foreground">
            Create New Post
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-foreground">
                Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter post title..."
                className="border-input"
                required
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium text-foreground">
                Content *
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="What's happening on campus?"
                className="min-h-[120px] border-input resize-none"
                required
              />
            </div>

            {/* Type and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="feed_type" className="text-sm font-medium text-foreground">
                  Post Type
                </Label>
                <Select
                  value={formData.feed_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, feed_type: value }))}
                >
                  <SelectTrigger className="border-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-medium text-foreground">
                  Priority
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger className="border-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Tags
              </Label>
              <div className="flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag..."
                  className="flex-1 border-input"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTag}
                  className="border-border"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/20"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTag(tag)}
                        className="ml-1 h-4 w-4 text-primary hover:text-primary/80"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_pinned"
                  checked={formData.is_pinned}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_pinned: !!checked }))}
                />
                <Label htmlFor="is_pinned" className="text-sm text-foreground">
                  Pin this post to the top
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: !!checked }))}
                />
                <Label htmlFor="is_public" className="text-sm text-foreground">
                  Make this post public
                </Label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-border text-foreground hover:bg-accent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {submitting ? "Creating..." : "Create Post"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
