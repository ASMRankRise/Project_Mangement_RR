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
  SunIcon,
} from "../common/Icons";

export function Sidebar({
  user,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  onLogout,
  onOpenSettings,
}) {
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  const navigationItems = [
    {
      label: "WORKSPACE",
      items: [
        {
          to: isAdmin ? "/admin" : "/dashboard",
          label: isAdmin ? "Overview" : "Overview",
          icon: LayoutDashboardIcon,
        },
        {
          to: "/tasks",
          label: "My Tasks",
          icon: CheckSquareIcon,
        },
        {
          to: "/projects",
          label: "Projects",
          icon: FolderIcon,
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
                label: "Team Directory",
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
          className="fixed inset-0 z-40 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0E1A] text-slate-800 dark:text-slate-200 transition-all duration-200 ease-in-out lg:static ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "lg:w-16" : "w-60"}`}
      >
        {/* Brand Header */}
        <div className="flex h-14 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-3.5">
          <div
            onClick={() => navigate("/")}
            className="flex cursor-pointer items-center gap-2.5 overflow-hidden"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs shadow-xs">
              <LayersIcon className="w-4 h-4" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  ProjectHub
                </span>
                <span className="text-[10px] font-medium tracking-wider text-indigo-600 dark:text-indigo-400 uppercase mt-0.5">
                  Enterprise
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse button */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white lg:block transition"
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
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-5">
          {navigationItems.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!collapsed && (
                <div className="px-2.5 pb-1.5 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
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
                      `group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-600/15 dark:text-indigo-300"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                      } ${collapsed ? "justify-center px-0" : ""}`
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

          {/* Settings link */}
          <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            {!collapsed && (
              <div className="px-2.5 pb-1.5 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                SYSTEM
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                handleNavClick();
                if (onOpenSettings) onOpenSettings();
              }}
              className={`w-full group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition ${
                collapsed ? "justify-center px-0" : ""
              }`}
              title={collapsed ? "Preferences" : undefined}
            >
              <SunIcon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Preferences</span>}
            </button>
          </div>
        </div>

        {/* User Card at Bottom */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-2.5">
          <div
            className={`flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 p-2 border border-slate-200/60 dark:border-slate-800/60 ${
              collapsed ? "justify-center p-1.5" : "justify-between"
            }`}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Avatar user={user} size="sm" />
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                    {user?.name || "User"}
                  </p>
                  <div className="mt-0.5">
                    <RoleBadge role={user?.role} size="xs" />
                  </div>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                type="button"
                onClick={onLogout}
                title="Log out"
                className="rounded-lg p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition"
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
