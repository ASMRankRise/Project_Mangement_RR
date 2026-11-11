const ENTERPRISE_AVATAR_COLORS = [
  "bg-slate-700 text-slate-100 dark:bg-slate-600 dark:text-slate-100",
  "bg-indigo-700 text-indigo-50 dark:bg-indigo-800 dark:text-indigo-100",
  "bg-blue-700 text-blue-50 dark:bg-blue-800 dark:text-blue-100",
  "bg-emerald-700 text-emerald-50 dark:bg-emerald-800 dark:text-emerald-100",
  "bg-amber-700 text-amber-50 dark:bg-amber-800 dark:text-amber-100",
  "bg-violet-700 text-violet-50 dark:bg-violet-800 dark:text-violet-100",
  "bg-teal-700 text-teal-50 dark:bg-teal-800 dark:text-teal-100",
];

function getAvatarColor(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % ENTERPRISE_AVATAR_COLORS.length;
  return ENTERPRISE_AVATAR_COLORS[index];
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
    xs: "h-5 w-5 text-[10px]",
    sm: "h-6 w-6 text-[11px] font-medium",
    md: "h-7 w-7 text-xs font-medium",
    lg: "h-8 w-8 text-xs font-semibold",
    xl: "h-10 w-10 text-sm font-semibold",
  };

  const initial = (userName || userEmail || "U").trim().charAt(0).toUpperCase();
  const colorClass = getAvatarColor(userEmail || userName);

  return (
    <div
      title={showTooltip ? `${userName}${userEmail ? ` (${userEmail})` : ""}` : undefined}
      className={`relative inline-flex shrink-0 select-none items-center justify-center rounded-full ${colorClass} ring-1 ring-slate-200 dark:ring-slate-700 ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      <span>{initial}</span>
    </div>
  );
}

export function AvatarGroup({ users = [], max = 3, size = "sm" }) {
  const userList = Array.isArray(users) ? users : [];
  const displayUsers = userList.slice(0, max);
  const remaining = userList.length - max;

  return (
    <div className="flex items-center -space-x-1.5 overflow-hidden">
      {displayUsers.map((u, i) => (
        <Avatar
          key={u?._id || u?.id || u?.email || i}
          user={u}
          size={size}
          className="ring-2 ring-white dark:ring-[#161B22]"
        />
      ))}
      {remaining > 0 && (
        <div
          title={`${remaining} more team members`}
          className="relative inline-flex shrink-0 select-none items-center justify-center rounded-full bg-slate-100 text-[10px] font-medium text-slate-700 ring-2 ring-white dark:bg-slate-800 dark:text-slate-300 dark:ring-[#161B22] h-6 w-6"
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

export default Avatar;
