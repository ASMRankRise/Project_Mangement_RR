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
      box: "bg-[#F0FDF4] text-[#166534] border-[#BBF7D0] dark:bg-[#052E16] dark:text-[#4ADE80] dark:border-[#14532D]",
      icon: CheckCircleIcon,
      iconColor: "text-[#166534] dark:text-[#4ADE80]",
    },
    error: {
      box: "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA] dark:bg-[#3B0D0D] dark:text-[#F87171] dark:border-[#681D1D]",
      icon: AlertCircleIcon,
      iconColor: "text-[#991B1B] dark:text-[#F87171]",
    },
    warning: {
      box: "bg-[#FFF4EC] text-[#9A3412] border-[#FBD6BA] dark:bg-[#341708] dark:text-[#FB923C] dark:border-[#5C2A10]",
      icon: AlertTriangleIcon,
      iconColor: "text-[#9A3412] dark:text-[#FB923C]",
    },
    info: {
      box: "bg-[#F1EDE4] text-[#57534E] border-[#E4DED4] dark:bg-[#232726] dark:text-[#A8A29E] dark:border-[#2E3432]",
      icon: InfoIcon,
      iconColor: "text-[#57534E] dark:text-[#A8A29E]",
    },
  };

  const current = styles[type] || styles.error;
  const IconComponent = current.icon;

  return (
    <div
      role={type === "success" ? "status" : "alert"}
      aria-live={type === "success" ? "polite" : "assertive"}
      className={`flex items-start gap-2.5 rounded-md border p-3.5 text-[13px] font-medium leading-relaxed ${current.box} transition-colors`}
    >
      <IconComponent className={`h-4 w-4 shrink-0 mt-0.5 ${current.iconColor}`} />
      <span className="flex-1 text-left">{message}</span>
    </div>
  );
}

export default Alert;
