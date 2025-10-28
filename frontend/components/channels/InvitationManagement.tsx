"use client";

import { useState, useEffect } from "react";
import { Check, X, Clock, UserPlus, Users, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Invitation {
  id: string;
  channel_id: string;
  invited_by_id: string;
  invited_user_id: string;
  status: string;
  invite_type: string;
  message?: string;
  created_at: string;
  updated_at: string;
}

interface InvitationManagementProps {
  channelId: string;
  currentUserRole: "MEMBER" | "MODERATOR" | "ADMIN" | "OWNER";
}

export default function InvitationManagement({ channelId, currentUserRole }: InvitationManagementProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchInvitations();
  }, [channelId]);

  const fetchInvitations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/channels/${channelId}/invites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      }
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteAction = async (inviteId: string, action: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/channels/invites/${inviteId}/action`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        // Refresh invitations
        fetchInvitations();
      }
    } catch (error) {
      console.error("Error handling invite action:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: Clock, text: "Pending" },
      approved: { variant: "default" as const, icon: Check, text: "Approved" },
      rejected: { variant: "destructive" as const, icon: X, text: "Rejected" },
      accepted: { variant: "default" as const, icon: Check, text: "Accepted" },
      declined: { variant: "destructive" as const, icon: X, text: "Declined" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getInviteTypeBadge = (type: string) => {
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        {type === "invitation" ? <UserPlus className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
        {type === "invitation" ? "Invitation" : "Join Request"}
      </Badge>
    );
  };

  const filteredInvitations = invitations.filter(invite => 
    statusFilter === "all" || invite.status === statusFilter
  );

  const canManageInvites = currentUserRole === "ADMIN" || currentUserRole === "OWNER";

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invitation Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading invitations...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Invitation Management
        </CardTitle>
        <p className="text-sm text-gray-600">
          {canManageInvites ? "Manage channel invitations and join requests" : "View channel invitations"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter */}
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Invitations List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredInvitations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No invitations found
            </div>
          ) : (
            filteredInvitations.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      <UserPlus className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="font-medium">
                      {invite.invite_type === "invitation" ? "Invitation" : "Join Request"}
                    </div>
                    <div className="text-sm text-gray-600">
                      {invite.message || "No message provided"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(invite.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getInviteTypeBadge(invite.invite_type)}
                  {getStatusBadge(invite.status)}

                  {canManageInvites && invite.status === "pending" && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInviteAction(invite.id, "approve")}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInviteAction(invite.id, "reject")}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        <div className="pt-3 border-t">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total Invitations: {invitations.length}</span>
            <span>Showing: {filteredInvitations.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
