const ENTERPRISE_AVATAR_COLORS = [
  "bg-[#292524] text-[#FAF8F5]",
  "bg-[#154336] text-[#FAF8F5]",
  "bg-[#78350F] text-[#FAF8F5]",
  "bg-[#1E3A5F] text-[#FAF8F5]",
  "bg-[#9A3412] text-[#FAF8F5]",
  "bg-[#44403C] text-[#FAF8F5]",
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
    xs: "h-6 w-6 text-[12px] font-medium",
    sm: "h-7 w-7 text-[12px] font-medium",
    md: "h-8 w-8 text-[13px] font-medium",
    lg: "h-9 w-9 text-sm font-semibold",
    xl: "h-11 w-11 text-base font-semibold",
  };

  const initial = (userName || userEmail || "U").trim().charAt(0).toUpperCase();
  const colorClass = getAvatarColor(userEmail || userName);

  return (
    <div
      title={showTooltip ? `${userName}${userEmail ? ` (${userEmail})` : ""}` : undefined}
      className={`relative inline-flex shrink-0 select-none items-center justify-center rounded-full ${colorClass} ring-1 ring-border ${sizeClasses[size] || sizeClasses.md} ${className}`}
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
          className="ring-2 ring-surface"
        />
      ))}
      {remaining > 0 && (
        <div
          title={`${remaining} more team members`}
          className="relative inline-flex shrink-0 select-none items-center justify-center rounded-full bg-surface-subtle text-[12px] font-medium text-text-secondary ring-2 ring-surface h-7 w-7"
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

export default Avatar;
