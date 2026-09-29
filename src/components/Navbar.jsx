import { BrainCircuit, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}
          className="flex items-center gap-3 text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <BrainCircuit size={22} />
          </div>

          <span className="hidden text-lg font-bold tracking-tight text-slate-900 sm:block">
            AI Interview Prep
          </span>
        </button>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 sm:flex">
                <User size={17} className="text-slate-500" />
                <span className="text-sm font-medium text-slate-700">
                  Candidate
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={17} />
                <span className="hidden sm:block">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/login")}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;