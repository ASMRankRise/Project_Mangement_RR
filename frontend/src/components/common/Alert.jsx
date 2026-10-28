function Alert({ message, type = "error" }) {
  if (!message) return null;

  const styles = {
    success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    error: "bg-red-500/10 text-red-300 border-red-500/20",
    warning: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    info: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  };

  const alertStyle = styles[type] || styles.error;

  return (
    <p
      role={type === "success" ? "status" : "alert"}
      aria-live={type === "success" ? "polite" : "assertive"}
      className={`rounded-lg border p-3 text-sm ${alertStyle}`}
    >
      {message}
    </p>
  );
}

export default Alert;
