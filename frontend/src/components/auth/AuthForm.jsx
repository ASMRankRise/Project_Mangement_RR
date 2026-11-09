import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Alert from "../common/Alert";
import {
  LayersIcon,
  UserIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  KanbanIcon,
  FolderIcon,
  ShieldIcon,
  ZapIcon,
} from "../common/Icons";

export function AuthForm({ mode = "login" }) {
  const isLogin = mode === "login";
  const navigate = useNavigate();

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

  if (user) {
    return (
      <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password || (!isLogin && !name)) return;

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
    <div className="flex min-h-screen bg-[#070a13] text-white">
      {/* Left Form Panel */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:flex-none lg:w-[480px] xl:w-[540px]">
        <div className="mx-auto w-full max-w-sm">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-md text-white">
              <LayersIcon className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white leading-tight">
                ProjectHub
              </span>
              <span className="block text-[10px] font-medium tracking-wider text-indigo-400 uppercase">
                Enterprise SaaS
              </span>
            </div>
          </div>

          <div className="mt-8">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-2 text-xs text-slate-400">
              {isLogin
                ? "Sign in to access your organization workspaces and tasks."
                : "Join your team to manage projects with real-time delivery tracking."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {!isLogin && (
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300"
                >
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
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
                    className="w-full rounded-xl border border-white/10 bg-[#0c1020] py-2.5 pl-10 pr-4 text-xs text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Work Email
              </label>
              <div className="relative">
                <MailIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  disabled={authLoading}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="alex@company.com"
                  className="w-full rounded-xl border border-white/10 bg-[#0c1020] py-2.5 pl-10 pr-4 text-xs text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Password
              </label>
              <div className="relative">
                <LockIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  maxLength={128}
                  disabled={authLoading}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-white/10 bg-[#0c1020] py-2.5 pl-10 pr-11 text-xs text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {authError && <Alert message={authError} type="error" />}
            {authSuccess && <Alert message={authSuccess} type="success" />}

            <button
              type="submit"
              disabled={authLoading}
              className="mt-2 w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-semibold text-white shadow-sm transition disabled:opacity-50"
            >
              {authLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Processing...</span>
                </span>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Free Account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            {isLogin ? "Don't have an account yet? " : "Already have an account? "}
            <Link
              to={isLogin ? "/register" : "/login"}
              className="font-semibold text-indigo-400 hover:text-indigo-300 transition"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </Link>
          </p>
        </div>
      </div>

      {/* Right Feature Showcase Hero (Desktop only) */}
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden border-l border-white/10 bg-[#0a0e1c] p-12 lg:flex">
        <div className="relative max-w-lg space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300">
            <ZapIcon className="h-3.5 w-3.5" />
            <span>High-Velocity Project Delivery</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white lg:text-4xl leading-tight">
            Manage projects, teams, and sprints with clarity.
          </h2>

          <div className="space-y-3.5">
            {[
              {
                title: "Interactive Kanban Pipeline",
                desc: "Track work across five status gates with real-time progress indicators.",
                icon: KanbanIcon,
              },
              {
                title: "Dedicated Project Workspaces",
                desc: "Organize teams, assign responsibilities, and monitor task delivery.",
                icon: FolderIcon,
              },
              {
                title: "Role-Based Permissions",
                desc: "Owner and administrator controls with secure JWT authentication.",
                icon: ShieldIcon,
              },
            ].map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 rounded-xl border border-white/5 bg-white/[0.02] p-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <IconComp className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{feat.title}</h4>
                    <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;
