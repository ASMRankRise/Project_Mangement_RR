import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Alert from "../common/Alert";
import {
  BriefcaseIcon,
  UserIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  SunIcon,
  MoonIcon,
  ArrowRightIcon,
  CheckCircleIcon,
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
    const isElevated = user.role === "admin" || user.role === "superadmin";
    return (
      <Navigate to={isElevated ? "/admin" : "/dashboard"} replace />
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
      const isElevated =
        result.role === "admin" || result.role === "superadmin";
      navigate(isElevated ? "/admin" : "/dashboard", {
        replace: true,
      });
    }
  };

  return (
    <div className="relative flex min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0D1117] dark:text-slate-100 transition-colors">
      {/* Theme toggle in header */}
      <div className="absolute top-4 right-5 z-30">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161B22] px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          {theme === "dark" ? (
            <>
              <SunIcon className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <MoonIcon className="h-3.5 w-3.5 text-slate-600" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>
      </div>

      {/* LEFT COLUMN: Modern Enterprise Login Form */}
      <div className="flex flex-1 flex-col justify-between px-6 py-8 sm:px-12 lg:w-1/2 lg:flex-none lg:px-16 xl:px-20 bg-white dark:bg-[#161B22] border-r border-slate-200 dark:border-slate-800">
        {/* Brand Bar */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-white shadow-xs">
              <BriefcaseIcon className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  StaffSync
                </span>
                <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 text-[10px] font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  Workforce OS
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Center Content Box */}
        <div className="mx-auto w-full max-w-sm py-6 sm:max-w-md">
          {/* Welcome Heading */}
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              {isLogin ? "Sign in to Employee Portal" : "Register Employee Account"}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isLogin
                ? "Enter your corporate credentials to access employee resources, team projects, and deliverables."
                : "Join your company workforce workspace with real-time project collaboration."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-3.5" noValidate>
            {!isLogin && (
              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
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
                    className={`h-9 w-full rounded-md border bg-white dark:bg-[#0D1117] py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 transition shadow-2xs ${
                      clientErrors.name
                        ? "border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-slate-300 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-600 dark:focus:ring-indigo-500"
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
                className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Work Email Address
              </label>
              <div className="relative">
                <MailIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
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
                  className={`h-9 w-full rounded-md border bg-white dark:bg-[#0D1117] py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 transition shadow-2xs ${
                    clientErrors.email
                      ? "border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      : "border-slate-300 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-600 dark:focus:ring-indigo-500"
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
                className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Password
              </label>
              <div className="relative">
                <LockIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
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
                  className={`h-9 w-full rounded-md border bg-white dark:bg-[#0D1117] py-2 pl-9 pr-9 text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 transition shadow-2xs ${
                    clientErrors.password
                      ? "border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      : "border-slate-300 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-600 dark:focus:ring-indigo-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 rounded p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
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
              className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-md bg-indigo-600 hover:bg-indigo-700 px-4 text-xs font-medium text-white shadow-xs transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {authLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Signing in...</span>
                </span>
              ) : (
                <>
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Switch Mode Prompt */}
          <div className="mt-5 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {isLogin ? "Don't have an account yet? " : "Already have an account? "}
              <Link
                to={isLogin ? "/register" : "/login"}
                className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
              >
                {isLogin ? "Create account" : "Sign in here"}
              </Link>
            </p>
          </div>
        </div>

        {/* Security & Compliance Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-3 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldIcon className="h-3.5 w-3.5 text-slate-400" />
            <span>Enterprise JWT Session Security</span>
          </div>
          <span className="mt-1 sm:mt-0">© {new Date().getFullYear()} StaffSync Workforce Platform</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Real-World SaaS Product Visual Preview */}
      <div className="relative hidden lg:flex flex-1 flex-col justify-between overflow-hidden bg-slate-50 dark:bg-[#0D1117] p-8 xl:p-12">
        {/* Top Feature Pill */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#161B22] px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs">
            <KanbanIcon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Interactive Sprint Pipeline</span>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Release Cycle 24
          </div>
        </div>

        {/* Central Product Showcase Window Frame */}
        <div className="my-auto py-4">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] shadow-sm overflow-hidden text-left">
            {/* Window Titlebar */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="ml-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Mobile App Redesign Workspace
                </span>
              </div>
              <span className="rounded bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                Active Sprint
              </span>
            </div>

            {/* Window Content: Real Project Workspace Representation */}
            <div className="p-4 space-y-3.5">
              {/* Sprint Progress Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                    Sprint Progress
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    8 of 11 tasks completed
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    73%
                  </span>
                  <div className="mt-1 h-1.5 w-24 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full w-[73%] rounded-full bg-indigo-600 dark:bg-indigo-500" />
                  </div>
                </div>
              </div>

              {/* Minimal Kanban Columns Preview */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {/* Column 1: In Progress */}
                <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-2.5">
                  <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      In Progress
                    </span>
                    <span className="rounded bg-slate-200/80 dark:bg-slate-800 px-1.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                      2
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="rounded border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#161B22] p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-rose-50 dark:bg-rose-950/60 px-1 py-0.2 text-[9px] font-medium text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                          Urgent
                        </span>
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-700 text-[8px] font-bold text-white">
                          AM
                        </div>
                      </div>
                      <p className="mt-1 text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                        Refactor Auth & JWT Refresh
                      </p>
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                        <ClockIcon className="h-3 w-3" />
                        <span>Today</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: In Review */}
                <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-2.5">
                  <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Testing
                    </span>
                    <span className="rounded bg-slate-200/80 dark:bg-slate-800 px-1.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                      1
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="rounded border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#161B22] p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-amber-50 dark:bg-amber-950/60 px-1 py-0.2 text-[9px] font-medium text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                          Medium
                        </span>
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-700 text-[8px] font-bold text-white">
                          SD
                        </div>
                      </div>
                      <p className="mt-1 text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                        Design Tokens Integration
                      </p>
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                        <ClockIcon className="h-3 w-3" />
                        <span>Tomorrow</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Completed */}
                <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-2.5">
                  <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Completed
                    </span>
                    <span className="rounded bg-slate-200/80 dark:bg-slate-800 px-1.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                      8
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="rounded border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#161B22] p-2 text-xs opacity-80">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 dark:bg-emerald-950/60 px-1 py-0.2 text-[9px] font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                          <CheckCircleIcon className="h-2.5 w-2.5" />
                          Done
                        </span>
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-700 text-[8px] font-bold text-white">
                          JR
                        </div>
                      </div>
                      <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400 line-through truncate">
                        Global Search Modal (Ctrl+K)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Activity Mini Pill */}
            <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3.5 py-2 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Sarah updated task status to <strong>Completed</strong></span>
              </div>
              <span className="text-[10px] text-slate-400">2m ago</span>
            </div>
          </div>
        </div>

        {/* Feature Highlights Footer Strip */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
              Kanban Pipeline
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Track tasks across five clear status stages.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
              Role Governance
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Granular access controls for admins and members.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
              Team Workspaces
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Manage member rosters and project deliverables.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;
