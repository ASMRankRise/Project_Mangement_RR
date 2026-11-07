import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import useProjects from "../hooks/useProjects";
import useTasks from "../hooks/useTasks";
import StatCard from "./dashboard/StatCard";
import TaskDistribution from "./dashboard/TaskDistribution";
import ProjectList from "./projects/ProjectList";
import CreateProjectModal from "./projects/CreateProjectModal";
import CreateTaskModal from "./tasks/CreateTaskModal";
import TaskFilters from "./tasks/TaskFilters";
import TaskList from "./tasks/TaskList";
import Alert from "./common/Alert";
import Icon from "./common/Icons";

export function AdminDashboard({ user }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [viewMode, setViewMode] = useState("kanban");

  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);

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
      setDashboardLoading(true);
      setDashboardError("");
      const response = await api.get("/dashboard");
      setDashboardData(response.data);
    } catch (err) {
      setDashboardError(
        err.response?.data?.message || "Failed to fetch dashboard metrics.",
      );
    } finally {
      setDashboardLoading(false);
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
      "Are you sure you want to delete this project and all its tasks? This action cannot be undone.",
    );
    if (!confirmed) return false;

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
      return true;
    } catch (err) {
      setProjectError(
        err.response?.data?.message || "Failed to delete project.",
      );
      return false;
    }
  };

  const summary = dashboardData?.summary || {};

  return (
    <div className="space-y-8">
      {/* Executive Admin Header */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-purple-900/30 via-indigo-950/40 to-[#070a13] p-6 backdrop-blur-xl sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 -z-10 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 right-1/3 -z-10 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Administrator Control Center
            </div>

            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
              Organization Overview
            </h1>
            <p className="mt-2 max-w-xl text-xs text-slate-400 sm:text-sm">
              Manage organization-wide workspaces, monitor real-time delivery velocity, and orchestrate user access.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setCreateProjectOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/15"
            >
              <Icon name="plus" className="h-4 w-4" />
              <span>New Project</span>
            </button>

            <button
              type="button"
              onClick={() => setCreateTaskOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:from-indigo-500 hover:to-indigo-600"
            >
              <Icon name="plus" className="h-4 w-4" />
              <span>Create Task</span>
            </button>
          </div>
        </div>

        {dashboardError && (
          <div className="mt-4">
            <Alert message={dashboardError} type="error" />
          </div>
        )}
      </section>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Projects"
          value={dashboardLoading ? "..." : summary.totalProjects ?? 0}
          description="Active workspaces running across the organization."
          icon="projects"
          gradient="from-indigo-600 to-indigo-800"
          badgeText="Workspaces"
        />

        <StatCard
          title="Global Tasks"
          value={dashboardLoading ? "..." : summary.totalTasks ?? 0}
          description="Total work items tracked in the organization pipeline."
          icon="tasks"
          gradient="from-violet-600 to-purple-800"
          badgeText="Work Items"
        />

        <StatCard
          title="Registered Users"
          value={dashboardLoading ? "..." : summary.totalUsers ?? 0}
          description="Total authenticated accounts in the organization directory."
          icon="users"
          gradient="from-emerald-600 to-teal-800"
          badgeText="Members"
        />
      </div>

      {/* Task Distribution / Visual Analytics */}
      {dashboardData?.taskStats && (
        <TaskDistribution taskStats={dashboardData.taskStats} />
      )}

      {/* Projects Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Icon name="projects" className="h-5 w-5 text-indigo-400" />
              Organization Projects
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Manage workspace membership, parameters, and access permissions
            </p>
          </div>
        </div>

        {projectError && <Alert message={projectError} type="error" />}
        {projectSuccess && <Alert message={projectSuccess} type="success" />}

        <ProjectList
          projects={projects}
          user={user}
          loading={projectsLoading}
          onRefresh={fetchProjects}
          onDeleteProject={handleDeleteProject}
        />
      </section>

      {/* Tasks Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Icon name="tasks" className="h-5 w-5 text-indigo-400" />
              Global Task Pipeline
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Complete oversight of all work items across all workspaces
            </p>
          </div>
        </div>

        {taskState.error && <Alert message={taskState.error} type="error" />}
        {taskState.success && <Alert message={taskState.success} type="success" />}

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
          viewMode={viewMode}
        />
      </section>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
        onCreate={handleCreateProject}
        loading={projectsLoading}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        projects={projects}
        onCreate={handleCreateTask}
        loading={taskState.loading}
      />
    </div>
  );
}

export default AdminDashboard;
