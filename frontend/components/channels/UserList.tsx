"use client";

import { useState, useEffect } from "react";
import { Search, UserPlus, Users, GraduationCap, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface User {
  id: string;
  name: string;
  email?: string;
  usn?: string;
  role: "student" | "professor";
  department?: string;
  year?: number;
  avatar_url?: string;
}

interface UserListProps {
  onInviteUser: (userId: string, userName: string) => void;
  channelId: string;
  currentUserRole: "MEMBER" | "MODERATOR" | "ADMIN" | "OWNER";
}

export default function UserList({ onInviteUser, channelId, currentUserRole }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/users/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.usn?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleInviteUser = (user: User) => {
    onInviteUser(user.id, user.name);
  };

  const canInviteUsers = currentUserRole === "ADMIN" || currentUserRole === "OWNER";

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Campus Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading users...</div>
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
          Campus Users
        </CardTitle>
        <p className="text-sm text-gray-600">
          {canInviteUsers ? "Invite users to join this channel" : "View campus users"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users by name, email, or USN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="professor">Professors</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No users found matching your criteria
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>
                      {user.role === "student" ? (
                        <GraduationCap className="h-5 w-5" />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-600">
                      {user.email || user.usn}
                      {user.department && ` • ${user.department}`}
                      {user.year && ` • Year ${user.year}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={user.role === "student" ? "secondary" : "default"}>
                    {user.role === "student" ? "Student" : "Professor"}
                  </Badge>

                  {canInviteUsers && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleInviteUser(user)}
                      className="flex items-center gap-1"
                    >
                      <UserPlus className="h-4 w-4" />
                      Invite
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        <div className="pt-3 border-t">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total Users: {users.length}</span>
            <span>Showing: {filteredUsers.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
