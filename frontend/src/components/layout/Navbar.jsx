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
    const interval = setInterval(fetchLiveNotices, 60000);
    return () => clearInterval(interval);
  }, [fetchLiveNotices]);

  const activeNotices = notifications.filter((n) => !dismissedIds.has(n.id));

  const handleDismissNotice = (e, id) => {
    e.stopPropagation();
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] px-4 transition-colors">
      {/* Left: Mobile hamburger & breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:hidden"
          aria-label="Open navigation sidebar"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>

      {/* Right: Quick actions, Search, Theme toggle, Notifications & Profile */}
      <div className="flex items-center gap-2">
        {/* Global Command Search Button */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="group flex h-8 items-center gap-2 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 px-2.5 text-xs text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-slate-100 transition shadow-2xs"
          title="Search tasks, projects, and workspaces (Ctrl+K)"
        >
          <SearchIcon className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
          <span className="hidden md:inline font-normal">Search workspace...</span>
          <kbd className="hidden rounded bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 sm:inline-block">
            ⌘K
          </kbd>
        </button>

        {/* Theme Switcher Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition"
          title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
        >
          {isDark ? (
            <SunIcon className="h-4 w-4 text-amber-400" />
          ) : (
            <MoonIcon className="h-4 w-4 text-slate-600" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition"
            aria-label="View notifications"
          >
            <BellIcon className="h-4 w-4" />
            {activeNotices.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white ring-1 ring-white dark:ring-[#161B22]">
                {activeNotices.length > 9 ? "9+" : activeNotices.length}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] text-slate-900 dark:text-white shadow-lg z-50">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    Notifications
                  </span>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                    {activeNotices.length}
                  </span>
                </div>
                {activeNotices.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setDismissedIds(new Set(notifications.map((n) => n.id)));
                    }}
                    className="text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {activeNotices.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                    <CheckCircleIcon className="mx-auto mb-2 h-6 w-6 text-emerald-500 opacity-80" />
                    <p className="font-medium">No pending task alerts</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      You are all caught up across your workspace!
                    </p>
                  </div>
                ) : (
                  activeNotices.map((notif) => {
                    const isOverdue = notif.type === "overdue";
                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          setNotificationOpen(false);
                          navigate(notif.link);
                        }}
                        className={`flex items-start gap-2.5 p-3 transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                          isOverdue
                            ? "bg-rose-50/40 dark:bg-rose-950/20"
                            : "bg-amber-50/40 dark:bg-amber-950/20"
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
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                            {notif.desc}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleDismissNotice(e, notif.id)}
                          className="shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded"
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
            className="flex items-center gap-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 pr-2 text-left transition hover:bg-slate-50 dark:hover:bg-slate-750"
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
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] p-1.5 text-slate-900 dark:text-white shadow-lg z-50">
              <div className="border-b border-slate-100 dark:border-slate-800 p-2">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {user?.email || ""}
                </p>
                <div className="mt-1.5">
                  <RoleBadge role={user?.role} size="xs" />
                </div>
              </div>

              <div className="py-1 space-y-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    navigate("/projects");
                    setProfileDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <SunIcon className="h-3.5 w-3.5 text-slate-400" />
                  <span>Preferences</span>
                </button>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onLogout?.();
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
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
