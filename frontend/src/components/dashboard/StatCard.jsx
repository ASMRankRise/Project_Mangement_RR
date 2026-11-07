import Icon from "../common/Icons";

export function StatCard({
  title,
  value,
  description,
  icon = "sparkles",
  gradient = "from-indigo-500 to-violet-600",
  badgeText,
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-xl hover:shadow-black/30 sm:p-6">
      {/* Glow on hover */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl transition group-hover:bg-indigo-500/20" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            {title}
          </p>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {value}
            </span>
            {badgeText && (
              <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">
                <Icon name="trendingUp" className="h-3 w-3" />
                {badgeText}
              </span>
            )}
          </div>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg shadow-black/20 text-white`}
        >
          <Icon name={icon} className="h-6 w-6" />
        </div>
      </div>

      {description && (
        <p className="mt-3 text-xs text-slate-400 leading-relaxed">
          {description}
        </p>
      )}
    </article>
  );
}

export default StatCard;
