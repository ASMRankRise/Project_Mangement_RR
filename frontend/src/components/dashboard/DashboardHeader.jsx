function DashboardHeader({ user, onLogout, loading = false }) {
  const isAdmin = user?.role === "admin";

  return (
    <>
      <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">ProjectFlow</h1>
          <p className="mt-1 text-sm text-slate-400">
            Project Management System
          </p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          disabled={loading}
          className="rounded-xl bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Please wait..." : "Logout"}
        </button>
      </header>

      <section className="py-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
          {isAdmin ? "Admin Workspace" : "Your Workspace"}
        </p>

        <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
          Welcome, {user?.name || "User"}!
        </h2>

        <p className="mt-3 text-slate-400">
          {user?.email || "No email available"}
        </p>

        <span className="mt-4 inline-block rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium capitalize text-indigo-300">
          {user?.role || "user"}
        </span>
      </section>
    </>
  );
}

export default DashboardHeader;
