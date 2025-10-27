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
        <div className="min-h-screen w-full text-foreground overflow-x-hidden overflow-y-hidden">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-xl mr-3">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Resume Analyzer</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Enhance your resume with AI-powered insights and personalized recommendations
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-10 mb-12 max-w-5xl mx-auto">
            <div className="group text-center p-6 border border-border rounded-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 bg-card shadow-sm hover:shadow-md">
              <div className="p-3 border border-green-500/20 rounded-full w-fit mx-auto mb-4 group-hover:border-green-500/40 transition-colors bg-green-50">
                <CheckCircle className="h-6 w-6 text-green-600 group-hover:text-green-700 transition-colors" />
              </div>
              <h3 className="text-base font-semibold mb-2 text-card-foreground">Strengths Analysis</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Discover and highlight your core competencies and achievements
              </p>
            </div>

            <div className="group text-center p-6 border border-border rounded-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 bg-card shadow-sm hover:shadow-md">
              <div className="p-3 border border-amber-500/20 rounded-full w-fit mx-auto mb-4 group-hover:border-amber-500/40 transition-colors bg-amber-50">
                <Search className="h-6 w-6 text-amber-600 group-hover:text-amber-700 transition-colors" />
              </div>
              <h3 className="text-base font-semibold mb-2 text-card-foreground">Gap Detection</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Identify missing elements and improvement opportunities
              </p>
            </div>

            <div className="group text-center p-6 border border-border rounded-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 bg-card shadow-sm hover:shadow-md">
              <div className="p-3 border border-primary/20 rounded-full w-fit mx-auto mb-4 group-hover:border-primary/40 transition-colors bg-primary/5">
                <Target className="h-6 w-6 text-primary group-hover:text-primary/80 transition-colors" />
              </div>
              <h3 className="text-base font-semibold mb-2 text-card-foreground">Smart Suggestions</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Receive targeted recommendations for maximum impact
              </p>
            </div>
          </div>

          {/* Upload Section */}
          <div className="max-w-md mx-auto">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors bg-card shadow-sm">
              <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                <Upload className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">Upload Resume</h3>
              <p className="text-sm mb-6 text-muted-foreground">PDF format recommended</p>

              {!selectedFile ? (
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="border-input focus:ring-2 focus:ring-primary focus:border-transparent text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold  cursor-pointer"
                />
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-card-foreground font-medium">{selectedFile.name}</p>
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={`bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer w-full ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? "Analyzing..." : "Submit Resume"}
                  </Button>
                </div>
              )}
            </div>

            <p className="text-xs text-center mt-4 text-muted-foreground">
              Your resume data is processed securely and never stored
            </p>
          </div>
        </div>
      )}
    </>
  )
}