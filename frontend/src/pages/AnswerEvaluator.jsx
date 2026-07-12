import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import toast from "react-hot-toast";
import MainLayout from "../layouts/MainLayout";
import {
  FaEdit,
  FaClipboardList,
  FaCheckCircle,
  FaTimesCircle,
  FaLightbulb,
  FaRedo,
} from "react-icons/fa";

function AnswerEvaluator() {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [evaluationError, setEvaluationError] = useState(null);

  const handleEvaluate = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    if (!answer.trim()) {
      toast.error("Please provide an answer");
      return;
    }

    if (answer.length < 20) {
      toast.error("Answer is too short (minimum 20 characters)");
      return;
    }

    setIsEvaluating(true);
    setEvaluationError(null);
    setEvaluationResult(null);

    try {
      const response = await api.post("/ai/answer-evaluations", {
        question: question,
        answer: answer,
      });

      setEvaluationResult(response.data.data || response.data);
      toast.success("Answer evaluation complete!");
    } catch (error) {
      setEvaluationError(error.message || "Evaluation failed");
      toast.error("Failed to evaluate answer");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    setQuestion("");
    setAnswer("");
    setEvaluationResult(null);
    setEvaluationError(null);
  };

  if (!user) return null;

  return (
    <MainLayout>
      <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <FaClipboardList />
              Answer Evaluator
            </h1>
            <p className="text-zinc-400 mt-2">
              Get AI-powered feedback on your interview answers to improve your responses
            </p>
          </div>

          {/* Form */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-zinc-400">
                  Interview Question
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter the interview question you want to practice..."
                  rows={4}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:border-violet-500 resize-none"
                  required
                />
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-zinc-500">
                    {question.length} / ∞ characters
                  </span>
                  <span className="text-zinc-500">
                    Minimum: 0 characters
                  </span>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-zinc-400">
                  Your Answer
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={8}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:border-violet-500 resize-none"
                  minLength={20}
                  required
                />
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-zinc-500">
                    {answer.length} / ∞ characters
                  </span>
                  <span className="text-zinc-500">
                    Minimum: 20 characters
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isEvaluating}
                  className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <FaRedo />
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={isEvaluating}
                  className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 transition disabled:opacity-50 font-semibold flex items-center gap-2"
                >
                  {isEvaluating ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-b-2 border-white"></span>
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      Evaluate Answer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Results */}
          {evaluationError && (
            <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <FaTimesCircle className="text-red-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-400 mb-2">Evaluation Failed</h3>
                  <p className="text-zinc-300">{evaluationError}</p>
                </div>
              </div>
            </div>
          )}

          {evaluationResult && (
            <div className="space-y-6">
              {/* Score */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">
                    <FaChartBar /> Response Score
                  </h2>
                  <div className="text-5xl font-bold text-violet-400">
                    {evaluationResult.score}/100
                  </div>
                </div>
                <div className="w-full bg-zinc-800/50 rounded-full h-4 mb-3">
                  <div
                    className={`bg-gradient-to-r from-violet-500 to-violet-600 h-4 rounded-full transition-all duration-1000`}
                    style={{ width: `${Math.min(evaluationResult.score, 100)}%` }}
                  ></div>
                </div>
                <p className="text-center text-zinc-400">
                  {evaluationResult.score >= 80
                    ? "Excellent response!"
                    : evaluationResult.score >= 60
                      ? "Good response with room for improvement"
                      : "Needs significant improvement"}
                </p>
              </div>

              {/* Feedback */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                <h2 className="text-xl font-bold mb-4">
                  <FaSpeechBubble /> Feedback Summary
                </h2>
                <p className="text-zinc-300 leading-relaxed">
                  {evaluationResult.summary || "No summary provided"}
                </p>
              </div>

              {/* Strengths and Improvements */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                  <h2 className="text-xl font-bold mb-4">
                    <FaCheckCircle /> Strengths
                  </h2>
                  {(evaluationResult.strengths || []).length > 0 ? (
                    <ul className="space-y-2 text-zinc-300">
                      {evaluationResult.strengths.map((strength, index) => (
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

                {/* Improvements */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                  <h2 className="text-xl font-bold mb-4">
                    <FaTimesCircle /> Areas for Improvement
                  </h2>
                  {(evaluationResult.improvements || []).length > 0 ? (
                    <ul className="space-y-2 text-zinc-300">
                      {evaluationResult.improvements.map((imp, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <FaTimesCircle className="text-red-400 mt-1 flex-shrink-0" />
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-zinc-400 italic">No improvements suggested</p>
                  )}
                </div>
              </div>

              {/* Improved Answer Example */}
              {evaluationResult.improved_answer && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                  <h2 className="text-xl font-bold mb-4">
                    <FaLightbulb /> Suggested Improved Answer
                  </h2>
                  <div className="bg-zinc-800/50 rounded-xl p-4">
                    <p className="text-zinc-300 whitespace-pre-wrap">
                      {evaluationResult.improved_answer}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition flex items-center gap-2"
                >
                  <FaRedo />
                  Evaluate Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default AnswerEvaluator;