import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { signup } from "../services/authService";
import { getErrorMessage } from "../services/api";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await signup({
        name,
        email,
        password,
      });

      navigate("/login");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to create account."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">

      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center">

        <div className="grid w-full overflow-hidden rounded-[28px] bg-white shadow-2xl lg:grid-cols-2">

          {/* LEFT PANEL */}
          <div className="relative hidden min-h-[680px] overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-10 text-white sm:p-12 lg:flex">

            <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-white/10 blur-2xl" />

            <div className="absolute -bottom-32 -left-28 h-80 w-80 rounded-full bg-fuchsia-400/20 blur-3xl" />

            <div className="relative z-10 flex w-full flex-col justify-between">

              {/* Logo */}
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md">
                  <BrainCircuit size={25} />
                </div>

                <span className="text-xl font-bold tracking-tight">
                  AI Interview Prep
                </span>

              </div>

              {/* Main */}
              <div className="max-w-lg">

                <div className="mb-5 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-md">
                  ✦ Your personalized interview coach
                </div>

                <h1 className="text-5xl font-bold leading-[1.08] tracking-tight">
                  Build confidence.
                  <br />
                  <span className="text-indigo-100">
                    Land the interview.
                  </span>
                </h1>

                <p className="mt-7 max-w-md text-lg leading-8 text-indigo-100">
                  Practice realistic interviews with AI that understands
                  your answers and adapts the next question accordingly.
                </p>

                {/* Features */}
                <div className="mt-8 space-y-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                      <Check size={15} />
                    </div>

                    <span className="text-sm text-indigo-50">
                      Adaptive AI questioning
                    </span>

                  </div>

                  <div className="flex items-center gap-3">

                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                      <Check size={15} />
                    </div>

                    <span className="text-sm text-indigo-50">
                      Instant answer evaluation
                    </span>

                  </div>

                  <div className="flex items-center gap-3">

                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                      <Check size={15} />
                    </div>

                    <span className="text-sm text-indigo-50">
                      Detailed performance reports
                    </span>

                  </div>

                </div>

              </div>

              {/* Bottom */}
              <div className="max-w-md rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">

                <p className="text-sm leading-6 text-indigo-50">
                  Prepare with purpose. Learn from every answer. Improve
                  before the real interview.
                </p>

              </div>

            </div>

          </div>

          {/* RIGHT PANEL */}
          <div className="flex min-h-[680px] items-center bg-white px-6 py-10 sm:px-12 lg:px-14">

            <div className="mx-auto w-full max-w-md">

              {/* Mobile logo */}
              <div className="mb-9 flex items-center gap-3 lg:hidden">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <BrainCircuit size={22} />
                </div>

                <span className="text-lg font-bold text-slate-900">
                  AI Interview Prep
                </span>

              </div>

              {/* Heading */}
              <div className="mb-8">

                <p className="mb-3 text-sm font-semibold text-indigo-600">
                  GET STARTED
                </p>

                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Create your account
                </h2>

                <p className="mt-3 text-base leading-6 text-slate-500">
                  Start preparing for your next interview today.
                </p>

              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSignup} className="space-y-4">

                {/* Name */}
                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Full name
                  </label>

                  <div className="relative">

                    <User
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Aman Yadav"
                      autoComplete="name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />

                  </div>

                </div>

                {/* Email */}
                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email address
                  </label>

                  <div className="relative">

                    <Mail
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />

                  </div>

                </div>

                {/* Password */}
                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Password
                  </label>

                  <div className="relative">

                    <Lock
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>

                  </div>

                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition duration-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight
                        size={18}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>

              </form>

              {/* Login */}
              <p className="mt-8 text-center text-sm text-slate-500">

                Already have an account?{" "}

                <Link
                  to="/login"
                  className="font-semibold text-indigo-600 transition hover:text-indigo-700"
                >
                  Sign in
                </Link>

              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Signup;