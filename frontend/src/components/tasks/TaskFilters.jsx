function TaskFilters({
  search = "",
  setSearch,
  statusFilter = "",
  setStatusFilter,
  priorityFilter = "",
  setPriorityFilter,
}) {
  const handleSearchChange = (value) => {
    setSearch(value);
  };

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Search by task title */}
      <input
        type="search"
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder="Search task title..."
        aria-label="Search tasks by title"
        className="w-full rounded-xl border border-white/10 bg-[#0e1222] px-4 py-3 text-white outline-none transition focus:border-indigo-500"
      />

      {/* Filter by status */}
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        aria-label="Filter tasks by status"
        className="w-full rounded-xl border border-white/10 bg-[#0e1222] px-4 py-3 text-white outline-none transition focus:border-indigo-500"
      >
        <option value="">All statuses</option>
        <option value="todo">To Do</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      {/* Filter by priority */}
      <select
        value={priorityFilter}
        onChange={(e) => setPriorityFilter(e.target.value)}
        aria-label="Filter tasks by priority"
        className="w-full rounded-xl border border-white/10 bg-[#0e1222] px-4 py-3 text-white outline-none transition focus:border-indigo-500"
      >
        <option value="">All priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </div>
  );
}

export default TaskFilters;
