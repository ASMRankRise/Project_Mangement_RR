import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import DashboardHeader from "../dashboard/DashboardHeader";
import Navigation from "../common/Navigation";

function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const { user, logout, authLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#080b16] p-4 text-white sm:p-8">
      <div className="mx-auto max-w-6xl">
        <DashboardHeader
          user={user}
          onLogout={handleLogout}
          loading={authLoading}
        />

        <Navigation user={user} />

        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}

export default DashboardLayout;
