import { NavLink, useNavigate } from "react-router-dom";
import { Avatar } from "../common/Avatar";
import { RoleBadge } from "../common/Badge";
import {
  LayersIcon,
  LayoutDashboardIcon,
  FolderIcon,
  CheckSquareIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
  LogOutIcon,
} from "../common/Icons";

export function Sidebar({
  user,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  onLogout,
}) {
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  const navigationItems = [
    {
      label: "MAIN",
      items: [
        {
          to: isAdmin ? "/admin" : "/dashboard",
          label: isAdmin ? "Admin Overview" : "Dashboard",
          icon: LayoutDashboardIcon,
        },
        {
          to: "/projects",
          label: "Projects",
          icon: FolderIcon,
        },
        {
          to: "/tasks",
          label: "Tasks",
          icon: CheckSquareIcon,
        },
      ],
    },
    ...(isAdmin
      ? [
          {
            label: "ADMINISTRATION",
            items: [
              {
                to: "/admin/users",
                label: "Manage Users",
                icon: UsersIcon,
              },
            ],
          },
        ]
      : []),
  ];

  const handleNavClick = () => {
    if (mobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-[#0A0E1A] text-slate-200 transition-all duration-300 ease-in-out lg:static ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "lg:w-20" : "w-64"}`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <div
            onClick={() => navigate("/")}
            className="flex cursor-pointer items-center gap-3 overflow-hidden"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 shadow-md text-white font-bold text-sm">
              <LayersIcon className="w-4 h-4" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-white leading-tight">
                  ProjectHub
                </span>
                <span className="text-[10px] font-medium tracking-wider text-indigo-400 uppercase">
                  Workspace
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse button */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:block transition"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRightIcon className="h-4 w-4" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4" />
            )}
          </button>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigationItems.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                  {group.label}
                </div>
              )}
              {group.items.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                        isActive
                          ? "bg-indigo-600 text-white font-semibold shadow-sm"
                          : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                      } ${collapsed ? "justify-center" : ""}`
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <IconComponent className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Card at Bottom */}
        <div className="border-t border-white/10 p-3">
          <div
            className={`flex items-center gap-3 rounded-lg bg-white/[0.02] p-2.5 transition hover:bg-white/[0.05] ${
              collapsed ? "justify-center" : "justify-between"
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Avatar user={user} size="sm" />
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-white">
                    {user?.name || "User"}
                  </p>
                  <div className="mt-0.5">
                    <RoleBadge role={user?.role} size="sm" />
                  </div>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                type="button"
                onClick={onLogout}
                title="Log out"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-300 transition"
              >
                <LogOutIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
