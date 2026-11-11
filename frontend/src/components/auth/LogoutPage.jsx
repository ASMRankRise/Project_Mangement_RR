import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export function LogoutPage({ onLogout }) {
  const started = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const handleLogout = async () => {
      await onLogout();
      navigate("/login", { replace: true });
    };

    handleLogout();
  }, [onLogout, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-slate-900 dark:bg-[#0D1117] dark:text-slate-100 transition-colors">
      <div className="flex flex-col items-center gap-3">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-400 border-t-transparent dark:border-slate-500 dark:border-t-transparent" />
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Signing out safely...
        </p>
      </div>
    </div>
  );
}

export default LogoutPage;
