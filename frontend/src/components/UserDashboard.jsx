import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import useProjects from "../hooks/useProjects";
import useTasks from "../hooks/useTasks";
import StatCard from "./dashboard/StatCard";
import TaskDistribution from "./dashboard/TaskDistribution";
import ProjectList from "./projects/ProjectList";
import TaskFilters from "./tasks/TaskFilters";
import TaskList from "./tasks/TaskList";
import Alert from "./common/Alert";
import Icon from "./common/Icons";

export function UserDashboard({ user }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [viewMode, setViewMode] = useState("kanban");

  const {
    projects,
    loading: projectsLoading,
    error: projectError,
    fetchProjects,
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
        err.response?.data?.message || "Failed to load dashboard metrics.",
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

  const firstName = user?.name?.trim()?.split(/\s+/)[0] || "there";
  const summary = dashboardData?.summary || {};

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-900/40 via-[#0d1222] to-[#070a13] p-6 backdrop-blur-xl sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 -z-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 right-1/3 -z-10 h-48 w-48 rounded-full bg-violet-500/15 blur-3xl" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Member Workspace
            </div>

            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
              Welcome back, {firstName}!
            </h1>
            <p className="mt-2 max-w-xl text-xs text-slate-400 sm:text-sm">
              Here is your active workload overview across your assigned projects and delivery milestones.
            </p>
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
          title="Accessible Projects"
          value={dashboardLoading ? "..." : summary.totalProjects ?? 0}
          description="Projects you own or participate in as a team member."
          icon="projects"
          gradient="from-indigo-600 to-indigo-800"
          badgeText="Workspaces"
        />

        <StatCard
          title="Total Tasks"
          value={dashboardLoading ? "..." : summary.totalTasks ?? 0}
          description="Active and completed tasks across all your projects."
          icon="tasks"
          gradient="from-violet-600 to-purple-800"
          badgeText="Work Items"
        />

        <StatCard
          title="Assigned to Me"
          value={dashboardLoading ? "..." : summary.assignedTasks ?? 0}
          description="Specific tasks currently assigned to your account."
          icon="user"
          gradient="from-emerald-600 to-teal-800"
          badgeText="Actionable"
        />
      </div>

      {/* Visual Analytics / Distributions */}
      {dashboardData?.taskStats && (
        <TaskDistribution taskStats={dashboardData.taskStats} />
      )}

      {/* Projects Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Icon name="projects" className="h-5 w-5 text-indigo-400" />
              My Projects
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Workspaces you own or collaborate within
            </p>
          </div>
        </div>

        {projectError && <Alert message={projectError} type="error" />}

        <ProjectList
          projects={projects}
          user={user}
          loading={projectsLoading}
          onRefresh={fetchProjects}
        />
      </section>

      {/* Tasks Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Icon name="tasks" className="h-5 w-5 text-indigo-400" />
              My Tasks & Delivery Pipeline
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Search, filter, and progress tasks across your assigned workflows
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
    </div>
  );
}

export default UserDashboard;
