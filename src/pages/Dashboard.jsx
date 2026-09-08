import { useEffect, useState } from "react";
import {
  BarChart3,
  BrainCircuit,
  Plus,
  Target,
  Trophy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import InterviewCard from "../components/InterviewCard";

import { getDashboard } from "../services/dashboardService";
import { getInterviews } from "../services/interviewService";

function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [interviews, setInterviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [dashboardData, interviewData] = await Promise.all([
          getDashboard(),
          getInterviews(),
        ]);

        setDashboard(dashboardData);
        setInterviews(interviewData);
      } catch (err) {
        console.error(err);
        setError("Unable to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <section className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold text-indigo-600">
              YOUR DASHBOARD
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Welcome back 👋
            </h1>

            <p className="mt-2 max-w-xl text-slate-500">
              Track your interview progress and keep improving your
              performance with AI-powered practice.
            </p>
          </div>

          <button
            onClick={() => navigate("/create-interview")}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
          >
            <Plus size={18} />
            New Interview
          </button>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Stats */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              icon={BrainCircuit}
              title="Total Interviews"
              value={dashboard?.totalInterviews ?? 0}
              description="Interviews attempted"
            />

            <StatCard
              icon={Trophy}
              title="Completed"
              value={dashboard?.completedInterviews ?? 0}
              description="Successfully completed"
            />

            <StatCard
              icon={Target}
              title="Average Score"
              value={`${dashboard?.averageScore ?? 0}/10`}
              description="Overall performance"
            />
          </div>
        )}

        {/* Quick Action */}
        <section className="mt-8 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <BarChart3 size={21} />
              </div>

              <h2 className="text-2xl font-bold">
                Ready for your next challenge?
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100">
                Start a live adaptive interview and let AI dynamically
                adjust the questions based on your answers.
              </p>
            </div>

            <button
              onClick={() => navigate("/create-interview")}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
            >
              Start Interview
              <Plus size={17} />
            </button>
          </div>
        </section>

        {/* Interviews */}
        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Recent Interviews
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your latest interview sessions
              </p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-2xl bg-slate-200"
                />
              ))}
            </div>
          ) : interviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <BrainCircuit size={26} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                No interviews yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Start your first AI interview to begin tracking your progress.
              </p>

              <button
                onClick={() => navigate("/create-interview")}
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Create Interview
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.slice(0, 5).map((interview) => (
                <InterviewCard
                  key={interview.id}
                  interview={interview}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;