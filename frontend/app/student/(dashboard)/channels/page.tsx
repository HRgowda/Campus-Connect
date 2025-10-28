"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { useAtom } from "jotai";
import { userAtom } from "@/app/atoms/atoms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Search,
  Users,
  MessageSquare,
  Settings,
  Hash,
  Lock,
  Globe,
  Calendar,
  Filter,
  MoreVertical,
  Star,
  Pin,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateChannelModal from "@/components/channels/CreateChannelModal";
import ChannelCard from "@/components/channels/ChannelCard";
import ChannelFilters from "@/components/channels/ChannelFilters";
import UserList from "@/components/channels/UserList";
import InvitationManagement from "@/components/channels/InvitationManagement";

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

interface ChannelFilters {
  query?: string;
  channel_type?: string;
  is_private?: boolean;
  tags?: string[];
}

export default function ChannelsPage() {
  const [user] = useAtom(userAtom);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ChannelFilters>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Fetch user's channels
  const fetchUserChannels = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/channels?page=${page}&per_page=20`);
      const data = response.data;
      
      if (page === 1) {
        setChannels(data.channels);
      } else {
        setChannels(prev => [...prev, ...data.channels]);
      }
      
      setHasMore(data.has_next);
    } catch (error) {
      console.error("Failed to fetch channels:", error);
    } finally {
      setLoading(false);
    }
  };

  // Search channels
  const searchChannels = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: "1",
        per_page: "20",
        ...(searchQuery && { query: searchQuery }),
        ...(filters.channel_type && { channel_type: filters.channel_type }),
        ...(filters.is_private !== undefined && { is_private: filters.is_private.toString() }),
        ...(filters.tags && filters.tags.length > 0 && { tags: filters.tags.join(",") }),
      });
      
      const response = await axiosInstance.get(`/channels/search?${params}`);
      const data = response.data;
      
      setChannels(data.channels);
      setHasMore(data.has_next);
      setPage(1);
    } catch (error) {
      console.error("Failed to search channels:", error);
    } finally {
      setLoading(false);
    }
  };

  // Join channel
  const joinChannel = async (channelId: string) => {
    try {
      await axiosInstance.post(`/channels/${channelId}/join`);
      
      // Update channel in list
      setChannels(prev => prev.map(channel => 
        channel.id === channelId 
          ? { ...channel, is_member: true, member_count: channel.member_count + 1 }
          : channel
      ));
      
      alert("Successfully joined the channel!");
    } catch (error) {
      console.error("Failed to join channel:", error);
      alert("Failed to join channel. Please try again.");
    }
  };

  // Send join request
  const sendJoinRequest = async (channelId: string, message: string) => {
    try {
      await axiosInstance.post(`/channels/${channelId}/join-request`, { message });
      alert("Join request sent successfully!");
    } catch (error) {
      console.error("Failed to send join request:", error);
    }
  };

  // Leave channel
  const leaveChannel = async (channelId: string) => {
    try {
      await axiosInstance.post(`/channels/${channelId}/leave`);
      
      // Remove channel from list
      setChannels(prev => prev.filter(channel => channel.id !== channelId));
    } catch (error) {
      console.error("Failed to leave channel:", error);
    }
  };

  // Handle channel creation
  const handleChannelCreated = (newChannel: Channel) => {
    setChannels(prev => [newChannel, ...prev]);
    setShowCreateModal(false);
  };

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim() || Object.keys(filters).length > 0) {
      searchChannels();
    } else {
      fetchUserChannels();
    }
  };

  // Load more channels
  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    fetchUserChannels();
  }, [user?.id, page]);

  useEffect(() => {
    if (page > 1) {
      fetchUserChannels();
    }
  }, [page]);

  const getChannelIcon = (channelType: string) => {
    switch (channelType) {
      case "academic":
        return "📚";
      case "project":
        return "🚀";
      case "announcement":
        return "📢";
      case "study_group":
        return "👥";
      case "club":
        return "🎯";
      case "department":
        return "🏢";
      default:
        return "#";
    }
  };

  const getChannelTypeColor = (channelType: string) => {
    switch (channelType) {
      case "academic":
        return "bg-blue-100 text-blue-800";
      case "project":
        return "bg-green-100 text-green-800";
      case "announcement":
        return "bg-yellow-100 text-yellow-800";
      case "study_group":
        return "bg-purple-100 text-purple-800";
      case "club":
        return "bg-pink-100 text-pink-800";
      case "department":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-card-foreground">Channels</h1>
            <p className="text-muted-foreground mt-1">
              Connect with your campus community
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Channel
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search channels..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 bg-background border-input"
                  />
                </div>
              </div>
              <Button onClick={handleSearch} className="sm:w-auto">
                Search
              </Button>
            </div>
            
            {showFilters && (
              <ChannelFilters
                filters={filters}
                onFiltersChange={setFilters}
                onApply={handleSearch}
              />
            )}
          </CardContent>
        </Card>

        {/* Channels Grid */}
        {loading && channels.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {channels.map((channel, index) => (
                <ChannelCard
                  key={channel.id || `channel-${index}`}
                  channel={channel}
                  onJoin={() => joinChannel(channel.id)}
                  onLeave={() => leaveChannel(channel.id)}
                  getChannelIcon={getChannelIcon}
                  getChannelTypeColor={getChannelTypeColor}
                />
              ))}
            </div>

            {channels.length === 0 && !loading && (
              <Card className="border-border">
                <CardContent className="p-12 text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                      <Hash className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-card-foreground">
                        No channels found
                      </h3>
                      <p className="text-muted-foreground mt-2">
                        {searchQuery || Object.keys(filters).length > 0
                          ? "Try adjusting your search criteria"
                          : "Create your first channel to get started"
                        }
                      </p>
                    </div>
                    {(!searchQuery && Object.keys(filters).length === 0) && (
                      <Button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-4"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Channel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {hasMore && (
              <div className="text-center">
                <Button
                  onClick={loadMore}
                  disabled={loading}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {loading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Channel Modal */}
      {showCreateModal && (
        <CreateChannelModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onChannelCreated={handleChannelCreated}
        />
      )}
    </div>
  );
}

