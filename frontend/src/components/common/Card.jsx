export function Card({
  children,
  className = "",
  onClick,
  hoverable = false,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border border-border bg-surface shadow-subtle ${
        hoverable
          ? "transition-colors hover:border-brand/40 cursor-pointer"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  children,
  className = "",
}) {
  return (
    <div
      className={`flex items-start justify-between gap-4 border-b border-border/80 p-4 sm:px-5 sm:py-4 ${className}`}
    >
      <div className="min-w-0 flex-1">
        {title && (
          <h3 className="text-[17px] font-semibold tracking-tight text-text-primary truncate">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="mt-0.5 text-[13px] text-text-secondary leading-normal">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`p-4 sm:p-5 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
  return (
    <div
      className={`flex items-center justify-between gap-3 border-t border-border/80 px-4 py-3 sm:px-5 ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;

