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
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-muted-foreground text-xl font-semibold">
            Please select a semester to view subjects.
          </p>
        </div>
      </div>
    )
  }

  // Show Resources when a subject is selected
  if (selectedSubject) {
    return <Resources />
  }

  if (subjects.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-muted-foreground text-xl font-semibold text-center">
          No subjects available for this semester.
        </p>
      </div>
    )
  }

  return (
    <div>
        <p className="text-foreground text-lg leading-relaxed my-6">
          Below you'll find notes, materials, and links organized by subject. Select a subject to begin exploring.
        </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject: Subject, index: number) => (
          <div
            key={subject.id || index}
            className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
            onClick={() => handleSubjectClick(subject)}
          >
            <Card className="border border-border hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-200 bg-card">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-card-foreground mb-1 truncate">{subject.subjectName}</h3>
                    <p className="text-sm text-muted-foreground font-medium">{subject.subjectCode}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}