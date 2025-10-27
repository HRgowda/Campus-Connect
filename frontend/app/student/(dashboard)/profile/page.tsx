"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { useAtom } from "jotai";
import { userAtom } from "@/app/atoms/atoms";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Mail,
  CreditCard,
  Linkedin,
  Github,
  Globe,
  ExternalLink,
  MapPin,
  Edit,
  Plus,
  X,
  AlertCircle,
} from "lucide-react";

interface Website {
  id?: string;
  name: string;
  url: string;
}

interface ProfileData {
  name?: string;
  email?: string;
  usn?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  websites?: Website[];
  skills?: string[];
}

export interface UserAtomType {
  id: string;
  name: string;
  email: string | undefined;
  role: string;
}

interface ProfileComponentProps {
  profileData?: ProfileData;
}

const ProfileComponent: React.FC<ProfileComponentProps> = ({ profileData: propProfileData }) => {
  const [user] = useAtom(userAtom);
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [isEditing, setIsEditing] = useState(false);
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  
  // Form state for editing
  const [formData, setFormData] = useState({
    bio: "",
    location: "",
    skills: [] as string[],
    websites: [] as Website[],
  });
  
  // Temporary state for adding new items
  const [newSkill, setNewSkill] = useState("");
  const [newWebsite, setNewWebsite] = useState({ name: "", url: "" });

  const getInitials = (name: string): string =>
    name
      .split(" ")
      .map((n) => n[0] ?? "")
      .join("")
      .toUpperCase();

  const openLink = (url?: string): void => {
    if (!url) return;
    window.open(String(url), "_blank", "noopener,noreferrer");
  };

  const handleEmailClick = (): void => {
    if (profileData.email) {
      window.location.href = `mailto:${profileData.email}`;
    }
  };

  // Fetch profile data from backend
  const fetchProfileData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/profile/student`);
      const data = response.data;
      
      setProfileData({
        name: data.student?.name || user.name,
        email: data.student?.email || user.email || undefined,
        usn: data.student?.usn,
        avatar: data.avatar,
        bio: data.bio,
        location: data.location,
        linkedin: data.linkedin,
        github: data.github,
        websites: data.websites || [],
        skills: data.skills || [],
      });
      
      // Initialize form data
      setFormData({
        bio: data.bio || "",
        location: data.location || "",
        skills: data.skills || [],
        websites: data.websites || [],
      });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      // Initialize with user data if fetch fails
      setProfileData({
        name: user.name,
        email: user.email || undefined,
      });
      setFormData({
        bio: "",
        location: "",
        skills: [],
        websites: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user?.id]);

  // Create payload shape required by backend and POST
  const handleSaveProfile = async () => {
    setMessage(null);
    if (!user?.id) {
      setMessage("No user id found. Please sign in.");
      return;
    }

    // Build the payload exactly as backend expects
    const payload = {
      bio: formData.bio || null,
      location: formData.location || null,
      skills: formData.skills || [],
      linkedin: profileData.linkedin || null,
      github: profileData.github || null,
      avatar: profileData.avatar || null,
    };

    try {
      setPosting(true);
      const res = await axiosInstance.put("/profile/student", payload);

      // Update profile data with response
      const resData = res.data ?? {};
      const updatedProfileData = {
        ...profileData,
        bio: resData.bio,
        location: resData.location,
        skills: resData.skills || [],
        linkedin: resData.linkedin,
        github: resData.github,
        avatar: resData.avatar,
      };

      setProfileData(updatedProfileData);
      setIsEditing(false);
      setMessage("Profile saved successfully.");
    } catch (err: any) {
      console.error("Failed to save profile:", err);
      const errMsg = err?.response?.data?.detail ?? err?.message ?? "Unknown error";
      setMessage(`Failed to save profile: ${errMsg}`);
    } finally {
      setPosting(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addWebsite = async () => {
    if (newWebsite.name.trim() && newWebsite.url.trim()) {
      try {
        const response = await axiosInstance.post("/profile/student/websites", {
          name: newWebsite.name.trim(),
          url: newWebsite.url.trim()
        });
        
        const newWebsiteData = response.data;
        setFormData(prev => ({
          ...prev,
          websites: [...(prev.websites || []), newWebsiteData]
        }));
        setProfileData(prev => ({
          ...prev,
          websites: [...(prev.websites || []), newWebsiteData]
        }));
        setNewWebsite({ name: "", url: "" });
        setMessage("Website added successfully.");
      } catch (error) {
        console.error("Failed to add website:", error);
        setMessage("Failed to add website. Please try again.");
      }
    }
  };

  const removeWebsite = async (websiteId: string) => {
    if (!websiteId) {
      setMessage("Cannot remove website: missing ID");
      return;
    }
    
    try {
      await axiosInstance.delete(`/profile/student/websites/${websiteId}`);
      
      setFormData(prev => ({
        ...prev,
        websites: (prev.websites || []).filter(website => website.id !== websiteId)
      }));
      setProfileData(prev => ({
        ...prev,
        websites: (prev.websites || []).filter(website => website.id !== websiteId)
      }));
      setMessage("Website removed successfully.");
    } catch (error) {
      console.error("Failed to remove website:", error);
      setMessage("Failed to remove website. Please try again.");
    }
  };

  const isProfileComplete = () => {
    return !!(profileData.bio && profileData.location && profileData.skills && profileData.skills.length > 0);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file.');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('File size must be less than 5MB.');
      return;
    }

    try {
      setPosting(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post('/profile/student/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { avatar_url } = response.data;
      setProfileData(prev => ({
        ...prev,
        avatar: avatar_url
      }));
      setMessage('Avatar updated successfully.');
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      setMessage('Failed to upload avatar. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-gray-400">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="border border-border shadow-xl rounded-2xl overflow-hidden bg-card">
        <CardHeader className="text-center pb-4 pt-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-32 h-32 ring-4 ring-primary/20 rounded-full transition-transform hover:scale-105 shadow-lg">
                <AvatarImage src={profileData.avatar} alt={profileData.name} />
                <AvatarFallback className="text-2xl font-bold text-primary-foreground bg-gradient-to-br from-primary to-primary/80">
                  {getInitials(profileData.name || "User")}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="absolute -bottom-2 -right-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="avatar-upload"
                    disabled={posting}
                  />
                  <Button
                    size="icon"
                    className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    disabled={posting}
                  >
                    {posting ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Edit className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold text-card-foreground tracking-tight">
                {profileData.name || "Complete Your Profile"}
              </h1>
              {profileData.bio ? (
                <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                  {profileData.bio}
                </p>
              ) : (
                <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-full border border-amber-200">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Profile incomplete - Add your bio and details</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="rounded-full px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                  size="sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {isProfileComplete() ? "Edit Profile" : "Complete Profile"}
                </Button>
              ) : (
                <div className="flex gap-3">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={posting || !user?.id}
                    className="rounded-full px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                    size="sm"
                  >
                    {posting ? "Saving..." : "Save Profile"}
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    disabled={posting}
                    className="rounded-full px-6 py-2 border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                    size="sm"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {message && (
                <div className={`text-sm px-4 py-2 rounded-full ${
                  message.includes("successfully") 
                    ? "text-green-700 bg-green-50 border border-green-200" 
                    : "text-red-700 bg-red-50 border border-red-200"
                }`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 px-4 sm:px-6 py-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-card-foreground border-b border-border pb-3">
              Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profileData.email && (
                <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-xl border border-border hover:border-primary/30 transition-all duration-300 group">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Mail className="w-5 h-5 text-primary group-hover:text-primary/80" />
                  </div>
                  <button
                    onClick={handleEmailClick}
                    className="flex-1 text-left text-card-foreground hover:text-primary transition-colors duration-300 group"
                  >
                    <div className="text-sm font-medium">{profileData.email}</div>
                    <div className="text-xs text-muted-foreground">Email Address</div>
                  </button>
                </div>
              )}

              {profileData.usn && (
                <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-xl border border-border">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-card-foreground">USN: {profileData.usn}</div>
                    <div className="text-xs text-muted-foreground">Student ID</div>
                  </div>
                </div>
              )}

              {profileData.location && (
                <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-xl border border-border">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-card-foreground">{profileData.location}</div>
                    <div className="text-xs text-muted-foreground">Location</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Profile Completion Form */}
          {isEditing && (
            <div className="space-y-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-card-foreground border-b border-border pb-3">
                Profile Details
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Bio */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-card-foreground">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself, your interests, and what you're passionate about..."
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                      rows={4}
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-card-foreground">Location</label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, Country"
                      className="bg-background border-input text-foreground"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">

                  {/* Skills */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-card-foreground">Skills</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs font-medium px-3 py-1 rounded-full border border-primary/30 hover:border-destructive hover:text-destructive bg-primary/5 hover:bg-destructive/5 transition-colors duration-300 cursor-pointer"
                          onClick={() => removeSkill(skill)}
                        >
                          {skill}
                          <X className="w-3 h-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill"
                        className="bg-background border-input text-foreground flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <Button
                        onClick={addSkill}
                        size="sm"
                        variant="outline"
                        className="px-3"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Websites */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-card-foreground">Personal Websites</label>
                    <div className="space-y-2 mb-3">
                      {formData.websites.map((website, index) => (
                        <div key={website.id || index} className="flex items-center gap-2 p-3 border border-border rounded-lg bg-muted/30">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-card-foreground">{website.name}</div>
                            <div className="text-xs text-muted-foreground">{website.url}</div>
                          </div>
                          <Button
                            onClick={() => website.id && removeWebsite(website.id)}
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                            disabled={!website.id}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input
                        value={newWebsite.name}
                        onChange={(e) => setNewWebsite(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Website name"
                        className="bg-background border-input text-foreground"
                      />
                      <Input
                        value={newWebsite.url}
                        onChange={(e) => setNewWebsite(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="Website URL"
                        className="bg-background border-input text-foreground"
                      />
                    </div>
                    <Button
                      onClick={addWebsite}
                      size="sm"
                      variant="outline"
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Website
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Display Sections (when not editing) */}
          {!isEditing && (
            <>
              {/* Social Profiles */}
              {(profileData.linkedin || profileData.github) && (
                <div className="space-y-6">
                  <h2 className="text-xl sm:text-2xl font-semibold text-card-foreground border-b border-border pb-3">
                    Social Profiles
                  </h2>

                  <div className="flex flex-wrap gap-4">
                    {profileData.linkedin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openLink(profileData.linkedin)}
                        className="flex items-center space-x-2 rounded-full px-6 py-3 border border-primary/30 hover:border-primary hover:text-primary bg-primary/5 hover:bg-primary/10 transition-all duration-300"
                      >
                        <Linkedin className="w-4 h-4" />
                        <span>LinkedIn</span>
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}

                    {profileData.github && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openLink(profileData.github)}
                        className="flex items-center space-x-2 rounded-full px-6 py-3 border border-border hover:border-primary hover:text-primary bg-muted/30 hover:bg-primary/5 transition-all duration-300"
                      >
                        <Github className="w-4 h-4" />
                        <span>GitHub</span>
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Other Websites */}
              {profileData.websites && profileData.websites.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-xl sm:text-2xl font-semibold text-card-foreground border-b border-border pb-3">
                    Personal Websites
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profileData.websites.map((website, index) => (
                      <Button
                        key={website.id || index}
                        variant="outline"
                        size="sm"
                        onClick={() => openLink(website.url)}
                        className="flex items-center justify-between w-full rounded-lg px-4 py-3 border border-border hover:border-primary hover:text-primary bg-muted/30 hover:bg-primary/5 transition-all duration-300"
                      >
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4" />
                          <span className="text-sm font-medium">{website.name}</span>
                        </div>
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {profileData.skills && profileData.skills.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-xl sm:text-2xl font-semibold text-card-foreground border-b border-border pb-3">
                    Skills & Expertise
                  </h2>

                  <div className="flex flex-wrap gap-3">
                    {profileData.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-sm font-medium px-4 py-2 rounded-full border border-primary/30 hover:border-primary hover:text-primary bg-primary/5 hover:bg-primary/10 transition-colors duration-300"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileComponent;