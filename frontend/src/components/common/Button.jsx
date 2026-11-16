export function Button({
  children,
  variant = "secondary",
  size = "md",
  icon: IconComponent,
  iconRight: IconRightComponent,
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

  const variants = {
    primary:
      "bg-brand text-brand-text hover:bg-brand-hover active:opacity-95 shadow-subtle border border-transparent",
    secondary:
      "bg-surface text-text-primary hover:bg-surface-subtle border border-border shadow-subtle active:bg-surface-subtle",
    outline:
      "bg-transparent text-text-primary hover:bg-surface-subtle border border-border active:bg-surface-subtle",
    ghost:
      "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-subtle",
    danger:
      "bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA] hover:bg-[#FEE2E2] dark:bg-[#3B0D0D] dark:text-[#F87171] dark:border-[#681D1D] dark:hover:bg-[#4C1212]",
  };

  const sizes = {
    sm: "h-8 px-3 text-[13px]",
    md: "h-9 px-3.5 text-sm",
    lg: "h-10 px-4 text-sm",
    icon: "h-9 w-9 p-0",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant] || variants.secondary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : IconComponent ? (
        <IconComponent className="h-4 w-4 shrink-0" />
      ) : null}
      {children}
      {IconRightComponent && !loading && (
        <IconRightComponent className="h-4 w-4 shrink-0" />
      )}
    </button>
  );
}

export default Button;

