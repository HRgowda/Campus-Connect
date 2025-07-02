"use client"

import { useAtom } from "jotai"
import { resourceAtom } from "@/app/atoms/atoms"
import { subjectsBySemester, Subject } from "./subjects"
import { Card, CardContent } from "@/components/ui/card"

export default function SubjectCards() {
  const [selectedResource] = useAtom(resourceAtom)
  const semesterKey = selectedResource?.semester ?? ""
  const subjects: Subject[] = subjectsBySemester[semesterKey] ?? []

  if (!selectedResource) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <p className="text-white/60 text-center text-2xl font-semibold">
          Please select a semester to view subjects.
        </p>
      </div>
    )
  }  

  if (subjects.length === 0) {
    return <p className="text-white/60 mt-4">No subjects available for this semester.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-5 mt-6 py-8">
      {subjects.map((subject: Subject) => (
        <div
          key={subject.code}
          className="cursor-pointer transition-transform hover:scale-[1.02]"
          onClick={() => {
            console.log(`Selected subject: ${subject.name}`)
          }}
        >
          <Card className="border border-white/10 hover:border-white/30 shadow-md transition-colors">
            <CardContent className="p-5">
              <h3 className="text-lg font-semibold text-white">{subject.name}</h3>
              <p className="text-sm text-white/60">{subject.code}</p>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}
