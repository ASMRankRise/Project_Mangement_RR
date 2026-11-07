import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-[#070a13] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        user={user}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          user={user}
          onLogout={handleLogout}
          setMobileOpen={setMobileOpen}
        />

        {/* Page Content Viewport */}
        <main className="relative flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Subtle Ambient Glows */}
          <div className="pointer-events-none fixed top-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-indigo-600/[0.07] blur-[120px]" />
          <div className="pointer-events-none fixed bottom-0 left-1/3 -z-10 h-96 w-96 rounded-full bg-violet-600/[0.05] blur-[140px]" />

          <div className="mx-auto max-w-7xl animate-in fade-in duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
