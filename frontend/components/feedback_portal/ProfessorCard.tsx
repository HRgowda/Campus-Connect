"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, User, Star } from "lucide-react";

interface ProfessorCardProps {
  name: string;
  email: string;
  onFeedbackClick: () => void;
}

export const ProfessorCard = ({ name, email, onFeedbackClick }: ProfessorCardProps) => {
  const initials = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);

  return (
    <Card className="group relative border-2 border-dashed border-muted hover:border-solid hover:border-primary/20 rounded-3xl shadow-lg transition-all duration-500 w-full max-w-sm overflow-hidden mt-6">  
      
      <CardContent className="relative p-8 space-y-6">
        {/* Header with avatar and status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl border-2 border-dashed border-muted-foreground/30 group-hover:border-primary/50 flex items-center justify-center font-bold text-xl transition-all duration-300 group-hover:scale-110">
                {initials}
              </div>
            </div>
          </div>
          
          <Badge variant="outline" className="text-xs font-medium border-dashed">
            <Star className="w-3 h-3 mr-1" />
            Professor
          </Badge>
        </div>

        {/* Professor info */}
        <div className="space-y-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors duration-300">
              {name}
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              Faculty Member
            </p>
          </div>
          
          <div className="flex items-center space-x-2 p-3 rounded-xl border border-dashed border-muted-foreground/20 group-hover:border-muted-foreground/40 transition-all duration-300">
            <Mail size={14} className="text-muted-foreground" />
            <p className="text-sm font-medium truncate flex-1">{email}</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex space-x-4">
            <div className="text-center">
              <div className="text-lg font-bold">4.8</div>
              <div className="text-xs text-muted-foreground">Rating</div>
            </div>
            <div className="w-px h-8 border-l border-dashed border-muted-foreground/30" />
            <div className="text-center">
              <div className="text-lg font-bold">127</div>
              <div className="text-xs text-muted-foreground">Reviews</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={12} 
                className={`${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`}
              />
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="relative p-8 pt-0">
        <Button
          onClick={onFeedbackClick}
          size="lg"
          className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white w-full group/button relative overflow-hidden rounded-2xl h-14 font-semibold text-base shadow-lg cursor-pointer transition-all duration-300 border-2 border-transparent hover:border-primary/20"
        >
          <div className="relative flex items-center justify-center space-x-3">
            <MessageSquare size={20} className="group-hover/button:scale-110 transition-transform duration-200" />
            <span>Share Your Experience</span>
          </div>
        </Button>
      </CardFooter>
      
    </Card>
  );
};