import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import useProjects from "../hooks/useProjects";
import useTasks from "../hooks/useTasks";
import { TaskDistribution } from "./dashboard/TaskDistribution";
import { UpcomingDeadlines } from "./dashboard/UpcomingDeadlines";
import ProjectWorkspace from "./projects/ProjectWorkspace";
import KanbanBoard from "./tasks/KanbanBoard";
import TaskList from "./tasks/TaskList";
import CreateProjectModal from "./projects/CreateProjectModal";
import CreateTaskModal from "./tasks/CreateTaskModal";
import TaskDetailModal from "./tasks/TaskDetailModal";
import Alert from "./common/Alert";
import {
  UsersIcon,
  PlusIcon,
  ShieldIcon,
  FolderIcon,
  CheckSquareIcon,
} from "./common/Icons";
import { useToast } from "../context/ToastContext";

export function AdminDashboard({ user }) {
  const { success, error: toastError } = useToast();
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [viewMode, setViewMode] = useState("kanban"); // "kanban" | "table"

  const {
    projects,
    error: projectError,
    success: projectSuccess,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
  } = useProjects();

  const taskState = useTasks(user, { limit: 100 });
  const { fetchTasks } = taskState;

  const fetchDashboard = useCallback(async () => {
    setDashboardLoading(true);
    setDashboardError("");
    try {
      const res = await api.get("/dashboard");
      setDashboardData(res.data);
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
      return true;
    } else {
      toastError(res?.error || "Failed to delete project");
      return false;
    }
  };

  const getId = (v) => (typeof v === "object" && v !== null ? v._id || v.id : v);

  // Real Metric computations
  const summary = dashboardData?.summary || {};
  const totalProjectsCount = summary.totalProjects ?? projects.length;
  const totalTasksCount = summary.totalTasks ?? taskState.total ?? 0;
  const totalUsersCount = summary.totalUsers ?? 0;

  const byStatus = dashboardData?.taskStats?.byStatus || {};
  const inProgressTasksCount =
    (byStatus["in-progress"] || 0) +
    (byStatus.testing || 0) ||
    taskState.allTasks.filter((t) => t.status === "in-progress" || t.status === "testing").length;
  const completedTasksCount =
    (byStatus.completed || 0) +
    (byStatus.done || 0) ||
    taskState.allTasks.filter((t) => t.status === "completed" || t.status === "done").length;

  const overdueTasksCount = useMemo(() => {
    return taskState.allTasks.filter(
      (t) =>
        t.dueDate &&
        new Date(t.dueDate) < new Date() &&
        t.status !== "completed" &&
        t.status !== "done",
    ).length;
  }, [taskState.allTasks]);

  const completionRate =
    totalTasksCount > 0
      ? Math.round((completedTasksCount / totalTasksCount) * 100)
      : 0;

  const selectedProject = projects.find(
    (p) => String(getId(p)) === String(selectedProjectId),
  );

  return (
    <div className="space-y-5">
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                <ShieldIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Admin Console</span>
              </div>
              <h1 className="mt-1.5 text-lg sm:text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Executive Overview
              </h1>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Organization-wide operations, team directory, workloads, and deliverables.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/admin/users"
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition"
              >
                <UsersIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Team Directory ({totalUsersCount})</span>
              </Link>

              <button
                type="button"
                onClick={() => setCreateProjectOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
              >
                <PlusIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>New Project</span>
              </button>

              <button
                type="button"
                onClick={() => setCreateTaskOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 text-xs font-medium text-white shadow-xs transition cursor-pointer"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                <span>New Task</span>
              </button>
            </div>
          </div>

          {dashboardError && <Alert message={dashboardError} type="error" />}
          {projectError && <Alert message={projectError} type="error" />}
          {projectSuccess && <Alert message={projectSuccess} type="success" />}

          {/* 6 Practical Enterprise Metric Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] p-3.5 text-left">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
                Total Projects
              </span>
              <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {dashboardLoading ? "..." : totalProjectsCount}
              </div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 block">Active workspaces</span>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] p-3.5 text-left">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
                Registered Users
              </span>
              <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {dashboardLoading ? "..." : totalUsersCount}
              </div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 block">Accounts</span>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] p-3.5 text-left">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
                Total Tasks
              </span>
              <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {dashboardLoading ? "..." : totalTasksCount}
              </div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 block">Work items</span>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] p-3.5 text-left">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
                In Progress
              </span>
              <div className="mt-1 text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                {dashboardLoading ? "..." : inProgressTasksCount}
              </div>
              <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 mt-0.5 block">Underway</span>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] p-3.5 text-left">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
                Completed
              </span>
              <div className="mt-1 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {dashboardLoading ? "..." : completedTasksCount}
              </div>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5 block">{completionRate}% finished</span>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] p-3.5 text-left">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
                Overdue Tasks
              </span>
              <div
                className={`mt-1 text-2xl font-bold tracking-tight ${
                  overdueTasksCount > 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-slate-900 dark:text-white"
                }`}
              >
                {dashboardLoading ? "..." : overdueTasksCount}
              </div>
              <span
                className={`text-[11px] font-medium mt-0.5 block ${
                  overdueTasksCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {overdueTasksCount > 0 ? "Requires review" : "On schedule"}
              </span>
            </div>
          </div>

          {/* Status Distribution & Upcoming Deadlines */}
          <div className="space-y-5">
            <TaskDistribution taskStats={dashboardData?.taskStats || {}} />
            <UpcomingDeadlines
              tasks={taskState.allTasks}
              onTaskClick={(t) => setSelectedTask(t)}
            />
          </div>

          {/* All Project Workspaces Directory */}
          <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <FolderIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>All Organization Workspaces</span>
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Select a project workspace to inspect deliverables, members, and Kanban boards
                </p>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {projects.length} workspaces
              </span>
            </div>

            {projects.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                No projects created yet. Click &quot;New Project&quot; above to create one.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((proj) => {
                  const pId = String(getId(proj));
                  const projTasks = taskState.allTasks.filter(
                    (t) => String(getId(t.project)) === pId,
                  );
                  const completed = projTasks.filter(
                    (t) => t.status === "completed" || t.status === "done",
                  ).length;
                  const pct =
                    projTasks.length > 0
                      ? Math.round((completed / projTasks.length) * 100)
                      : 0;

                  return (
                    <div
                      key={pId}
                      onClick={() => setSelectedProjectId(pId)}
                      className="group flex flex-col justify-between rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-3 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer text-left"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate">
                            {proj.name}
                          </h4>
                          <span className="rounded px-1.5 py-0.2 text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/50">
                            Admin Access
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">
                          {proj.description || "No description provided."}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">
                          {completed}/{projTasks.length} tasks
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Full Task Workspace Section */}
          <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckSquareIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Master Task Directory</span>
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Inspect and update tasks across all organization projects
                </p>
              </div>

              {/* View Switcher Tabs */}
              <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("kanban")}
                  className={`rounded px-3 py-1 font-medium transition ${
                    viewMode === "kanban"
                      ? "bg-white text-slate-900 shadow-xs dark:bg-[#161B22] dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  Kanban Board
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`rounded px-3 py-1 font-medium transition ${
                    viewMode === "table"
                      ? "bg-white text-slate-900 shadow-xs dark:bg-[#161B22] dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  Table View
                </button>
              </div>
            </div>

            {viewMode === "kanban" ? (
              <KanbanBoard
                tasks={taskState.allTasks}
                projects={projects}
                user={user}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onSelectTask={(t) => setSelectedTask(t)}
              />
            ) : (
              <TaskList
                tasks={taskState.allTasks}
                projects={projects}
                user={user}
                loading={taskState.loading}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onSelectTask={(t) => setSelectedTask(t)}
              />
            )}
          </section>
        </>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
        onSubmit={handleCreateProject}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        projects={projects}
        onSubmit={handleCreateTask}
      />

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={Boolean(selectedTask)}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          projects={projects}
          user={user}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
}

export default AdminDashboard;
