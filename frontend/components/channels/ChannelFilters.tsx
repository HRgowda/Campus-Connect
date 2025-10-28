"use client";

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChannelFiltersProps {
  onSearchChange: (search: string) => void;
  onTypeFilter: (type: string) => void;
  onPrivacyFilter: (privacy: string) => void;
  onClearFilters: () => void;
  searchQuery: string;
  typeFilter: string;
  privacyFilter: string;
}

const channelTypes = [
  { value: "all", label: "All Types" },
  { value: "GENERAL", label: "General" },
  { value: "ACADEMIC", label: "Academic" },
  { value: "PROJECT", label: "Project" },
  { value: "ANNOUNCEMENT", label: "Announcement" },
  { value: "STUDY_GROUP", label: "Study Group" },
  { value: "CLUB", label: "Club" },
  { value: "DEPARTMENT", label: "Department" },
];

const privacyOptions = [
  { value: "all", label: "All Channels" },
  { value: "public", label: "Public Only" },
  { value: "private", label: "Private Only" },
];

export default function ChannelFilters({
  onSearchChange,
  onTypeFilter,
  onPrivacyFilter,
  onClearFilters,
  searchQuery,
  typeFilter,
  privacyFilter,
}: ChannelFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = 
    searchQuery !== "" || 
    typeFilter !== "all" || 
    privacyFilter !== "all";

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search channels..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1">
              {[searchQuery, typeFilter, privacyFilter].filter(
                (filter) => filter !== "" && filter !== "all"
              ).length}
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Channel Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Channel Type
              </label>
              <Select value={typeFilter} onValueChange={onTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {channelTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Privacy Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Privacy
              </label>
              <Select value={privacyFilter} onValueChange={onPrivacyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select privacy" />
                </SelectTrigger>
                <SelectContent>
                  {privacyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Active Filters
              </label>
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: "{searchQuery}"
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => onSearchChange("")}
                    />
                  </Badge>
                )}
                {typeFilter !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Type: {channelTypes.find(t => t.value === typeFilter)?.label}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => onTypeFilter("all")}
                    />
                  </Badge>
                )}
                {privacyFilter !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Privacy: {privacyOptions.find(p => p.value === privacyFilter)?.label}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => onPrivacyFilter("all")}
                    />
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
