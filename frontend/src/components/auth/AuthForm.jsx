import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Alert from "../common/Alert";

function AuthForm({ mode = "login" }) {
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
    <div className="flex min-h-screen items-center justify-center bg-[#080b16] p-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0e1222] p-6 sm:p-10">
        <h1 className="text-3xl font-bold">ProjectFlow</h1>

        <p className="mt-3 text-sm text-slate-400">
          {isLogin
            ? "Sign in to access your workspace."
            : "Create your account to get started."}
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          {!isLogin && (
            <div>
              <label htmlFor="name" className="mb-2 block text-sm">
                Full name
              </label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                maxLength={100}
                required
                disabled={authLoading}
                placeholder="Your name"
                className="w-full rounded-xl border border-white/10 bg-[#090d19] px-4 py-3 outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-2 block text-sm">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              maxLength={254}
              required
              disabled={authLoading}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-[#090d19] px-4 py-3 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm">
              Password
            </label>

            <div className="flex rounded-xl border border-white/10 bg-[#090d19] focus-within:border-indigo-500">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                autoComplete={isLogin ? "current-password" : "new-password"}
                minLength={6}
                maxLength={128}
                required
                disabled={authLoading}
                placeholder="Enter your password"
                className="min-w-0 flex-1 bg-transparent px-4 py-3 outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={authLoading}
                className="px-4 text-xs text-indigo-400"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <Alert message={authError} type="error" />
          <Alert message={authSuccess} type="success" />

          <button
            type="submit"
            disabled={authLoading}
            className="w-full rounded-xl bg-indigo-600 py-3.5 font-bold disabled:opacity-50"
          >
            {authLoading
              ? "Please wait..."
              : isLogin
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}

          <Link
            to={isLogin ? "/register" : "/login"}
            className="font-semibold text-indigo-400 hover:text-indigo-300"
          >
            {isLogin ? "Create account" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AuthForm;
