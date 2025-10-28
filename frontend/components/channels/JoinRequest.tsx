"use client";

import { useState } from "react";
import { Send, MessageSquare, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface JoinRequestProps {
  channelId: string;
  channelName: string;
  isPrivate: boolean;
  onJoinRequest: (message: string) => void;
}

export default function JoinRequest({ channelId, channelName, isPrivate, onJoinRequest }: JoinRequestProps) {
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      await onJoinRequest(message);
      setMessage("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error sending join request:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isPrivate) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <MessageSquare className="h-4 w-4 mr-2" />
            Request to Join
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request to Join {channelName}</DialogTitle>
            <DialogDescription>
              This is a private channel. Send a message to the channel admins explaining why you'd like to join.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Message to Admins</label>
              <Textarea
                placeholder="Tell the admins why you'd like to join this channel..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !message.trim()}>
              {loading ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Join {channelName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This is a public channel. You can join directly or send a message to the admins.
          </p>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Optional Message</label>
            <Textarea
              placeholder="Add a message for the channel admins (optional)..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => onJoinRequest("")} 
              disabled={loading}
              className="flex-1"
            >
              <Users className="h-4 w-4 mr-2" />
              Join Directly
            </Button>
            
            {message.trim() && (
              <Button 
                onClick={handleSubmit} 
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Request
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
