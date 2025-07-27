"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { useAtom } from "jotai";
import { userAtom, professorAtom } from "@/app/atoms/atoms";
import { showSuccessToast, showErrorToast } from "@/lib/toastUtils";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  professorName: string;
}

const ratingLabels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

export const FeedbackModal = ({
  open,
  onClose,
  professorName,
}: FeedbackModalProps) => {
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user] = useAtom(userAtom);
  const [professor] = useAtom(professorAtom);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await axiosInstance.post("/give_feedback", {
        rating,
        professorId: professor?.id,
        studentId: user?.id,
      });
      showSuccessToast("Feedback submitted successfully!");
      setRating(0);
      onClose();
    } catch (error) {
      console.error(error);
      showErrorToast("Failed to submit your response, Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setRating(0);
        onClose();
      }}
    >
      <DialogContent className="max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Feedback for {professorName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-4 my-6">
          <div className="flex items-center justify-center space-x-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-transform duration-200 ease-in-out hover:scale-110"
              >
                <Star
                  size={36}
                  fill={rating >= star ? "#facc15" : "#d1d5db"}
                  stroke={rating >= star ? "#facc15" : "#d1d5db"}
                  className="text-yellow-500 dark:text-yellow-400"
                />
              </button>
            ))}
          </div>

          {rating > 0 && (
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {ratingLabels[rating - 1]}
            </p>
          )}
        </div>

        <Button
          disabled={rating === 0 || loading}
          onClick={handleSubmit}
          className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white py-2.5 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}