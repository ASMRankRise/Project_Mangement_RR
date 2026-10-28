import { useEffect } from "react";
import api from "../services/api";

import useProjects from "../hooks/useProjects";
import useTasks from "../hooks/useTasks";

import SummaryCards from "./dashboard/SummaryCards";
import CreateProjectForm from "./projects/CreateProjectForm";
import ProjectList from "./projects/ProjectList";
import CreateTaskForm from "./tasks/CreateTaskForm";
import TaskFilters from "./tasks/TaskFilters";
import TaskList from "./tasks/TaskList";

import Alert from "./common/Alert";
import Loading from "./common/Loading";

function AdminDashboard({ user }) {
  const {
    projects,
    loading: projectsLoading,
    error: projectError,
    success: projectSuccess,
    setError: setProjectError,
    setSuccess: setProjectSuccess,
    fetchProjects,
    createProject,
  } = useProjects();

  const taskState = useTasks(user);

  // Fetch projects when the admin dashboard mounts.
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDeleteProject = async (projectId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project and its tasks?",
    );

    if (!confirmed) return;

    setProjectError("");
    setProjectSuccess("");

    try {
      await api.delete(`/projects/${projectId}`);

      setProjectSuccess("Project deleted successfully.");

      await fetchProjects();
      await taskState.fetchTasks();
    } catch (err) {
      setProjectError(
        err.response?.data?.message || "Failed to delete project.",
      );
    }
  };

  const handleSearchChange = (value) => {
    taskState.setSearch(value);
    taskState.setPage(1);
  };

  const handleStatusFilterChange = (value) => {
    taskState.setStatusFilter(value);
    taskState.setPage(1);
  };

  const handlePriorityFilterChange = (value) => {
    taskState.setPriorityFilter(value);
    taskState.setPage(1);
  };

  if (projectsLoading && projects.length === 0) {
    return <Loading message="Loading projects..." />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-400">Manage projects and tasks.</p>
      </div>

      <SummaryCards
        projectCount={projects.length}
        taskCount={taskState.total}
        user={user}
      />

      <section>
        <h2 className="mb-4 text-xl font-semibold">Create Project</h2>

        <Alert message={projectError} />
        <Alert message={projectSuccess} type="success" />

        <CreateProjectForm
          onCreate={createProject}
          loading={projectsLoading}
          error={projectError}
          success={projectSuccess}
        />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">All Projects</h2>

        <ProjectList
          projects={projects}
          user={user}
          loading={projectsLoading}
          onRefresh={fetchProjects}
          onDeleteProject={handleDeleteProject}
        />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Create Task</h2>

        <Alert message={taskState.error} />
        <Alert message={taskState.success} type="success" />

        <CreateTaskForm
          projects={projects}
          onCreate={taskState.createTask}
          loading={taskState.loading}
          error=""
          success=""
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Manage All Tasks</h2>

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

export default AdminDashboard;
