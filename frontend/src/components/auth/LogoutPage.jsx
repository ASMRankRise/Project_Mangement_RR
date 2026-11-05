import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function LogoutPage({ onLogout }) {
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
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <p>Logging out...</p>
    </div>
  );
}

export default LogoutPage;
