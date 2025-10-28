"use client";

import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "@/lib/axios";
import { useAtom } from "jotai";
import { userAtom } from "@/app/atoms/atoms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Pin,
  Star,
  Volume2,
  VolumeX,
  Users,
  Settings,
  Hash,
  Lock,
  Reply,
  Edit,
  Trash2,
  Download,
  Eye,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  content?: string;
  message_type: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  is_edited: boolean;
  edited_at?: string;
  reply_to_id?: string;
  channel_id: string;
  sender_id: string;
  sender_name?: string;
  sender_role: string;
  created_at: string;
  updated_at: string;
  reactions: {
    emoji: string;
    users: {
      user_id: string;
      user_role: string;
      created_at: string;
    }[];
    count: number;
  }[];
  reply_to?: Message;
}

interface Channel {
  id: string;
  name: string;
  description?: string;
  channel_type: string;
  is_private: boolean;
  member_count: number;
  user_role?: string;
}

interface ChannelMessagingProps {
  channel: Channel;
  onClose: () => void;
}

export default function ChannelMessaging({ channel, onClose }: ChannelMessagingProps) {
  const [user] = useAtom(userAtom);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/channels/${channel.id}/messages?per_page=50`);
      const data = response.data;
      setMessages(data.messages.reverse()); // Reverse to show oldest first
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() && !replyTo) return;

    try {
      setSending(true);
      
      const payload = {
        content: newMessage.trim(),
        message_type: "text",
        reply_to_id: replyTo?.id,
      };

      const response = await axiosInstance.post(`/channels/${channel.id}/messages`, payload);
      
      setNewMessage("");
      setReplyTo(null);
      setEditingMessage(null);
      
      // Add message to local state
      setMessages(prev => [...prev, response.data]);
      
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  // Edit message
  const editMessage = async (messageId: string, content: string) => {
    try {
      const response = await axiosInstance.put(
        `/channels/${channel.id}/messages/${messageId}`,
        { content }
      );
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? response.data : msg
      ));
      setEditingMessage(null);
    } catch (error) {
      console.error("Failed to edit message:", error);
    }
  };

  // Delete message
  const deleteMessage = async (messageId: string) => {
    try {
      await axiosInstance.delete(`/channels/${channel.id}/messages/${messageId}`);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  // Add reaction
  const addReaction = async (messageId: string, emoji: string) => {
    try {
      await axiosInstance.post(`/channels/${channel.id}/messages/${messageId}/reactions`, {
        emoji
      });
      
      // Update local state
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const existingReactions = msg.reactions || [];
          const reactionIndex = existingReactions.findIndex(r => r.emoji === emoji);
          
          if (reactionIndex >= 0) {
            // Update existing reaction
            const updatedReactions = [...existingReactions];
            updatedReactions[reactionIndex] = {
              ...updatedReactions[reactionIndex],
              users: [...updatedReactions[reactionIndex].users, { 
                user_id: user?.id || '', 
                user_role: user?.role || 'student',
                created_at: new Date().toISOString()
              }],
              count: updatedReactions[reactionIndex].count + 1
            };
            return { ...msg, reactions: updatedReactions };
          } else {
            // Add new reaction
            return { 
              ...msg, 
              reactions: [...existingReactions, {
                emoji,
                users: [{ 
                  user_id: user?.id || '', 
                  user_role: user?.role || 'student',
                  created_at: new Date().toISOString()
                }],
                count: 1
              }]
            };
          }
        }
        return msg;
      }));
    } catch (error) {
      console.error("Failed to add reaction:", error);
    }
  };

  // WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const wsUrl = `ws://localhost:8000/channels/ws?token=${token}`;
      const websocket = new WebSocket(wsUrl);

      websocket.onopen = () => {
        console.log("WebSocket connected");
        setWs(websocket);
        
        // Join channel
        websocket.send(JSON.stringify({
          type: "join_channel",
          channel_id: channel.id
        }));
      };

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case "new_message":
            setMessages(prev => [...prev, data.data.message]);
            break;
          case "typing":
            if (data.data.user_id !== user?.id) {
              setTypingUsers(prev => {
                if (data.data.is_typing) {
                  return [...prev.filter(id => id !== data.data.user_id), data.data.user_id];
                } else {
                  return prev.filter(id => id !== data.data.user_id);
                }
              });
            }
            break;
          case "user_joined":
          case "user_left":
            // Handle user presence updates
            break;
        }
      };

      websocket.onclose = () => {
        console.log("WebSocket disconnected");
        setWs(null);
        // Reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      setWs(websocket);
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [channel.id, user?.id]);

  // Handle typing
  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (!isTyping && value.trim()) {
      setIsTyping(true);
      if (ws) {
        ws.send(JSON.stringify({
          type: "typing",
          channel_id: channel.id,
          is_typing: true
        }));
      }
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (ws) {
        ws.send(JSON.stringify({
          type: "stop_typing",
          channel_id: channel.id,
          is_typing: false
        }));
      }
    }, 1000);
  };

  // Format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    fetchMessages();
  }, [channel.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingMessage) {
        editMessage(editingMessage.id, newMessage);
      } else {
        sendMessage();
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <Card className="rounded-none border-b border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {channel.is_private ? (
                  <Lock className="w-5 h-5 text-amber-500" />
                ) : (
                  <Hash className="w-5 h-5 text-muted-foreground" />
                )}
                <CardTitle className="text-lg">{channel.name}</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs">
                {channel.channel_type}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{channel.member_count}</span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Channel Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Pin className="w-4 h-4 mr-2" />
                    Pinned Messages
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onClose}>
                    Close Channel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {channel.description && (
            <p className="text-sm text-muted-foreground">{channel.description}</p>
          )}
        </CardHeader>
      </Card>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
                      <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {messages.map((message, index) => {
                  const showDate = index === 0 || 
                    formatDate(messages[index - 1].created_at) !== formatDate(message.created_at);
                  
                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="text-center my-4">
                          <Badge variant="outline" className="text-xs">
                            {formatDate(message.created_at)}
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex gap-3 group hover:bg-muted/30 p-2 rounded-lg transition-colors">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(message.sender_name || message.sender_id)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-card-foreground">
                              {message.sender_name || message.sender_id}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(message.created_at)}
                            </span>
                            {message.is_edited && (
                              <Badge variant="outline" className="text-xs">
                                edited
                              </Badge>
                            )}
                          </div>
                          
                          {message.reply_to && (
                            <div className="mb-2 p-2 bg-muted/50 rounded border-l-2 border-primary/30">
                              <div className="text-xs text-muted-foreground">
                                Replying to {message.reply_to.sender_name || message.reply_to.sender_id}
                              </div>
                              <div className="text-sm truncate">
                                {message.reply_to.content}
                              </div>
                            </div>
                          )}
                          
                          <div className="text-sm text-card-foreground">
                            {message.content}
                          </div>
                          
                          {message.file_url && (
                            <div className="mt-2 p-2 bg-muted/50 rounded">
                              <div className="flex items-center gap-2">
                                <Paperclip className="w-4 h-4" />
                                <span className="text-sm">{message.file_name}</span>
                                <Button variant="ghost" size="sm">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          {/* Reactions */}
                          {message.reactions && message.reactions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {message.reactions.map((reaction, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => addReaction(message.id, reaction.emoji)}
                                >
                                  {reaction.emoji} {reaction.count}
                                </Button>
                              ))}
                            </div>
                          )}
                          
                          {/* Message Actions */}
                          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => addReaction(message.id, "👍")}
                            >
                              👍
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => addReaction(message.id, "❤️")}
                            >
                              ❤️
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => setReplyTo(message)}
                            >
                              <Reply className="w-3 h-3 mr-1" />
                              Reply
                            </Button>
                            
                            {message.sender_id === user?.id && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => {
                                    setEditingMessage(message);
                                    setNewMessage(message.content || "");
                                  }}
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs text-destructive"
                                  onClick={() => deleteMessage(message.id)}
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Delete
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span>
                      {typingUsers.length === 1 
                        ? "Someone is typing..." 
                        : `${typingUsers.length} people are typing...`
                      }
                    </span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Reply Preview */}
      {replyTo && (
        <div className="p-3 bg-muted/50 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Replying to {replyTo.sender_name || replyTo.sender_id}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyTo(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-sm truncate mt-1">
            {replyTo.content}
          </div>
        </div>
      )}

      {/* Message Input */}
      <Card className="rounded-none border-t border-border">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Textarea
                value={newMessage}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message #${channel.name}`}
                className="min-h-[40px] max-h-[120px] resize-none bg-background border-input"
                disabled={sending}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={sending}
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={sending}
              >
                <Smile className="w-4 h-4" />
              </Button>
              <Button
                onClick={editingMessage ? () => editMessage(editingMessage.id, newMessage) : sendMessage}
                disabled={sending || (!newMessage.trim() && !replyTo)}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

