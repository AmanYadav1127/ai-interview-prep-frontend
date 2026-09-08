import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Play,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function InterviewCard({ interview }) {
  const navigate = useNavigate();

  const isCompleted = interview.status === "COMPLETED";

  const handleClick = () => {
    if (isCompleted) {
      navigate(`/interview/${interview.id}/result`);
    } else {
      navigate(`/interview/${interview.id}`);
    }
  };

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            {isCompleted ? (
              <CheckCircle2 size={21} />
            ) : (
              <Clock3 size={21} />
            )}
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">
              {interview.title}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {interview.role}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {interview.difficulty}
              </span>

              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">
                {interview.type}
              </span>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {interview.mode}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleClick}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
        >
          {isCompleted ? "View Result" : "Continue"}
          {isCompleted ? (
            <ArrowRight size={16} />
          ) : (
            <Play size={16} />
          )}
        </button>
      </div>
    </div>
  );
}

export default InterviewCard;