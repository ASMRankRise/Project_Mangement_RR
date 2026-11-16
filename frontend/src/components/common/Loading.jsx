export function Loading({ message = "Loading..." }) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-canvas text-text-primary transition-colors"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <p className="text-sm font-medium text-text-secondary">
          {message}
        </p>
      </div>
    </div>
  );
}

export default Loading;
