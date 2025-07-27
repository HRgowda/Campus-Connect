import { BarChart3 } from "lucide-react";

export default function FeedbackHeader() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-gray-100" />
        </div>
        <div>
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
            Feedback Analytics
          </h1>
          <p className="text-gray-400 text-xl font-medium mt-1">Insights into your teaching performance</p>
        </div>
      </div>
    </div>
  );
}