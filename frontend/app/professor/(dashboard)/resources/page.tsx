"use client"

import SemesterSelector from "@/components/common/resources/Selector";
import SubjectCards from "@/components/common/resources/SubjectCards";
import AddSubjectModal from "@/components/common/resources/AddSubjectModal";
import AddResourceModal from "@/components/common/resources/AddResourceModal";
import { Button } from "@/components/ui/button";
import { useAtom } from "jotai";
import { userAtom, resourceAtom } from "@/app/atoms/atoms";
import { useState } from "react";

interface SubjectData {
  subjectName: string;
  subjectCode: string;
  semester: string;
}

export default function ProfessorResourcesPage() {
  const [user] = useAtom(userAtom);
  const [semester] = useAtom(resourceAtom);
  const role = user?.role;
  const semesterSelected = Boolean(semester?.semester);

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openResourceModal, setOpenResourceModal] = useState<boolean>(false);

  const handleSubmit = (data: SubjectData) => {
    console.log("New subject added:", data);
    // Add logic to handle the new subject data (e.g., API call)
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl text-center">Notes & Learning Resources</h1>
        <div className="flex gap-4">
          <SemesterSelector />
          {role === "professor" && semesterSelected && (
            <Button
              className="border border-white/70 cursor-pointer hover:bg-white/20"
              onClick={() => setOpenModal(true)}
            >
              Add Subject +
            </Button>
          )}
            {/* <Button
              className="border border-white/70 cursor-pointer hover:bg-white/20"
              onClick={() => setOpenResourceModal(true)}
            >
              Add Resource +
            </Button> */}
        </div>
      </div>
      <SubjectCards />
      <AddSubjectModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleSubmit}
      />
      {/* <AddResourceModal
        isOpen={openResourceModal}
        onClose={() => setOpenResourceModal(false)}
      /> */}
    </div>
  );
}