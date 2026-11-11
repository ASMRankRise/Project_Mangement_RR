import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useProjects from "../../hooks/useProjects";
import useTasks from "../../hooks/useTasks";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import GlobalSearchModal from "../common/GlobalSearchModal";
import SettingsModal from "../common/SettingsModal";

export function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { projects, fetchProjects } = useProjects();
  const { allTasks, fetchTasks } = useTasks(user, { limit: 50 });

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, [fetchProjects, fetchTasks]);

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0D1117] dark:text-slate-100 antialiased selection:bg-indigo-600 selection:text-white transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        user={user}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onLogout={handleLogout}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Navbar */}
        <Navbar
          user={user}
          onLogout={handleLogout}
          setMobileOpen={setMobileOpen}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        {/* Page Content Viewport */}
        <main className="relative flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        projects={projects}
        tasks={allTasks}
      />

      {/* Preferences & Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        user={user}
      />
    </div>
  );
}

export default DashboardLayout;
