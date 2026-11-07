import { useCallback, useEffect, useState } from "react";

import api from "../services/api";

import useProjects from "../hooks/useProjects";
import useTasks from "../hooks/useTasks";

import ProjectList from "./projects/ProjectList";
import TaskFilters from "./tasks/TaskFilters";
import TaskList from "./tasks/TaskList";
import Alert from "./common/Alert";

function UserDashboard({ user }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

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
        err.response?.data?.message || "Failed to load dashboard data.",
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

  const handleSearchChange = (value) => {
    taskState.setSearch(value);
  };

  const handleStatusFilterChange = (value) => {
    taskState.setStatusFilter(value);
  };

  const handlePriorityFilterChange = (value) => {
    taskState.setPriorityFilter(value);
  };

  const firstName = user?.name?.trim()?.split(/\s+/)[0] || "there";

  return (
    <div className="min-h-screen space-y-10 bg-[#080b16] text-white">
      <header className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/20 via-[#11172b] to-[#0e1222] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-16 -z-10 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 -z-10 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />

        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Member Workspace
        </span>

        <h1 className="mt-5 break-words text-3xl font-bold tracking-tight sm:text-4xl">
          Welcome back, {firstName}!
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
          Manage your projects, track your tasks, and keep your work moving
          forward.
        </p>

        <Alert message={dashboardError} />

        <div className="mt-6 flex flex-wrap gap-3">
          <div className="rounded-xl border border-white/10 bg-black/10 px-4 py-3">
            <p className="text-xs text-slate-400">Accessible Projects</p>
            <p className="mt-1 text-xl font-bold">
              {dashboardLoading
                ? "..."
                : (dashboardData?.summary?.totalProjects ?? 0)}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/10 px-4 py-3">
            <p className="text-xs text-slate-400">Accessible Tasks</p>
            <p className="mt-1 text-xl font-bold">
              {dashboardLoading
                ? "..."
                : (dashboardData?.summary?.totalTasks ?? 0)}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/10 px-4 py-3">
            <p className="text-xs text-slate-400">Assigned Tasks</p>
            <p className="mt-1 text-xl font-bold">
              {dashboardLoading
                ? "..."
                : (dashboardData?.summary?.assignedTasks ?? 0)}
            </p>
          </div>
        </div>
      </header>

      <section className="space-y-6">
        <div className="mb-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
            Your Workspace
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            My Projects
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            View your projects and the teams you work with.
          </p>
        </div>

        <Alert message={projectError} />

        <ProjectList
          projects={projects}
          user={user}
          loading={projectsLoading}
          onRefresh={fetchProjects}
        />
      </section>

      <section className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            Stay On Track
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight">My Tasks</h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Search, filter, and manage your assigned tasks.
          </p>
        </div>

        <Alert message={taskState.error} />
        <Alert message={taskState.success} type="success" />

        <div className="rounded-2xl border border-white/10 bg-[#0e1222]/80 p-4 sm:p-6">
          <TaskFilters
            search={taskState.search}
            setSearch={handleSearchChange}
            statusFilter={taskState.statusFilter}
            setStatusFilter={handleStatusFilterChange}
            priorityFilter={taskState.priorityFilter}
            setPriorityFilter={handlePriorityFilterChange}
          />

          <div className="mt-6">
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
          </div>
        </div>
      </section>
    </div>
  );
}

export default UserDashboard;
