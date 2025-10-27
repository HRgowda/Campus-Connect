"use client"
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios"
import { FeedbackModal } from "@/components/feedback_portal/FeedbackModal";
import { ProfessorCard } from "@/components/feedback_portal/ProfessorCard";
import { useAtom } from "jotai";
import { professorAtom } from "@/app/atoms/atoms";
import { Professor } from "@/app/atoms/atoms";

export default function FeedbackPage() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [, setProfessorsData] = useAtom(professorAtom)

  useEffect(() => {
    axiosInstance.get("/professors")
    .then((res) => {
      setProfessors(res.data)
    }) 
  }, []);

  return (
    <div className="mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-xl mr-3">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Give Feedback to Professors</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Share your experience and help improve the teaching quality by providing honest feedback to your professors.
        </p>
      </div>

      {professors.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <p className="text-muted-foreground text-lg font-medium text-center">
            No professors available for feedback at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professors.map((prof, index: number) => (
            <ProfessorCard
              key={index}
              name={prof.name}
              email={prof.email}
              onFeedbackClick={() => {
                setSelectedProfessor(prof);
                setProfessorsData(prof);
                setModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {selectedProfessor && (
        <FeedbackModal
          open={isModalOpen}
          onClose={() => setModalOpen(false)}
          professorName={selectedProfessor.name}
        />
      )}
    </div>
  );
}
