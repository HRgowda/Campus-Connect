"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, X } from "lucide-react"

interface FeedFiltersProps {
  filters: {
    feed_type?: string
    priority?: string
    tags?: string[]
    is_pinned?: boolean
    is_public?: boolean
    date_from?: Date
    date_to?: Date
  }
  onFiltersChange: (filters: any) => void
  onClose: () => void
}

export default function FeedFilters({ filters, onFiltersChange, onClose }: FeedFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      feed_type: undefined,
      priority: undefined,
      tags: undefined,
      is_pinned: undefined,
      is_public: undefined,
      date_from: undefined,
      date_to: undefined
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
    onClose()
  }

  const updateFilter = (key: string, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-card-foreground">
          Filter Posts
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

      <CardContent className="space-y-4">
        {/* Post Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Post Type</Label>
          <Select
            value={localFilters.feed_type || "all"}
            onValueChange={(value) => updateFilter("feed_type", value === "all" ? undefined : value)}
          >
            <SelectTrigger className="border-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="announcement">Announcement</SelectItem>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Priority</Label>
          <Select
            value={localFilters.priority || "all"}
            onValueChange={(value) => updateFilter("priority", value === "all" ? undefined : value)}
          >
            <SelectTrigger className="border-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range - Simplified */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Date Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={localFilters.date_from ? localFilters.date_from.toISOString().split('T')[0] : ''}
              onChange={(e) => updateFilter("date_from", e.target.value ? new Date(e.target.value) : undefined)}
              className="border-input"
            />
            <Input
              type="date"
              value={localFilters.date_to ? localFilters.date_to.toISOString().split('T')[0] : ''}
              onChange={(e) => updateFilter("date_to", e.target.value ? new Date(e.target.value) : undefined)}
              className="border-input"
            />
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_pinned"
              checked={localFilters.is_pinned || false}
              onCheckedChange={(checked) => updateFilter("is_pinned", checked ? true : undefined)}
            />
            <Label htmlFor="is_pinned" className="text-sm text-foreground">
              Pinned posts only
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_public"
              checked={localFilters.is_public || false}
              onCheckedChange={(checked) => updateFilter("is_public", checked ? true : undefined)}
            />
            <Label htmlFor="is_public" className="text-sm text-foreground">
              Public posts only
            </Label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="border-border text-foreground hover:bg-accent"
          >
            Clear
          </Button>
          <Button
            onClick={handleApplyFilters}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
