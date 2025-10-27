import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { FeedbackData, ratingColors, ratingLabels } from "./types";

interface RatingBreakdownProps {
  data: FeedbackData[];
}

export default function RatingBreakdown({ data }: RatingBreakdownProps) {
  const grouped = [1, 2, 3, 4, 5].map(r => ({
    rating: r,
    count: data.filter(item => item.rating === r).length,
    label: ratingLabels[r - 1],
    percentage: data.length > 0 ? ((data.filter(item => item.rating === r).length / data.length) * 100).toFixed(1) : '0'
  }));

  const totalRatings = data.length;

  return (
    totalRatings > 0 && (
      <Card className="overflow-hidden border border-border shadow-xl bg-card">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="text-2xl font-bold text-card-foreground">Detailed Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {grouped.reverse().map((item, index) => (
              <div key={item.rating} className="group p-4 rounded-xl hover:bg-muted/30 transition-all duration-300">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 min-w-[120px]">
                    <div className="w-12 h-12 flex items-center justify-center font-bold text-lg text-primary-foreground bg-primary rounded-full shadow-lg">
                      {item.rating}
                    </div>
                    <Star size={20} className="text-amber-500 fill-amber-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-semibold text-card-foreground">{item.label}</span>
                      <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border">
                        {item.count} responses ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full shadow-inner overflow-hidden">
                      <div 
                        className="h-full transition-all duration-1000 ease-out rounded-full shadow-sm"
                        style={{ 
                          width: `${item.percentage}%`,
                          background: `linear-gradient(90deg, ${ratingColors[item.rating - 1]}, ${ratingColors[item.rating - 1]}dd)`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  );
}