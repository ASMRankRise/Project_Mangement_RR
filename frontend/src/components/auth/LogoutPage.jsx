import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../common/Icons";

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-[#070a13] text-slate-900 dark:text-white transition-colors duration-200">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 dark:text-red-400">
          <Icon name="logout" className="h-6 w-6 animate-pulse" />
        </div>
        <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
          Terminating session safely...
        </p>
      </div>
    </div>
  );
}

export default LogoutPage;
