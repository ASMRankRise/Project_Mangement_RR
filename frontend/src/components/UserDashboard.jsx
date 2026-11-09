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

  // Calculate Real SaaS metrics from actual backend data:
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
    <div className="space-y-8">
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
          <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0E131F] p-6 backdrop-blur-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold text-indigo-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Workspace Pipeline
                </div>

                <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Welcome back, {firstName}
                </h1>
                <p className="mt-1 text-xs text-slate-400">
                  Real-time status across your {projects.length} project workspaces and active deliverables.
                </p>
              </div>

              {/* Progress Summary Pill */}
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#070a13] p-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Overall Completion
                  </span>
                  <span className="text-lg font-bold text-white">
                    {completionRate}%
                  </span>
                </div>
                <div className="h-8 w-[1px] bg-white/10" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Overdue
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      overdueTasksCount > 0 ? "text-rose-400" : "text-emerald-400"
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-xl border border-white/10 bg-[#0E131F] p-4 text-left">
              <span className="text-[11px] font-medium text-slate-400 block truncate">
                Projects Owned
              </span>
              <div className="mt-2 text-2xl font-bold text-white">
                {dashboardLoading ? "..." : ownedProjectsCount}
              </div>
              <span className="text-[10px] text-indigo-400 mt-1 block">Lead role</span>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0E131F] p-4 text-left">
              <span className="text-[11px] font-medium text-slate-400 block truncate">
                Assigned Workspaces
              </span>
              <div className="mt-2 text-2xl font-bold text-white">
                {dashboardLoading ? "..." : assignedProjectsCount}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Team member</span>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0E131F] p-4 text-left">
              <span className="text-[11px] font-medium text-slate-400 block truncate">
                Total Tasks
              </span>
              <div className="mt-2 text-2xl font-bold text-white">
                {dashboardLoading ? "..." : totalTasksCount}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">All projects</span>
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
                {overdueTasksCount > 0 ? "Needs action" : "On schedule"}
              </span>
            </div>
          </div>

          {/* Real Analytics: Distribution & Upcoming Deadlines */}
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
                  <span>Active Project Workspaces</span>
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
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
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckSquareIcon className="h-4 w-4 text-indigo-400" />
                  <span>Tasks Delivery Pipeline</span>
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Quickly view and progress work items across your workspaces
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
