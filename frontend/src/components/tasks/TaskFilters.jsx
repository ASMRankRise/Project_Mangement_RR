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
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F] p-3 shadow-xs lg:flex-row lg:items-center lg:justify-between">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[220px]">
        <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search task title or description..."
          aria-label="Search tasks"
          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#070a13] py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-indigo-500 transition shadow-xs"
        />
      </div>

      {/* Select Filters & View Switcher */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#070a13] px-3 py-2 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 transition cursor-pointer shadow-xs"
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
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#070a13] px-3 py-2 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 transition cursor-pointer shadow-xs"
          >
            <option value="">All Priorities</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>

        {/* View Mode Toggle: Board vs Table vs Grid */}
        {setViewMode && (
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#070a13] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                viewMode === "kanban"
                  ? "bg-white text-indigo-600 shadow-xs dark:bg-indigo-600 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
              title="Kanban Board View"
            >
              <KanbanIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Board</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                viewMode === "table"
                  ? "bg-white text-indigo-600 shadow-xs dark:bg-indigo-600 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
              title="Table View"
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                viewMode === "list"
                  ? "bg-white text-indigo-600 shadow-xs dark:bg-indigo-600 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
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
