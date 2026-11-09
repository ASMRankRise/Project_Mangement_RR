import { useState, useMemo } from "react";
import { Avatar, AvatarGroup } from "../common/Avatar";
import { StatusBadge, PriorityBadge } from "../common/Badge";
import {
  FolderIcon,
  UsersIcon,
  CheckSquareIcon,
  PlusIcon,
  CalendarIcon,
  TrashIcon,
  EditIcon,
  ArrowLeftIcon,
  KanbanIcon,
  TableIcon,
  UserPlusIcon,
} from "../common/Icons";
import KanbanBoard from "../tasks/KanbanBoard";
import CreateTaskModal from "../tasks/CreateTaskModal";
import TaskDetailModal from "../tasks/TaskDetailModal";
import MemberManagementModal from "./MemberManagementModal";
import { useToast } from "../../context/ToastContext";

export function ProjectWorkspace({
  project,
  allTasks = [],
  currentUser,
  onBack,
  onUpdateProject,
  onDeleteProject,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
  onAddMember,
  onRemoveMember,
  onRefresh,
}) {
  const { success, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState("board"); // "board" | "table" | "members" | "settings"
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  // Settings tab form state
  const [editName, setEditName] = useState(project.name || "");
  const [editDescription, setEditDescription] = useState(project.description || "");
  const [savingSettings, setSavingSettings] = useState(false);

  const getId = (v) => (typeof v === "object" && v !== null ? v._id || v.id : v);
  const currentUserId = String(getId(currentUser) || "");
  const isAdmin = currentUser?.role === "admin";
  const pId = String(getId(project) || "");
  const ownerId = String(getId(project.owner) || "");
  const isOwner = currentUserId !== "" && ownerId === currentUserId;
  const canManage = isAdmin || isOwner;

  // Filter tasks belonging exclusively to this project
  const projectTasks = useMemo(() => {
    return allTasks.filter((t) => {
      const taskProjectId = getId(t.project);
      return String(taskProjectId) === pId;
    });
  }, [allTasks, pId]);

  // Real task metrics for this project
  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter(
    (t) => t.status === "completed" || t.status === "done"
  ).length;
  const inProgressTasks = projectTasks.filter(
    (t) => t.status === "in-progress" || t.status === "testing"
  ).length;
  const todoTasks = projectTasks.filter((t) => t.status === "todo").length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const members = Array.isArray(project.members) ? project.members : [];

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!canManage || savingSettings) return;

    if (!editName.trim()) {
      toastError("Project name is required");
      return;
    }
    if (editName.trim().length < 3 || editName.trim().length > 50) {
      toastError("Project name must be 3-50 characters");
      return;
    }

    setSavingSettings(true);
    const res = await onUpdateProject(pId, {
      name: editName.trim(),
      description: editDescription.trim(),
    });
    setSavingSettings(false);

    if (res?.success !== false) {
      success("Project settings saved");
      onRefresh?.();
    } else {
      toastError(res?.error || "Failed to update project");
    }
  };

  const handleInlineAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberEmail.trim() || addingMember) return;

    setAddingMember(true);
    const res = await onAddMember(pId, newMemberEmail.trim());
    setAddingMember(false);

    if (res?.success !== false) {
      success(`Added ${newMemberEmail} to project`);
      setNewMemberEmail("");
      onRefresh?.();
    } else {
      toastError(res?.error || "Failed to add member");
    }
  };

  const handleInlineRemoveMember = async (memberId, memberName) => {
    if (!canManage) return;
    const confirmed = window.confirm(`Remove ${memberName} from this project?`);
    if (!confirmed) return;

    const res = await onRemoveMember(pId, memberId);
    if (res?.success !== false) {
      success("Member removed from project");
      onRefresh?.();
    } else {
      toastError(res?.error || "Failed to remove member");
    }
  };

  const handleDeleteProject = async () => {
    if (!isAdmin) {
      toastError("Only administrators can delete projects");
      return;
    }
    const confirmed = window.confirm(
      `Permanently delete "${project.name}" and all associated tasks?`
    );
    if (!confirmed) return;

    const res = await onDeleteProject(pId);
    if (res?.success !== false) {
      success("Project deleted successfully");
      onBack();
    } else {
      toastError(res?.error || "Failed to delete project");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb / Back Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#0E131F] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          <span>Back to All Projects</span>
        </button>

        <div className="flex items-center gap-2">
          {canManage && (
            <button
              type="button"
              onClick={() => setCreateTaskModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
          )}

          {canManage && (
            <button
              type="button"
              onClick={() => setMemberModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0E131F] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition"
            >
              <UsersIcon className="w-3.5 h-3.5" />
              <span>Manage Team</span>
            </button>
          )}
        </div>
      </div>

      {/* Project Header Banner */}
      <div className="rounded-xl border border-white/10 bg-[#0D111A] p-6 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <FolderIcon className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {project.name}
              </h1>
              {isOwner && (
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                  You are Owner
                </span>
              )}
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {project.description || "No project description provided."}
            </p>

            <div className="flex items-center gap-6 pt-2 text-xs text-slate-400 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  Owner:
                </span>
                <span className="font-medium text-slate-200">
                  {project.owner?.name || project.owner?.email || "Unknown"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  Created:
                </span>
                <span>
                  {project.createdAt
                    ? new Date(project.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  Team:
                </span>
                <AvatarGroup users={members} size="xs" max={5} />
                <span>{members.length} member{members.length !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>

          {/* Quick Progress Card */}
          <div className="rounded-xl border border-white/10 bg-[#121824] p-4 min-w-[240px] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Completion</span>
              <span className="font-bold text-indigo-400">{progressPercent}%</span>
            </div>

            <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-1.5 rounded-lg bg-white/[0.02]">
                <div className="text-sm font-bold text-white">{todoTasks}</div>
                <div className="text-[10px] text-slate-400">Todo</div>
              </div>
              <div className="p-1.5 rounded-lg bg-white/[0.02]">
                <div className="text-sm font-bold text-sky-400">{inProgressTasks}</div>
                <div className="text-[10px] text-slate-400">In Prog</div>
              </div>
              <div className="p-1.5 rounded-lg bg-white/[0.02]">
                <div className="text-sm font-bold text-emerald-400">{completedTasks}</div>
                <div className="text-[10px] text-slate-400">Done</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex items-center gap-1 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab("board")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "board"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <KanbanIcon className="w-3.5 h-3.5" />
            <span>Task Board ({projectTasks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("table")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "table"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table View</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("members")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "members"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <UsersIcon className="w-3.5 h-3.5" />
            <span>Team Roster ({members.length})</span>
          </button>

          {canManage && (
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "settings"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <EditIcon className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Task Board */}
      {activeTab === "board" && (
        <div>
          {projectTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#0D111A]/60 p-12 text-center">
              <CheckSquareIcon className="w-8 h-8 text-indigo-400 mb-2" />
              <h3 className="text-sm font-bold text-white">No tasks in this workspace</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-sm">
                Get started by creating tasks to track project delivery and assign work to team members.
              </p>
              {canManage && (
                <button
                  type="button"
                  onClick={() => setCreateTaskModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>Create First Task</span>
                </button>
              )}
            </div>
          ) : (
            <KanbanBoard
              tasks={projectTasks}
              projects={[project]}
              user={currentUser}
              onUpdate={onTaskUpdate}
              onDelete={onTaskDelete}
              onTaskClick={(task) => setSelectedTask(task)}
            />
          )}
        </div>
      )}

      {/* Tab 2: Table View */}
      {activeTab === "table" && (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0E131F] backdrop-blur-sm">
          {projectTasks.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No tasks currently registered for this workspace.
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-white/10 bg-white/[0.02] text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                <tr>
                  <th className="px-4 py-3">Task Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Assignees</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {projectTasks.map((t) => {
                  const assignedUsers = Array.isArray(t.assignedTo)
                    ? t.assignedTo
                    : t.assignedTo
                    ? [t.assignedTo]
                    : [];

                  return (
                    <tr
                      key={t._id || t.id}
                      onClick={() => setSelectedTask(t)}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3 max-w-[280px]">
                        <div className="font-semibold text-white group-hover:text-indigo-300 transition truncate">
                          {t.title}
                        </div>
                        {t.description && (
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {t.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={t.status} size="sm" />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <PriorityBadge priority={t.priority} size="sm" />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <AvatarGroup users={assignedUsers} size="xs" max={3} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {t.dueDate ? (
                          <span className="flex items-center gap-1 text-slate-400">
                            <CalendarIcon className="w-3 h-3" />
                            {new Date(t.dueDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTask(t);
                          }}
                          className="px-2.5 py-1 rounded text-[11px] font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 3: Team Roster */}
      {activeTab === "members" && (
        <div className="rounded-xl border border-white/10 bg-[#0E131F] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Project Members</h3>
              <p className="text-xs text-slate-400">
                Team members can create tasks and update task progress within this workspace.
              </p>
            </div>

            {canManage && (
              <form onSubmit={handleInlineAddMember} className="flex items-center gap-2">
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="member@example.com"
                  required
                  className="rounded-lg border border-white/10 bg-[#070a13] px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 w-56"
                />
                <button
                  type="submit"
                  disabled={addingMember}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-50"
                >
                  <UserPlusIcon className="w-3.5 h-3.5" />
                  <span>{addingMember ? "Adding..." : "Add"}</span>
                </button>
              </form>
            )}
          </div>

          <div className="divide-y divide-white/5 border-t border-white/5">
            {/* Owner Row */}
            <div className="py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar user={project.owner} size="sm" />
                <div>
                  <div className="text-xs font-semibold text-white">
                    {project.owner?.name || project.owner?.email || "Workspace Owner"}
                  </div>
                  <div className="text-[11px] text-slate-400">{project.owner?.email}</div>
                </div>
              </div>
              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300">
                Project Owner
              </span>
            </div>

            {/* Member Rows */}
            {members.map((m) => {
              const mId = getId(m);
              const isCurrentUser = String(mId) === currentUserId;

              return (
                <div key={mId} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar user={m} size="sm" />
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-2">
                        <span>{m.name || m.email}</span>
                        {isCurrentUser && (
                          <span className="text-[10px] text-indigo-400">(You)</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{m.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-slate-300">
                      Member
                    </span>

                    {canManage && (
                      <button
                        type="button"
                        onClick={() => handleInlineRemoveMember(mId, m.name || m.email)}
                        className="text-xs text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-500/10 rounded transition"
                        title="Remove member"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {members.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-500">
                No external members added yet. Add team members to collaborate on tasks.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Project Settings */}
      {activeTab === "settings" && canManage && (
        <div className="rounded-xl border border-white/10 bg-[#0E131F] p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Project Settings</h3>
            <p className="text-xs text-slate-400">
              Update workspace name and description or manage workspace lifecycle.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Project Name *
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={50}
                required
                className="w-full rounded-lg border border-white/10 bg-[#070a13] px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Project Description
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-[#070a13] px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-sm disabled:opacity-50"
            >
              {savingSettings ? "Saving..." : "Save Changes"}
            </button>
          </form>

          {isAdmin && (
            <div className="pt-6 border-t border-rose-500/20">
              <h4 className="text-sm font-bold text-rose-400">Danger Zone</h4>
              <p className="mt-1 text-xs text-slate-400">
                Permanently delete this project along with all associated tasks. This action cannot be reversed.
              </p>
              <button
                type="button"
                onClick={handleDeleteProject}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                <span>Delete Workspace</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateTaskModal
        isOpen={createTaskModalOpen}
        onClose={() => setCreateTaskModalOpen(false)}
        projects={[project]}
        onCreate={onTaskCreate}
        loading={false}
      />

      <TaskDetailModal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        projects={[project]}
        currentUser={currentUser}
        onUpdateTask={onTaskUpdate}
        onDeleteTask={onTaskDelete}
      />

      <MemberManagementModal
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        project={project}
        onAddMember={onAddMember}
        onRemoveMember={onRemoveMember}
        loading={false}
      />
    </div>
  );
}

export default ProjectWorkspace;

