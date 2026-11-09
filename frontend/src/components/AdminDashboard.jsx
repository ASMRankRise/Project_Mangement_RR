import { useCallback, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import useProjects from "../hooks/useProjects";
import useTasks from "../hooks/useTasks";
import TaskDistribution from "./dashboard/TaskDistribution";
import UpcomingDeadlines from "./dashboard/UpcomingDeadlines";
import ProjectList from "./projects/ProjectList";
import ProjectWorkspace from "./projects/ProjectWorkspace";
import CreateProjectModal from "./projects/CreateProjectModal";
import CreateTaskModal from "./tasks/CreateTaskModal";
import TaskFilters from "./tasks/TaskFilters";
import TaskList from "./tasks/TaskList";
import TaskDetailModal from "./tasks/TaskDetailModal";
import Alert from "./common/Alert";
import {
  FolderIcon,
  CheckSquareIcon,
  UsersIcon,
  PlusIcon,
  ShieldIcon,
} from "./common/Icons";
import { useToast } from "../context/ToastContext";

export function AdminDashboard({ user }) {
  const { success, error: toastError } = useToast();
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [viewMode, setViewMode] = useState("kanban");

  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const {
    projects,
    loading: projectsLoading,
    error: projectError,
    success: projectSuccess,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
  } = useProjects();

  const taskState = useTasks(user, { limit: 50 });
  const { fetchTasks } = taskState;

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
    fetchTasks();
  }, [fetchDashboard, fetchProjects, fetchTasks]);

  const handleCreateProject = async (name, description) => {
    const res = await createProject(name, description);
    if (res?.success !== false) {
      success("Project workspace created!");
      setCreateProjectOpen(false);
      await fetchDashboard();
    } else {
      toastError(res?.error || "Failed to create project");
    }
    return res;
  };

  const handleCreateTask = async (payload) => {
    const res = await taskState.createTask(payload);
    if (res?.success !== false) {
      success("Task created!");
      setCreateTaskOpen(false);
      await fetchDashboard();
    } else {
      toastError(res?.error || "Failed to create task");
    }
    return res;
  };

  const handleUpdateTask = async (taskId, changes) => {
    const res = await taskState.updateTask(taskId, changes);
    if (res?.success !== false) {
      await fetchDashboard();
    }
    return res;
  };

  const handleDeleteTask = async (taskId) => {
    const res = await taskState.deleteTask(taskId);
    if (res?.success !== false) {
      await fetchDashboard();
    }
    return res;
  };

  const handleDeleteProject = async (projectId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project and all its tasks? This action cannot be undone.",
    );
    if (!confirmed) return false;

    const res = await deleteProject(projectId);
    if (res?.success !== false) {
      success("Project deleted successfully");
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
      }
      await fetchDashboard();
    } else {
      toastError(res?.error || "Failed to delete project");
    }
    return res;
  };

  const getId = (v) => (typeof v === "object" && v !== null ? v._id || v.id : v);

  // Real data calculations
  const summary = dashboardData?.summary || {};
  const totalProjectsCount = summary.totalProjects ?? projects.length;
  const totalTasksCount = summary.totalTasks ?? taskState.total ?? 0;
  const totalUsersCount = summary.totalUsers ?? 0;

  const byStatus = dashboardData?.taskStats?.byStatus || {};
  const inProgressTasksCount =
    (byStatus["in-progress"] || 0) + (byStatus.testing || 0);
  const completedTasksCount =
    (byStatus.completed || 0) + (byStatus.done || 0);

  const overdueTasksCount = useMemo(() => {
    return taskState.allTasks.filter(
      (t) =>
        t.dueDate &&
        new Date(t.dueDate) < new Date() &&
        t.status !== "completed" &&
        t.status !== "done",
    ).length;
  }, [taskState.allTasks]);

  const selectedProject = projects.find(
    (p) => String(getId(p)) === String(selectedProjectId),
  );

  return (
    <div className="space-y-8">
      {/* If a project workspace is opened */}
      {selectedProject ? (
        <ProjectWorkspace
          project={selectedProject}
          allTasks={taskState.allTasks}
          currentUser={user}
          onBack={() => setSelectedProjectId(null)}
          onUpdateProject={updateProject}
          onDeleteProject={handleDeleteProject}
          onTaskCreate={handleCreateTask}
          onTaskUpdate={handleUpdateTask}
          onTaskDelete={handleDeleteTask}
          onAddMember={addMember}
          onRemoveMember={removeMember}
          onRefresh={fetchProjects}
        />
      ) : (
        <>
          {/* Header & Quick Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold text-indigo-300">
                <ShieldIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Executive Administration Suite</span>
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                System Overview
              </h1>
              <p className="mt-1 text-xs text-slate-400">
                Organization-wide operations, workloads, team members, and deliverables.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/admin/users"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0E131F] px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/5 transition"
              >
                <UsersIcon className="w-4 h-4 text-slate-400" />
                <span>Manage Users ({totalUsersCount})</span>
              </Link>

              <button
                type="button"
                onClick={() => setCreateProjectOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0E131F] px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/5 transition"
              >
                <PlusIcon className="w-4 h-4 text-slate-400" />
                <span>New Project</span>
              </button>

              <button
                type="button"
                onClick={() => setCreateTaskOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
              >
                <PlusIcon className="w-4 h-4" />
                <span>New Task</span>
              </button>
            </div>
          </div>

          {dashboardError && <Alert message={dashboardError} type="error" />}
          {projectError && <Alert message={projectError} type="error" />}
          {projectSuccess && <Alert message={projectSuccess} type="success" />}

          {/* 6 Real Metric Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-xl border border-white/10 bg-[#0E131F] p-4 text-left">
              <span className="text-[11px] font-medium text-slate-400 block truncate">
                Total Projects
              </span>
              <div className="mt-2 text-2xl font-bold text-white">
                {dashboardLoading ? "..." : totalProjectsCount}
              </div>
              <span className="text-[10px] text-indigo-400 mt-1 block">Active workspaces</span>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0E131F] p-4 text-left">
              <span className="text-[11px] font-medium text-slate-400 block truncate">
                Registered Users
              </span>
              <div className="mt-2 text-2xl font-bold text-white">
                {dashboardLoading ? "..." : totalUsersCount}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Accounts</span>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0E131F] p-4 text-left">
              <span className="text-[11px] font-medium text-slate-400 block truncate">
                Total Tasks
              </span>
              <div className="mt-2 text-2xl font-bold text-white">
                {dashboardLoading ? "..." : totalTasksCount}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Work items</span>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0E131F] p-4 text-left">
              <span className="text-[11px] font-medium text-slate-400 block truncate">
                In Progress
              </span>
              <div className="mt-2 text-2xl font-bold text-sky-400">
                {dashboardLoading ? "..." : inProgressTasksCount}
              </div>
              <span className="text-[10px] text-sky-400/80 mt-1 block">Underway</span>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0E131F] p-4 text-left">
              <span className="text-[11px] font-medium text-slate-400 block truncate">
                Completed
              </span>
              <div className="mt-2 text-2xl font-bold text-emerald-400">
                {dashboardLoading ? "..." : completedTasksCount}
              </div>
              <span className="text-[10px] text-emerald-400/80 mt-1 block">Resolved</span>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0E131F] p-4 text-left">
              <span className="text-[11px] font-medium text-slate-400 block truncate">
                Overdue Tasks
              </span>
              <div
                className={`mt-2 text-2xl font-bold ${
                  overdueTasksCount > 0 ? "text-rose-400" : "text-slate-300"
                }`}
              >
                {dashboardLoading ? "..." : overdueTasksCount}
              </div>
              <span
                className={`text-[10px] mt-1 block ${
                  overdueTasksCount > 0 ? "text-rose-400" : "text-slate-500"
                }`}
              >
                {overdueTasksCount > 0 ? "Needs attention" : "On track"}
              </span>
            </div>
          </div>

          {/* Real Analytics: Distribution & Deadlines */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {dashboardData?.taskStats && (
                <TaskDistribution taskStats={dashboardData.taskStats} />
              )}
            </div>

            <div className="lg:col-span-1">
              <UpcomingDeadlines
                tasks={taskState.allTasks}
                onTaskClick={(task) => setSelectedTask(task)}
              />
            </div>
          </div>

          {/* Project Workspaces Gallery */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FolderIcon className="h-4 w-4 text-indigo-400" />
                  <span>All Project Workspaces</span>
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Global workspaces across the entire organization
                </p>
              </div>
            </div>

            <ProjectList
              projects={projects}
              tasks={taskState.allTasks}
              user={user}
              loading={projectsLoading}
              onRefresh={fetchProjects}
              onSelectProject={(project) => setSelectedProjectId(project._id || project.id)}
              onUpdateProject={updateProject}
              onDeleteProject={handleDeleteProject}
              onAddMember={addMember}
              onRemoveMember={removeMember}
            />
          </section>

          {/* Global Tasks Pipeline */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckSquareIcon className="h-4 w-4 text-indigo-400" />
                  <span>Organization Task Pipeline</span>
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Filter and track tasks across all teams and departments
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
              onTaskClick={(task) => setSelectedTask(task)}
              viewMode={viewMode}
            />
          </section>

          {/* Modals */}
          <CreateProjectModal
            isOpen={createProjectOpen}
            onClose={() => setCreateProjectOpen(false)}
            onCreate={handleCreateProject}
            loading={projectsLoading}
          />

          <CreateTaskModal
            isOpen={createTaskOpen}
            onClose={() => setCreateTaskOpen(false)}
            projects={projects}
            onCreate={handleCreateTask}
            loading={taskState.loading || projectsLoading}
          />

          <TaskDetailModal
            isOpen={Boolean(selectedTask)}
            onClose={() => setSelectedTask(null)}
            task={selectedTask}
            projects={projects}
            currentUser={user}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
