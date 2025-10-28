"use client";

import React, { useState } from "react";
import axiosInstance from "@/lib/axios";
import { useAtom } from "jotai";
import { userAtom } from "@/app/atoms/atoms";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, Plus, Hash, Lock, Globe } from "lucide-react";

interface Channel {
  id: string;
  name: string;
  description?: string;
  channel_type: string;
  is_private: boolean;
  is_archived: boolean;
  max_members?: number;
  tags: string[];
  avatar_url?: string;
  created_by_id: string;
  created_by_role: string;
  created_at: string;
  updated_at: string;
  member_count: number;
  is_member: boolean;
  user_role?: string;
}

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChannelCreated: (channel: Channel) => void;
}

const CHANNEL_TYPES = [
  { value: "general", label: "General", icon: "💬" },
  { value: "academic", label: "Academic", icon: "📚" },
  { value: "project", label: "Project", icon: "🚀" },
  { value: "announcement", label: "Announcement", icon: "📢" },
  { value: "study_group", label: "Study Group", icon: "👥" },
  { value: "club", label: "Club", icon: "🎯" },
  { value: "department", label: "Department", icon: "🏢" },
];

export default function CreateChannelModal({
  isOpen,
  onClose,
  onChannelCreated,
}: CreateChannelModalProps) {
  const [user] = useAtom(userAtom);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    channel_type: "general",
    is_private: false,
    max_members: "",
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Channel name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Channel name must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.name)) {
      newErrors.name = "Channel name can only contain letters, numbers, hyphens, and underscores";
    }

    if (formData.max_members && (isNaN(Number(formData.max_members)) || Number(formData.max_members) < 2)) {
      newErrors.max_members = "Maximum members must be at least 2";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        channel_type: formData.channel_type,
        is_private: formData.is_private,
        max_members: formData.max_members ? Number(formData.max_members) : null,
        tags: formData.tags,
      };

      const response = await axiosInstance.post("/channels", payload);
      onChannelCreated(response.data);
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        channel_type: "general",
        is_private: false,
        max_members: "",
        tags: [],
      });
      setNewTag("");
      setErrors({});
      
    } catch (error: any) {
      console.error("Failed to create channel:", error);
      const errorMessage = error?.response?.data?.detail || "Failed to create channel";
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: "",
        description: "",
        channel_type: "general",
        is_private: false,
        max_members: "",
        tags: [],
      });
      setNewTag("");
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Channel
          </DialogTitle>
          <DialogDescription>
            Create a new channel for your campus community to connect and collaborate.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{errors.general}</p>
            </div>
          )}

          {/* Channel Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Channel Name *</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="channel-name"
                className="pl-10 bg-background border-input"
                disabled={loading}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Use lowercase letters, numbers, hyphens, and underscores only
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What is this channel about?"
              className="bg-background border-input resize-none"
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Channel Type */}
          <div className="space-y-2">
            <Label htmlFor="channel_type">Channel Type</Label>
            <Select
              value={formData.channel_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, channel_type: value }))}
              disabled={loading}
            >
              <SelectTrigger className="bg-background border-input">
                <SelectValue placeholder="Select channel type" />
              </SelectTrigger>
              <SelectContent>
                {CHANNEL_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="is_private">Private Channel</Label>
                <p className="text-xs text-muted-foreground">
                  Only invited members can join
                </p>
              </div>
              <Switch
                id="is_private"
                checked={formData.is_private}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_private: checked }))}
                disabled={loading}
              />
            </div>
          </div>

          {/* Maximum Members */}
          <div className="space-y-2">
            <Label htmlFor="max_members">Maximum Members (Optional)</Label>
            <Input
              id="max_members"
              type="number"
              value={formData.max_members}
              onChange={(e) => setFormData(prev => ({ ...prev, max_members: e.target.value }))}
              placeholder="Leave empty for unlimited"
              min="2"
              max="1000"
              className="bg-background border-input"
              disabled={loading}
            />
            {errors.max_members && (
              <p className="text-sm text-destructive">{errors.max_members}</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags (Optional)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs px-2 py-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => removeTag(tag)}
                >
                  {tag}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                className="bg-background border-input flex-1"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                disabled={loading || formData.tags.length >= 10}
              />
              <Button
                type="button"
                onClick={addTag}
                size="sm"
                variant="outline"
                disabled={loading || !newTag.trim() || formData.tags.length >= 10}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Add up to 10 tags to help others find your channel
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? "Creating..." : "Create Channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

