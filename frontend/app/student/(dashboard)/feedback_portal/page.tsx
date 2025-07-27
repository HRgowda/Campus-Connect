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
    <div className="mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">Give Feedback to Professors</h1>
      <div className="grid grid-cols-1 md:grid-cols-3">
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
