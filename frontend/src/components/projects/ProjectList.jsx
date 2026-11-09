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

  const isAdmin = user?.role === "admin";
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
    <div className="space-y-6">
      {/* Search Bar & Stats */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workspaces by name, description, owner..."
            className="w-full rounded-xl border border-white/10 bg-[#070a13] py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="font-semibold text-white">{filteredProjects.length}</span> of{" "}
          <span className="font-semibold text-white">{projects.length}</span> workspaces
        </div>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Grid or Empty State */}
      {loading && projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="mt-3 text-xs text-slate-400">Loading workspaces...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
            <FolderIcon className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-white">
            {search ? "No matching workspaces" : "No active workspaces"}
          </h3>
          <p className="mt-1 max-w-sm text-xs text-slate-400">
            {search
              ? "Try adjusting your search terms to locate your project."
              : "Create a new project workspace to start delegating tasks and organizing your team."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
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
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-[#0E131F]/90 p-5 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-black/50 cursor-pointer text-left"
              >
                <div>
                  {/* Top Bar: Icon, Name & Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/20 transition">
                        <FolderIcon className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition truncate">
                          {project.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <CalendarIcon className="w-3 h-3 text-slate-500" />
                          <span>
                            {project.createdAt
                              ? new Date(project.createdAt).toLocaleDateString()
                              : "Active"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {isOwner ? (
                      <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                        Owner
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                        Member
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-400 min-h-[32px]">
                    {project.description || "No project description provided."}
                  </p>
                </div>

                {/* Progress & Team Details */}
                <div className="mt-5 border-t border-white/5 pt-3.5 space-y-3">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-400">
                        {totalProjTasks > 0
                          ? `${doneProjTasks} of ${totalProjTasks} tasks done`
                          : "No tasks assigned"}
                      </span>
                      <span className="font-semibold text-indigo-400">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Team Roster & Lead */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <AvatarGroup users={members} max={3} size="xs" />
                      <span className="text-[11px] text-slate-400">
                        {members.length} {members.length === 1 ? "member" : "members"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">Lead:</span>
                      <span className="text-[11px] font-medium text-slate-300 truncate max-w-[80px]">
                        {owner?.name?.split(" ")[0] || owner?.email?.split("@")[0] || "User"}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 group-hover:text-indigo-300">
                      <span>Open Workspace</span>
                      <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>

                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {canEdit && (
                        <button
                          type="button"
                          onClick={(e) => handleEditClick(e, project)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition"
                          title="Edit Project"
                        >
                          <EditIcon className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => setManageMembersProject(project)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition"
                          title="Manage Members"
                        >
                          <UsersIcon className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {isAdmin && onDeleteProject && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteProject(pId);
                          }}
                          className="rounded-lg p-1 text-slate-400 hover:bg-rose-500/10 hover:text-rose-300 transition"
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
          title="Edit Project Workspace"
        >
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Project Name *
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
                maxLength={50}
                required
                className="w-full rounded-lg border border-white/10 bg-[#070a13] px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Description
              </label>
              <textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                maxLength={500}
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-[#070a13] px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-sm disabled:opacity-50"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Manage Members Modal */}
      {manageMembersProject && (
        <MemberManagementModal
          isOpen={Boolean(manageMembersProject)}
          onClose={() => setManageMembersProject(null)}
          project={manageMembersProject}
          onAddMember={onAddMember}
          onRemoveMember={onRemoveMember}
        />
      )}
    </div>
  );
}

export default ProjectList;
