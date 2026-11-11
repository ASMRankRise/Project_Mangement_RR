import Icon from "./Icons";

export function Badge({
  variant = "default",
  size = "md",
  children,
  icon,
  className = "",
}) {
  const sizeStyles = {
    xs: "px-1.5 py-0.5 text-[10px] font-medium",
    sm: "px-2 py-0.5 text-[11px] font-medium",
    md: "px-2.5 py-0.5 text-xs font-medium",
    lg: "px-3 py-1 text-xs font-medium",
  };

  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60",
    purple: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60",
    amber: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60",
    rose: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60",
    sky: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/60",
    slate: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${sizeStyles[size] || sizeStyles.md} ${variants[variant] || variants.default} ${className}`}
    >
      {icon && <Icon name={icon} className="h-3 w-3 shrink-0" />}
      {children}
    </span>
  );
}

export function StatusBadge({ status, size = "md" }) {
  const config = {
    todo: { label: "To Do", variant: "slate", dot: "bg-slate-400 dark:bg-slate-500" },
    "in-progress": { label: "In Progress", variant: "sky", dot: "bg-sky-500" },
    testing: { label: "Testing", variant: "purple", dot: "bg-purple-500" },
    completed: { label: "Completed", variant: "emerald", dot: "bg-emerald-500" },
    done: { label: "Done", variant: "emerald", dot: "bg-emerald-500" },
  };

  const current = config[status] || { label: status || "Unknown", variant: "default", dot: "bg-slate-400" };

  return (
    <Badge variant={current.variant} size={size}>
      <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />
      <span>{current.label}</span>
    </Badge>
  );
}

export function PriorityBadge({ priority, size = "md" }) {
  const config = {
    low: { label: "Low", variant: "slate", icon: "flag" },
    medium: { label: "Medium", variant: "amber", icon: "flag" },
    high: { label: "High", variant: "rose", icon: "flag" },
  };

  const current = config[priority] || { label: priority || "Normal", variant: "default", icon: "flag" };

  return (
    <Badge variant={current.variant} size={size} icon={current.icon}>
      {current.label}
    </Badge>
  );
}

export function RoleBadge({ role, size = "sm" }) {
  const isAdmin = role === "admin";
  return (
    <Badge
      variant={isAdmin ? "indigo" : "slate"}
      size={size}
      icon={isAdmin ? "shield" : "user"}
    >
      {isAdmin ? "Admin" : "Member"}
    </Badge>
  );
}

export default Badge;
