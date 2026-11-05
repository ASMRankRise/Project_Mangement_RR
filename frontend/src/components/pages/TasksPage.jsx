import { useEffect } from "react";

import useProjects from "../../hooks/useProjects";
import useTasks from "../../hooks/useTasks";

import CreateTaskForm from "../tasks/CreateTaskForm";
import TaskFilters from "../tasks/TaskFilters";
import TaskList from "../tasks/TaskList";
import Alert from "../common/Alert";

function TasksPage({ user }) {
  const {
    projects,
    loading: projectsLoading,
    error: projectError,
    fetchProjects,
  } = useProjects();

  const taskState = useTasks(user);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    taskState.fetchTasks();
  }, [taskState.fetchTasks]);

  const handleSearchChange = (value) => {
    taskState.setSearch(value);
  };

  const handleStatusFilterChange = (value) => {
    taskState.setStatusFilter(value);
  };

  const handlePriorityFilterChange = (value) => {
    taskState.setPriorityFilter(value);
  };

  return (
    <div className="space-y-8 text-white">
      <h1 className="text-3xl font-bold">Tasks</h1>
      {(user?.role === "admin" ||
        projects.some(
          (project) =>
            String(project.owner?._id || project.owner) ===
            String(user?._id || user?.id),
        )) && (
        <CreateTaskForm
          projects={projects}
          onCreate={taskState.createTask}
          loading={taskState.loading || projectsLoading}
        />
      )}

      <Alert type="error" message={projectError} />

      <section className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-xl font-semibold">Manage Tasks</h2>

        <Alert type="error" message={taskState.error} />
        <Alert type="success" message={taskState.success} />

        <TaskFilters
          search={taskState.search}
          setSearch={handleSearchChange}
          statusFilter={taskState.statusFilter}
          setStatusFilter={handleStatusFilterChange}
          priorityFilter={taskState.priorityFilter}
          setPriorityFilter={handlePriorityFilterChange}
        />

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
        />
      </section>
    </div>
  );
}

export default TasksPage;
