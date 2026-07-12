import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import toast from "react-hot-toast";
import MainLayout from "../layouts/MainLayout";
import {
  FaFileAlt,
  FaBriefcase,
  FaChartBar,
  FaLightbulb,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

function ResumeAnalyzer() {
  const { user } = useAuth();
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      toast.error("Please enter your resume text");
      return;
    }

    if (resumeText.length < 80) {
      toast.error("Resume text is too short (minimum 80 characters)");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      const response = await api.post("/ai/resume-analyses", {
        resume_text: resumeText,
        target_role: targetRole || null,
      });

      setAnalysisResult(response.data.data || response.data);
      toast.success("Resume analysis complete!");
    } catch (error) {
      setAnalysisError(error.message || "Analysis failed");
      toast.error("Failed to analyze resume");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!user) return null;

  return (
    <MainLayout>
      <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <FaFileAlt />
              Resume Analyzer
            </h1>
            <p className="text-zinc-400 mt-2">
              Get AI-powered feedback on your resume to improve your job applications
            </p>
          </div>

          {/* Form */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-zinc-400">
                  Resume Text
                </label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume content here..."
                  rows={12}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:border-violet-500 focus:ring-violet-500 resize-none"
                  minLength={80}
                  required
                />
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-zinc-500">
                    {resumeText.length} / ∞ characters
                  </span>
                  <span className="text-zinc-500">
                    Minimum: 80 characters
                  </span>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-zinc-400">
                  Target Job Role (Optional)
                </label>
                <input
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:border-violet-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 transition disabled:opacity-50 font-semibold flex items-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-b-2 border-white"></span>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FaChartBar />
                      Analyze Resume
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Results */}
          {analysisError && (
            <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <FaTimesCircle className="text-red-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-400 mb-2">Analysis Failed</h3>
                  <p className="text-zinc-300">{analysisError}</p>
                </div>
              </div>
            </div>
          )}

          {analysisResult && (
            <div className="space-y-6">
              {/* Score */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-flex">
                    <FaChartBar /> Match Score
                  </h2>
                  <div className="text-5xl font-bold text-violet-400">
                    {analysisResult.score}/100
                  </div>
                </div>
                <div className="w-full bg-zinc-800/50 rounded-full h-4 mb-3">
                  <div
                    className={`bg-gradient-to-r from-violet-500 to-violet-600 h-4 rounded-full transition-all duration-1000`}
                    style={{ width: `${Math.min(analysisResult.score, 100)}%` }}
                  ></div>
                </div>
                <p className="text-center text-zinc-400">
                  {analysisResult.score >= 80
                    ? "Excellent match!"
                    : analysisResult.score >= 60
                    ? "Good match with room for improvement"
                    : "Needs significant improvement"}
                </p>
              </div>

              {/* Summary */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                <h2 className="text-xl font-flex mb-4">
                  <FaFileAlt /> Summary
                </h2>
                <p className="text-zinc-300 leading-relaxed">
                  {analysisResult.summary || "No summary provided"}
                </p>
              </div>

              {/* Strengths and Weaknesses */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                  <h2 className="text-xl font-flex mb-4">
                    <FaLightbulb /> Strengths
                  </h2>
                  {(analysisResult.strengths || []).length > 0 ? (
                    <ul className="space-y-2 text-zinc-300">
                      {analysisResult.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <FaCheckCircle className="text-violet-400 mt-1 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-zinc-400 italic">No strengths identified</p>
                  )}
                </div>

                {/* Gaps / Improvements */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                  <h2 className="text-xl font-flex mb-4">
                    <FaTimesCircle /> Areas for Improvement
                  </h2>
                  {(analysisResult.gaps || []).length > 0 ? (
                    <ul className="space-y-2 text-zinc-300">
                      {analysisResult.gaps.map((gap, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <FaTimesCircle className="text-red-400 mt-1 flex-shrink-0" />
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-zinc-400 italic">No gaps identified</p>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                <h2 className="text-xl font-flex mb-4">
                  <FaCheckCircle /> Recommendations
                </h2>
                {(analysisResult.recommendations || []).length > 0 ? (
                  <ol className="list-decimal list-inset space-y-2 text-zinc-300">
                    {analysisResult.recommendations.map((rec, index) => (
                      <li key={index}>
                        {rec}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-zinc-400 italic">No recommendations provided</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default ResumeAnalyzer;