export interface FeedbackData {
  rating: number;
  createdAt: string;
}

export const ratingColors = [
  "#ef4444", // red-500 for rating 1
  "#f97316", // orange-500 for rating 2
  "#eab308", // yellow-500 for rating 3
  "#22c55e", // green-500 for rating 4
  "#10b981"  // emerald-500 for rating 5
];

export const ratingLabels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];