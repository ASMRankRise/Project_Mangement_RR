export function Input({
  label,
  error,
  hint,
  icon: IconComponent,
  className = "",
  id,
  required,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[13px] font-medium text-text-secondary"
        >
          {label}
          {required && <span className="ml-1 text-accent">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {IconComponent && (
          <div className="pointer-events-none absolute left-3 flex items-center text-text-tertiary">
            <IconComponent className="h-4 w-4" />
          </div>
        )}
        <input
          id={inputId}
          className={`h-9 w-full rounded-md border bg-surface px-3 text-sm text-text-primary placeholder:text-text-tertiary shadow-subtle transition-colors focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:cursor-not-allowed disabled:opacity-50 ${
            IconComponent ? "pl-9" : ""
          } ${
            error
              ? "border-accent focus:border-accent focus:ring-accent"
              : "border-border"
          } ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-[12px] text-accent">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-text-tertiary">{hint}</p>
      ) : null}
    </div>
  );
}

export function Select({
  label,
  error,
  hint,
  children,
  className = "",
  id,
  required,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-[13px] font-medium text-text-secondary"
        >
          {label}
          {required && <span className="ml-1 text-accent">*</span>}
        </label>
      )}

      <select
        id={selectId}
        className={`h-9 w-full rounded-md border bg-surface px-3 text-sm text-text-primary shadow-subtle transition-colors focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
          error
            ? "border-accent focus:border-accent focus:ring-accent"
            : "border-border"
        } ${className}`}
        {...props}
      >
        {children}
      </select>

      {error ? (
        <p className="text-[12px] text-accent">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-text-tertiary">{hint}</p>
      ) : null}
    </div>
  );
}

export function Textarea({
  label,
  error,
  hint,
  className = "",
  id,
  required,
  rows = 3,
  ...props
}) {
  const areaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={areaId}
          className="block text-[13px] font-medium text-text-secondary"
        >
          {label}
          {required && <span className="ml-1 text-accent">*</span>}
        </label>
      )}

      <textarea
        id={areaId}
        rows={rows}
        className={`w-full rounded-md border bg-surface p-3 text-sm text-text-primary placeholder:text-text-tertiary shadow-subtle transition-colors focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:cursor-not-allowed disabled:opacity-50 ${
          error
            ? "border-accent focus:border-accent focus:ring-accent"
            : "border-border"
        } ${className}`}
        {...props}
      />

      {error ? (
        <p className="text-[12px] text-accent">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-text-tertiary">{hint}</p>
      ) : null}
    </div>
  );
}

export default Input;

