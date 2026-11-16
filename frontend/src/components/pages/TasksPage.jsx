import { useEffect, useState } from "react";
import useProjects from "../../hooks/useProjects";
import useTasks from "../../hooks/useTasks";
import TaskFilters from "../tasks/TaskFilters";
import TaskList from "../tasks/TaskList";
import CreateTaskModal from "../tasks/CreateTaskModal";
import TaskDetailModal from "../tasks/TaskDetailModal";
import Alert from "../common/Alert";
import Button from "../common/Button";
import { PlusIcon } from "../common/Icons";

export function TasksPage({ user }) {
  const {
    projects,
    error: projectError,
    fetchProjects,
  } = useProjects();

  const taskState = useTasks(user, { limit: 100 });
  const { fetchTasks } = taskState;
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState("kanban"); // "kanban" | "list" | "table"

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    const targetLimit = mode === "kanban" ? 100 : 10;
    if (taskState.limit !== targetLimit) {
      taskState.setLimit(targetLimit);
    }
  };

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
    <div className="space-y-5 text-left">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary font-heading">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Track and manage tasks across projects and team members.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Project Filter Selector */}
          {projects.length > 0 && (
            <div className="relative">
              <select
                aria-label="Filter by project"
                value={taskState.projectFilter}
                onChange={(e) => taskState.setProjectFilter(e.target.value)}
                className="h-9 rounded-md border border-border bg-surface px-3 text-[13px] font-medium text-text-secondary outline-none focus:border-brand cursor-pointer transition-colors shadow-subtle"
              >
                <option value="">All projects ({projects.length})</option>
                {projects.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {canCreateTask && (
            <Button
              variant="primary"
              size="md"
              icon={PlusIcon}
              onClick={() => setCreateModalOpen(true)}
            >
              New task
            </Button>
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
        setViewMode={handleViewModeChange}
      />

      {/* Task List Workspace */}
      <div className="rounded-lg border border-border bg-surface p-4 sm:p-5 shadow-subtle">
        <TaskList
          tasks={taskState.tasks}
          projects={projects}
          user={user}
          page={taskState.page}
          totalPages={taskState.totalPages}
          total={taskState.total}
          limit={taskState.limit}
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
