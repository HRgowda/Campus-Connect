"use client"

import SemesterSelector from "@/components/common/resources/Selector";
import SubjectCards from "@/components/common/resources/SubjectCards";
import { resourceAtom } from "@/app/atoms/atoms";
import { useAtom } from "jotai";

export default function ResourcesPage() {
  const [semester, setSemester] = useAtom(resourceAtom)

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl text-center">Notes & Learning Resources</h1>
        <SemesterSelector />
      </div>
      <SubjectCards />
    </div>

  );
}
