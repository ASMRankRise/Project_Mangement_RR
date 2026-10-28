function SummaryCards({ projectCount = 0, taskCount = 0, user }) {
  const isAdmin = user?.role === "admin";

  const cards = [
    {
      title: isAdmin ? "All Projects" : "My Projects",
      description: "Projects accessible to you",
      value: projectCount,
      suffix: projectCount === 1 ? "project" : "projects",
      icon: "📁",
      iconStyle: "bg-amber-500/10 text-amber-400",
      accent: "from-amber-500/20",
    },
    {
      title: isAdmin ? "All Tasks" : "My Tasks",
      description: "Tasks available to you",
      value: taskCount,
      suffix: taskCount === 1 ? "task" : "tasks",
      icon: "✓",
      iconStyle: "bg-emerald-500/10 text-emerald-400",
      accent: "from-emerald-500/20",
    },
    {
      title: "My Account",
      description: isAdmin
        ? "You are logged in as an administrator"
        : "Your account is authenticated",
      value: isAdmin ? "Admin" : "Member",
      suffix: "account",
      icon: "👤",
      iconStyle: "bg-violet-500/10 text-violet-400",
      accent: "from-violet-500/20",
    },
  ];

  return (
    <section
      aria-label="Dashboard summary"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
    >
      {cards.map((card) => (
        <article
          key={card.title}
          className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${card.accent} to-[#0e1222] p-5 transition duration-200 hover:-translate-y-1 hover:border-white/20 hover:shadow-xl hover:shadow-black/20 sm:p-6`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-400">{card.title}</p>

              <div className="mt-4 flex flex-wrap items-baseline gap-2">
                <h3 className="text-3xl font-bold tracking-tight text-white">
                  {card.value}
                </h3>

                <span className="text-xs text-slate-500">{card.suffix}</span>
              </div>
            </div>

            <div
              aria-hidden="true"
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${card.iconStyle}`}
            >
              {card.icon}
            </div>
          </div>

          <p className="mt-5 border-t border-white/[0.07] pt-4 text-sm leading-5 text-slate-400">
            {card.description}
          </p>
        </article>
      ))}
    </section>
  );
}

export default SummaryCards;
