"use client"

import { useAtom, useSetAtom } from "jotai"
import { resourceAtom } from "@/app/atoms/atoms"
import { Card, CardContent } from "@/components/ui/card"
import axiosInstance from "@/lib/axios"
import { useEffect, useState } from "react"
import { userAtom } from "@/app/atoms/atoms"

type Subject = {
  subjectName: string
  subjectCode: string
}

export default function SubjectCards() {
  const [selectedResource] = useAtom(resourceAtom)
  const [user] = useAtom(userAtom)
  const role = user?.role
  const semesterKey = selectedResource?.semester ?? ""
  const [subjects, setSubjects] = useState<Subject[] | []>([])

  useEffect(() => {
    const fetchSubject = async () => {
      try{
        const response = await axiosInstance.get("/subjects", {
          params: { // this is a get request , data is passed via query parameters.
            semester: semesterKey
          }
        }) 
        setSubjects(response.data)
      } catch (error) {
        console.error("Error fetching subject", error)
      }
    }
    
    if (semesterKey){
      fetchSubject()
    }

  }, [semesterKey])

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
    return <p className="text-white/60 text-center text-2xl font-semibold flex flex-col justify-center items-center h-[calc(100vh-200px)]">No subjects available for this semester.</p>
  }

  return (
    <div>
      <p className="text-xl text-start text-white/70 mt-10">
        Below you'll find notes, materials, and links organized by subject. Select a subject to begin exploring.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-5 mt-6 py-8">
        {subjects.map((subject: Subject, index: number) => (
          <div
            key={subject.subjectCode || index}
            className="cursor-pointer transition-transform hover:scale-[1.02]"
            onClick={() => {
              console.log(`Selected subject: ${subject}`)
            }}
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