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
  // Split by "\n\n" to separate points and filter out empty entries
  const points = text.split("\n\n").filter((point) => point.trim() !== "");
  
  return points.map((point) => {
    // Match the pattern "Number. **Title:** Description"
    const match = point.match(/^\d+\.\s*\*\*(.+?):\*\*\s*([\s\S]+)$/);
    if (match) {
      const [, title, description] = match;
      return {
        title: title.trim(),
        description: description.trim(),
      };
    }
    // Fallback in case the format doesn't match
    return {
      title: "",
      description: point.trim(),
    };
  }).filter((point) => point.title && point.description); // Filter out invalid points
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

  return (
    <div className="min-h-screen flex items-start justify-center p-8 text-white overflow-y-auto">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-3 border border-white/20 rounded-full hover:border-white/40 hover:bg-white/5 transition-all duration-300 group"
            >
              <ArrowLeft className="h-5 w-5 text-white/70 group-hover:text-white/90 group-hover:-translate-x-0.5 transition-all" />
            </button>
            <div>
              <h2 className="text-3xl font-extralight text-white/90">Analysis Results</h2>
              <p className="text-sm text-white/60 mt-1">Comprehensive resume evaluation and recommendations</p>
            </div>
          </div>
        </div>

        {/* Analysis Cards with Drawers */}
        <div className="space-y-6">
          {/* Strengths Card */}
          <div className="border border-white/10 rounded-2xl shadow-md hover:border-white/20 transition-all duration-300 group">
            <div
              className="flex items-center justify-between p-6 cursor-pointer"
              onClick={() => setIsStrengthsOpen(!isStrengthsOpen)}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 border border-green-500/20 rounded-full group-hover:border-green-500/40 transition-colors">
                  <CheckCircle className="h-6 w-6 text-green-400/80 group-hover:text-green-400 transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-light text-white/90">Strengths</h3>
                  <p className="text-xs text-white/50">Your key advantages</p>
                </div>
              </div>
              <div className="p-2">
                {isStrengthsOpen ? (
                  <ChevronUp className="h-6 w-6 text-white/70 group-hover:text-white/90 transition-transform duration-300" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-white/70 group-hover:text-white/90 transition-transform duration-300" />
                )}
              </div>
            </div>
            {/* Drawer Content */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                isStrengthsOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="border-t border-white/10 px-6 py-4">
                <div className="border-l-2 border-green-500/20 pl-6">
                  <ul className="space-y-4">
                    {strengthsPoints.map((point, index) => (
                      <li key={index} className="text-sm leading-relaxed">
                        <span className="font-semibold text-white/90">{point.title}:</span>{" "}
                        <Typewriter
                          text={point.description}
                          typeSpeed={30}
                          cursorColor="transparent"
                          startDelay={index * 1000}
                          className="inline text-sm font-light text-white/50 leading-relaxed"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Gaps Card */}
          <div className="border border-white/10 rounded-2xl shadow-md hover:border-white/20 transition-all duration-300 group">
            <div
              className="flex items-center justify-between p-6 cursor-pointer"
              onClick={() => setIsGapsOpen(!isGapsOpen)}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 border border-amber-500/20 rounded-full group-hover:border-amber-500/40 transition-colors">
                  <Search className="h-6 w-6 text-amber-400/80 group-hover:text-amber-400 transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-light text-white/90">Areas to Improve</h3>
                  <p className="text-xs text-white/50">Identified gaps</p>
                </div>
              </div>
              <div className="p-2">
                {isGapsOpen ? (
                  <ChevronUp className="h-6 w-6 text-white/70 group-hover:text-white/90 transition-transform duration-300" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-white/70 group-hover:text-white/90 transition-transform duration-300" />
                )}
              </div>
            </div>
            {/* Drawer Content */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                isGapsOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="border-t border-white/10 px-6 py-4">
                <div className="border-l-2 border-amber-500/20 pl-6">
                  <ul className="space-y-4">
                    {gapsPoints.map((point, index) => (
                      <li key={index} className="text-sm leading-relaxed">
                        <span className="font-semibold text-white/90">{point.title}:</span>{" "}
                        <Typewriter
                          text={point.description}
                          typeSpeed={30}
                          cursorColor="transparent"
                          startDelay={index * 1000}
                          className="inline text-sm font-light text-white/50 leading-relaxed"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Suggestions Card */}
          <div className="border border-white/10 rounded-2xl shadow-md hover:border-white/20 transition-all duration-300 group">
            <div
              className="flex items-center justify-between p-6 cursor-pointer"
              onClick={() => setIsSuggestionsOpen(!isSuggestionsOpen)}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 border border-blue-500/20 rounded-full group-hover:border-blue-500/40 transition-colors">
                  <Target className="h-6 w-6 text-blue-400/80 group-hover:text-blue-400 transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-light text-white/90">Recommendations</h3>
                  <p className="text-xs text-white/50">Actionable insights</p>
                </div>
              </div>
              <div className="p-2">
                {isSuggestionsOpen ? (
                  <ChevronUp className="h-6 w-6 text-white/70 group-hover:text-white/90 transition-transform duration-300" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-white/70 group-hover:text-white/90 transition-transform duration-300" />
                )}
              </div>
            </div>
            {/* Drawer Content */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                isSuggestionsOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="border-t border-white/10 px-6 py-4">
                <div className="border-l-2 border-blue-500/20 pl-6">
                  <ul className="space-y-4">
                    {suggestionsPoints.map((point, index) => (
                      <li key={index} className="text-sm leading-relaxed">
                        <span className="font-semibold text-white/90">{point.title}:</span>{" "}
                        <Typewriter
                          text={point.description}
                          typeSpeed={30}
                          cursorColor="transparent"
                          startDelay={index * 1000}
                          className="inline text-sm font-light text-white/50 leading-relaxed"
                        />
                      </li>
                    ))}
                  </ul>
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