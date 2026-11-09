import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
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
} from "../common/Icons";

export function Navbar({ user, onLogout, setMobileOpen }) {
  const navigate = useNavigate();
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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/10 bg-[#090d16]/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-300 hover:bg-white/10 lg:hidden"
          aria-label="Open navigation menu"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Real Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-300 hover:bg-white/10 transition"
            title="Notifications"
          >
            <BellIcon className="h-5 w-5" />
            {activeNotices.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-sm">
                {activeNotices.length}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-white/10 bg-[#0E131F] p-4 text-white shadow-2xl shadow-black/80 z-50">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Live Notifications
                </h4>
                <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  {activeNotices.length} Active
                </span>
              </div>

              <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                {activeNotices.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    <CheckCircleIcon className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
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
                            ? "bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/15"
                            : "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15"
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {isOverdue ? (
                            <AlertTriangleIcon className="w-4 h-4 text-rose-400" />
                          ) : (
                            <CalendarIcon className="w-4 h-4 text-amber-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white truncate">
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                            {notif.desc}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleDismissNotice(e, notif.id)}
                          className="shrink-0 text-slate-400 hover:text-white p-0.5 rounded"
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
            className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-1.5 pr-3 text-left transition hover:bg-white/10"
          >
            <Avatar user={user} size="sm" />
            <div className="hidden text-left md:block">
              <p className="max-w-[120px] truncate text-xs font-semibold text-white">
                {user?.name || "User"}
              </p>
              <p className="text-[10px] text-slate-400 capitalize">
                {user?.role || "user"}
              </p>
            </div>
            <ChevronDownIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          </button>

          {/* Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-[#0E131F] p-2 text-white shadow-2xl shadow-black/80 z-50">
              <div className="border-b border-white/10 p-3">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {user?.email || ""}
                </p>
                <div className="mt-2">
                  <RoleBadge role={user?.role} />
                </div>
              </div>

              <div className="py-2 space-y-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    navigate("/projects");
                    setProfileDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-slate-300 hover:bg-white/10 hover:text-white transition"
                >
                  <FolderIcon className="h-4 w-4 text-slate-400" />
                  <span>Projects</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigate("/tasks");
                    setProfileDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-slate-300 hover:bg-white/10 hover:text-white transition"
                >
                  <CheckSquareIcon className="h-4 w-4 text-slate-400" />
                  <span>Tasks</span>
                </button>

                {user?.role === "admin" && (
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/admin/users");
                      setProfileDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-slate-300 hover:bg-white/10 hover:text-white transition"
                  >
                    <UsersIcon className="h-4 w-4 text-slate-400" />
                    <span>Manage Users</span>
                  </button>
                )}
              </div>

              <div className="border-t border-white/10 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onLogout?.();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition"
                >
                  <LogOutIcon className="h-4 w-4" />
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
