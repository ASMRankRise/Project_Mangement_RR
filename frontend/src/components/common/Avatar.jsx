const GRADIENTS = [
  "from-indigo-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-blue-500 to-cyan-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-purple-600",
];

function getGradient(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
}

export function Avatar({
  user,
  name,
  email,
  size = "md",
  showTooltip = true,
  className = "",
}) {
  const userName = user?.name || name || "User";
  const userEmail = user?.email || email || "";

  const sizeClasses = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-7 w-7 text-[11px] font-medium",
    md: "h-8 w-8 text-xs font-semibold",
    lg: "h-9 w-9 text-sm font-semibold",
    xl: "h-11 w-11 text-base font-bold",
  };

  const initial = (userName || userEmail || "U").trim().charAt(0).toUpperCase();
  const gradient = getGradient(userEmail || userName);

  return (
    <div
      title={showTooltip ? `${userName}${userEmail ? ` (${userEmail})` : ""}` : undefined}
      className={`relative inline-flex shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-white shadow-xs ring-2 ring-white dark:ring-slate-900 ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      <span>{initial}</span>
    </div>
  );
}

export function AvatarGroup({ users = [], max = 4, size = "sm" }) {
  const visible = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className="flex items-center -space-x-2 overflow-hidden">
      {visible.map((u, i) => (
        <Avatar
          key={u._id || u.id || u.email || i}
          user={u}
          size={size}
        />
      ))}
      {remaining > 0 && (
        <span
          title={`${remaining} more members`}
          className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 ring-2 ring-white dark:ring-slate-900"
        >
          +{remaining}
        </span>
      )}
    </div>
  );
}

export default Avatar;
