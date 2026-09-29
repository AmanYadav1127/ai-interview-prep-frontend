import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Mic,
  MicOff,
  Repeat,
  Send,
  Sparkles,
  Target,
  AlertCircle,
  Volume2,
  VolumeX,
  TrendingUp,
  MessageSquare,
  Flame,
  Check,
  LogOut,
  ChevronRight,
  User,
} from "lucide-react";

import Navbar from "../components/Navbar";
import { startInterview, submitAnswer, completeInterview } from "../services/answerService";
import { getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";

function InterviewRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const startedRef = useRef(false);

  const [interview, setInterview] = useState(null);
  const [question, setQuestion] = useState(null);

  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completingEarly, setCompletingEarly] = useState(false);
  const [error, setError] = useState("");

  // Dialogue / Transcript History for live conversational feel
  const [dialogueHistory, setDialogueHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("current"); // "current" | "dialogue"

  // AI feedback from previous evaluation
  const [lastEvaluation, setLastEvaluation] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // ─── Timer state ────────────────────────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState(600); // in seconds
  const [timeExpired, setTimeExpired] = useState(false);

  // ─── Voice mode (browser Web Speech APIs) ──────────────────────────────
  const [speakOn, setSpeakOn] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const recognitionRef = useRef(null);

  const SpeechRecognitionImpl =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;
  const speechSupported = !!SpeechRecognitionImpl;

  const isLiveInterview = interview?.type === "LIVE_ADAPTIVE";
  const isVoiceInterview = interview?.mode === "VOICE";

  // Check auth
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Text to Speech
  const speak = (text) => {
    if (!("speechSynthesis" in window) || !text) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synth.speak(utterance);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
    setInterimText("");
  };

  const startListening = () => {
    setVoiceError("");

    if (!SpeechRecognitionImpl) {
      setVoiceError(
        "Speech recognition is not supported in this browser. Use Chrome, Edge, or Safari — or type your answer below."
      );
      return;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      const recognition = new SpeechRecognitionImpl();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let finalChunk = "";
        let interim = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += transcript;
          } else {
            interim += transcript;
          }
        }

        if (finalChunk.trim()) {
          setAnswer((prev) =>
            prev ? `${prev} ${finalChunk.trim()}` : finalChunk.trim()
          );
          setError("");
        }

        setInterimText(interim);
      };

      recognition.onerror = (event) => {
        if (
          event.error === "not-allowed" ||
          event.error === "service-not-allowed"
        ) {
          setVoiceError(
            "Microphone access was blocked. Allow microphone permission in your browser and try again."
          );
        } else if (event.error !== "aborted" && event.error !== "no-speech") {
          setVoiceError(`Speech recognition error: ${event.error}`);
        }
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
        setInterimText("");
      };

      recognition.start();
      recognitionRef.current = recognition;
      setListening(true);
    } catch (err) {
      setVoiceError(`Could not start speech recognition. ${err?.message || ""}`);
      setListening(false);
    }
  };

  // Sound preference on/off
  useEffect(() => {
    if (interview?.mode) {
      setSpeakOn(interview.mode === "VOICE");
    }
  }, [interview?.mode]);

  // Read each new question aloud when sound is on
  useEffect(() => {
    if (!question?.questionText) return;
    if (speakOn) {
      speak(question.questionText);
    } else if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.id, speakOn]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  // Initialize countdown timer based on interview duration
  useEffect(() => {
    if (!interview) return;
    const duration = (interview.durationMinutes || 10) * 60;
    if (interview.startedAt) {
      const elapsed = Math.floor(
        (Date.now() - new Date(interview.startedAt).getTime()) / 1000
      );
      setTimeLeft(Math.max(0, duration - elapsed));
    } else {
      setTimeLeft(duration);
    }
  }, [interview]);

  // Tick timer
  useEffect(() => {
    if (loading || timeLeft <= 0 || timeExpired) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, timeLeft, timeExpired]);

  const handleTimeExpired = async () => {
    setTimeExpired(true);
    stopListening();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();

    try {
      await completeInterview(id);
    } catch (e) {
      console.warn("Time expired completeInterview warning:", e);
    }

    setTimeout(() => {
      navigate(`/interview/${id}/result`);
    }, 3000);
  };

  // Start interview load
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const start = async () => {
      try {
        setLoading(true);
        setError("");

        const firstQuestion = await startInterview(id);
        console.log("START INTERVIEW RESPONSE:", firstQuestion);

        setInterview(firstQuestion.interview);
        setQuestion(firstQuestion);

        // Add initial question to dialog history
        setDialogueHistory([
          {
            sender: "interviewer",
            text: firstQuestion.questionText,
            topic: firstQuestion.topic,
            order: firstQuestion.questionOrder ?? 0,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } catch (err) {
        console.error("START INTERVIEW ERROR:", err);
        setError(getErrorMessage(err, "Unable to start interview."));
      } finally {
        setLoading(false);
      }
    };

    start();
  }, [id]);

  const handleSubmit = async () => {
    stopListening();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    setError("");

    if (!answer.trim()) {
      setError("Please write (or speak) your answer before submitting.");
      return;
    }

    if (!question?.id) {
      setError("Question is not available. Please refresh the interview.");
      return;
    }

    const submittedAnswerText = answer.trim();

    try {
      setSubmitting(true);
      setShowFeedback(false);

      // Record candidate's answer into dialogue history
      setDialogueHistory((prev) => [
        ...prev,
        {
          sender: "candidate",
          text: submittedAnswerText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);

      const nextQuestion = await submitAnswer(question.id, submittedAnswerText);
      console.log("SUBMIT ANSWER RESPONSE:", nextQuestion);

      const isLastAnswer =
        (nextQuestion.questionOrder ?? 0) + 1 >= (interview?.questionLimit ?? 1);

      if (isLastAnswer) {
        try {
          await completeInterview(id);
        } catch (e) {
          console.warn("completeInterview failed (non-fatal):", e);
        }
        navigate(`/interview/${id}/result`);
        return;
      }

      setLastEvaluation({
        message: "Your answer was received and analyzed by AI.",
        nextTopic: nextQuestion.topic,
        nextDifficulty: nextQuestion.difficulty,
      });
      setShowFeedback(true);

      // Add the next question to dialogue history
      setDialogueHistory((prev) => [
        ...prev,
        {
          sender: "interviewer",
          text: nextQuestion.questionText,
          topic: nextQuestion.topic,
          order: nextQuestion.questionOrder ?? 0,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);

      setQuestion(nextQuestion);
      setAnswer("");
    } catch (err) {
      console.error("SUBMIT ANSWER ERROR:", err);
      setError(getErrorMessage(err, "Unable to submit answer."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishEarly = async () => {
    if (!window.confirm("Are you sure you want to end the interview now and generate your evaluation report?")) {
      return;
    }

    setCompletingEarly(true);
    stopListening();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();

    try {
      await completeInterview(id);
      navigate(`/interview/${id}/result`);
    } catch (err) {
      console.error(err);
      navigate(`/interview/${id}/result`);
    } finally {
      setCompletingEarly(false);
    }
  };

  // Timer formatted MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentQuestionNumber = (question?.questionOrder ?? 0) + 1;
  const totalQuestions = interview?.questionLimit ?? 5;
  const progress = Math.min((currentQuestionNumber / totalQuestions) * 100, 100);

  const difficultyColor = {
    EASY: "bg-emerald-50 text-emerald-700 border-emerald-200",
    MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
    HARD: "bg-red-50 text-red-700 border-red-200",
  };

  // Timer styling
  const isTimeCritical = timeLeft <= 60;
  const isTimeWarning = timeLeft <= 180 && !isTimeCritical;

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
              Connecting to Interview Room...
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {isLiveInterview
                ? "Alex (AI Interviewer) is reviewing your role and preparing the warm-up introduction."
                : "AI is setting up your structured technical questions."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error State ──────────────────────────────────────────────────────────
  if (error && !question) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertCircle size={24} />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Interview Unavailable
            </h2>
            <p className="mt-2 text-sm text-slate-600">{error}</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      {/* Time Expired Overlay Modal */}
      <AnimatePresence>
        {timeExpired && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <Clock3 size={28} />
              </div>
              <h3 className="mt-4 text-2xl font-bold text-slate-900">
                Session Time Expired
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                The allotted interview duration has completed. AI is compiling
                your comprehensive evaluation and answer comparison report...
              </p>
              <div className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600/30 border-t-indigo-600" />
                Redirecting to your results...
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ─── Top Header Bar with Session Countdown Timer ─── */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                  isLiveInterview
                    ? "bg-violet-100 text-violet-700"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {isLiveInterview ? (
                  <>
                    <Sparkles size={13} className="text-violet-600" />
                    Live 1-on-1 Adaptive
                  </>
                ) : (
                  <>
                    <Target size={13} />
                    Normal Structured Interview
                  </>
                )}
              </span>

              {isVoiceInterview && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  <Mic size={12} /> Voice Enabled
                </span>
              )}
            </div>

            <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              {interview?.title || "Technical Interview"}
            </h1>
            <p className="text-xs text-slate-500">
              Role: <span className="font-semibold text-slate-700">{interview?.role}</span> • Target: {interview?.difficulty}
            </p>
          </div>

          {/* Right Action Widgets: Timer & End Early */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Session Countdown Timer */}
            <div
              className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 shadow-sm transition ${
                isTimeCritical
                  ? "border-red-300 bg-red-50 text-red-700 animate-pulse"
                  : isTimeWarning
                  ? "border-amber-300 bg-amber-50 text-amber-800"
                  : "border-slate-200 bg-slate-50 text-slate-800"
              }`}
            >
              <Clock3
                size={18}
                className={
                  isTimeCritical
                    ? "text-red-600"
                    : isTimeWarning
                    ? "text-amber-600"
                    : "text-indigo-600"
                }
              />
              <div className="text-left">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isTimeCritical
                    ? "Final Seconds"
                    : isTimeWarning
                    ? "Wrap-Up Phase"
                    : "Time Remaining"}
                </span>
                <span className="font-mono text-base font-bold">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            {/* Question Counter */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700">
              Question <span className="text-indigo-600 font-bold">{currentQuestionNumber}</span> / {totalQuestions}
            </div>

            {/* Finish & View Report early */}
            <button
              onClick={handleFinishEarly}
              disabled={completingEarly || submitting}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              <LogOut size={14} />
              {completingEarly ? "Ending..." : "End Early"}
            </button>
          </div>
        </div>

        {/* ─── Pacing & Wrap-up Banner (AI Time Awareness) ─── */}
        {isTimeWarning && (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
            <Flame size={16} className="text-amber-600 shrink-0" />
            <span>
              <strong>Pacing notice:</strong> Under 3 minutes remaining in this session. The AI interviewer is pacing your responses to ensure a smooth conclusion on time.
            </span>
          </div>
        )}

        {/* ─── Progress Bar ─── */}
        <div className="mb-6">
          <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-500">
            <span>Interview progression</span>
            <span>{Math.round(progress)}% completed</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <motion.div
              className="h-full rounded-full bg-indigo-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* ─── Layout Grid ─── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_310px]">

          {/* ── Main Interactive Column ── */}
          <div className="space-y-5">

            {/* Tab switch for Live Dialogue vs Current Question */}
            {isLiveInterview && (
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setActiveTab("current")}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                    activeTab === "current"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Sparkles size={14} />
                  Active Interview Console
                </button>

                <button
                  onClick={() => setActiveTab("dialogue")}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                    activeTab === "dialogue"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <MessageSquare size={14} />
                  Full Conversation Dialogue ({dialogueHistory.length})
                </button>
              </div>
            )}

            {/* AI Evaluation feedback chip */}
            <AnimatePresence>
              {showFeedback && lastEvaluation && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                      <CheckCircle2 size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-emerald-900">
                        {lastEvaluation.message}
                      </p>
                      {lastEvaluation.nextTopic && (
                        <p className="mt-1 text-xs text-emerald-700">
                          Next Focus Area: <span className="font-bold">{lastEvaluation.nextTopic}</span>
                          {lastEvaluation.nextDifficulty && (
                            <span className="ml-2 rounded-full bg-emerald-200/70 px-2 py-0.5 text-[10px] font-bold uppercase">
                              {lastEvaluation.nextDifficulty}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setShowFeedback(false)}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-800"
                    >
                      Dismiss
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TAB 1: ACTIVE QUESTION & ANSWER INTERACTION */}
            {activeTab === "current" && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={question?.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  {/* Card Header: AI Interviewer Persona Header */}
                  <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="relative">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
                            <BrainCircuit size={24} />
                          </div>
                          {isSpeaking && (
                            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500" />
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="font-bold text-slate-900 text-base">
                              {isLiveInterview ? "Alex — Senior AI Interviewer" : "Technical Interview Question"}
                            </h2>
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-200 flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              ONLINE
                            </span>
                          </div>

                          {/* Dynamic State Indicator */}
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                            {submitting ? (
                              <span className="text-indigo-600 font-semibold flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
                                Analyzing your answer & adapting follow-up...
                              </span>
                            ) : isSpeaking ? (
                              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                <span className="flex gap-0.5">
                                  <span className="h-2 w-1 bg-emerald-500 animate-bounce" />
                                  <span className="h-3 w-1 bg-emerald-500 animate-bounce delay-100" />
                                  <span className="h-2 w-1 bg-emerald-500 animate-bounce delay-200" />
                                </span>
                                Speaking to you...
                              </span>
                            ) : listening ? (
                              <span className="text-red-600 font-semibold flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                Listening to your voice...
                              </span>
                            ) : (
                              <span>
                                {isLiveInterview
                                  ? (currentQuestionNumber === 1
                                      ? "Starting with candidate introduction & warm-up"
                                      : "Adapting question according to your answer")
                                  : "Standard structured assessment"}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Sound Controls */}
                      <div className="flex items-center gap-2">
                        {speakOn !== null && (
                          <button
                            onClick={() => setSpeakOn(!speakOn)}
                            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600"
                          >
                            {speakOn ? <Volume2 size={14} className="text-indigo-600" /> : <VolumeX size={14} />}
                            {speakOn ? "Voice On" : "Voice Muted"}
                          </button>
                        )}
                        {speakOn && (
                          <button
                            onClick={() => speak(question?.questionText)}
                            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600"
                          >
                            <Repeat size={13} />
                            Replay
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Question Prompt Body */}
                  <div className="px-6 py-6 sm:px-8 sm:py-7">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                        Question {currentQuestionNumber}
                      </span>
                      {question?.topic && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {question.topic}
                        </span>
                      )}
                      {question?.difficulty && (
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            difficultyColor[question.difficulty] ?? "bg-slate-100"
                          }`}
                        >
                          {question.difficulty}
                        </span>
                      )}
                      {currentQuestionNumber === totalQuestions && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                          Final Question
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl font-bold leading-8 tracking-tight text-slate-900 sm:text-2xl sm:leading-9">
                      {question?.questionText}
                    </h2>

                    {/* Candidate Answer Box */}
                    <div className="mt-7">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <label className="block text-sm font-semibold text-slate-700">
                          Your Answer / Response
                        </label>

                        {/* Speech Toggle Button */}
                        {speechSupported ? (
                          <button
                            onClick={listening ? stopListening : startListening}
                            disabled={submitting}
                            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              listening
                                ? "bg-red-500 text-white shadow-lg shadow-red-500/25 hover:bg-red-600 animate-pulse"
                                : "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
                            }`}
                          >
                            {listening ? (
                              <>
                                <MicOff size={14} /> Stop Recording
                              </>
                            ) : (
                              <>
                                <Mic size={14} /> Speak Answer (Mic)
                              </>
                            )}
                          </button>
                        ) : (
                          isVoiceInterview && (
                            <span className="text-xs text-amber-600">
                              Voice input requires Chrome, Edge, or Safari
                            </span>
                          )
                        )}
                      </div>

                      {listening && (
                        <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
                          <span className="mt-1 h-2 w-2 shrink-0 animate-pulse rounded-full bg-red-500" />
                          <span>
                            Listening... Speak naturally.
                            {interimText && (
                              <span className="italic font-medium text-slate-700">
                                {" "}"{interimText}"
                              </span>
                            )}
                          </span>
                        </div>
                      )}

                      {voiceError && (
                        <div className="mb-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                          <AlertCircle size={14} className="mt-0.5 shrink-0" />
                          {voiceError}
                        </div>
                      )}

                      <textarea
                        value={answer}
                        onChange={(e) => {
                          setAnswer(e.target.value);
                          setError("");
                        }}
                        placeholder={
                          currentQuestionNumber === 1 && isLiveInterview
                            ? "Introduce yourself, your background, and the technologies or projects you've worked with..."
                            : isVoiceInterview
                            ? "Tap 'Speak Answer (Mic)' to talk, or type your answer here..."
                            : "Type your answer clearly. Include practical real-world patterns or code concepts..."
                        }
                        rows={8}
                        disabled={submitting}
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60"
                      />

                      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                        <span>
                          {isLiveInterview
                            ? "Alex will adapt the next question based on what you share here."
                            : "Be clear, concise, and structured."}
                        </span>
                        <span>{answer.length} characters</span>
                      </div>
                    </div>

                    {error && (
                      <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        {error}
                      </div>
                    )}

                    {/* Submit Action */}
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || !answer.trim()}
                      className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          {isLiveInterview
                            ? "Alex is evaluating your answer & preparing the next question..."
                            : "AI is evaluating your response..."}
                        </>
                      ) : (
                        <>
                          {currentQuestionNumber === totalQuestions
                            ? "Submit Final Answer & Generate Report"
                            : "Submit Answer & Continue"}
                          <Send
                            size={16}
                            className="transition-transform group-hover:translate-x-0.5"
                          />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {/* TAB 2: FULL CONVERSATION DIALOGUE */}
            {activeTab === "dialogue" && isLiveInterview && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Live Interview Conversation Dialogue
                    </h3>
                    <p className="text-xs text-slate-500">
                      Chronological transcript of your live 1-on-1 interview
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("current")}
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    Return to Question
                  </button>
                </div>

                <div className="space-y-4">
                  {dialogueHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${
                        item.sender === "candidate" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {item.sender === "interviewer" && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white text-xs font-bold">
                          AI
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] rounded-2xl p-4 text-sm leading-6 ${
                          item.sender === "candidate"
                            ? "bg-indigo-600 text-white"
                            : "border border-slate-200 bg-slate-50 text-slate-800"
                        }`}
                      >
                        <div className="mb-1 flex items-center gap-2 text-[10px] opacity-75">
                          <span className="font-bold uppercase">
                            {item.sender === "candidate" ? "You" : "Alex (Interviewer)"}
                          </span>
                          {item.timestamp && <span>{item.timestamp}</span>}
                          {item.topic && (
                            <span className="rounded bg-black/10 px-1 py-0.2">
                              {item.topic}
                            </span>
                          )}
                        </div>
                        <p className="whitespace-pre-wrap">{item.text}</p>
                      </div>

                      {item.sender === "candidate" && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-700 text-xs font-bold">
                          <User size={14} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar Details ── */}
          <div className="space-y-5">

            {/* Persona Information Card in Live Mode */}
            {isLiveInterview && (
              <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Person vs Person Dynamic
                    </h3>
                    <p className="text-xs text-slate-500">Live AI Interview Mode</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2.5 text-xs leading-5 text-slate-600">
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-600" />
                    <span>
                      <strong>Adaptive questions:</strong> Alex listens to your responses and formulates follow-ups tailored to your statements.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-600" />
                    <span>
                      <strong>Timer awareness:</strong> The AI manages pacing to conclude your interview gracefully before the session timer expires.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Interview Configuration Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm">Interview Session</h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Difficulty</span>
                  <span
                    className={`rounded-full border px-2 py-0.5 font-semibold ${
                      difficultyColor[interview?.difficulty] ?? "bg-slate-100"
                    }`}
                  >
                    {interview?.difficulty}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Target Role</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                    {interview?.role}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Duration</span>
                  <span className="font-semibold text-slate-800">
                    {interview?.durationMinutes || 10} Minutes
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Questions</span>
                  <span className="font-semibold text-slate-800">
                    {totalQuestions} Total
                  </span>
                </div>
              </div>
            </div>

            {/* Question Sequence Steps */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Question Roadmap</h3>
              </div>

              <div className="space-y-2">
                {Array.from({ length: totalQuestions }).map((_, i) => {
                  const isCurrent = i === currentQuestionNumber - 1;
                  const isDone = i < currentQuestionNumber - 1;

                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs transition ${
                        isCurrent
                          ? "bg-indigo-50 border border-indigo-200 font-bold text-indigo-700"
                          : isDone
                          ? "text-slate-500"
                          : "text-slate-400"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isDone ? (
                          <Check size={13} className="text-emerald-600" />
                        ) : isCurrent ? (
                          <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-slate-300" />
                        )}
                        {i === 0 && isLiveInterview
                          ? "1. Introduction & Warm-up"
                          : i === totalQuestions - 1
                          ? `${i + 1}. Final Wrap-up Question`
                          : `Question ${i + 1}`}
                      </span>

                      {isCurrent && (
                        <span className="rounded bg-indigo-600 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                          Now
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pro Tip */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-600">
                <Target size={16} />
                <h4 className="font-bold text-slate-900 text-xs">Interview Tip</h4>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Structure your answers with the STAR method (Situation, Task, Action, Result) or define concept → implementation → trade-offs.
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default InterviewRoom;