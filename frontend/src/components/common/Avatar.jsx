
const GRADIENTS = [
  "from-indigo-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-blue-500 to-cyan-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-fuchsia-600",
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
  name = "User",
  email = "",
  size = "md",
  showTooltip = true,
  className = "",
}) {
  const sizeClasses = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-7 w-7 text-xs",
    md: "h-8 w-8 text-xs font-semibold",
    lg: "h-10 w-10 text-sm font-semibold",
    xl: "h-12 w-12 text-base font-bold",
  };

  const initial = (name || email || "U").trim().charAt(0).toUpperCase();
  const gradient = getGradient(email || name);

  return (
    <div
      title={showTooltip ? `${name}${email ? ` (${email})` : ""}` : undefined}
      className={`relative inline-flex shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-white shadow-sm ring-2 ring-[#0e1222] ${sizeClasses[size] || sizeClasses.md} ${className}`}
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
          name={u.name || u.email}
          email={u.email}
          size={size}
        />
      ))}
      {remaining > 0 && (
        <span
          title={`${remaining} more members`}
          className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/20 bg-slate-800 text-[10px] font-bold text-slate-300 ring-2 ring-[#0e1222]"
        >
          +{remaining}
        </span>
      )}
    </div>
  );
}

export default Avatar;
