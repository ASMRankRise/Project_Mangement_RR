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
    loading: projectsLoading,
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
    projects.some(
      (project) =>
        String(project.owner?._id || project.owner) ===
        String(user?._id || user?.id),
    );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Workspaces & Tasks
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Tasks Management
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Track tasks across statuses, update progress, and meet deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Project Filter Selector */}
          {projects.length > 0 && (
            <div className="relative">
              <select
                aria-label="Filter by project"
                value={taskState.projectFilter}
                onChange={(e) => taskState.setProjectFilter(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#0F1420] px-3.5 py-2 text-xs font-medium text-slate-200 outline-none focus:border-indigo-500 cursor-pointer transition shadow-sm"
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
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
            >
              <PlusIcon className="h-4 w-4" />
              <span>New Task</span>
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

      {/* Tasks View: Kanban, List, or Table */}
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
        onTaskClick={(task) => setSelectedTask(task)}
        viewMode={viewMode}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        projects={projects}
        onCreate={taskState.createTask}
        loading={taskState.loading || projectsLoading}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        projects={projects}
        currentUser={user}
        onUpdateTask={taskState.updateTask}
        onDeleteTask={taskState.deleteTask}
      />
    </div>
  );
}

export default TasksPage;
