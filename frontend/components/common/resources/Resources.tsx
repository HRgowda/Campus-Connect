"use client"

import { useAtom } from "jotai"
import { selectedSubjectAtom } from "@/app/atoms/atoms"
import axiosInstance from "@/lib/axios"
import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type Resource = {
  resourceName: string
  resourceUrl: string
  resourceType: string // pdf, word, etc.
}

export default function Resources() {
  const [subject, setSubject] = useAtom(selectedSubjectAtom)
  const [resources, setResources] = useState<Resource[]>([])

  useEffect(() => {
    const fetchResources = async () => {
      if (!subject) return

      try {
        const response = await axiosInstance.get(`/resources`, {
          params: {
            subjectId: subject.id
          }
        })
        setResources(response.data)
      } catch (error) {
        console.error("Error fetching resources", error)
      }
    }

    fetchResources()
  }, [subject])

  if (!subject) {
    return null 
  }

  const handleGoBack = () => {
    setSubject(null) // this resets to show subject cards again
  }

  return (
    <div className="mt-6 text-white">
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleGoBack}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-2xl font-bold">Resources for {subject.subjectName}</h2>
      </div>

      {resources.length === 0 ? (
        <p className="text-white/60 flex flex-col justify-center items-center h-[calc(100vh-200px)]">No resources available for this subject yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {resources.map((res, index) => (
            <Card
              key={index}
              className="border border-white/10 hover:border-white/30 hover:bg-white/5 transition"
            >
              <CardContent className="p-4">
                <a
                  href={res.resourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline text-lg font-semibold"
                >
                  {res.resourceName}
                </a>
                <p className="text-sm text-white/50 mt-1">Type: {res.resourceType}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}