import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Alert from "../common/Alert";
import {
  LayersIcon,
  UserIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  SunIcon,
  MoonIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  SparklesIcon,
  ShieldIcon,
  KanbanIcon,
  ClockIcon,
} from "../common/Icons";

export function AuthForm({ mode = "login" }) {
  const isLogin = mode === "login";
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const {
    user,
    authenticate,
    authLoading,
    authError,
    authSuccess,
    setAuthError,
    setAuthSuccess,
  } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [clientErrors, setClientErrors] = useState({});

  if (user) {
    return (
      <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (clientErrors[name]) {
      setClientErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailTrimmed = formData.email.trim();

    if (!isLogin && !formData.name.trim()) {
      errors.name = "Full name is required.";
    }

    if (!emailTrimmed) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      errors.email = "Please enter a valid work email address.";
    }

    if (!formData.password) {
      errors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (!validateForm()) return;

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    const payload = isLogin ? { email, password } : { name, email, password };
    const result = await authenticate(mode, payload);

    if (!result) return;

    setFormData({ name: "", email: "", password: "" });
    setShowPassword(false);

    if (isLogin) {
      navigate(result.role === "admin" ? "/admin" : "/dashboard", {
        replace: true,
      });
    }
  };

  return (
    <div className="relative flex min-h-screen bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Absolute theme toggle button in header */}
      <div className="absolute top-5 right-6 z-30">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#111625]/90 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm backdrop-blur transition hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white"
        >
          {theme === "dark" ? (
            <>
              <SunIcon className="h-4 w-4 text-amber-400 transition group-hover:rotate-45" />
              <span className="hidden sm:inline">Light Mode</span>
            </>
          ) : (
            <>
              <MoonIcon className="h-4 w-4 text-slate-600 transition group-hover:-rotate-12" />
              <span className="hidden sm:inline">Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* LEFT COLUMN: Modern Login Form */}
      <div className="flex flex-1 flex-col justify-between px-6 py-10 sm:px-12 lg:w-1/2 lg:flex-none lg:px-16 xl:px-20">
        {/* Brand Bar */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="group flex items-center gap-3 transition"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20 ring-1 ring-white/20 transition group-hover:scale-[1.02]">
              <LayersIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  ProjectHub
                </span>
                <span className="rounded-md border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-400">
                  SaaS
                </span>
              </div>
              <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Workspace Management
              </span>
            </div>
          </Link>
        </div>

        {/* Center Content Box */}
        <div className="mx-auto w-full max-w-sm py-8 sm:max-w-md">
          {/* Welcome Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              {isLogin ? "Welcome back" : "Create your workspace account"}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 sm:text-sm leading-relaxed">
              {isLogin
                ? "Sign in to access your organization projects, sprint boards, and assigned tasks."
                : "Join your delivery team to organize projects and track deliverables in real-time."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            {!isLogin && (
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                >
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    maxLength={100}
                    disabled={authLoading}
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Alex Morgan"
                    className={`w-full rounded-xl border bg-slate-50 dark:bg-[#111625] py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 transition shadow-sm ${
                      clientErrors.name
                        ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                        : "border-slate-200 dark:border-slate-800 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/10 dark:focus:ring-indigo-500/20"
                    }`}
                  />
                </div>
                {clientErrors.name && (
                  <p className="mt-1 text-[11px] text-rose-500 font-medium">
                    {clientErrors.name}
                  </p>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Work Email Address
              </label>
              <div className="relative">
                <MailIcon className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  disabled={authLoading}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className={`w-full rounded-xl border bg-slate-50 dark:bg-[#111625] py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 transition shadow-sm ${
                    clientErrors.email
                      ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      : "border-slate-200 dark:border-slate-800 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/10 dark:focus:ring-indigo-500/20"
                  }`}
                />
              </div>
              {clientErrors.email && (
                <p className="mt-1 text-[11px] text-rose-500 font-medium">
                  {clientErrors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Password
              </label>
              <div className="relative">
                <LockIcon className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  minLength={6}
                  maxLength={128}
                  disabled={authLoading}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className={`w-full rounded-xl border bg-slate-50 dark:bg-[#111625] py-2.5 pl-10 pr-11 text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 transition shadow-sm ${
                    clientErrors.password
                      ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      : "border-slate-200 dark:border-slate-800 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/10 dark:focus:ring-indigo-500/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 rounded-md p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              {clientErrors.password && (
                <p className="mt-1 text-[11px] text-rose-500 font-medium">
                  {clientErrors.password}
                </p>
              )}
            </div>

            {/* Error & Success Feedback Banners */}
            {authError && <Alert message={authError} type="error" />}
            {authSuccess && <Alert message={authSuccess} type="success" />}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={authLoading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] py-2.5 px-4 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {authLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Authenticating session...</span>
                </span>
              ) : (
                <>
                  <span>{isLogin ? "Sign in to Workspace" : "Create Free Account"}</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch Mode Prompt */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {isLogin ? "Don't have an account yet? " : "Already registered on ProjectHub? "}
              <Link
                to={isLogin ? "/register" : "/login"}
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 underline underline-offset-4 transition"
              >
                {isLogin ? "Create account" : "Sign in here"}
              </Link>
            </p>
          </div>
        </div>

        {/* Security & Compliance Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4 text-[11px] text-slate-500 dark:text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Enterprise JWT Session Security</span>
          </div>
          <span className="mt-1 sm:mt-0">© {new Date().getFullYear()} ProjectHub</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Real-World SaaS Product Visual Preview */}
      <div className="relative hidden lg:flex flex-1 flex-col justify-between overflow-hidden border-l border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-[#070A12] p-10 xl:p-14">
        {/* Subtle dot matrix pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-25"
          style={{
            backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Top Feature Pill */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-900/60 bg-white/80 dark:bg-indigo-950/40 px-3.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-sm backdrop-blur">
            <SparklesIcon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Built for High-Velocity Engineering Teams</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <KanbanIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Sprint Pipeline 2.0</span>
          </div>
        </div>

        {/* Central Product Showcase Window Frame */}
        <div className="relative z-10 my-auto py-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1322] shadow-2xl shadow-slate-200/50 dark:shadow-black/70 overflow-hidden backdrop-blur">
            {/* macOS Style Window Titlebar */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#12182B]/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Acme / Mobile App Redesign
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                  Active Sprint
                </span>
              </div>
            </div>

            {/* Window Content: Real Project Workspace Representation */}
            <div className="p-5 space-y-4">
              {/* Sprint Progress Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Sprint Cycle 24
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Delivery target: 8 of 11 tasks completed
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    73%
                  </span>
                  <div className="mt-1 h-1.5 w-24 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full w-[73%] rounded-full bg-indigo-600" />
                  </div>
                </div>
              </div>

              {/* Minimal Kanban Columns Preview */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {/* Column 1: In Progress */}
                <div className="rounded-xl border border-slate-200/70 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#12182B]/40 p-3">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/50 dark:border-slate-800/60">
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      In Progress
                    </span>
                    <span className="rounded-full bg-amber-100 dark:bg-amber-950/70 px-1.5 py-0.2 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                      2
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-[#161D32] p-2.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 text-[9px] font-semibold text-rose-700 dark:text-rose-400">
                          Urgent
                        </span>
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[8px] font-bold text-white">
                          AM
                        </div>
                      </div>
                      <p className="mt-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                        Refactor Auth & JWT Refresh
                      </p>
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                        <ClockIcon className="h-3 w-3" />
                        <span>Today</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: In Review */}
                <div className="rounded-xl border border-slate-200/70 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#12182B]/40 p-3">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/50 dark:border-slate-800/60">
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      In Review
                    </span>
                    <span className="rounded-full bg-indigo-100 dark:bg-indigo-950/70 px-1.5 py-0.2 text-[10px] font-bold text-indigo-700 dark:text-indigo-400">
                      1
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-[#161D32] p-2.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700 dark:text-amber-400">
                          Medium
                        </span>
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[8px] font-bold text-white">
                          SD
                        </div>
                      </div>
                      <p className="mt-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                        Design System 2.0 Tokens
                      </p>
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                        <ClockIcon className="h-3 w-3" />
                        <span>Tomorrow</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Completed */}
                <div className="rounded-xl border border-slate-200/70 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#12182B]/40 p-3">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/50 dark:border-slate-800/60">
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Completed
                    </span>
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/70 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                      8
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-[#161D32]/70 p-2.5 shadow-xs opacity-80">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 dark:text-emerald-400">
                          <CheckCircleIcon className="h-2.5 w-2.5" />
                          Done
                        </span>
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[8px] font-bold text-white">
                          JR
                        </div>
                      </div>
                      <p className="mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 line-through line-clamp-1">
                        Global Search Modal (Ctrl+K)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Activity Mini Pill */}
            <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#12182B]/50 px-4 py-2.5 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Sarah updated task status to <strong>Completed</strong></span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-500">2m ago</span>
            </div>
          </div>
        </div>

        {/* Feature Highlights Footer Strip */}
        <div className="relative z-10 grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/80 dark:border-slate-800 text-xs">
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">
              Interactive Kanban
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Drag, prioritize, and track tasks across five workflow gates.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">
              Role Governance
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Granular access controls for admins, owners, and team members.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">
              Real-time Workspaces
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Unified project hubs with live member rosters and sprint metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;
