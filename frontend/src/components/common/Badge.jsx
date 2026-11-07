import Icon from "./Icons";

export function Badge({
  variant = "default",
  size = "md",
  children,
  icon,
  className = "",
}) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-xs font-medium",
    lg: "px-3 py-1.5 text-sm font-medium",
  };

  const variants = {
    default: "bg-white/10 text-slate-300 border border-white/10",
    indigo: "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20",
    purple: "bg-purple-500/10 text-purple-300 border border-purple-500/20",
    emerald: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-300 border border-rose-500/20",
    sky: "bg-sky-500/10 text-sky-300 border border-sky-500/20",
    slate: "bg-slate-800 text-slate-300 border border-slate-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${sizeStyles[size] || sizeStyles.md} ${variants[variant] || variants.default} ${className}`}
    >
      {icon && <Icon name={icon} className="h-3 w-3 shrink-0" />}
      {children}
    </span>
  );
}

export function StatusBadge({ status, size = "md" }) {
  const config = {
    todo: { label: "To Do", variant: "slate", dot: "bg-slate-400" },
    "in-progress": { label: "In Progress", variant: "sky", dot: "bg-sky-400 animate-pulse" },
    testing: { label: "Testing", variant: "purple", dot: "bg-purple-400" },
    completed: { label: "Completed", variant: "emerald", dot: "bg-emerald-400" },
    done: { label: "Done", variant: "emerald", dot: "bg-emerald-400" },
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
