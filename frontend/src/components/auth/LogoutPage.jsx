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
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas text-text-primary transition-colors">
      <div className="flex flex-col items-center gap-3">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <p className="text-sm font-medium text-text-secondary">
          Signing out...
        </p>
      </div>
    </div>
  );
}

export default LogoutPage;
