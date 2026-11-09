import {
  SearchIcon,
  KanbanIcon,
  ListIcon,
  TableIcon,
} from "../common/Icons";

export function TaskFilters({
  search = "",
  setSearch,
  statusFilter = "",
  setStatusFilter,
  priorityFilter = "",
  setPriorityFilter,
  viewMode = "kanban",
  setViewMode,
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0E131F] p-3.5 backdrop-blur-md lg:flex-row lg:items-center lg:justify-between">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px]">
        <SearchIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search task title or description..."
          aria-label="Search tasks"
          className="w-full rounded-lg border border-white/10 bg-[#070a13] py-2 pl-10 pr-4 text-xs text-white outline-none placeholder:text-slate-500 focus:border-indigo-500 transition"
        />
      </div>

      {/* Select Filters & View Switcher */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="rounded-lg border border-white/10 bg-[#070a13] px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="testing">Testing</option>
            <option value="completed">Completed</option>
            <option value="done">Done</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="relative">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            aria-label="Filter by priority"
            className="rounded-lg border border-white/10 bg-[#070a13] px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>

        {/* View Mode Toggle: Board vs Table vs Grid */}
        {setViewMode && (
          <div className="flex items-center rounded-lg border border-white/10 bg-[#070a13] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                viewMode === "kanban"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Kanban Board View"
            >
              <KanbanIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Board</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                viewMode === "table"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Table View"
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                viewMode === "list"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Grid Cards View"
            >
              <ListIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskFilters;
