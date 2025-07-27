"use client"

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { useAtom } from "jotai";
import { userAtom } from "@/app/atoms/atoms";
import FeedbackHeader from "@/components/feedback_portal/professorFeedback/FeedbackHeader";
import StatsCards from "@/components/feedback_portal/professorFeedback/StatsCards";
import RatingChart from "@/components/feedback_portal/professorFeedback/RatingChart";
import RatingBreakdown from "@/components/feedback_portal/professorFeedback/RatingBreakdown";
import { FeedbackData } from "@/components/feedback_portal/professorFeedback/types";

export default function ProfessorFeedbackPage() {
  const [data, setData] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [user] = useAtom(userAtom);
  const id = user?.id;

  useEffect(() => {
    if (id) {
      axiosInstance.get("/myfeedbacks", {
        params: {
          professorId: id
        }
      })
        .then((res) => {
          setData(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen p-4 bg-black/90">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 w-80 bg-gray-700 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-40 bg-gray-700 rounded-3xl shadow-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-700 rounded-3xl shadow-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <FeedbackHeader />
        <StatsCards data={data} />
        <RatingChart data={data} />
        <RatingBreakdown data={data} />
      </div>
    </div>
  );
}