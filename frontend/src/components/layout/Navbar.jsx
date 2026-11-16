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
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface px-4 transition-colors">
      {/* Left: Mobile hamburger & breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-1.5 text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition lg:hidden cursor-pointer"
          aria-label="Open navigation sidebar"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>

      {/* Right: Search, Theme, Notifications & Profile */}
      <div className="flex items-center gap-2">
        {/* Command Search Button */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="group flex h-9 items-center gap-2.5 rounded-md border border-border bg-surface-subtle px-3 text-[13px] text-text-secondary hover:border-border-subtle hover:text-text-primary transition shadow-subtle cursor-pointer"
          title="Search workspace (Ctrl+K)"
        >
          <SearchIcon className="h-3.5 w-3.5 text-text-tertiary group-hover:text-text-secondary" />
          <span className="hidden md:inline font-normal">Search workspace...</span>
          <kbd className="hidden rounded bg-surface px-1.5 py-0.5 text-[12px] font-mono text-text-tertiary border border-border sm:inline-block">
            ⌘K
          </kbd>
        </button>

        {/* Theme Switcher */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition cursor-pointer shadow-subtle"
          title={isDark ? "Switch to light theme" : "Switch to dark theme"}
        >
          {isDark ? (
            <SunIcon className="h-4 w-4 text-accent" />
          ) : (
            <MoonIcon className="h-4 w-4 text-text-secondary" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition cursor-pointer shadow-subtle"
            aria-label="View notifications"
          >
            <BellIcon className="h-4 w-4" />
            {activeNotices.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[12px] font-bold text-white ring-2 ring-surface">
                {activeNotices.length > 9 ? "9+" : activeNotices.length}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-surface text-text-primary shadow-lg z-50">
              <div className="flex items-center justify-between border-b border-border bg-surface-subtle px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-text-primary">
                    Notifications
                  </span>
                  <span className="rounded bg-surface border border-border px-1.5 py-0.2 text-[12px] font-medium text-text-secondary">
                    {activeNotices.length}
                  </span>
                </div>
                {activeNotices.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setDismissedIds(new Set(notifications.map((n) => n.id)));
                    }}
                    className="text-[12px] font-medium text-text-secondary hover:text-text-primary cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-border/60">
                {activeNotices.length === 0 ? (
                  <div className="p-6 text-center text-sm text-text-secondary">
                    <CheckCircleIcon className="mx-auto mb-2 h-6 w-6 text-brand opacity-80" />
                    <p className="font-medium text-text-primary">All caught up</p>
                    <p className="text-[12px] text-text-tertiary mt-0.5">
                      No pending task alerts in your workspace.
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
                        className={`flex items-start gap-2.5 p-3.5 transition cursor-pointer hover:bg-surface-subtle ${
                          isOverdue
                            ? "bg-[#FEF2F2]/40 dark:bg-[#3B0D0D]/20"
                            : "bg-[#FFF4EC]/40 dark:bg-[#341708]/20"
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {isOverdue ? (
                            <AlertTriangleIcon className="w-4 h-4 text-accent" />
                          ) : (
                            <CalendarIcon className="w-4 h-4 text-accent" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold truncate text-text-primary">
                            {notif.title}
                          </p>
                          <p className="text-[12px] text-text-secondary mt-0.5 leading-snug">
                            {notif.desc}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleDismissNotice(e, notif.id)}
                          className="shrink-0 text-text-tertiary hover:text-text-primary p-0.5 rounded cursor-pointer"
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
            className="flex items-center gap-2 rounded-md border border-border bg-surface p-1 pr-2.5 text-left transition hover:bg-surface-subtle cursor-pointer shadow-subtle"
          >
            <Avatar user={user} size="sm" />
            <div className="hidden text-left md:block">
              <p className="max-w-[120px] truncate text-[13px] font-semibold text-text-primary leading-tight">
                {user?.name || "User"}
              </p>
              <p className="text-[12px] text-text-secondary capitalize">
                {user?.role === "superadmin"
                  ? "Super Admin"
                  : user?.role || "user"}
              </p>
            </div>
            <ChevronDownIcon className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
          </button>

          {/* Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-surface p-1.5 text-text-primary shadow-lg z-50">
              <div className="border-b border-border p-2.5">
                <p className="text-sm font-semibold text-text-primary truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-[12px] text-text-secondary truncate mt-0.5">
                  {user?.email || ""}
                </p>
                <div className="mt-2">
                  <RoleBadge role={user?.role} size="sm" />
                </div>
              </div>

              <div className="py-1 space-y-0.5 text-[13px]">
                <button
                  type="button"
                  onClick={() => {
                    navigate("/projects");
                    setProfileDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition cursor-pointer"
                >
                  <FolderIcon className="h-4 w-4 text-text-tertiary" />
                  <span>Projects</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigate("/tasks");
                    setProfileDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition cursor-pointer"
                >
                  <CheckSquareIcon className="h-4 w-4 text-text-tertiary" />
                  <span>Tasks</span>
                </button>

                {(user?.role === "admin" || user?.role === "superadmin") && (
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/admin/users");
                      setProfileDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition cursor-pointer"
                  >
                    <UsersIcon className="h-4 w-4 text-text-tertiary" />
                    <span>Team Directory</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    if (onOpenSettings) onOpenSettings();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition cursor-pointer"
                >
                  <SunIcon className="h-4 w-4 text-text-tertiary" />
                  <span>Preferences</span>
                </button>
              </div>

              <div className="border-t border-border pt-1 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onLogout?.();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-accent hover:bg-[#FEF2F2] dark:hover:bg-[#3B0D0D]/30 transition cursor-pointer"
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
