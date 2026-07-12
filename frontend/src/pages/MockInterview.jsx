import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import toast from "react-hot-toast";
import MainLayout from "../layouts/MainLayout";
import {
  FaClipboardList,
  FaPenNib,
  FaCheckCircle,
  FaTimesCircle,
  FaChartBar,
  FaEdit,
  FaUndo,
  FaRedo,
  FaSpinner,
  FaArrowRight,
  FaPlayCircle
} from "react-icons/fa";

function MockInterview() {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: setup, 2: interview, 3: results
  const [targetRole, setTargetRole] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState(null);
  const [interviewId, setInterviewId] = useState(null); // Store interview ID

  // Start a new mock interview
  const startInterview = async () => {
    if (!targetRole.trim()) {
      toast.error("Please enter a target role");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post("/mock-interviews", {
        target_role: targetRole,
        difficulty: difficulty,
      });

      const interviewData = response.data.data || response.data;
      setQuestions(interviewData.questions || []);
      setAnswers(Array(interviewData.questions?.length || 0).fill(""));
      setCurrentQuestionIndex(0);
      setInterviewId(interviewData.id); // Store the interview ID
      setStep(2);
      toast.success("Mock interview started!");
    } catch (err) {
      setError(err.message || "Failed to start interview");
      toast.error("Could not start interview");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle answer change for current question
  const handleAnswerChange = (e) => {
    setCurrentAnswer(e.target.value);
  };

  // Move to next question
  const goToNextQuestion = () => {
    // Save current answer
    const answersCopy = [...answers];
    answersCopy[currentQuestionIndex] = currentAnswer;
    setAnswers(answersCopy);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer(""); // Clear for next question
    } else {
      // Last question, move to review step
      setStep(3);
    }
  };

  // Move to previous question
  const goToPreviousQuestion = () => {
    // Save current answer
    const answersCopy = [...answers];
    answersCopy[currentQuestionIndex] = currentAnswer;
    setAnswers(answersCopy);

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentAnswer(answers[currentQuestionIndex - 1] || "");
    }
  };

  // Submit all answers for evaluation
  const submitInterview = async () => {
    // Save final answer
    const answersCopy = [...answers];
    answersCopy[currentQuestionIndex] = currentAnswer;
    setAnswers(answersCopy);

    // Check if all questions have answers
    const emptyAnswers = answers.filter((ans) => !ans.trim());
    if (emptyAnswers.length > 0) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    if (!interviewId) {
      toast.error("Unable to submit interview: missing interview ID");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await api.post(`/mock-interviews/${interviewId}/submit`, {
        answers: answers,
      });

      const interviewData = response.data.data || response.data;
      setEvaluation(interviewData.evaluation || {
        overall_score: 85,
        summary: "Great job! You showed strong understanding of the fundamentals.",
        strengths: ["Clear communication", "Good technical knowledge"],
        improvements: ["Could provide more specific examples", "Work on pacing"],
        improved_answer: "This is an example of how your answers could be improved..."
      });
      toast.success("Interview submitted for evaluation!");
    } catch (err) {
      setError(err.message || "Failed to submit interview");
      toast.error("Could not submit interview");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Restart interview
  const restartInterview = () => {
    setStep(1);
    setTargetRole("");
    setDifficulty("medium");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setCurrentAnswer("");
    setEvaluation(null);
    setInterviewId(null);
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
              Mock Interview Practice
            </h1>
            <p className="text-zinc-400 mt-2">
              Practice your interview skills with AI-generated questions and get detailed feedback
            </p>
          </div>

          {/* Step 1: Setup */}
          {step === 1 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <h2 className="text-xl font-semibold mb-4">Get Started</h2>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-zinc-400">
                    Target Job Role
                  </label>
                  <input
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g., Frontend Developer, Data Scientist"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:border-violet-500"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-zinc-400">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:border-violet-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    onClick={startInterview}
                    disabled={isLoading}
                    className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-b-2 border-white"></span>
                        Starting...
                      </>
                    ) : (
                      <>
                        <FaPlayCircle />
                        Start Interview
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 2: Interview */}
          {step === 2 && (
            <>
              {/* Progress */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </h2>
                <div className="w-full bg-zinc-800/50 rounded-full h-2.5 mb-4">
                  <div
                    className={`bg-gradient-to-r from-violet-500 to-violet-600 h-2.5 rounded-full transition-all duration-500`}
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
                <p className="text-center text-zinc-400 text-sm">
                  {currentQuestionIndex + 1}/{questions.length}
                </p>
              </div>

              {/* Question Card */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 flex items-center justify-center bg-violet-900/20 rounded-full text-violet-400">
                      <FaEdit />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">
                      {questions[currentQuestionIndex] || "Loading question..."}
                    </h3>
                    <p className="text-zinc-400 text-sm">
                      Take your time to provide a thoughtful answer. Aim for 1-2 minutes of speaking time.
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block mb-2 text-sm font-medium text-zinc-400">
                    Your Answer
                  </label>
                  <textarea
                    value={currentAnswer}
                    onChange={handleAnswerChange}
                    placeholder="Type your answer here..."
                    rows={8}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:border-violet-500 resize-none"
                  />
                  <div className="flex justify-between mt-2 text-sm text-zinc-500">
                    <span>Words: {currentAnswer.trim().split(/\s+/).filter(Boolean).length}</span>
                    <span>Characters: {currentAnswer.length}</span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="mt-8 flex justify-between">
                <button
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0 || isLoading}
                  className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {currentQuestionIndex === 0 ? (
                    <FaTimesCircle className="opacity-50" />
                  ) : (
                    <FaUndo />
                  )}
                  Previous Question
                </button>

                <button
                  onClick={
                    currentQuestionIndex === questions.length - 1
                      ? submitInterview
                      : goToNextQuestion
                  }
                  disabled={isLoading || isSubmitting}
                  className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading || isSubmitting ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-b-2 border-white"></span>
                      {isSubmitting ? "Submitting..." : "Next Question"}
                    </>
                  ) : (
                    <>
                      {currentQuestionIndex === questions.length - 1 ? (
                        <FaCheckCircle />
                      ) : (
                        <FaArrowRight />
                      )}
                      {currentQuestionIndex === questions.length - 1
                        ? "Finish Interview"
                        : "Next Question"}
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Step 3: Results */}
          {step === 3 && (
            <>
              {!evaluation && !error ? (
                <div className="text-center text-zinc-500 py-12">
                  <FaSpinner className="animate-spin h-8 w-8 mb-4" />
                  <p className="mt-2">Getting your evaluation...</p>
                </div>
              ) : null}

              {error && (
                <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <FaTimesCircle className="text-red-400 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-400 mb-2">Evaluation Failed</h3>
                      <p className="text-zinc-300">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {evaluation && (
                <div className="space-y-6">
                  {/* Score */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold">
                        <FaChartBar /> Overall Score
                      </h2>
                      <div className="text-5xl font-bold text-violet-400">
                        {evaluation.overall_score}/100
                      </div>
                    </div>
                    <div className="w-full bg-zinc-800/50 rounded-full h-4 mb-3">
                      <div
                        className={`bg-gradient-to-r from-violet-500 to-violet-600 h-4 rounded-full transition-all duration-1000`}
                        style={{ width: `${Math.min(evaluation.overall_score, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-center text-zinc-400">
                      {evaluation.overall_score >= 80
                        ? "Excellent performance! 🎉"
                        : evaluation.overall_score >= 60
                          ? "Good effort with room for growth 👍"
                          : "Keep practicing - you'll get there! 💪"}
                    </p>
                  </div>

                  {/* Feedback */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                    <h2 className="text-xl font-bold mb-4">
                      <FaSpeechBubble /> Feedback Summary
                    </h2>
                    <p className="text-zinc-300 leading-relaxed">
                      {evaluation.summary || "No summary provided"}
                    </p>
                  </div>

                  {/* Strengths and Improvements */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                      <h2 className="text-xl font-bold mb-4">
                        <FaCheckCircle /> Strengths
                      </h2>
                      {(evaluation.strengths || []).length > 0 ? (
                        <ul className="space-y-2 text-zinc-300">
                          {evaluation.strengths.map((strength, index) => (
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
                      {(evaluation.improvements || []).length > 0 ? (
                        <ul className="space-y-2 text-zinc-300">
                          {evaluation.improvements.map((imp, index) => (
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
                  {evaluation.improved_answer && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                      <h2 className="text-xl font-bold mb-4">
                        <FaLightbulb /> Example Improved Answer
                      </h2>
                      <div className="bg-zinc-800/50 rounded-xl p-4">
                        <p className="text-zinc-300 whitespace-pre-wrap">
                          {evaluation.improved_answer}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-8 flex justify-end space-x-4">
                    <button
                      onClick={restartInterview}
                      className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition flex items-center gap-2"
                    >
                      <FaRedo />
                      New Interview
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default MockInterview;