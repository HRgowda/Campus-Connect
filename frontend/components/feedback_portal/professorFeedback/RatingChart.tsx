import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";
import { FeedbackData, ratingColors, ratingLabels } from "./types";

interface RatingChartProps {
  data: FeedbackData[];
}

export default function RatingChart({ data }: RatingChartProps) {
  const grouped = [1, 2, 3, 4, 5].map(r => ({
    rating: r,
    count: data.filter(item => item.rating === r).length,
    label: ratingLabels[r - 1],
    percentage: data.length > 0 ? ((data.filter(item => item.rating === r).length / data.length) * 100).toFixed(1) : '0'
  }));

  const totalRatings = data.length;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800/90 !important rounded-2xl p-6 border border-gray-700 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 size={20} className="text-yellow-400 fill-yellow-400" />
            <span className="font-bold text-lg text-gray-100">{data.label}</span>
          </div>
          <p className="text-gray-300 mb-2">Rating: {label} stars</p>
          <p className="font-bold text-2xl text-gray-100 mb-1">{payload[0].value} responses</p>
          <p className="text-gray-400">{data.percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden border border-white/50 shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-bold text-gray-100">Rating Distribution</CardTitle>
            <p className="text-gray-400 mt-2 text-lg">Breakdown of all feedback ratings</p>
          </div>
          <Badge className="bg-gradient-to-r from-indigo-600 to-purple-700 text-gray-100 border-0 px-4 py-2 text-sm font-semibold shadow-lg">
            {totalRatings} Total Reviews
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-8 pb-8">
        {totalRatings > 0 ? (
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={grouped} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <XAxis 
                dataKey="rating" 
                tickFormatter={(value) => `${value} ⭐`}
                className="text-sm"
                tick={{ fill: '#9ca3af' }}
              />
              <YAxis 
                className="text-sm" 
                tick={{ fill: '#9ca3af' }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar 
                dataKey="count" 
                radius={[12, 12, 0, 0]}
                className="drop-shadow-lg"
              >
                {grouped.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={ratingColors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-96 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl pointer-events-none">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-800 to-purple-800 flex items-center justify-center mx-auto shadow-lg">
                <BarChart3 className="w-10 h-10 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-100">No feedback yet</h3>
                <p className="text-gray-400 text-lg mt-2">Ratings will appear here once students provide feedback</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}