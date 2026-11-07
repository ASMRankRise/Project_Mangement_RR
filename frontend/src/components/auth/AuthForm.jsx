import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Alert from "../common/Alert";
import Icon from "../common/Icons";

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
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-lg shadow-indigo-600/30">
              <Icon name="sparkles" className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">
                ProjectFlow
              </span>
              <span className="block text-[10px] font-semibold tracking-widest text-indigo-400 uppercase">
                SaaS Enterprise
              </span>
            </div>
          </div>

          <div className="mt-8">
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-2 text-xs text-slate-400 sm:text-sm">
              {isLogin
                ? "Sign in to access your organization workspaces and tasks."
                : "Join your team and coordinate projects with real-time delivery velocity."}
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
                  <Icon
                    name="user"
                    className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500"
                  />
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
                    className="w-full rounded-xl border border-white/10 bg-[#0c1020] py-3 pl-10 pr-4 text-xs text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
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
                <Icon
                  name="mail"
                  className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500"
                />
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
                  className="w-full rounded-xl border border-white/10 bg-[#0c1020] py-3 pl-10 pr-4 text-xs text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
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
                <Icon
                  name="lock"
                  className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500"
                />
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
                  className="w-full rounded-xl border border-white/10 bg-[#0c1020] py-3 pl-10 pr-11 text-xs text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <Icon
                    name={showPassword ? "eyeOff" : "eye"}
                    className="h-4 w-4"
                  />
                </button>
              </div>
            </div>

            {authError && <Alert message={authError} type="error" />}
            {authSuccess && <Alert message={authSuccess} type="success" />}

            <button
              type="submit"
              disabled={authLoading}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50"
            >
              {authLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Processing...</span>
                </span>
              ) : isLogin ? (
                "Sign In to ProjectFlow"
              ) : (
                "Create Free Account"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            {isLogin ? "Don't have an account yet? " : "Already have an account? "}
            <Link
              to={isLogin ? "/register" : "/login"}
              className="font-bold text-indigo-400 hover:text-indigo-300 transition"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </Link>
          </p>
        </div>
      </div>

      {/* Right Feature Showcase Hero (Desktop only) */}
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden border-l border-white/10 bg-gradient-to-br from-[#0d1224] via-[#090d19] to-[#060810] p-12 lg:flex">
        {/* Ambient atmospheric glows */}
        <div className="pointer-events-none absolute -left-20 top-20 h-96 w-96 rounded-full bg-indigo-500/15 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-10 right-10 h-80 w-80 rounded-full bg-violet-500/15 blur-[100px]" />

        <div className="relative max-w-lg space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold text-indigo-300">
            <Icon name="sparkles" className="h-4 w-4" />
            Next-Gen Project Orchestration
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
            Streamline your delivery pipeline with modern SaaS velocity.
          </h2>

          <div className="space-y-4">
            {[
              {
                title: "Interactive Kanban Pipeline",
                desc: "Track work across five status gates with real-time distribution metrics.",
                icon: "kanban",
              },
              {
                title: "Workspace & Team Isolation",
                desc: "Delegate project owners, invite team members, and isolate project assets.",
                icon: "projects",
              },
              {
                title: "Role-Based Access Governance",
                desc: "Enterprise administrator controls for role promotion and directory management.",
                icon: "shield",
              },
              {
                title: "Ultra-Fast Redis Caching",
                desc: "Sub-millisecond query responses powered by Upstash distributed Redis versioning.",
                icon: "sparkles",
              },
            ].map((feat, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-sm"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Icon name={feat.icon} className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{feat.title}</h4>
                  <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;
