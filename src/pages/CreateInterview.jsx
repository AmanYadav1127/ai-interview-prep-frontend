import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Check,
  FileText,
  Mic,
  Sparkles,
  Target,
} from "lucide-react";

import Navbar from "../components/Navbar";
import { createInterview } from "../services/interviewService";

function CreateInterview() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    role: "",
    mode: "TEXT",
    type: "LIVE_ADAPTIVE",
    difficulty: "MEDIUM",
    questionLimit: 5,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.title.trim() || !form.role.trim()) {
      setError("Please enter interview title and job role.");
      return;
    }

    setLoading(true);

    try {
      const response = await createInterview({
        title: form.title,
        role: form.role,
        mode: form.mode,
        type: form.type,
        difficulty: form.difficulty,
        questionLimit: Number(form.questionLimit),
      });

      navigate(`/interview/${response.id}`);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to create interview."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Back */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <BrainCircuit size={25} />
          </div>

          <p className="text-sm font-semibold text-indigo-600">
            NEW INTERVIEW
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Create your interview
          </h1>

          <p className="mt-3 max-w-2xl text-slate-500">
            Configure your interview and let AI create a personalized
            practice experience for you.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

            {/* Main Form */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

              {/* Basic Information */}
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <FileText size={18} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Interview details
                    </h2>

                    <p className="text-xs text-slate-500">
                      Tell us what you want to practice
                    </p>
                  </div>
                </div>

                <div className="space-y-5">

                  {/* Title */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Interview title
                    </label>

                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Java Backend Interview"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Job role
                    </label>

                    <input
                      type="text"
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      placeholder="Java Backend Developer"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>
              </div>

              <div className="my-8 border-t border-slate-100" />

              {/* Interview Mode */}
              <div>
                <div className="mb-4">
                  <h2 className="font-bold text-slate-900">
                    Interview mode
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Choose how you want to answer questions
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">

                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        mode: "TEXT",
                      }))
                    }
                    className={`rounded-2xl border p-5 text-left transition ${
                      form.mode === "TEXT"
                        ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/10"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                        <FileText size={20} />
                      </div>

                      {form.mode === "TEXT" && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white">
                          <Check size={14} />
                        </div>
                      )}
                    </div>

                    <h3 className="mt-4 font-semibold text-slate-900">
                      Text Interview
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      Type your answers and get AI feedback.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        mode: "VOICE",
                      }))
                    }
                    className={`rounded-2xl border p-5 text-left transition ${
                      form.mode === "VOICE"
                        ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/10"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                        <Mic size={20} />
                      </div>

                      {form.mode === "VOICE" && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white">
                          <Check size={14} />
                        </div>
                      )}
                    </div>

                    <h3 className="mt-4 font-semibold text-slate-900">
                      Voice Interview
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      Practice speaking your answers naturally.
                    </p>
                  </button>

                </div>
              </div>

              <div className="my-8 border-t border-slate-100" />

              {/* Type */}
              <div>
                <div className="mb-4">
                  <h2 className="font-bold text-slate-900">
                    Interview type
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Choose how the AI should conduct your interview
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">

                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        type: "NORMAL",
                      }))
                    }
                    className={`rounded-2xl border p-5 text-left transition ${
                      form.type === "NORMAL"
                        ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/10"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <Target
                        size={21}
                        className="text-indigo-600"
                      />

                      {form.type === "NORMAL" && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white">
                          <Check size={14} />
                        </div>
                      )}
                    </div>

                    <h3 className="mt-4 font-semibold text-slate-900">
                      Normal Interview
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      Follow a structured interview flow.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        type: "LIVE_ADAPTIVE",
                      }))
                    }
                    className={`rounded-2xl border p-5 text-left transition ${
                      form.type === "LIVE_ADAPTIVE"
                        ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/10"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <Sparkles
                        size={21}
                        className="text-violet-600"
                      />

                      {form.type === "LIVE_ADAPTIVE" && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white">
                          <Check size={14} />
                        </div>
                      )}
                    </div>

                    <h3 className="mt-4 font-semibold text-slate-900">
                      Live Adaptive AI
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      AI adapts every question to your answers.
                    </p>
                  </button>

                </div>
              </div>

              <div className="my-8 border-t border-slate-100" />

              {/* Difficulty + Questions */}
              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Difficulty
                  </label>

                  <select
                    name="difficulty"
                    value={form.difficulty}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Number of questions
                  </label>

                  <select
                    name="questionLimit"
                    value={form.questionLimit}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  >
                    <option value="3">3 Questions</option>
                    <option value="5">5 Questions</option>
                    <option value="7">7 Questions</option>
                    <option value="10">10 Questions</option>
                  </select>
                </div>

              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating interview...
                  </>
                ) : (
                  <>
                    Create Interview
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </div>

            {/* Right Side */}
            <div className="space-y-5">

              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <Sparkles size={21} />
                </div>

                <h3 className="mt-5 font-bold text-slate-900">
                  Live Adaptive AI
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Your interview isn't based on a fixed script. AI analyzes
                  your answers and decides what to ask next.
                </p>

                <div className="mt-5 space-y-3">
                  {[
                    "Evaluates your answer",
                    "Identifies weak areas",
                    "Adjusts question difficulty",
                    "Chooses the next topic",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-sm text-slate-600"
                    >
                      <Check
                        size={16}
                        className="shrink-0 text-indigo-600"
                      />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-bold text-slate-900">
                  Interview summary
                </h3>

                <div className="mt-5 space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mode</span>
                    <span className="font-semibold text-slate-900">
                      {form.mode === "TEXT" ? "Text" : "Voice"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Type</span>
                    <span className="font-semibold text-slate-900">
                      {form.type === "LIVE_ADAPTIVE"
                        ? "Adaptive AI"
                        : "Normal"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Difficulty</span>
                    <span className="font-semibold text-slate-900">
                      {form.difficulty}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Questions</span>
                    <span className="font-semibold text-slate-900">
                      {form.questionLimit}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

export default CreateInterview;