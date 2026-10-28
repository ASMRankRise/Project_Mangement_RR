function Loading({ message = "Loading..." }) {
  return (
    <div
      className="grid min-h-screen place-items-center bg-[#080b16] text-white"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-indigo-500" />

        <p className="text-sm text-slate-300">{message}</p>
      </div>
    </div>
  );
}

export default Loading;
