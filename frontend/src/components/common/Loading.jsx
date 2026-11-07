import Icon from "./Icons";

export function Loading({ message = "Loading workspace..." }) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-[#070a13] text-white"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-xl shadow-indigo-600/30">
          <Icon name="sparkles" className="h-7 w-7 text-white animate-pulse" />
          <span className="absolute -inset-1 rounded-2xl border-2 border-indigo-500/40 animate-ping opacity-30" />
        </div>

        <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}

export default Loading;
