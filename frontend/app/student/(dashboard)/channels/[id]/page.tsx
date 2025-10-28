"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { useAtom } from "jotai";
import { userAtom } from "@/app/atoms/atoms";
import ChannelMessaging from "@/components/channels/ChannelMessaging";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Settings,
  Users,
  Hash,
  Lock,
  Calendar,
  UserPlus,
  LogOut,
  Crown,
  Shield,
} from "lucide-react";

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

export default function ChannelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user] = useAtom(userAtom);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const channelId = params?.id as string;

  // Fetch channel details
  const fetchChannel = async () => {
    if (!channelId) return;
    
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/channels/${channelId}`);
      setChannel(response.data);
    } catch (error: any) {
      console.error("Failed to fetch channel:", error);
      setError(error?.response?.data?.detail || "Failed to load channel");
    } finally {
      setLoading(false);
    }
  };

  // Join channel
  const joinChannel = async () => {
    if (!channel) return;
    
    try {
      await axiosInstance.post(`/channels/${channel.id}/join`);
      setChannel(prev => prev ? { ...prev, is_member: true, member_count: prev.member_count + 1 } : null);
    } catch (error) {
      console.error("Failed to join channel:", error);
    }
  };

  // Leave channel
  const leaveChannel = async () => {
    if (!channel) return;
    
    try {
      await axiosInstance.post(`/channels/${channel.id}/leave`);
      router.push("/student/channels");
    } catch (error) {
      console.error("Failed to leave channel:", error);
    }
  };

  useEffect(() => {
    fetchChannel();
  }, [channelId]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-border">
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
                  <Hash className="w-8 h-8 text-destructive" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-card-foreground">
                    Channel Not Found
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    {error || "This channel doesn't exist or you don't have access to it."}
                  </p>
                </div>
                <Button onClick={() => router.push("/student/channels")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Channels
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!channel.is_member) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/student/channels")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div className="flex items-center gap-2">
                  {channel.is_private ? (
                    <Lock className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Hash className="w-5 h-5 text-muted-foreground" />
                  )}
                  <CardTitle className="text-2xl">{channel.name}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xl">
                    {channel.avatar_url ? channel.name.slice(0, 2).toUpperCase() : getChannelIcon(channel.channel_type)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant="outline" 
                      className={`text-sm ${getChannelTypeColor(channel.channel_type)}`}
                    >
                      {channel.channel_type.replace("_", " ")}
                    </Badge>
                    {channel.is_private && (
                      <Badge variant="outline" className="text-sm bg-amber-100 text-amber-800">
                        Private
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{channel.member_count} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Created {new Date(channel.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {channel.description && (
                <div>
                  <h4 className="font-semibold text-card-foreground mb-2">Description</h4>
                  <p className="text-muted-foreground">{channel.description}</p>
                </div>
              )}

              {channel.tags && channel.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold text-card-foreground mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {channel.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={joinChannel}
                  className="bg-primary hover:bg-primary/90"
                  disabled={channel.is_archived}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {channel.is_archived ? "Channel Archived" : "Join Channel"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/student/channels")}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <ChannelMessaging channel={channel} onClose={() => router.push("/student/channels")} />
    </div>
  );
}

