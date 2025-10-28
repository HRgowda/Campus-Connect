"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  MessageSquare,
  Settings,
  Hash,
  Lock,
  Globe,
  Calendar,
  MoreVertical,
  Star,
  Pin,
  Volume2,
  VolumeX,
  UserPlus,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import JoinRequest from "./JoinRequest";

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

interface ChannelCardProps {
  channel: Channel;
  onJoin: () => void;
  onLeave: () => void;
  getChannelIcon: (type: string) => string;
  getChannelTypeColor: (type: string) => string;
}

export default function ChannelCard({
  channel,
  onJoin,
  onLeave,
  getChannelIcon,
  getChannelTypeColor,
}: ChannelCardProps) {
  const router = useRouter();
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleOpenChannel = () => {
    // Determine the correct route based on user type
    const userType = window.location.pathname.includes('/professor/') ? 'professor' : 'student';
    router.push(`/${userType}/channels/${channel.id}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src={channel.avatar_url} alt={channel.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {channel.avatar_url ? getInitials(channel.name) : getChannelIcon(channel.channel_type)}
                </AvatarFallback>
              </Avatar>
              {channel.is_private && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                  <Lock className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-card-foreground truncate group-hover:text-primary transition-colors">
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
                  <DropdownMenuItem onClick={handleOpenChannel}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Open Channel
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Channel Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onLeave} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Leave Channel
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={onJoin}>
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
              <span>{formatDate(channel.created_at)}</span>
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
              onClick={handleOpenChannel}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Open Channel
            </Button>
          ) : (
            <Button
              onClick={onJoin}
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
  );
}
