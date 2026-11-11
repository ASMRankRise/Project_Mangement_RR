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
      toastError(res?.error || "Failed to update settings");
    }
  };

  const handleInlineAddMember = async (e) => {
    e.preventDefault();
    if (!canManage || addingMember || !newMemberEmail.trim()) return;

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
    <div className="space-y-4">
      {/* Top Breadcrumb / Back Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="h-8 inline-flex items-center gap-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition shadow-2xs"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          <span>Back to Projects</span>
        </button>

        <div className="flex items-center gap-2">
          {canManage && (
            <button
              type="button"
              onClick={() => setCreateTaskModalOpen(true)}
              className="h-8 inline-flex items-center gap-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 px-3 py-1 text-xs font-medium text-white shadow-2xs transition cursor-pointer"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
          )}

          {canManage && (
            <button
              type="button"
              onClick={() => setMemberModalOpen(true)}
              className="h-8 inline-flex items-center gap-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition shadow-2xs cursor-pointer"
            >
              <UsersIcon className="w-3.5 h-3.5" />
              <span>Manage Team</span>
            </button>
          )}
        </div>
      </div>

      {/* Project Header Banner */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <FolderIcon className="w-4 h-4" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {project.name}
              </h1>
              {isOwner && (
                <span className="rounded border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                  Owner
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {project.description || "No project description specified."}
            </p>

            {/* Meta details strip */}
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Owner:</span>
                <Avatar user={project.owner} size="xs" />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {project.owner?.name || project.owner?.email || "Workspace Owner"}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Team:</span>
                <AvatarGroup users={members} size="xs" max={5} />
                <span>{members.length} {members.length === 1 ? "member" : "members"}</span>
              </div>
            </div>
          </div>

          {/* Quick Progress Card */}
          <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3.5 min-w-[220px] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Completion</span>
              <span className="font-bold text-slate-900 dark:text-white">{progressPercent}%</span>
            </div>

            <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-0.5 text-center">
              <div className="p-1 rounded bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-900 dark:text-white">{todoTasks}</div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400">Todo</div>
              </div>
              <div className="p-1 rounded bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800">
                <div className="text-xs font-bold text-blue-600 dark:text-blue-400">{inProgressTasks}</div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400">Prog</div>
              </div>
              <div className="p-1 rounded bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800">
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{completedTasks}</div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400">Done</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-5 flex items-center gap-1 border-t border-slate-200 dark:border-slate-800 pt-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("board")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "board"
                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <KanbanIcon className="w-3.5 h-3.5" />
            <span>Task Board ({projectTasks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("table")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "table"
                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table View</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("members")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "members"
                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <UsersIcon className="w-3.5 h-3.5" />
            <span>Team ({members.length})</span>
          </button>

          {canManage && (
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                activeTab === "settings"
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#161B22] p-10 text-center">
              <CheckSquareIcon className="w-7 h-7 text-slate-400 dark:text-slate-500 mb-1.5" />
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">No tasks in this workspace</h3>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 max-w-sm">
                Get started by creating tasks to track project delivery and assign work to team members.
              </p>
              {canManage && (
                <button
                  type="button"
                  onClick={() => setCreateTaskModalOpen(true)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 px-3 py-1 text-xs font-medium text-white shadow-2xs transition"
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
              onClick={(task) => setSelectedTask(task)}
            />
          )}
        </div>
      )}

      {/* Tab 2: Table View */}
      {activeTab === "table" && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22]">
          {projectTasks.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500 dark:text-slate-400">
              No tasks currently registered for this workspace.
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="px-3.5 py-2.5">Task Title</th>
                  <th className="px-3.5 py-2.5">Status</th>
                  <th className="px-3.5 py-2.5">Priority</th>
                  <th className="px-3.5 py-2.5">Assignees</th>
                  <th className="px-3.5 py-2.5">Due Date</th>
                  <th className="px-3.5 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
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
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition cursor-pointer"
                    >
                      <td className="px-3.5 py-2.5 max-w-[280px]">
                        <div className="font-semibold text-slate-900 dark:text-white truncate">
                          {t.title}
                        </div>
                        {t.description && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {t.description}
                          </div>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5 whitespace-nowrap">
                        <StatusBadge status={t.status} size="xs" />
                      </td>
                      <td className="px-3.5 py-2.5 whitespace-nowrap">
                        <PriorityBadge priority={t.priority} size="xs" />
                      </td>
                      <td className="px-3.5 py-2.5 whitespace-nowrap">
                        <AvatarGroup users={assignedUsers} size="xs" max={3} />
                      </td>
                      <td className="px-3.5 py-2.5 whitespace-nowrap">
                        {t.dueDate ? (
                          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px]">
                            <CalendarIcon className="w-3 h-3 text-slate-400" />
                            {new Date(t.dueDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTask(t);
                          }}
                          className="px-2 py-0.5 rounded text-[11px] font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-950/40 transition"
                        >
                          View
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
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Project Members</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Team members can create tasks and update task progress within this workspace.
              </p>
            </div>

            {canManage && (
              <form onSubmit={handleInlineAddMember} className="flex items-center gap-2">
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="member@company.com"
                  required
                  className="h-8 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] px-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-600 w-52 shadow-2xs"
                />
                <button
                  type="submit"
                  disabled={addingMember}
                  className="h-8 inline-flex items-center gap-1 rounded-md bg-indigo-600 hover:bg-indigo-700 px-3 text-xs font-medium text-white transition disabled:opacity-50 shadow-2xs"
                >
                  <UserPlusIcon className="w-3.5 h-3.5" />
                  <span>{addingMember ? "..." : "Add"}</span>
                </button>
              </form>
            )}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-200 dark:border-slate-800">
            {/* Owner Row */}
            <div className="py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Avatar user={project.owner} size="sm" />
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    {project.owner?.name || project.owner?.email || "Workspace Owner"}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{project.owner?.email}</div>
                </div>
              </div>
              <span className="rounded border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.2 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                Project Owner
              </span>
            </div>

            {/* Member Rows */}
            {members.map((m) => {
              const mId = getId(m);
              const isCurrentUser = String(mId) === currentUserId;

              return (
                <div key={mId} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar user={m} size="sm" />
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{m.name || m.email}</span>
                        {isCurrentUser && (
                          <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">(You)</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{m.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2 py-0.2 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                      Member
                    </span>

                    {canManage && (
                      <button
                        type="button"
                        onClick={() => handleInlineRemoveMember(mId, m.name || m.email)}
                        className="text-xs text-rose-600 dark:text-rose-400 hover:underline p-1 transition"
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
              <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                No external members added yet. Add team members to collaborate on tasks.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Project Settings */}
      {activeTab === "settings" && canManage && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] p-4 sm:p-5 space-y-5">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Workspace Settings</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Update workspace name and description or manage workspace lifecycle.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-3.5 max-w-lg">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={50}
                required
                className="h-9 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Project Description
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="h-8 px-3 rounded-md text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              {savingSettings ? "Saving..." : "Save Settings"}
            </button>
          </form>

          {isAdmin && (
            <div className="pt-4 border-t border-rose-200 dark:border-rose-900/60">
              <h4 className="text-xs font-semibold text-rose-600 dark:text-rose-400">Danger Zone</h4>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                Permanently delete this project along with all associated tasks. This action cannot be reversed.
              </p>
              <button
                type="button"
                onClick={handleDeleteProject}
                className="mt-2.5 h-8 inline-flex items-center gap-1.5 rounded-md border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 px-3 text-xs font-medium text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition cursor-pointer"
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
        onSubmit={onTaskCreate}
      />

      {selectedTask && (
        <TaskDetailModal
          isOpen={Boolean(selectedTask)}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          projects={[project]}
          user={currentUser}
          onUpdate={onTaskUpdate}
          onDelete={onTaskDelete}
        />
      )}

      <MemberManagementModal
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        project={project}
        currentUser={currentUser}
        onAddMember={onAddMember}
        onRemoveMember={onRemoveMember}
      />
    </div>
  );
}

export default ProjectWorkspace;
