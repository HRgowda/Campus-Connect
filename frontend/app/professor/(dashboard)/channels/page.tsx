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
  Crown,
  Shield,
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

export default function ProfessorChannelsPage() {
  const [user] = useAtom(userAtom);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ChannelFilters>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Fetch all channels (professors can see all channels)
  const fetchAllChannels = async () => {
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
    } catch (error) {
      console.error("Failed to join channel:", error);
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

  // Archive channel
  const archiveChannel = async (channelId: string) => {
    try {
      await axiosInstance.put(`/channels/${channelId}`, { is_archived: true });
      
      // Update channel in list
      setChannels(prev => prev.map(channel => 
        channel.id === channelId 
          ? { ...channel, is_archived: true }
          : channel
      ));
    } catch (error) {
      console.error("Failed to archive channel:", error);
    }
  };

  // Delete channel
  const deleteChannel = async (channelId: string) => {
    try {
      await axiosInstance.delete(`/channels/${channelId}`);
      
      // Remove channel from list
      setChannels(prev => prev.filter(channel => channel.id !== channelId));
    } catch (error) {
      console.error("Failed to delete channel:", error);
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
      fetchAllChannels();
    }
  };

  // Load more channels
  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    fetchAllChannels();
  }, [user?.id, page]);

  useEffect(() => {
    if (page > 1) {
      fetchAllChannels();
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

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4 text-purple-500" />;
      case "admin":
        return <Shield className="w-4 h-4 text-red-500" />;
      case "moderator":
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-card-foreground flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              Channel Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and moderate campus channels
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
              {channels.map((channel) => (
                <Card key={channel.id} className="border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {channel.avatar_url ? channel.name.slice(0, 2).toUpperCase() : getChannelIcon(channel.channel_type)}
                            </AvatarFallback>
                          </Avatar>
                          {channel.is_private && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                              <Lock className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-semibold text-card-foreground truncate group-hover:text-primary transition-colors flex items-center gap-2">
                            {channel.is_private ? (
                              <div className="flex items-center gap-1">
                                <Lock className="w-4 h-4 text-amber-500" />
                                {channel.name}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Hash className="w-4 h-4 text-muted-foreground" />
                                {channel.name}
                              </div>
                            )}
                            {getRoleIcon(channel.user_role)}
                          </CardTitle>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getChannelTypeColor(channel.channel_type)}`}
                            >
                              {channel.channel_type.replace("_", " ")}
                            </Badge>
                            {channel.is_archived && (
                              <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600">
                                Archived
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {channel.is_member ? (
                            <>
                              <DropdownMenuItem>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Open Channel
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Settings className="w-4 h-4 mr-2" />
                                Channel Settings
                              </DropdownMenuItem>
                              {(channel.user_role === "owner" || channel.user_role === "admin") && (
                                <>
                                  <DropdownMenuItem onClick={() => archiveChannel(channel.id)}>
                                    <Pin className="w-4 h-4 mr-2" />
                                    {channel.is_archived ? "Unarchive" : "Archive"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => deleteChannel(channel.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Channel
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem onClick={() => leaveChannel(channel.id)} className="text-destructive">
                                <LogOut className="w-4 h-4 mr-2" />
                                Leave Channel
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem onClick={() => joinChannel(channel.id)}>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Join Channel
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {channel.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {channel.description}
                      </p>
                    )}

                    {/* Tags */}
                    {channel.tags && channel.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {channel.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {channel.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{channel.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{channel.member_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(channel.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {channel.max_members && (
                        <div className="text-xs">
                          Max: {channel.max_members}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="flex gap-2">
                      {channel.is_member ? (
                        <Button
                          onClick={() => {
                            const userType = 'professor';
                            window.location.href = `/${userType}/channels/${channel.id}`;
                          }}
                          className="flex-1 bg-primary hover:bg-primary/90"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Open Channel
                        </Button>
                      ) : (
                        <Button
                          onClick={() => joinChannel(channel.id)}
                          className="flex-1"
                          disabled={channel.is_archived}
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          {channel.is_archived ? "Archived" : "Join Channel"}
                        </Button>
                      )}
                      
                      {channel.is_member && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {/* Navigate to settings */}}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* User Role Badge */}
                    {channel.is_member && channel.user_role && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            channel.user_role === "owner" 
                              ? "bg-purple-100 text-purple-800" 
                              : channel.user_role === "admin"
                              ? "bg-red-100 text-red-800"
                              : channel.user_role === "moderator"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {channel.user_role.charAt(0).toUpperCase() + channel.user_role.slice(1)}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
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
