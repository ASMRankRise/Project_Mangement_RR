import Icon from "./Icons";

export function Alert({ message, type = "error" }) {
  if (!message) return null;

  const styles = {
    success: {
      box: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
      icon: "checkCircle",
    },
    error: {
      box: "bg-rose-500/10 text-rose-300 border-rose-500/20",
      icon: "alertCircle",
    },
    warning: {
      box: "bg-amber-500/10 text-amber-300 border-amber-500/20",
      icon: "alertCircle",
    },
    info: {
      box: "bg-sky-500/10 text-sky-300 border-sky-500/20",
      icon: "alertCircle",
    },
  };

  const current = styles[type] || styles.error;

  return (
    <div
      role={type === "success" ? "status" : "alert"}
      aria-live={type === "success" ? "polite" : "assertive"}
      className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-xs font-medium leading-relaxed ${current.box} animate-in fade-in duration-200`}
    >
      <Icon name={current.icon} className="h-4 w-4 shrink-0 mt-0.5" />
      <span className="flex-1">{message}</span>
    </div>
  );
}

export default Alert;
