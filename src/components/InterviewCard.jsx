import { ArrowRight, CheckCircle2, Clock3, Play, Circle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATUS_CONFIG = {
  COMPLETED: {
    icon: CheckCircle2,
    iconBg: "bg-emerald-50 text-emerald-600",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Completed",
  },
  IN_PROGRESS: {
    icon: Clock3,
    iconBg: "bg-amber-50 text-amber-600",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    label: "In Progress",
  },
  NOT_STARTED: {
    icon: Circle,
    iconBg: "bg-slate-100 text-slate-500",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
    label: "Not Started",
  },
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return null;
  }
}

function InterviewCard({ interview }) {
  const navigate = useNavigate();

  const status = interview.status ?? "NOT_STARTED";
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.NOT_STARTED;
  const Icon = config.icon;

  const isCompleted = status === "COMPLETED";

  const handleClick = () => {
    if (isCompleted) {
      navigate(`/interview/${interview.id}/result`);
    } else {
      navigate(`/interview/${interview.id}`);
    }
  };

  const date = formatDate(interview.startedAt ?? interview.completedAt);

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.iconBg}`}
          >
            <Icon size={21} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-slate-900">{interview.title}</h3>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${config.badge}`}
              >
                {config.label}
              </span>
            </div>

            <p className="mt-0.5 text-sm text-slate-500">{interview.role}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {interview.difficulty}
              </span>
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">
                {interview.type === "LIVE_ADAPTIVE" ? "Adaptive AI" : interview.type}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {interview.mode}
              </span>
              {date && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                  {date}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleClick}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 sm:shrink-0"
        >
          {isCompleted ? "View Result" : "Continue"}
          {isCompleted ? <ArrowRight size={16} /> : <Play size={16} />}
        </button>
      </div>
    </div>
  );
}

export default InterviewCard;