"use client"

import { Input } from "@/components/ui/input"
import { Upload, FileText, Target, Search, CheckCircle } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { showSuccessToast, showErrorToast } from "@/lib/toastUtils"
import ResumeAnalysis from "@/components/students/ResumeAnalysis"
import { useLoader } from "@/app/context/LoaderContext"

// Define the Analysis type
interface Analysis {
  strengths: string;
  gaps: string;
  suggestions: string;
}

export default function ResumeAnalyzerPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { showLoader, hideLoader } = useLoader()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setIsLoading(true)
    showLoader()
    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      const response = await axios.post("http://localhost:8000/student/analyze-resume", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      setAnalysis(response.data.analysis)
    } catch (error: any) {
        const defaultMessage = "Something went wrong. Please try again.";

        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          const message = error.response?.data?.detail;

          if (status === 429) {
            showSuccessToast(message || "Too many requests. Try again later.");
          } else {
            showSuccessToast(message || defaultMessage);
          }
        } else {
          showSuccessToast(defaultMessage);
        }
      }
    finally {
      hideLoader()
      setIsLoading(false)
    }
  }

  const handleCloseAnalysis = () => {
    setAnalysis(null)
    setSelectedFile(null)
  }

  return (
    <>
      {analysis ? (
        <ResumeAnalysis analysis={analysis} onClose={handleCloseAnalysis} />
      ) : (
        <div className="min-h-screen w-[calc(100%-6rem)] mx-3 w-full text-white overflow-x-hidden overflow-y-hidden">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 mr-3" />
              <h1 className="text-3xl font-light">Resume Analyzer</h1>
            </div>
            <p className="text-lg font-light max-w-2xl mx-auto leading-relaxed">
              Enhance your resume with AI-powered insights and personalized recommendations
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-10 mb-12 max-w-5xl mx-auto">
            <div className="group text-center p-6 border border-white/10 rounded-xl hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="p-3 border border-white/10 rounded-full w-fit mx-auto mb-4 group-hover:border-white/20 transition-colors">
                <CheckCircle className="h-6 w-6 text-white/60 group-hover:text-white/80 transition-colors" />
              </div>
              <h3 className="text-base font-light mb-2 text-white/90">Strengths Analysis</h3>
              <p className="text-xs leading-relaxed text-white/60">
                Discover and highlight your core competencies and achievements
              </p>
            </div>

            <div className="group text-center p-6 border border-white/10 rounded-xl hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="p-3 border border-white/10 rounded-full w-fit mx-auto mb-4 group-hover:border-white/20 transition-colors">
                <Search className="h-6 w-6 text-white/60 group-hover:text-white/80 transition-colors" />
              </div>
              <h3 className="text-base font-light mb-2 text-white/90">Gap Detection</h3>
              <p className="text-xs leading-relaxed text-white/60">
                Identify missing elements and improvement opportunities
              </p>
            </div>

            <div className="group text-center p-6 border border-white/10 rounded-xl hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="p-3 border border-white/10 rounded-full w-fit mx-auto mb-4 group-hover:border-white/20 transition-colors">
                <Target className="h-6 w-6 text-white/60 group-hover:text-white/80 transition F-colors" />
              </div>
              <h3 className="text-base font-light mb-2 text-white/90">Smart Suggestions</h3>
              <p className="text-xs leading-relaxed text-white/60">
                Receive targeted recommendations for maximum impact
              </p>
            </div>
          </div>

          {/* Upload Section */}
          <div className="max-w-md mx-auto">
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-gray-300 transition-colors">
              <Upload className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-light mb-2">Upload Resume</h3>
              <p className="text-sm mb-6">PDF format recommended</p>

              {!selectedFile ? (
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="border-0 text-black bg-white/90 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:hover:file:bg-gray-200 cursor-pointer"
                />
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-300">{selectedFile.name}</p>
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={`bg-white text-black hover:bg-gray-100 cursor-pointer ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? "Analyzing..." : "Submit Resume"}
                  </Button>
                </div>
              )}
            </div>

            <p className="text-xs text-center mt-4">
              Your resume data is processed securely and never stored
            </p>
          </div>
        </div>
      )}
    </>
  )
}