import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Lightbulb,
  Star,
  BarChart3,
  Trophy,
  Target,
  Copy,
  Check,
  Award,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Percent,
  User,
  ShieldCheck,
  Clock,
} from "lucide-react";

import Navbar from "../components/Navbar";
import { getInterviewResult } from "../services/interviewService";
import { getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";

// Animated circular score ring
function ScoreRing({ score = 0, max = 100, size = 120, label, color = "#6366f1" }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(score / max, 0), 1);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={8}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - pct) }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-2xl font-bold text-slate-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {score.toFixed(1)}
          </motion.span>
          <span className="text-xs text-slate-400">/ {max}</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

// Parse text into bullet points
function parsePoints(text) {
  if (!text) return [];
  return text
    .split(/\n|(?<=\.)\s+(?=[A-Z•\-*])|^\s*[-•*]\s*/m)
    .map((s) => s.replace(/^[-•*\d.)\s]+/, "").trim())
    .filter(Boolean);
}

function InterviewResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedQuestionId, setCopiedQuestionId] = useState(null);

  // Check auth
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getInterviewResult(id);
        console.log("INTERVIEW RESULT DATA:", data);
        setResult(data);
      } catch (err) {
        console.error("RESULT ERROR:", err);
        setError(getErrorMessage(err, "Unable to load interview result."));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const copyToClipboard = (text, qId) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedQuestionId(qId);
    setTimeout(() => {
      setCopiedQuestionId(null);
    }, 2000);
  };

  // ─── Loading State ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 shadow-md">
              <BrainCircuit size={32} />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              Generating your comprehensive report...
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              AI is computing question-by-question accuracy comparisons and model answers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error State ──────────────────────────────────────────────────────────
  if (error || !result) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertCircle size={24} />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Report Not Available
            </h2>
            <p className="mt-2 text-sm text-slate-600">{error || "Unable to load evaluation."}</p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Retry
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const overallScore = result.overallScore ?? 0;
  const technicalScore = result.technicalScore ?? 0;
  const communicationScore = result.communicationScore ?? 0;

  const strengths = parsePoints(result.strengths);
  const weaknesses = parsePoints(result.weaknesses);
  const recommendations = parsePoints(result.recommendations);

  const questions = result.questions || [];

  const getVerdict = (score) => {
    if (score >= 80) return { title: "Ready for Target Role", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (score >= 60) return { title: "Good Foundation — Needs Targeted Practice", color: "text-amber-700 bg-amber-50 border-amber-200" };
    return { title: "Further Preparation Recommended", color: "text-rose-700 bg-rose-50 border-rose-200" };
  };

  const verdict = getVerdict(overallScore);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ─── Top Header Navigation ─── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/create-interview")}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700"
            >
              <Target size={16} />
              Start New Interview
            </button>
          </div>
        </div>

        {/* ─── Hero Performance Summary Card ─── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  AI Evaluation Report
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${verdict.color}`}>
                  {verdict.title}
                </span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Interview Performance Review
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Detailed evaluation for{" "}
                <strong className="text-slate-800">{result.interview?.role || "Target Role"}</strong>.
                Review how your answers compare against actual correct model answers below.
              </p>
            </div>

            {/* Score Rings */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
              <ScoreRing
                score={overallScore}
                label="Overall"
                size={120}
                color="#6366f1"
              />
              <ScoreRing
                score={technicalScore}
                label="Technical"
                size={110}
                color="#10b981"
              />
              <ScoreRing
                score={communicationScore}
                label="Clarity"
                size={110}
                color="#f59e0b"
              />
            </div>
          </div>
        </motion.section>

        {/* ─── Strengths, Areas to Improve, Recommendations ─── */}
        <div className="mb-10 grid gap-6 md:grid-cols-3">

          {/* Strengths */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={20} />
              </div>
              <h2 className="font-bold text-slate-900">Key Strengths</h2>
            </div>
            {strengths.length > 0 ? (
              <ul className="space-y-2.5">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 italic">
                {result.strengths || "Completed evaluation."}
              </p>
            )}
          </motion.div>

          {/* Areas to Improve */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                <AlertCircle size={20} />
              </div>
              <h2 className="font-bold text-slate-900">Areas to Improve</h2>
            </div>
            {weaknesses.length > 0 ? (
              <ul className="space-y-2.5">
                {weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 italic">
                {result.weaknesses || "No critical weaknesses noted."}
              </p>
            )}
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.3 }}
            className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Lightbulb size={20} />
              </div>
              <h2 className="font-bold text-slate-900">Recommendations</h2>
            </div>
            {recommendations.length > 0 ? (
              <ul className="space-y-2.5">
                {recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 italic">
                {result.recommendations || "Continue practicing core topics."}
              </p>
            )}
          </motion.div>
        </div>

        {/* ─── QUESTION BY QUESTION SIDE-BY-SIDE COMPARISON ─── */}
        <section className="mt-12 space-y-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <ShieldCheck size={20} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Detailed Answer Comparison & Accuracy Breakdown
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Question-by-Question Comparison
              </h2>
              <p className="text-sm text-slate-500">
                Compare your given answer side-by-side with the actual correct reference answer, including your accuracy match percentage.
              </p>
            </div>

            <div className="text-xs font-medium text-slate-500">
              Total questions reviewed: <strong className="text-slate-800">{questions.length}</strong>
            </div>
          </div>

          {questions.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              No questions recorded for this interview session.
            </div>
          ) : (
            questions.map((item, index) => {
              const accuracy = Math.round(item.accuracyPercentage ?? item.technicalAccuracy ?? item.score ?? 0);

              const getAccuracyBadge = (pct) => {
                if (pct >= 75) {
                  return {
                    badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
                    bar: "bg-emerald-500",
                    label: "High Match",
                  };
                }
                if (pct >= 50) {
                  return {
                    badge: "bg-amber-100 text-amber-800 border-amber-300",
                    bar: "bg-amber-500",
                    label: "Partial Match",
                  };
                }
                return {
                  badge: "bg-rose-100 text-rose-800 border-rose-300",
                  bar: "bg-rose-500",
                  label: "Needs Improvement",
                };
              };

              const accuracyStyle = getAccuracyBadge(accuracy);
              const isCopied = copiedQuestionId === item.questionId;

              return (
                <motion.div
                  key={item.questionId || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.1 }}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
                >
                  {/* Top Question Bar */}
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold text-white">
                        Question #{item.questionOrder ?? index + 1}
                      </span>
                      {item.topic && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {item.topic}
                        </span>
                      )}
                      {item.difficulty && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {item.difficulty}
                        </span>
                      )}
                    </div>

                    {/* Prominent Accuracy Match Percentage */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Answer Correctness Match
                        </span>
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="text-lg font-black text-slate-900 font-mono">
                            {accuracy}%
                          </span>
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${accuracyStyle.badge}`}
                          >
                            {accuracyStyle.label}
                          </span>
                        </div>
                      </div>

                      {/* Mini visual meter */}
                      <div className="hidden sm:block h-3 w-20 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${accuracyStyle.bar}`}
                          style={{ width: `${accuracy}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 leading-snug sm:text-xl">
                      {item.questionText}
                    </h3>
                  </div>

                  {/* ─── SIDE-BY-SIDE COMPARISON BOX ─── */}
                  <div className="mb-6 grid gap-6 lg:grid-cols-2">

                    {/* Left Column: What User Answered */}
                    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-inner">
                      <div>
                        <div className="mb-3 flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                          <div className="flex items-center gap-2 text-indigo-700">
                            <User size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">
                              Your Given Answer
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {item.candidateAnswer ? item.candidateAnswer.split(/\s+/).length : 0} words
                          </span>
                        </div>

                        <div className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap font-sans">
                          {item.candidateAnswer ? (
                            item.candidateAnswer
                          ) : (
                            <span className="italic text-slate-400">
                              No answer recorded for this question.
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-3 text-xs text-slate-500">
                        <span>Clarity: <strong>{Math.round(item.clarity ?? 0)}/100</strong></span>
                        <span>Completeness: <strong>{Math.round(item.completeness ?? 0)}/100</strong></span>
                      </div>
                    </div>

                    {/* Right Column: Actual Correct / Ideal Answer */}
                    <div className="flex flex-col justify-between rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm">
                      <div>
                        <div className="mb-3 flex items-center justify-between border-b border-emerald-200/60 pb-2.5">
                          <div className="flex items-center gap-2 text-emerald-800">
                            <Award size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">
                              Actual Correct / Ideal Answer
                            </span>
                          </div>

                          <button
                            onClick={() => copyToClipboard(item.idealAnswer, item.questionId)}
                            className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 transition"
                            title="Copy ideal answer to clipboard"
                          >
                            {isCopied ? (
                              <>
                                <Check size={12} className="text-emerald-600" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copy Answer</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap font-sans">
                          {item.idealAnswer ||
                            "A comprehensive answer defines the underlying principles, provides real-world code architecture examples, and explores operational trade-offs."}
                        </div>
                      </div>

                      <div className="mt-4 border-t border-emerald-200/60 pt-3 text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                        <span>Compare your answer above with these key concepts.</span>
                      </div>
                    </div>
                  </div>

                  {/* ─── AI Diagnostic Breakdown ─── */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                      AI Diagnostic & Feedback
                    </h4>

                    <div className="grid gap-4 md:grid-cols-2">
                      {/* What was correct */}
                      <div className="rounded-xl border border-emerald-100 bg-white p-4">
                        <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                          <CheckCircle2 size={15} />
                          <span>What you got right:</span>
                        </div>
                        <p className="text-xs leading-5 text-slate-600 whitespace-pre-wrap">
                          {item.correctPoints || "Covered foundational terminology."}
                        </p>
                      </div>

                      {/* What was missing */}
                      <div className="rounded-xl border border-amber-100 bg-white p-4">
                        <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-700">
                          <AlertCircle size={15} />
                          <span>What was missing from your answer:</span>
                        </div>
                        <p className="text-xs leading-5 text-slate-600 whitespace-pre-wrap">
                          {item.missingPoints || "Mentioning production trade-offs and edge cases."}
                        </p>
                      </div>
                    </div>

                    {/* Evaluator Feedback note */}
                    {item.feedback && (
                      <div className="mt-3 rounded-xl border border-indigo-100 bg-white p-4 text-xs leading-5 text-slate-700">
                        <strong className="text-indigo-700">Coaching Note:</strong> {item.feedback}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </section>

        {/* ─── Bottom Navigation Actions ─── */}
        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200 pt-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          <button
            onClick={() => navigate("/create-interview")}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
          >
            <Target size={16} />
            Practice Another Interview
          </button>
        </div>

      </main>
    </div>
  );
}

export default InterviewResultPage;
