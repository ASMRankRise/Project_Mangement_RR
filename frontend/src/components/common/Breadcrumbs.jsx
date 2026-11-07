import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import Icon from "./Icons";

export function Breadcrumbs({ customCrumbs }) {
  const location = useLocation();

  const pathMap = {
    dashboard: "Dashboard",
    admin: "Admin Console",
    users: "Manage Users",
    projects: "Projects",
    tasks: "Tasks",
  };

  const segments = location.pathname.split("/").filter(Boolean);

  const crumbs =
    customCrumbs ||
    segments.map((seg, idx) => {
      const url = `/${segments.slice(0, idx + 1).join("/")}`;
      return {
        label: pathMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
        url,
        isLast: idx === segments.length - 1,
      };
    });

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400">
      <Link
        to="/"
        className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition"
      >
        <Icon name="dashboard" className="h-3.5 w-3.5" />
        <span>Home</span>
      </Link>

      {crumbs.map((crumb, idx) => (
        <Fragment key={crumb.url || idx}>
          <Icon name="chevronRight" className="h-3 w-3 text-slate-600 shrink-0" />
          {crumb.isLast ? (
            <span className="font-semibold text-slate-200">{crumb.label}</span>
          ) : (
            <Link
              to={crumb.url}
              className="text-slate-400 hover:text-slate-200 transition"
            >
              {crumb.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

export default Breadcrumbs;
