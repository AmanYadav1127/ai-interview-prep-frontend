import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Send,
  Sparkles,
  Target,
} from "lucide-react";

import Navbar from "../components/Navbar";
import {
  startInterview,
  submitAnswer,
} from "../services/answerService";

function InterviewRoom() {
  const { id } = useParams();
  const navigate = useNavigate();

  const startedRef = useRef(false);

  const [interview, setInterview] = useState(null);
  const [question, setQuestion] = useState(null);

  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (startedRef.current) {
      return;
    }

    startedRef.current = true;

    const start = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await startInterview(id);

        console.log("START INTERVIEW RESPONSE:", response);

        setInterview(response.interview);
        setQuestion(response.question);
      } catch (err) {
        console.error("START INTERVIEW ERROR:", err);

        setError(
          err.response?.data?.message ||
            err.response?.data ||
            "Unable to start interview."
        );
      } finally {
        setLoading(false);
      }
    };

    start();
  }, [id]);

  const handleSubmit = async () => {
    setError("");

    if (!answer.trim()) {
      setError("Please write your answer before submitting.");
      return;
    }

    if (!question?.id) {
      setError(
        "Question is not available. Please refresh the interview."
      );
      return;
    }

    try {
      setSubmitting(true);

      console.log("SUBMITTING QUESTION ID:", question.id);

      const response = await submitAnswer(
        question.id,
        answer
      );

      console.log("SUBMIT ANSWER RESPONSE:", response);

      if (response.interviewCompleted) {
        navigate(`/interview/${id}/result`);
        return;
      }

      if (!response.nextQuestion) {
        setError("AI did not return the next question.");
        return;
      }

      setQuestion(response.nextQuestion);
      setAnswer("");
    } catch (err) {
      console.error("SUBMIT ANSWER ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to submit answer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
              <BrainCircuit size={28} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Preparing your interview...
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              AI is getting your first question ready.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !question) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4">
          <div className="w-full rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              !
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Unable to start interview
            </h2>

            <p className="mt-2 text-sm text-red-500">
              {error}
            </p>

            <button
              onClick={() => navigate("/dashboard")}
              className="mt-6 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion =
    question?.questionOrder !== undefined
      ? question.questionOrder + 1
      : 1;

  const totalQuestions = interview?.questionLimit || 5;

  const progress = Math.min(
    (currentQuestion / totalQuestions) * 100,
    100
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              LIVE INTERVIEW
            </p>

            <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
              {interview?.title}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {interview?.role}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm ring-1 ring-slate-200">
            <Clock3 size={17} className="text-slate-400" />

            <span className="text-sm font-semibold text-slate-700">
              Question {currentQuestion} / {totalQuestions}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
            <span>Interview progress</span>
            <span>{Math.round(progress)}%</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">

          {/* Main */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                  <BrainCircuit size={22} />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-slate-900">
                      AI Interviewer
                    </h2>

                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      LIVE
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Adaptive AI interviewer
                  </p>
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="px-6 py-7 sm:px-8 sm:py-9">

              <div className="mb-4 flex items-center gap-2">
                <Sparkles
                  size={17}
                  className="text-indigo-600"
                />

                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Question {currentQuestion}
                </span>
              </div>

              <h2 className="text-2xl font-bold leading-9 tracking-tight text-slate-900 sm:text-3xl">
                {question?.questionText}
              </h2>

              {question?.questionType && (
                <div className="mt-5 inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                  {question.questionType.replaceAll("_", " ")}
                </div>
              )}

              {/* Answer */}
              <div className="mt-8">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Your answer
                </label>

                <textarea
                  value={answer}
                  onChange={(e) => {
                    setAnswer(e.target.value);
                    setError("");
                  }}
                  placeholder="Type your answer here..."
                  rows={9}
                  disabled={submitting}
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-70"
                />

                <div className="mt-2 flex justify-end">
                  <span className="text-xs text-slate-400">
                    {answer.length} characters
                  </span>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    AI is evaluating...
                  </>
                ) : (
                  <>
                    Submit Answer
                    <Send
                      size={17}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <Sparkles size={19} />
              </div>

              <h3 className="mt-4 font-bold text-slate-900">
                Adaptive AI
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Your next question is selected based on how you answer the
                current one.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-slate-900">
                Interview details
              </h3>

              <div className="mt-5 space-y-4">

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Difficulty
                  </span>

                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                    {interview?.difficulty}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Mode
                  </span>

                  <span className="text-sm font-semibold text-slate-800">
                    {interview?.mode}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Type
                  </span>

                  <span className="text-sm font-semibold text-slate-800">
                    {interview?.type === "LIVE_ADAPTIVE"
                      ? "Adaptive AI"
                      : "Normal"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Questions
                  </span>

                  <span className="text-sm font-semibold text-slate-800">
                    {totalQuestions}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-indigo-600" />

                <h3 className="font-bold text-slate-900">
                  Quick tip
                </h3>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Explain your thinking clearly. For technical questions,
                include examples whenever possible.
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default InterviewRoom;