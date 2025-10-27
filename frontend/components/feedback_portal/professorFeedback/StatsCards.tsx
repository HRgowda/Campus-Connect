import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Star, Users, Calendar } from "lucide-react";
import { FeedbackData, ratingColors, ratingLabels } from "./types";

interface StatsCardsProps {
  data: FeedbackData[];
}

export default function StatsCards({ data }: StatsCardsProps) {
  const totalRatings = data.length;
  const averageRating = totalRatings > 0 
    ? (data.reduce((sum, item) => sum + item.rating, 0) / totalRatings).toFixed(1)
    : '0.0';

  const grouped = [1, 2, 3, 4, 5].map(r => ({
    rating: r,
    count: data.filter(item => item.rating === r).length,
    label: ratingLabels[r - 1],
    percentage: data.length > 0 ? ((data.filter(item => item.rating === r).length / data.length) * 100).toFixed(1) : '0'
  }));

  const highestRating = Math.max(...grouped.map(g => g.count));
  const mostCommonRating = grouped.find(g => g.count === highestRating);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border border-border transition-all duration-300 bg-card hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reviews</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-card-foreground">{totalRatings}</div>
          <div className="flex items-center gap-1 mt-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">All time</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border transition-all duration-300 bg-card hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-card-foreground">{averageRating}</div>
          <div className="flex items-center gap-1 mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  size={14} 
                  className={`${star <= Math.round(parseFloat(averageRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">out of 5</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border transition-all duration-300 bg-card hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Most Common</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-card-foreground">{mostCommonRating?.rating || 'N/A'} ⭐</div>
          <div className="mt-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
              {mostCommonRating?.label || 'No data'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border transition-all duration-300 bg-card hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Satisfaction Rate</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-card-foreground">
            {totalRatings > 0 ? Math.round((data.filter(item => item.rating >= 4).length / totalRatings) * 100) : 0}%
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            4+ star ratings
          </div>
        </CardContent>
      </Card>
    </div>
  );
}