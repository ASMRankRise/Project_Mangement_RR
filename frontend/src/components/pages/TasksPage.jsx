import { useEffect, useState } from "react";
import useProjects from "../../hooks/useProjects";
import useTasks from "../../hooks/useTasks";
import TaskFilters from "../tasks/TaskFilters";
import TaskList from "../tasks/TaskList";
import CreateTaskModal from "../tasks/CreateTaskModal";
import TaskDetailModal from "../tasks/TaskDetailModal";
import Alert from "../common/Alert";
import { PlusIcon } from "../common/Icons";

export function TasksPage({ user }) {
  const {
    projects,
    error: projectError,
    fetchProjects,
  } = useProjects();

  const taskState = useTasks(user, { limit: 50 });
  const { fetchTasks } = taskState;
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState("kanban"); // "kanban" | "list" | "table"

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const canCreateTask =
    user?.role === "admin" ||
    user?.role === "superadmin" ||
    projects.some(
      (project) =>
        String(project.owner?._id || project.owner) ===
        String(user?._id || user?.id),
    );

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Workforce Deliverables
          </span>
          <h1 className="mt-1 text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Deliverables & Tasks
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Track deliverables across status stages, manage employee assignments, and meet team milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Project Filter Selector */}
          {projects.length > 0 && (
            <div className="relative">
              <select
                aria-label="Filter by project"
                value={taskState.projectFilter}
                onChange={(e) => taskState.setProjectFilter(e.target.value)}
                className="h-8 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-600 cursor-pointer transition shadow-2xs"
              >
                <option value="">All Projects ({projects.length})</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {canCreateTask && (
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="h-8 inline-flex items-center gap-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 text-xs font-medium text-white shadow-2xs transition cursor-pointer"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              <span>New Deliverable</span>
            </button>
          )}
        </div>
      </div>

      {projectError && <Alert type="error" message={projectError} />}
      {taskState.error && <Alert type="error" message={taskState.error} />}
      {taskState.success && <Alert type="success" message={taskState.success} />}

      {/* Filters & View Mode Selector */}
      <TaskFilters
        search={taskState.search}
        setSearch={taskState.setSearch}
        statusFilter={taskState.statusFilter}
        setStatusFilter={taskState.setStatusFilter}
        priorityFilter={taskState.priorityFilter}
        setPriorityFilter={taskState.setPriorityFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Task List Workspace */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] p-4">
        <TaskList
          tasks={taskState.tasks}
          projects={projects}
          user={user}
          page={taskState.page}
          totalPages={taskState.totalPages}
          total={taskState.total}
          loading={taskState.loading}
          onPageChange={taskState.setPage}
          onUpdate={taskState.updateTask}
          onDelete={taskState.deleteTask}
          onTaskClick={(t) => setSelectedTask(t)}
          viewMode={viewMode}
        />
      </div>

      {/* Modals */}
      {createModalOpen && (
        <CreateTaskModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          projects={projects}
          onSubmit={async (payload) => {
            const res = await taskState.createTask(payload);
            if (res?.success !== false) {
              setCreateModalOpen(false);
            }
          }}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          isOpen={Boolean(selectedTask)}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          projects={projects}
          user={user}
          onUpdate={taskState.updateTask}
          onDelete={taskState.deleteTask}
        />
      )}
    </div>
  );
}

export default TasksPage;
