"use client"

import { ArrowLeft, CheckCircle, Search, Target, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import Typewriter from "react-typewriter-effect";

interface ResumeAnalysisProps {
  analysis: {
    strengths: string;
    gaps: string;
    suggestions: string;
  };
  onClose: () => void;
}

// Helper function to parse the text into points
const parseAnalysisText = (text: string) => {
  if (!text || text.trim() === "") {
    return [];
  }

  // First, try to split by double newlines (original format)
  let points = text.split("\n\n").filter((point) => point.trim() !== "");
  
  // If we only have one point, it might be a continuous paragraph with numbered points
  if (points.length === 1) {
    const continuousText = points[0];
    
    // Split by the pattern "Number. **Title**:" to separate individual points
    // This regex looks for "Number. **Title**:" and splits before each occurrence
    const splitPattern = /(?=\d+\.\s*\*\*[^*]+\*\*:)/;
    const splitPoints = continuousText.split(splitPattern).filter((point) => point.trim() !== "");
    
    if (splitPoints.length > 1) {
      points = splitPoints;
    }
  }
  
  return points.map((point) => {
    // Clean up the point text
    const cleanPoint = point.trim();
    
    // Try to match the pattern "Number. **Title**: Description"
    const match = cleanPoint.match(/^\d+\.\s*\*\*(.+?):\*\*\s*(.+)$/);
    if (match) {
      const [, title, description] = match;
      return {
        title: title.trim(),
        description: description.trim(),
      };
    }
    
    // Try pattern without the closing **
    const match2 = cleanPoint.match(/^\d+\.\s*\*\*(.+?):\s*(.+)$/);
    if (match2) {
      const [, title, description] = match2;
      return {
        title: title.trim(),
        description: description.trim(),
      };
    }
    
    // Try pattern with **Title**: Description (no number)
    const match3 = cleanPoint.match(/^\*\*(.+?):\*\*\s*(.+)$/);
    if (match3) {
      const [, title, description] = match3;
      return {
        title: title.trim(),
        description: description.trim(),
      };
    }
    
    // Try pattern with **Title**: Description (no number, no closing **)
    const match4 = cleanPoint.match(/^\*\*(.+?):\s*(.+)$/);
    if (match4) {
      const [, title, description] = match4;
      return {
        title: title.trim(),
        description: description.trim(),
      };
    }
    
    // Fallback: treat the entire point as description
    return {
      title: "Point",
      description: cleanPoint,
    };
  }).filter((point) => point.description && point.description !== ""); // Filter out empty points
};

function ResumeAnalysis({ analysis, onClose }: ResumeAnalysisProps) {
  // State to manage drawer open/close for each section
  const [isStrengthsOpen, setIsStrengthsOpen] = useState(false);
  const [isGapsOpen, setIsGapsOpen] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  // Parse the analysis text into points
  const strengthsPoints = parseAnalysisText(analysis.strengths);
  const gapsPoints = parseAnalysisText(analysis.gaps);
  const suggestionsPoints = parseAnalysisText(analysis.suggestions);

  // Debug logging
  console.log("Strengths raw:", analysis.strengths);
  console.log("Strengths parsed:", strengthsPoints);
  console.log("Gaps raw:", analysis.gaps);
  console.log("Gaps parsed:", gapsPoints);
  console.log("Suggestions raw:", analysis.suggestions);
  console.log("Suggestions parsed:", suggestionsPoints);

  return (
    <div className="min-h-screen flex items-start justify-center p-8 text-foreground overflow-y-auto bg-background">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-3 border border-border rounded-full hover:border-primary/40 hover:bg-accent transition-all duration-300 group"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:-translate-x-0.5 transition-all" />
            </button>
            <div>
              <h2 className="text-3xl font-semibold text-foreground">Analysis Results</h2>
              <p className="text-sm text-muted-foreground mt-1">Comprehensive resume evaluation and recommendations</p>
            </div>
          </div>
        </div>

        {/* Analysis Cards with Drawers */}
        <div className="space-y-6">
          {/* Strengths Card */}
          <div className="border border-border rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group bg-card">
            <div
              className="flex items-center justify-between p-6 cursor-pointer"
              onClick={() => setIsStrengthsOpen(!isStrengthsOpen)}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 border border-green-500/20 rounded-full group-hover:border-green-500/40 transition-colors bg-green-50">
                  <CheckCircle className="h-6 w-6 text-green-600 group-hover:text-green-700 transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-card-foreground">Strengths</h3>
                  <p className="text-xs text-muted-foreground">Your key advantages</p>
                </div>
              </div>
              <div className="p-2">
                {isStrengthsOpen ? (
                  <ChevronUp className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-transform duration-300" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-transform duration-300" />
                )}
              </div>
            </div>
            {/* Drawer Content */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                isStrengthsOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="border-t border-border px-6 py-4">
                <div className="border-l-2 border-green-500/30 pl-6">
                  {strengthsPoints.length > 0 ? (
                    <div className="space-y-6">
                      {strengthsPoints.map((point, index) => (
                        <div key={index} className="group">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                              <span className="text-green-600 font-semibold text-sm">{index + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base font-semibold text-card-foreground mb-2 group-hover:text-green-700 transition-colors">
                                {point.title}
                              </h4>
                              <div className="text-sm text-muted-foreground leading-relaxed">
                                <Typewriter
                                  text={point.description}
                                  typeSpeed={25}
                                  cursorColor="transparent"
                                  startDelay={index * 800}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      <p>No strengths data available.</p>
                      <p className="mt-2 text-xs">Raw data: {analysis.strengths}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Gaps Card */}
          <div className="border border-border rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group bg-card">
            <div
              className="flex items-center justify-between p-6 cursor-pointer"
              onClick={() => setIsGapsOpen(!isGapsOpen)}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 border border-amber-500/20 rounded-full group-hover:border-amber-500/40 transition-colors bg-amber-50">
                  <Search className="h-6 w-6 text-amber-600 group-hover:text-amber-700 transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-card-foreground">Areas to Improve</h3>
                  <p className="text-xs text-muted-foreground">Identified gaps</p>
                </div>
              </div>
              <div className="p-2">
                {isGapsOpen ? (
                  <ChevronUp className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-transform duration-300" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-transform duration-300" />
                )}
              </div>
            </div>
            {/* Drawer Content */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                isGapsOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="border-t border-border px-6 py-4">
                <div className="border-l-2 border-amber-500/30 pl-6">
                  {gapsPoints.length > 0 ? (
                    <div className="space-y-6">
                      {gapsPoints.map((point, index) => (
                        <div key={index} className="group">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mt-1">
                              <span className="text-amber-600 font-semibold text-sm">{index + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base font-semibold text-card-foreground mb-2 group-hover:text-amber-700 transition-colors">
                                {point.title}
                              </h4>
                              <div className="text-sm text-muted-foreground leading-relaxed">
                                <Typewriter
                                  text={point.description}
                                  typeSpeed={25}
                                  cursorColor="transparent"
                                  startDelay={index * 800}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      <p>No gaps data available.</p>
                      <p className="mt-2 text-xs">Raw data: {analysis.gaps}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Suggestions Card */}
          <div className="border border-border rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group bg-card">
            <div
              className="flex items-center justify-between p-6 cursor-pointer"
              onClick={() => setIsSuggestionsOpen(!isSuggestionsOpen)}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 border border-primary/20 rounded-full group-hover:border-primary/40 transition-colors bg-primary/5">
                  <Target className="h-6 w-6 text-primary group-hover:text-primary/80 transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-card-foreground">Recommendations</h3>
                  <p className="text-xs text-muted-foreground">Actionable insights</p>
                </div>
              </div>
              <div className="p-2">
                {isSuggestionsOpen ? (
                  <ChevronUp className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-transform duration-300" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-transform duration-300" />
                )}
              </div>
            </div>
            {/* Drawer Content */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                isSuggestionsOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="border-t border-border px-6 py-4">
                <div className="border-l-2 border-primary/30 pl-6">
                  {suggestionsPoints.length > 0 ? (
                    <div className="space-y-6">
                      {suggestionsPoints.map((point, index) => (
                        <div key={index} className="group">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                              <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base font-semibold text-card-foreground mb-2 group-hover:text-blue-700 transition-colors">
                                {point.title}
                              </h4>
                              <div className="text-sm text-muted-foreground leading-relaxed">
                                <Typewriter
                                  text={point.description}
                                  typeSpeed={25}
                                  cursorColor="transparent"
                                  startDelay={index * 800}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      <p>No suggestions data available.</p>
                      <p className="mt-2 text-xs">Raw data: {analysis.suggestions}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeAnalysis;