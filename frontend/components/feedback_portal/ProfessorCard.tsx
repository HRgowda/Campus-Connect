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
    <Card className="group relative border border-border hover:border-primary/30 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 w-full max-w-sm overflow-hidden bg-card">  
      
      <CardContent className="relative p-6 space-y-4">
        {/* Header with avatar and status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 group-hover:border-primary/40 flex items-center justify-center font-bold text-lg text-primary transition-all duration-300 group-hover:scale-110">
                {initials}
              </div>
            </div>
          </div>
          
          <Badge variant="secondary" className="text-xs font-medium bg-primary/10 text-primary border-primary/20">
            <Star className="w-3 h-3 mr-1" />
            Professor
          </Badge>
        </div>

        {/* Professor info */}
        <div className="space-y-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors duration-300 text-card-foreground">
              {name}
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              Faculty Member
            </p>
          </div>
          
          <div className="flex items-center space-x-2 p-3 rounded-lg border border-border group-hover:border-primary/20 transition-all duration-300 bg-muted/30">
            <Mail size={14} className="text-muted-foreground" />
            <p className="text-sm font-medium truncate flex-1 text-card-foreground">{email}</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex space-x-4">
            <div className="text-center">
              <div className="text-lg font-bold text-card-foreground">4.8</div>
              <div className="text-xs text-muted-foreground">Rating</div>
            </div>
            <div className="w-px h-8 border-l border-border" />
            <div className="text-center">
              <div className="text-lg font-bold text-card-foreground">127</div>
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

      <CardFooter className="relative p-6 pt-0">
        <Button
          onClick={onFeedbackClick}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground w-full group/button relative overflow-hidden rounded-xl h-12 font-semibold text-sm shadow-sm cursor-pointer transition-all duration-300"
        >
          <div className="relative flex items-center justify-center space-x-2">
            <MessageSquare size={18} className="group-hover/button:scale-110 transition-transform duration-200" />
            <span>Share Your Experience</span>
          </div>
        </Button>
      </CardFooter>
      
    </Card>
  );
};