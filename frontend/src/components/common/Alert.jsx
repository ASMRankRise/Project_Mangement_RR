import {
  CheckCircleIcon,
  AlertTriangleIcon,
  AlertCircleIcon,
  InfoIcon,
} from "./Icons";

export function Alert({ message, type = "error" }) {
  if (!message) return null;

  const styles = {
    success: {
      box: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
      icon: CheckCircleIcon,
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    error: {
      box: "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20",
      icon: AlertCircleIcon,
      iconColor: "text-rose-600 dark:text-rose-400",
    },
    warning: {
      box: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
      icon: AlertTriangleIcon,
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    info: {
      box: "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20",
      icon: InfoIcon,
      iconColor: "text-sky-600 dark:text-sky-400",
    },
  };

  const current = styles[type] || styles.error;
  const IconComponent = current.icon;

  return (
    <div
      role={type === "success" ? "status" : "alert"}
      aria-live={type === "success" ? "polite" : "assertive"}
      className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-xs font-medium leading-relaxed ${current.box} transition-all`}
    >
      <IconComponent className={`h-4 w-4 shrink-0 mt-0.5 ${current.iconColor}`} />
      <span className="flex-1">{message}</span>
    </div>
  );
}

export default Alert;
