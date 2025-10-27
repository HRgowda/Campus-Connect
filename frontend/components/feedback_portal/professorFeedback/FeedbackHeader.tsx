import { BarChart3 } from "lucide-react";

export default function FeedbackHeader() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Feedback Analytics
          </h1>
          <p className="text-muted-foreground text-lg font-medium mt-1">Insights into your teaching performance</p>
        </div>
      </div>
    </div>
  );
}