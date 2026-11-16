import Icon from "./Icons";

export function Badge({
  variant = "default",
  size = "md",
  children,
  icon,
  className = "",
}) {
  const sizeStyles = {
    xs: "px-2 py-0.5 text-[12px] font-medium",
    sm: "px-2 py-0.5 text-[12px] font-medium",
    md: "px-2.5 py-1 text-[13px] font-medium",
    lg: "px-3 py-1.5 text-sm font-medium",
  };

  const variants = {
    default: "bg-[#F1EDE4] text-[#57534E] border-[#E4DED4] dark:bg-[#232726] dark:text-[#A8A29E] dark:border-[#2E3432]",
    stone: "bg-[#F1EDE4] text-[#57534E] border-[#E4DED4] dark:bg-[#232726] dark:text-[#A8A29E] dark:border-[#2E3432]",
    pine: "bg-[#EAF2ED] text-[#154336] border-[#BCD4CA] dark:bg-[#163328] dark:text-[#34D399] dark:border-[#225040]",
    brand: "bg-[#EAF2ED] text-[#154336] border-[#BCD4CA] dark:bg-[#163328] dark:text-[#34D399] dark:border-[#225040]",
    terracotta: "bg-[#FFF4EC] text-[#9A3412] border-[#FBD6BA] dark:bg-[#341708] dark:text-[#FB923C] dark:border-[#5C2A10]",
    amber: "bg-[#FFF4EC] text-[#9A3412] border-[#FBD6BA] dark:bg-[#341708] dark:text-[#FB923C] dark:border-[#5C2A10]",
    emerald: "bg-[#F0FDF4] text-[#166534] border-[#BBF7D0] dark:bg-[#052E16] dark:text-[#4ADE80] dark:border-[#14532D]",
    crimson: "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA] dark:bg-[#3B0D0D] dark:text-[#F87171] dark:border-[#681D1D]",
    superadmin: "bg-[#1C1917] text-[#FAF9F6] border-[#44403C] dark:bg-[#242726] dark:text-[#F5F5F4] dark:border-[#3E4542]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${sizeStyles[size] || sizeStyles.md} ${variants[variant] || variants.default} ${className}`}
    >
      {icon && <Icon name={icon} className="h-3.5 w-3.5 shrink-0" />}
      {children}
    </span>
  );
}

export function StatusBadge({ status, size = "md" }) {
  const config = {
    todo: { label: "To Do", variant: "stone", dot: "bg-[#78716C] dark:bg-[#A8A29E]" },
    "in-progress": { label: "In Progress", variant: "pine", dot: "bg-[#154336] dark:bg-[#34D399]" },
    testing: { label: "Testing", variant: "terracotta", dot: "bg-[#C2410C] dark:bg-[#FB923C]" },
    completed: { label: "Completed", variant: "emerald", dot: "bg-[#166534] dark:bg-[#4ADE80]" },
    done: { label: "Done", variant: "emerald", dot: "bg-[#166534] dark:bg-[#4ADE80]" },
  };

  const current = config[status] || { label: status || "Unknown", variant: "stone", dot: "bg-[#78716C]" };

  return (
    <Badge variant={current.variant} size={size}>
      <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />
      <span>{current.label}</span>
    </Badge>
  );
}

export function PriorityBadge({ priority, size = "md" }) {
  const config = {
    low: { label: "Low", variant: "stone", icon: "flag" },
    medium: { label: "Medium", variant: "terracotta", icon: "flag" },
    high: { label: "High", variant: "crimson", icon: "flag" },
  };

  const current = config[priority] || { label: priority || "Normal", variant: "stone", icon: "flag" };

  return (
    <Badge variant={current.variant} size={size} icon={current.icon}>
      {current.label}
    </Badge>
  );
}

export function RoleBadge({ role, size = "sm" }) {
  if (role === "superadmin") {
    return (
      <Badge
        variant="superadmin"
        size={size}
        icon="shield"
        className="font-semibold"
      >
        Super Admin
      </Badge>
    );
  }

  const isAdmin = role === "admin";
  return (
    <Badge
      variant={isAdmin ? "pine" : "stone"}
      size={size}
      icon={isAdmin ? "shield" : "user"}
    >
      {isAdmin ? "Administrator" : "Employee"}
    </Badge>
  );
}

export default Badge;
