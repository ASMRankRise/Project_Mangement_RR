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
    <div className="flex flex-col gap-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] p-2.5 shadow-2xs lg:flex-row lg:items-center lg:justify-between">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <SearchIcon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by title or description..."
          aria-label="Search tasks"
          className="h-8 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] py-1 pl-8 pr-3 text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition shadow-2xs"
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
            className="h-8 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-600 transition cursor-pointer shadow-2xs"
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
            className="h-8 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-600 transition cursor-pointer shadow-2xs"
          >
            <option value="">All Priorities</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>

        {/* View Mode Toggle: Board vs Table vs Grid */}
        {setViewMode && (
          <div className="flex items-center rounded-md border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition ${
                viewMode === "kanban"
                  ? "bg-white text-slate-900 shadow-2xs dark:bg-[#161B22] dark:text-white"
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
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-2xs dark:bg-[#161B22] dark:text-white"
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
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition ${
                viewMode === "list"
                  ? "bg-white text-slate-900 shadow-2xs dark:bg-[#161B22] dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
              title="Grid View"
            >
              <ListIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>
        )}

        {/* Clear Filters Button if any active */}
        {(statusFilter || priorityFilter || search) && (
          <button
            type="button"
            onClick={() => {
              setSearch?.("");
              setStatusFilter?.("");
              setPriorityFilter?.("");
            }}
            className="h-8 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

export default TaskFilters;
