import { useCallback, useEffect, useState } from "react";
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

function AdminDashboard({ user }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardError, setDashboardError] = useState("");

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

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await api.get("/dashboard");
      setDashboardData(response.data);
      setDashboardError("");
    } catch (err) {
      setDashboardError(
        err.response?.data?.message || "Failed to fetch dashboard data.",
      );
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchProjects();
    taskState.fetchTasks();
  }, [fetchDashboard, fetchProjects, taskState.fetchTasks]);

  const handleCreateProject = async (name, description) => {
    const created = await createProject(name, description);

    if (created) {
      await fetchDashboard();
    }

    return created;
  };

  const handleCreateTask = async (payload) => {
    const created = await taskState.createTask(payload);

    if (created) {
      await fetchDashboard();
    }

    return created;
  };

  const handleUpdateTask = async (taskId, changes) => {
    const updated = await taskState.updateTask(taskId, changes);

    if (updated) {
      await fetchDashboard();
    }

    return updated;
  };

  const handleDeleteTask = async (taskId) => {
    const deleted = await taskState.deleteTask(taskId);

    if (deleted) {
      await fetchDashboard();
    }

    return deleted;
  };

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

      await Promise.all([
        fetchProjects(),
        taskState.fetchTasks(),
        fetchDashboard(),
      ]);
    } catch (err) {
      setProjectError(
        err.response?.data?.message || "Failed to delete project.",
      );
    }
  };

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-400">Manage projects and tasks.</p>
      </div>

      {dashboardError && <Alert message={dashboardError} />}

      <SummaryCards
        projectCount={dashboardData?.summary?.totalProjects ?? 0}
        taskCount={dashboardData?.summary?.totalTasks ?? 0}
        user={user}
      />

      <section>
        <h2 className="mb-4 text-xl font-semibold">Create Project</h2>

        <Alert message={projectError} />
        <Alert message={projectSuccess} type="success" />

        <CreateProjectForm
          onCreate={handleCreateProject}
          loading={projectsLoading}
          error=""
          success=""
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
          onCreate={handleCreateTask}
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
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      </section>
    </div>
  );
}

export default AdminDashboard;
