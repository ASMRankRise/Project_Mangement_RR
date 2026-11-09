import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useTheme } from "../../context/ThemeContext";
import { Avatar } from "../common/Avatar";
import { RoleBadge } from "../common/Badge";
import Breadcrumbs from "../common/Breadcrumbs";
import {
  BellIcon,
  MenuIcon,
  ChevronDownIcon,
  FolderIcon,
  CheckSquareIcon,
  UsersIcon,
  LogOutIcon,
  AlertTriangleIcon,
  CalendarIcon,
  CheckCircleIcon,
  XIcon,
  SearchIcon,
  SunIcon,
  MoonIcon,
} from "../common/Icons";

export function Navbar({
  user,
  onLogout,
  setMobileOpen,
  onOpenSearch,
  onOpenSettings,
}) {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(new Set());

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch real notifications based on user's tasks
  const fetchLiveNotices = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/tasks", { params: { limit: 25 } });
      const tasks = res.data?.tasks || [];
      const now = new Date();
      const notices = [];

      tasks.forEach((task) => {
        if (task.status === "completed" || task.status === "done") return;

        if (task.dueDate) {
          const due = new Date(task.dueDate);
          const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

          if (diffDays < 0) {
            notices.push({
              id: `overdue-${task._id}`,
              type: "overdue",
              title: "Overdue Task",
              desc: `"${task.title}" was due ${Math.abs(diffDays)} day${
                Math.abs(diffDays) === 1 ? "" : "s"
              } ago`,
              link: "/tasks",
            });
          } else if (diffDays <= 2) {
            notices.push({
              id: `due-soon-${task._id}`,
              type: "due-soon",
              title: "Deadline Approaching",
              desc: `"${task.title}" is due ${
                diffDays === 0 ? "today" : `in ${diffDays} day${diffDays === 1 ? "" : "s"}`
              }`,
              link: "/tasks",
            });
          }
        }
      });

      setNotifications(notices);
    } catch {
      // Ignore background notification fetch errors
    }
  }, [user]);

  useEffect(() => {
    fetchLiveNotices();
  }, [fetchLiveNotices]);

  const activeNotices = notifications.filter((n) => !dismissedIds.has(n.id));

  const handleDismissNotice = (e, id) => {
    e.stopPropagation();
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B0F19]/95 px-4 backdrop-blur-md transition-colors sm:px-6">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg border border-slate-200 dark:border-slate-800 p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden transition"
          aria-label="Open navigation menu"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>

      {/* Center/Search trigger */}
      <div className="flex-1 max-w-xs mx-4 hidden md:block">
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 text-xs text-slate-400 transition"
        >
          <span className="flex items-center gap-2">
            <SearchIcon className="w-3.5 h-3.5" />
            <span>Search workspaces, tasks...</span>
          </span>
          <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.2 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Mobile Search Button */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="md:hidden rounded-lg border border-slate-200 dark:border-slate-800 p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition"
          title="Search"
        >
          <SearchIcon className="h-4 w-4" />
        </button>

        {/* Theme Switcher Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-lg border border-slate-200 dark:border-slate-800 p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle color theme"
        >
          {isDark ? (
            <SunIcon className="h-4 w-4 text-amber-400" />
          ) : (
            <MoonIcon className="h-4 w-4 text-slate-600" />
          )}
        </button>

        {/* Real Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative rounded-lg border border-slate-200 dark:border-slate-800 p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition"
            title="Notifications"
          >
            <BellIcon className="h-4 w-4" />
            {activeNotices.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white shadow-xs">
                {activeNotices.length}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F] p-4 text-slate-900 dark:text-white shadow-xl z-50">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Live Notifications
                </h4>
                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/20">
                  {activeNotices.length} Active
                </span>
              </div>

              <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                {activeNotices.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                    <CheckCircleIcon className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
                    All caught up! No urgent task notices.
                  </div>
                ) : (
                  activeNotices.map((notif) => {
                    const isOverdue = notif.type === "overdue";

                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          navigate(notif.link);
                          setNotificationOpen(false);
                        }}
                        className={`flex items-start justify-between gap-2.5 p-2.5 rounded-lg border transition cursor-pointer ${
                          isOverdue
                            ? "bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 text-rose-900 dark:text-rose-200 hover:opacity-90"
                            : "bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 text-amber-900 dark:text-amber-200 hover:opacity-90"
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {isOverdue ? (
                            <AlertTriangleIcon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                          ) : (
                            <CalendarIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">
                            {notif.title}
                          </p>
                          <p className="text-[11px] opacity-90 mt-0.5 leading-snug">
                            {notif.desc}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleDismissNotice(e, notif.id)}
                          className="shrink-0 opacity-70 hover:opacity-100 p-0.5 rounded"
                          title="Dismiss notice"
                        >
                          <XIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 p-1 pr-2.5 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Avatar user={user} size="sm" />
            <div className="hidden text-left md:block">
              <p className="max-w-[110px] truncate text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                {user?.name || "User"}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                {user?.role || "user"}
              </p>
            </div>
            <ChevronDownIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          </button>

          {/* Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F] p-2 text-slate-900 dark:text-white shadow-xl z-50">
              <div className="border-b border-slate-100 dark:border-slate-800/80 p-2.5">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {user?.email || ""}
                </p>
                <div className="mt-2">
                  <RoleBadge role={user?.role} size="xs" />
                </div>
              </div>

              <div className="py-1.5 space-y-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    navigate("/projects");
                    setProfileDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <FolderIcon className="h-3.5 w-3.5 text-slate-400" />
                  <span>Projects</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigate("/tasks");
                    setProfileDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <CheckSquareIcon className="h-3.5 w-3.5 text-slate-400" />
                  <span>My Tasks</span>
                </button>

                {user?.role === "admin" && (
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/admin/users");
                      setProfileDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <UsersIcon className="h-3.5 w-3.5 text-slate-400" />
                    <span>Manage Users</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    if (onOpenSettings) onOpenSettings();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <SunIcon className="h-3.5 w-3.5 text-slate-400" />
                  <span>Preferences</span>
                </button>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-1.5 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onLogout?.();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                >
                  <LogOutIcon className="h-3.5 w-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
