import { useEffect, useState } from "react";
import useProjects from "../../hooks/useProjects";
import useTasks from "../../hooks/useTasks";
import TaskFilters from "../tasks/TaskFilters";
import TaskList from "../tasks/TaskList";
import CreateTaskModal from "../tasks/CreateTaskModal";
import Alert from "../common/Alert";
import Icon from "../common/Icons";

export function TasksPage({ user }) {
  const {
    projects,
    loading: projectsLoading,
    error: projectError,
    fetchProjects,
  } = useProjects();

  const taskState = useTasks(user);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("kanban"); // "kanban" | "list"

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    taskState.fetchTasks();
  }, [taskState.fetchTasks]);

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
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
            Sprint & Delivery Pipeline
          </span>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Tasks & Work Items
          </h1>
          <p className="mt-1.5 text-xs text-slate-400">
            Track progress across statuses, manage workloads, and meet team milestones.
          </p>
        </div>

        {canCreateTask && (
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:from-indigo-500 hover:to-indigo-600"
          >
            <Icon name="plus" className="h-4 w-4" />
            <span>Create Task</span>
          </button>
        )}
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

      {/* Tasks View: Kanban or List */}
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
    </div>
  );
}

export default TasksPage;
