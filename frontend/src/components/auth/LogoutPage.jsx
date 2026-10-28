import { useEffect, useRef } from "react";

function LogoutPage({ onLogout }) {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;

    started.current = true;
    onLogout();
  }, [onLogout]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <p>Logging out...</p>
    </div>
  );
}

export default LogoutPage;
