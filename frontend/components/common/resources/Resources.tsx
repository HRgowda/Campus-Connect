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
    <div className="mt-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleGoBack}
          className="text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Resources for {subject.subjectName}</h2>
          <p className="text-muted-foreground text-sm">{subject.subjectCode}</p>
        </div>
      </div>

      {resources.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-muted-foreground text-lg font-medium text-center">
            No resources available for this subject yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res, index) => (
            <Card
              key={index}
              className="border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 bg-card group"
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <a
                      href={res.resourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 text-lg font-semibold block mb-2 transition-colors"
                    >
                      {res.resourceName}
                    </a>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full font-medium">
                        {res.resourceType.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}