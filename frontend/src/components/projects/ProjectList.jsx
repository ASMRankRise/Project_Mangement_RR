import { useState } from "react";
import api from "../../services/api";
import { AvatarGroup } from "../common/Avatar";
import Modal from "../common/Modal";
import Alert from "../common/Alert";
import Icon from "../common/Icons";
import MemberManagementModal from "./MemberManagementModal";

export function ProjectList({
  projects = [],
  user,
  loading = false,
  onRefresh,
  onDeleteProject,
}) {
  const [search, setSearch] = useState("");
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [updating, setUpdating] = useState(false);
  const [manageMembersProject, setManageMembersProject] = useState(null);
  const [addingMember, setAddingMember] = useState(false);
  const [removingMember, setRemovingMember] = useState(false);
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

  const handleEditClick = (p) => {
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
      await api.patch(`/projects/${pId}`, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
      });
      setSuccess("Project updated successfully.");
      setEditingProject(null);
      await onRefresh?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update project.");
    } finally {
      setUpdating(false);
    }
  };

  const handleAddMember = async (pId, memberEmail) => {
    setAddingMember(true);
    try {
      await api.post(`/projects/${pId}/members`, { email: memberEmail });
      await onRefresh?.();
      return true;
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (project, member) => {
    setRemovingMember(true);
    try {
      const pId = getId(project);
      const mId = getId(member);
      await api.delete(`/projects/${pId}/members/${mId}`);
      await onRefresh?.();
    } finally {
      setRemovingMember(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Subheader Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Icon
            name="search"
            className="absolute left-3.5 top-3 h-4 w-4 text-slate-500"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name, description, owner..."
            className="w-full rounded-xl border border-white/10 bg-[#070a13] py-2 pl-10 pr-4 text-xs text-white outline-none placeholder:text-slate-500 focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 self-end text-xs text-slate-400">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold text-slate-300">
            {filteredProjects.length}{" "}
            {filteredProjects.length === 1 ? "Workspace" : "Workspaces"}
          </span>
        </div>
      </div>

      {error && <Alert message={error} type="error" />}
      {success && <Alert message={success} type="success" />}

      {/* Loading Skeleton */}
      {loading && projects.length === 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-56 animate-pulse rounded-2xl border border-white/10 bg-white/[0.02] p-6"
            >
              <div className="h-5 w-2/3 rounded bg-white/10" />
              <div className="mt-3 h-4 w-full rounded bg-white/5" />
              <div className="mt-8 h-8 w-1/2 rounded bg-white/5" />
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
            <Icon name="projects" className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-white">
            {search ? "No matching projects found" : "No active projects yet"}
          </h3>
          <p className="mt-1 max-w-sm text-xs text-slate-400">
            {search
              ? "Try adjusting your search terms to locate your workspace."
              : "Create a new project workspace to start delegating tasks and organizing your team."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const pId = getId(project);
            const owner = project.owner;
            const members = Array.isArray(project.members)
              ? project.members
              : [];
            const canEdit = canManage(project);
            const isOwner = isProjectOwner(project);

            return (
              <article
                key={pId}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-5 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-950/20"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 text-indigo-300">
                        <Icon name="projects" className="h-4 w-4" />
                      </div>
                      <h3 className="line-clamp-1 text-base font-bold text-white group-hover:text-indigo-300 transition">
                        {project.name}
                      </h3>
                    </div>

                    {isOwner && (
                      <span className="shrink-0 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                        Owner
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-400">
                    {project.description || "No project description provided."}
                  </p>
                </div>

                {/* Team Members & Owner */}
                <div className="mt-6 border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                        Team Roster
                      </span>
                      <div className="mt-1">
                        <AvatarGroup users={members} max={4} size="sm" />
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                        Lead
                      </span>
                      <p className="mt-1 text-xs font-semibold text-slate-200 truncate max-w-[100px]">
                        {owner?.name || owner?.email || "Unknown"}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setManageMembersProject(project)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
                    >
                      <Icon name="users" className="h-3.5 w-3.5" />
                      <span>Team ({members.length})</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleEditClick(project)}
                          className="rounded-lg border border-white/10 bg-white/[0.04] p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
                          title="Edit Project"
                        >
                          <Icon name="edit" className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {isAdmin && onDeleteProject && (
                        <button
                          type="button"
                          onClick={() => onDeleteProject(pId)}
                          className="rounded-lg border border-red-500/20 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20 transition"
                          title="Delete Project (Admin)"
                        >
                          <Icon name="trash" className="h-3.5 w-3.5" />
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
          subtitle="Update workspace title and project specifications."
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Workspace Name
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={50}
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full rounded-xl border border-white/10 bg-[#070a13] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Description
              </label>
              <textarea
                rows={3}
                maxLength={500}
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-white/10 bg-[#070a13] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition disabled:opacity-50"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Team Member Management Modal */}
      {manageMembersProject && (
        <MemberManagementModal
          isOpen={Boolean(manageMembersProject)}
          onClose={() => setManageMembersProject(null)}
          project={
            projects.find((p) => getId(p) === getId(manageMembersProject)) ||
            manageMembersProject
          }
          canManage={canManage(manageMembersProject)}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
          addingMember={addingMember}
          removingMember={removingMember}
        />
      )}
    </div>
  );
}

export default ProjectList;
