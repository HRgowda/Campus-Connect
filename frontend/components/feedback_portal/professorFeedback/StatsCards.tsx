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
      <Card className="border-0  transition-all duration-300 bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-400">Total Reviews</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-blue-900/50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-100">{totalRatings}</div>
          <div className="flex items-center gap-1 mt-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">All time</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0  transition-all duration-300 bg-gradient-to-br from-amber-900/50 to-orange-900/50 hover:from-amber-800/60 hover:to-orange-800/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-amber-400">Average Rating</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-yellow-900/50 flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-amber-200">{averageRating}</div>
          <div className="flex items-center gap-1 mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  size={14} 
                  className={`${star <= Math.round(parseFloat(averageRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                />
              ))}
            </div>
            <span className="text-sm text-amber-400">out of 5</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0  transition-all duration-300 bg-gradient-to-br from-emerald-900/50 to-green-900/50 hover:from-emerald-800/60 hover:to-green-800/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-emerald-400">Most Common</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-green-900/50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-emerald-200">{mostCommonRating?.rating || 'N/A'} ⭐</div>
          <div className="mt-2">
            <Badge variant="secondary" className="bg-green-900/50 text-green-300 hover:bg-green-800/60 border-0">
              {mostCommonRating?.label || 'No data'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0  transition-all duration-300 bg-gradient-to-br from-purple-900/50 to-indigo-900/50 hover:from-purple-800/60 hover:to-indigo-800/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-purple-400">Satisfaction Rate</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-purple-900/50 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-gray-200"></div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-200">
            {totalRatings > 0 ? Math.round((data.filter(item => item.rating >= 4).length / totalRatings) * 100) : 0}%
          </div>
          <div className="text-sm text-purple-400 mt-2">
            4+ star ratings
          </div>
        </CardContent>
      </Card>
    </div>
  );
}