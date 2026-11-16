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
import Button from "./common/Button";
import {
  UsersIcon,
  PlusIcon,
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

  // Metric computations (unchanged)
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
    <div className="space-y-6">
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
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary font-heading">
                Overview
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                Projects, tasks and team at a glance.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/admin/users"
                className="inline-flex items-center justify-center gap-2 h-9 px-3.5 text-sm font-medium rounded-md border border-border bg-surface text-text-primary hover:bg-surface-subtle transition-colors shadow-subtle"
              >
                <UsersIcon className="w-4 h-4 text-text-secondary" />
                <span>Team directory ({totalUsersCount})</span>
              </Link>

              <Button
                variant="secondary"
                size="md"
                icon={PlusIcon}
                onClick={() => setCreateProjectOpen(true)}
              >
                New project
              </Button>

              <Button
                variant="primary"
                size="md"
                icon={PlusIcon}
                onClick={() => setCreateTaskOpen(true)}
              >
                New task
              </Button>
            </div>
          </div>

          {dashboardError && <Alert message={dashboardError} type="error" />}
          {projectError && <Alert message={projectError} type="error" />}
          {projectSuccess && <Alert message={projectSuccess} type="success" />}

          {/* Stat Cards with Varied Hierarchy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 sm:gap-4">
            {/* Primary Metric: Tasks & Completion (Spans 5 cols on lg) */}
            <div className="sm:col-span-2 lg:col-span-5 rounded-lg border border-border bg-surface p-4 sm:p-5 shadow-subtle flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-text-secondary">
                    Tasks
                  </span>
                  <span className="inline-flex items-center rounded-md border border-border bg-surface-subtle px-2 py-0.5 text-[12px] font-medium text-text-secondary">
                    {completionRate}% completed
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary font-heading">
                    {dashboardLoading ? "..." : totalTasksCount}
                  </span>
                  <span className="text-sm text-text-tertiary">total tasks</span>
                </div>
              </div>

              {/* Progress Bar & Breakdown */}
              <div className="mt-4 pt-3 border-t border-border-subtle">
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
                  <div
                    className="h-full bg-brand transition-all duration-300"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <div className="mt-2.5 flex items-center justify-between text-[12px] text-text-secondary">
                  <span>{completedTasksCount} finished</span>
                  <span>•</span>
                  <span>{inProgressTasksCount} in progress</span>
                  <span>•</span>
                  <span>{Math.max(0, totalTasksCount - completedTasksCount - inProgressTasksCount)} pending</span>
                </div>
              </div>
            </div>

            {/* Supporting Metric 1: Projects (Spans 2 cols on lg) */}
            <div className="rounded-lg border border-border bg-surface p-4 sm:p-5 shadow-subtle flex flex-col justify-between text-left lg:col-span-2">
              <div>
                <span className="text-[13px] font-medium text-text-secondary block">
                  Projects
                </span>
                <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-text-primary font-heading">
                  {dashboardLoading ? "..." : totalProjectsCount}
                </div>
              </div>
              <div className="mt-3 text-[12px] text-text-tertiary">
                Active workspaces
              </div>
            </div>

            {/* Supporting Metric 2: Employees (Spans 2 cols on lg) */}
            <div className="rounded-lg border border-border bg-surface p-4 sm:p-5 shadow-subtle flex flex-col justify-between text-left lg:col-span-2">
              <div>
                <span className="text-[13px] font-medium text-text-secondary block">
                  Employees
                </span>
                <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-text-primary font-heading">
                  {dashboardLoading ? "..." : totalUsersCount}
                </div>
              </div>
              <div className="mt-3 text-[12px] text-text-tertiary">
                Team members
              </div>
            </div>

            {/* Supporting Metric 3: Overdue (Spans 3 cols on lg, rust accent only when overdue > 0) */}
            <div
              className={`rounded-lg border p-4 sm:p-5 shadow-subtle flex flex-col justify-between text-left lg:col-span-3 transition-colors ${
                overdueTasksCount > 0
                  ? "border-accent/40 bg-accent-subtle/20"
                  : "border-border bg-surface"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-text-secondary">
                    Overdue
                  </span>
                  {overdueTasksCount > 0 && (
                    <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  )}
                </div>
                <div
                  className={`mt-2 text-2xl sm:text-3xl font-bold tracking-tight font-heading ${
                    overdueTasksCount > 0 ? "text-accent" : "text-text-primary"
                  }`}
                >
                  {dashboardLoading ? "..." : overdueTasksCount}
                </div>
              </div>
              <div
                className={`mt-3 text-[12px] font-medium ${
                  overdueTasksCount > 0 ? "text-accent" : "text-text-tertiary"
                }`}
              >
                {overdueTasksCount > 0 ? "Requires attention" : "All on schedule"}
              </div>
            </div>
          </div>

          {/* Status Distribution & Upcoming Deadlines */}
          <div className="space-y-6">
            <TaskDistribution taskStats={dashboardData?.taskStats || {}} />
            <UpcomingDeadlines
              tasks={taskState.allTasks}
              onTaskClick={(t) => setSelectedTask(t)}
            />
          </div>

          {/* Projects Directory Section */}
          <section className="rounded-lg border border-border bg-surface p-4 sm:p-5 shadow-subtle">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">
                  Projects
                </h3>
                <p className="mt-0.5 text-[12px] text-text-secondary">
                  Select a project to view tasks, members, and details
                </p>
              </div>
              <span className="text-[12px] text-text-secondary font-medium">
                {projects.length} {projects.length === 1 ? "project" : "projects"}
              </span>
            </div>

            {projects.length === 0 ? (
              <div className="py-8 text-center text-sm text-text-secondary">
                No projects created yet. Click &quot;New project&quot; above to create one.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
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
                      className="group flex flex-col justify-between rounded-md border border-border bg-surface-subtle/40 p-3.5 hover:border-brand/40 hover:bg-surface-subtle transition-colors cursor-pointer text-left"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-semibold text-text-primary group-hover:text-brand transition-colors truncate">
                            {proj.name}
                          </h4>
                          <span className="rounded-md px-2 py-0.5 text-[12px] font-medium bg-surface text-text-secondary border border-border">
                            Admin
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-1 text-[13px] text-text-secondary">
                          {proj.description || "No description provided."}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-border-subtle flex items-center justify-between text-[12px]">
                        <span className="text-text-secondary">
                          {completed}/{projTasks.length} tasks
                        </span>
                        <span className="font-mono font-medium text-text-primary">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Tasks Workspace Section */}
          <section className="rounded-lg border border-border bg-surface p-4 sm:p-5 shadow-subtle">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">
                  Tasks
                </h3>
                <p className="mt-0.5 text-[12px] text-text-secondary">
                  Inspect and manage tasks across all projects
                </p>
              </div>

              {/* View Switcher Tabs */}
              <div className="inline-flex rounded-md border border-border bg-surface-subtle p-0.5 text-[13px]">
                <button
                  type="button"
                  onClick={() => setViewMode("kanban")}
                  className={`rounded px-3 py-1 font-medium transition-colors cursor-pointer ${
                    viewMode === "kanban"
                      ? "bg-surface text-text-primary shadow-subtle"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Board
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`rounded px-3 py-1 font-medium transition-colors cursor-pointer ${
                    viewMode === "table"
                      ? "bg-surface text-text-primary shadow-subtle"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Table
                </button>
              </div>
            </div>

            {viewMode === "kanban" ? (
              <KanbanBoard
                tasks={taskState.allTasks}
                projects={projects}
                user={user}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
                onClick={(t) => setSelectedTask(t)}
              />
            ) : (
              <TaskList
                tasks={taskState.allTasks}
                projects={projects}
                user={user}
                loading={taskState.loading}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
                onTaskClick={(t) => setSelectedTask(t)}
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
