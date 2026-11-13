import { useState } from "react";
import { AvatarGroup } from "../common/Avatar";
import Modal from "../common/Modal";
import Alert from "../common/Alert";
import {
  FolderIcon,
  UsersIcon,
  EditIcon,
  TrashIcon,
  SearchIcon,
  ArrowRightIcon,
  CalendarIcon,
} from "../common/Icons";
import MemberManagementModal from "./MemberManagementModal";

export function ProjectList({
  projects = [],
  tasks = [],
  user,
  loading = false,
  onRefresh,
  onSelectProject,
  onUpdateProject,
  onDeleteProject,
  onAddMember,
  onRemoveMember,
}) {
  const [search, setSearch] = useState("");
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [updating, setUpdating] = useState(false);
  const [manageMembersProject, setManageMembersProject] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const userId = user?._id || user?.id;

  const getId = (v) =>
    typeof v === "object" && v !== null ? v._id || v.id : v;

  const isProjectOwner = (p) =>
    String(getId(p.owner)) === String(userId);

  const canManage = (p) => isAdmin || isProjectOwner(p);

  // Filter projects by search
  const filteredProjects = projects.filter((p) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.owner?.name?.toLowerCase().includes(q) ||
      p.owner?.email?.toLowerCase().includes(q)
    );
  });

  const handleEditClick = (e, p) => {
    e.stopPropagation();
    setEditingProject(p);
    setEditForm({
      name: p.name || "",
      description: p.description || "",
    });
    setError("");
    setSuccess("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingProject) return;

    setError("");
    setSuccess("");
    setUpdating(true);

    try {
      const pId = getId(editingProject);
      await onUpdateProject?.(pId, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
      });
      setSuccess("Project updated successfully.");
      setEditingProject(null);
      await onRefresh?.();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to update project.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar & Stats */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workspaces by name, description, owner..."
            className="h-9 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] py-1.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition shadow-2xs"
          />
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Showing <span className="font-semibold text-slate-900 dark:text-white">{filteredProjects.length}</span> of{" "}
          <span className="font-semibold text-slate-900 dark:text-white">{projects.length}</span> workspaces
        </div>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Grid or Empty State */}
      {loading && projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-14 text-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Loading workspaces...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#161B22] p-10 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            <FolderIcon className="h-5 w-5" />
          </div>
          <h3 className="mt-2.5 text-xs font-semibold text-slate-900 dark:text-white">
            {search ? "No matching workspaces" : "No active workspaces"}
          </h3>
          <p className="mt-1 max-w-sm text-[11px] text-slate-500 dark:text-slate-400">
            {search
              ? "Try adjusting your search query."
              : "Create a project workspace to begin tracking tasks and organizing team workloads."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const pId = getId(project);
            const owner = project.owner;
            const members = Array.isArray(project.members) ? project.members : [];
            const canEdit = canManage(project);
            const isOwner = isProjectOwner(project);

            // Calculate task progress for this project
            const projTasks = tasks.filter((t) => String(getId(t.project)) === String(pId));
            const totalProjTasks = projTasks.length;
            const doneProjTasks = projTasks.filter(
              (t) => t.status === "completed" || t.status === "done"
            ).length;
            const progress = totalProjTasks > 0 ? Math.round((doneProjTasks / totalProjTasks) * 100) : 0;

            return (
              <article
                key={pId}
                onClick={() => onSelectProject?.(project)}
                className="group relative flex flex-col justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] p-4 shadow-2xs transition hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer text-left"
              >
                <div>
                  {/* Top Bar: Icon, Name & Badges */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <FolderIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate">
                          {project.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <CalendarIcon className="w-3 h-3 text-slate-400" />
                          <span>
                            {project.createdAt
                              ? new Date(project.createdAt).toLocaleDateString()
                              : "Active"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {isOwner ? (
                      <span className="shrink-0 rounded border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                        Owner
                      </span>
                    ) : (
                      <span className="shrink-0 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                        Member
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 min-h-[30px]">
                    {project.description || "No project description provided."}
                  </p>
                </div>

                {/* Progress & Team Details */}
                <div className="mt-3.5 border-t border-slate-100 dark:border-slate-800/80 pt-3 space-y-2.5">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-500 dark:text-slate-400">
                        {totalProjTasks > 0
                          ? `${doneProjTasks} of ${totalProjTasks} done`
                          : "No tasks registered"}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Team Roster & Lead */}
                  <div className="flex items-center justify-between pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <AvatarGroup users={members} max={3} size="xs" />
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {members.length} {members.length === 1 ? "member" : "members"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 uppercase font-medium">Lead:</span>
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[80px]">
                        {owner?.name?.split(" ")[0] || owner?.email?.split("@")[0] || "User"}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                      <span>Open Workspace</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </span>

                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {canEdit && (
                        <button
                          type="button"
                          onClick={(e) => handleEditClick(e, project)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition"
                          title="Edit Project"
                        >
                          <EditIcon className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {canEdit && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setManageMembersProject(project);
                          }}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition"
                          title="Manage Members"
                        >
                          <UsersIcon className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {canEdit && (
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const confirmed = window.confirm(
                              `Delete project "${project.name}" and all associated tasks?`
                            );
                            if (confirmed) {
                              await onDeleteProject?.(pId);
                            }
                          }}
                          className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
                          title="Delete Project"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <Modal
          isOpen={Boolean(editingProject)}
          onClose={() => setEditingProject(null)}
          title="Edit Workspace"
          subtitle="Modify project title and mission statement"
        >
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Project Name
              </label>
              <input
                type="text"
                required
                maxLength={50}
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                className="h-9 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="h-8 rounded-md border border-slate-300 dark:border-slate-700 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="h-8 rounded-md bg-indigo-600 hover:bg-indigo-700 px-3 text-xs font-medium text-white disabled:opacity-50"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Member Management Modal */}
      {manageMembersProject && (
        <MemberManagementModal
          isOpen={Boolean(manageMembersProject)}
          onClose={() => setManageMembersProject(null)}
          project={manageMembersProject}
          currentUser={user}
          canManage={canManage(manageMembersProject)}
          onAddMember={onAddMember}
          onRemoveMember={onRemoveMember}
        />
      )}
    </div>
  );
}

export default ProjectList;
