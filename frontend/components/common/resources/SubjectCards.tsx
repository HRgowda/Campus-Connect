"use client"

import { useAtom } from "jotai"
import { resourceAtom, userAtom, selectedSubjectAtom } from "@/app/atoms/atoms"
import { Card, CardContent } from "@/components/ui/card"
import axiosInstance from "@/lib/axios"
import { useEffect, useState } from "react"
import Resources from "./Resources"

type Subject = {
  subjectName: string
  subjectCode: string
  id: string
}

export default function SubjectCards() {
  const [selectedResource] = useAtom(resourceAtom)
  const [user] = useAtom(userAtom)
  const role = user?.role
  const semesterKey = selectedResource?.semester ?? ""
  const [subjects, setSubjects] = useState<Subject[] | []>([])
  const [selectedSubject, setSelectedSubject] = useAtom(selectedSubjectAtom)

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const response = await axiosInstance.get("/subjects", {
          params: { semester: semesterKey }
        })
        setSubjects(response.data)
      } catch (error) {
        console.error("Error fetching subject", error)
      }
    }

    if (semesterKey) {
      fetchSubject()
    }
  }, [semesterKey])

  const handleSubjectClick = async (subject: Subject) => {
    setSelectedSubject(subject)
  }

  if (!selectedResource) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <p className="text-white/60 text-center text-2xl font-semibold">
          Please select a semester to view subjects.
        </p>
      </div>
    )
  }

  // Show Resources when a subject is selected
  if (selectedSubject) {
    return <Resources />
  }

  if (subjects.length === 0) {
    return (
      <p className="text-white/60 text-center text-2xl font-semibold flex flex-col justify-center items-center h-[calc(100vh-200px)]">
        No subjects available for this semester.
      </p>
    )
  }

  return (
    <div>
      <p className="text-xl text-start text-white/70 mt-10">
        Below you'll find notes, materials, and links organized by subject. Select a subject to begin exploring.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-5 mt-6 py-8">
        {subjects.map((subject: Subject, index: number) => (
          <div
            key={subject.id || index}
            className="cursor-pointer transition-transform hover:scale-[1.02]"
            onClick={() => handleSubjectClick(subject)}
          >
            <Card className="border border-white/10 hover:border-white/30 shadow-md transition-colors">
              <CardContent className="p-5">
                <h3 className="text-lg font-semibold text-white">{subject.subjectName}</h3>
                <p className="text-sm text-white/60">{subject.subjectCode}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}