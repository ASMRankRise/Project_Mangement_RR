import { NavLink, useNavigate } from "react-router-dom";
import Icon from "../common/Icons";
import Avatar from "../common/Avatar";
import { RoleBadge } from "../common/Badge";

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
      label: "WORKSPACE",
      items: [
        {
          to: isAdmin ? "/admin" : "/dashboard",
          label: isAdmin ? "Admin Overview" : "Dashboard",
          icon: "dashboard",
        },
        {
          to: "/projects",
          label: "Projects",
          icon: "projects",
        },
        {
          to: "/tasks",
          label: "Tasks",
          icon: "tasks",
        },
      ],
    },
    ...(isAdmin
      ? [
          {
            label: "MANAGEMENT",
            items: [
              {
                to: "/admin/users",
                label: "Manage Users",
                icon: "users",
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
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-[#0a0e1c] text-slate-200 transition-all duration-300 ease-in-out lg:static ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "lg:w-20" : "w-64"}`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <div
            onClick={() => navigate("/")}
            className="flex cursor-pointer items-center gap-3 overflow-hidden"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-md shadow-indigo-600/30">
              <Icon name="sparkles" className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-white">
                  ProjectFlow
                </span>
                <span className="text-[10px] font-medium tracking-widest text-indigo-400 uppercase">
                  Enterprise
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
            <Icon
              name={collapsed ? "chevronRight" : "chevronLeft"}
              className="h-4 w-4"
            />
          </button>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigationItems.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                  {group.label}
                </div>
              )}
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/25 font-semibold"
                        : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                    } ${collapsed ? "justify-center" : ""}`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    name={item.icon}
                    className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110"
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* User Card at Bottom */}
        <div className="border-t border-white/10 p-3">
          <div
            className={`flex items-center gap-3 rounded-xl bg-white/[0.03] p-2.5 transition hover:bg-white/[0.06] ${
              collapsed ? "justify-center" : "justify-between"
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <Avatar name={user?.name} email={user?.email} size="sm" />
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
                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-300 transition"
              >
                <Icon name="logout" className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
