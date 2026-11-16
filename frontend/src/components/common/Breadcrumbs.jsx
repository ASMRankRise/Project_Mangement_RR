import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRightIcon, LayoutDashboardIcon } from "./Icons";

export function Breadcrumbs({ customCrumbs }) {
  const location = useLocation();

  const pathMap = {
    dashboard: "Overview",
    admin: "Admin",
    users: "Team directory",
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
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-text-secondary">
      <Link
        to="/"
        className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors"
      >
        <LayoutDashboardIcon className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Workspace</span>
      </Link>

      {crumbs.map((crumb, idx) => (
        <Fragment key={crumb.url || idx}>
          <ChevronRightIcon className="h-3 w-3 text-text-tertiary shrink-0" />
          {crumb.isLast ? (
            <span className="font-semibold text-text-primary truncate max-w-[180px]">
              {crumb.label}
            </span>
          ) : (
            <Link
              to={crumb.url}
              className="text-text-secondary hover:text-text-primary transition-colors truncate max-w-[140px]"
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
