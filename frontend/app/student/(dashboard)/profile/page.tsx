"use client";

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Mail, 
  User, 
  CreditCard, 
  Linkedin, 
  Github, 
  Globe, 
  ExternalLink,
  MapPin
} from 'lucide-react';

// Type definitions
interface Website {
  name: string;
  url: string;
}

interface ProfileData {
  name: string;
  email: string;
  usn: string;
  avatar?: string;
  bio?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  websites?: Website[];
  skills?: string[];
}

interface ProfileComponentProps {
  profileData?: ProfileData;
}

const ProfileComponent: React.FC<ProfileComponentProps> = ({ profileData: propProfileData }) => {
  // Default profile data
  const defaultProfileData: ProfileData = {
    name: "John Doe",
    email: "john.doe@example.com",
    usn: "USN123456789",
    avatar: "", // Empty for fallback
    bio: "Full-stack developer passionate about creating innovative solutions and contributing to open-source projects.",
    location: "San Francisco, CA",
    linkedin: "https://linkedin.com/in/johndoe",
    github: "https://github.com/johndoe",
    websites: [
      { name: "Portfolio", url: "https://johndoe.dev" },
      { name: "Blog", url: "https://blog.johndoe.dev" },
      { name: "Company", url: "https://mycompany.com" }
    ],
    skills: ["React", "Node.js", "TypeScript", "Python", "AWS"]
  };

  const profileData = propProfileData || defaultProfileData;

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase();
  };

  const openLink = (url: string): void => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleEmailClick = (): void => {
    window.location.href = `mailto:${profileData.email}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="text-center pb-6 pt-8">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-28 h-28 ring-4 ring-gray-100 rounded-full transition-transform hover:scale-105">
              <AvatarImage src={profileData.avatar} alt={profileData.name} />
              <AvatarFallback className="text-xl font-semibold text-gray-700 bg-gray-50">
                {getInitials(profileData.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{profileData.name}</h1>
              {profileData.bio && (
                <p className="text-gray-600 text-base max-w-lg mx-auto leading-relaxed">{profileData.bio}</p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 px-4 sm:px-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Contact Information</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleEmailClick}
                className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors duration-200 group"
              >
                <Mail className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                <span className="text-sm font-medium">{profileData.email}</span>
              </button>
              
              <div className="flex items-center space-x-3 text-gray-700">
                <CreditCard className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium">USN: {profileData.usn}</span>
              </div>
              
              {profileData.location && (
                <div className="flex items-center space-x-3 text-gray-700">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium">{profileData.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Social Profiles */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Social Profiles</h2>
            
            <div className="flex flex-wrap gap-3">
              {profileData.linkedin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openLink(profileData.linkedin!)}
                  className="flex items-center space-x-2 rounded-full px-4 py-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-200"
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
                  onClick={() => openLink(profileData.github!)}
                  className="flex items-center space-x-2 rounded-full px-4 py-2 border-gray-300 hover:border-gray-900 hover:text-gray-900 transition-all duration-200"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Other Websites */}
          {profileData.websites && profileData.websites.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Other Websites</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profileData.websites.map((website: Website, index: number) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => openLink(website.url)}
                    className="flex items-center justify-between w-full rounded-lg px-4 py-2 border-gray-300 hover:border-gray-500 hover:text-gray-700 transition-all duration-200"
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
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Skills</h2>
              
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs font-medium px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors duration-200"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileComponent;