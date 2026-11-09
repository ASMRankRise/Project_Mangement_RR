import { useCallback, useEffect, useState, useMemo } from "react";
import api from "../services/api";
import useProjects from "../hooks/useProjects";
import useTasks from "../hooks/useTasks";
import TaskDistribution from "./dashboard/TaskDistribution";
import UpcomingDeadlines from "./dashboard/UpcomingDeadlines";
import ProjectList from "./projects/ProjectList";
import ProjectWorkspace from "./projects/ProjectWorkspace";
import TaskFilters from "./tasks/TaskFilters";
import TaskList from "./tasks/TaskList";
import TaskDetailModal from "./tasks/TaskDetailModal";
import Alert from "./common/Alert";
import {
  FolderIcon,
  CheckSquareIcon,
} from "./common/Icons";

export function UserDashboard({ user }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [viewMode, setViewMode] = useState("kanban");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const {
    projects,
    loading: projectsLoading,
    error: projectError,
    fetchProjects,
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
        err.response?.data?.message || "Failed to load dashboard metrics.",
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

  const getId = (v) => (typeof v === "object" && v !== null ? v._id || v.id : v);
  const userId = String(getId(user) || "");
  const firstName = user?.name?.trim()?.split(/\s+/)[0] || "User";

  // Real SaaS metrics
  const ownedProjectsCount = useMemo(() => {
    return projects.filter((p) => String(getId(p.owner)) === userId).length;
  }, [projects, userId]);

  const assignedProjectsCount = useMemo(() => {
    return projects.filter((p) =>
      p.members?.some((m) => String(getId(m)) === userId),
    ).length;
  }, [projects, userId]);

  const summary = dashboardData?.summary || {};
  const totalTasksCount = summary.totalTasks ?? taskState.total ?? 0;

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
      {/* If a project workspace was opened from dashboard */}
      {selectedProject ? (
        <ProjectWorkspace
          project={selectedProject}
          allTasks={taskState.allTasks}
          currentUser={user}
          onBack={() => setSelectedProjectId(null)}
          onUpdateProject={updateProject}
          onDeleteProject={deleteProject}
          onTaskCreate={taskState.createTask}
          onTaskUpdate={handleUpdateTask}
          onTaskDelete={handleDeleteTask}
          onAddMember={addMember}
          onRemoveMember={removeMember}
          onRefresh={fetchProjects}
        />
      ) : (
        <>
          {/* Welcome & Pulse Header */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F] p-5 sm:p-6 shadow-xs transition-colors">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Personal Workspace</span>
                </div>

                <h1 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Welcome back, {firstName}
                </h1>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Tracking {projects.length} accessible project workspaces and active deliverables.
                </p>
              </div>

              {/* Progress Summary Pill */}
              <div className="flex items-center gap-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 py-2 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">
                    Completion
                  </span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {completionRate}%
                  </span>
                </div>
                <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">
                    Overdue
                  </span>
                  <span
                    className={`text-base font-bold ${
                      overdueTasksCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {overdueTasksCount}
                  </span>
                </div>
              </div>
            </div>

            {dashboardError && (
              <div className="mt-4">
                <Alert message={dashboardError} type="error" />
              </div>
            )}
          </section>

          {/* 6 Real Metric Cards Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F] p-4 text-left shadow-xs">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block truncate">
                Projects Owned
              </span>
              <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {dashboardLoading ? "..." : ownedProjectsCount}
              </div>
              <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 mt-0.5 block">Project lead</span>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F] p-4 text-left shadow-xs">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block truncate">
                Team Workspaces
              </span>
              <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {dashboardLoading ? "..." : assignedProjectsCount}
              </div>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 block">Participant</span>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F] p-4 text-left shadow-xs">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block truncate">
                Total Tasks
              </span>
              <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {dashboardLoading ? "..." : totalTasksCount}
              </div>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 block">All pipelines</span>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F] p-4 text-left shadow-xs">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block truncate">
                In Progress
              </span>
              <div className="mt-1 text-2xl font-bold text-sky-600 dark:text-sky-400">
                {dashboardLoading ? "..." : inProgressTasksCount}
              </div>
              <span className="text-[10px] font-medium text-sky-600 dark:text-sky-400/80 mt-0.5 block">Underway</span>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F] p-4 text-left shadow-xs">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block truncate">
                Completed
              </span>
              <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {dashboardLoading ? "..." : completedTasksCount}
              </div>
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400/80 mt-0.5 block">Delivered</span>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F] p-4 text-left shadow-xs">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block truncate">
                Overdue Tasks
              </span>
              <div
                className={`mt-1 text-2xl font-bold ${
                  overdueTasksCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-slate-200"
                }`}
              >
                {dashboardLoading ? "..." : overdueTasksCount}
              </div>
              <span
                className={`text-[10px] font-medium mt-0.5 block ${
                  overdueTasksCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {overdueTasksCount > 0 ? "Requires action" : "On schedule"}
              </span>
            </div>
          </div>

          {/* Real Analytics: Distribution & Upcoming Deadlines */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
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
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FolderIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Active Project Workspaces</span>
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Select a workspace to manage its tasks, roster, and timelines
                </p>
              </div>
            </div>

            {projectError && <Alert message={projectError} type="error" />}

            <ProjectList
              projects={projects}
              tasks={taskState.allTasks}
              user={user}
              loading={projectsLoading}
              onRefresh={fetchProjects}
              onSelectProject={(project) => setSelectedProjectId(project._id || project.id)}
              onUpdateProject={updateProject}
              onDeleteProject={deleteProject}
              onAddMember={addMember}
              onRemoveMember={removeMember}
            />
          </section>

          {/* Tasks Pipeline Section */}
          <section className="space-y-3 pt-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckSquareIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Tasks Delivery Pipeline</span>
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Filter and progress work items across your workspaces
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

          {/* Task Detail Modal */}
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

export default UserDashboard;
