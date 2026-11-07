import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../common/Icons";
import Avatar from "../common/Avatar";
import { RoleBadge } from "../common/Badge";
import Breadcrumbs from "../common/Breadcrumbs";

export function Navbar({ user, onLogout, setMobileOpen }) {
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

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

  const dummyNotifications = [
    {
      id: 1,
      title: "Workspace Synchronized",
      desc: "Upstash Redis cache and MongoDB are running at optimum latency.",
      time: "Just now",
      read: false,
    },
    {
      id: 2,
      title: "Session Authenticated",
      desc: "JWT session token active with auto-refresh protection.",
      time: "10m ago",
      read: true,
    },
  ];

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
          <Icon name="menu" className="h-5 w-5" />
        </button>

        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-300 hover:bg-white/10 transition"
            title="Notifications"
          >
            <Icon name="bell" className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          </button>

          {/* Notifications Flyout */}
          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-white/10 bg-[#0f1424] p-4 text-white shadow-2xl shadow-black/80">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="text-sm font-bold">Notifications</h4>
                <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  2 New
                </span>
              </div>
              <div className="mt-3 divide-y divide-white/5 space-y-2">
                {dummyNotifications.map((notif) => (
                  <div key={notif.id} className="pt-2">
                    <p className="text-xs font-semibold text-slate-200">
                      {notif.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400 leading-relaxed">
                      {notif.desc}
                    </p>
                    <span className="mt-1 block text-[10px] text-slate-500">
                      {notif.time}
                    </span>
                  </div>
                ))}
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
            <Avatar name={user?.name} email={user?.email} size="sm" />
            <div className="hidden text-left md:block">
              <p className="max-w-[120px] truncate text-xs font-semibold text-white">
                {user?.name || "User"}
              </p>
              <p className="text-[10px] text-slate-400 capitalize">
                {user?.role || "user"}
              </p>
            </div>
            <Icon
              name="chevronDown"
              className="h-3.5 w-3.5 text-slate-400 shrink-0"
            />
          </button>

          {/* Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#0f1424] p-2 text-white shadow-2xl shadow-black/80">
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

              <div className="py-2 space-y-1 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    navigate("/projects");
                    setProfileDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-slate-300 hover:bg-white/10 hover:text-white transition"
                >
                  <Icon name="projects" className="h-4 w-4" />
                  <span>My Projects</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigate("/tasks");
                    setProfileDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-slate-300 hover:bg-white/10 hover:text-white transition"
                >
                  <Icon name="tasks" className="h-4 w-4" />
                  <span>My Tasks</span>
                </button>

                {user?.role === "admin" && (
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/admin/users");
                      setProfileDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-slate-300 hover:bg-white/10 hover:text-white transition"
                  >
                    <Icon name="users" className="h-4 w-4" />
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
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
                >
                  <Icon name="logout" className="h-4 w-4" />
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
