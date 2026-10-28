import { NavLink } from "react-router-dom";

function Navigation({ user }) {
  const links = [
    { to: "/dashboard", label: "Dashboard", roles: ["user"] },
    { to: "/admin", label: "Admin", roles: ["admin"] },
    { to: "/projects", label: "Projects", roles: ["user", "admin"] },
    { to: "/tasks", label: "Tasks", roles: ["user", "admin"] },
  ];

  return (
    <nav className="mb-6 flex flex-wrap gap-3">
      {links
        .filter((link) => link.roles.includes(user?.role))
        .map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `rounded-lg px-4 py-2 text-sm font-medium ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
    </nav>
  );
}

export default Navigation;
