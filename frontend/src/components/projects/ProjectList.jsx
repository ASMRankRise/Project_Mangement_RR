import { useState } from "react";
import api from "../../services/api";
import Alert from "../common/Alert";

function ProjectList({
  projects = [],
  user,
  loading = false,
  onRefresh,
  onDeleteProject,
}) {
  const [emails, setEmails] = useState({});
  const [addingProject, setAddingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [removingMember, setRemovingMember] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
  });
  const [updatingProject, setUpdatingProject] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isAdmin = user?.role === "admin";

  const getId = (value) =>
    typeof value === "object" && value !== null ? value._id || value.id : value;

  const isProjectOwner = (project) =>
    String(getId(project.owner)) === String(user?._id || user?.id);

  const canManageProject = (project) => isAdmin || isProjectOwner(project);

  const handleEditProject = (project) => {
    setEditingProject(getId(project));
    setEditForm({
      name: project.name || "",
      description: project.description || "",
    });
    setError("");
    setSuccess("");
  };

  const handleUpdateProject = async (e, projectId) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      setUpdatingProject(true);

      await api.patch(`/projects/${projectId}`, {
        name: editForm.name,
        description: editForm.description,
      });

      setSuccess("Project updated successfully.");
      setEditingProject(null);

      await onRefresh?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update project.");
    } finally {
      setUpdatingProject(false);
    }
  };

  const handleAddMember = async (projectId) => {
    const email = (emails[projectId] || "").trim().toLowerCase();

    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter a user email.");
      return;
    }

    try {
      setAddingProject(projectId);

      await api.post(`/projects/${projectId}/members`, { email });

      setEmails((prev) => ({ ...prev, [projectId]: "" }));
      setSuccess("Project member added successfully.");

      await onRefresh?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add project member.");
    } finally {
      setAddingProject(null);
    }
  };

  const handleRemoveMember = async (project, member) => {
    const projectId = getId(project);
    const memberId = getId(member);
    const memberName = member?.name || member?.email || "this member";

    if (!projectId || !memberId || removingMember !== null) return;

    if (String(getId(project.owner)) === String(memberId)) {
      setError("Project owner cannot be removed.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to remove ${memberName} from this project?`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setRemovingMember(`${projectId}:${memberId}`);

    try {
      await api.delete(`/projects/${projectId}/members/${memberId}`);

      setSuccess(`${memberName} removed from the project successfully.`);

      await onRefresh?.();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to remove project member.",
      );
    } finally {
      setRemovingMember(null);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!onDeleteProject || deletingProject !== null) return;

    setError("");
    setSuccess("");
    setDeletingProject(projectId);
    

    try {
      const deleted = await onDeleteProject(projectId);

      if (deleted === true) {
        setSuccess("Project deleted successfully.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete project.");
    } finally {
      setDeletingProject(null);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.03] p-6"
          >
            <div className="h-5 w-1/2 rounded bg-white/10" />
            <div className="mt-4 h-3 w-full rounded bg-white/10" />
            <div className="mt-3 h-3 w-2/3 rounded bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex justify-end">
        <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300">
          {projects.length} {projects.length === 1 ? "Project" : "Projects"}
        </span>
      </div>

      <Alert message={error} type="error" />
      <Alert message={success} type="success" />

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
          <h3 className="text-lg font-semibold text-white">
            No projects found
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            Projects you create or join will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {projects.map((project) => {
            const projectId = getId(project);
            const owner = project.owner;
            const ownerId = getId(owner);

            const members = Array.isArray(project.members)
              ? project.members
              : [];

            return (
              <article
                key={projectId}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-indigo-400/30 hover:bg-white/[0.05]"
              >
                <div className="mb-5">
                  <h3 className="break-words text-lg font-bold text-white">
                    {project.name || "Untitled Project"}
                  </h3>

                  <p className="mt-2 break-words text-sm leading-6 text-slate-400">
                    {project.description || "No description provided."}
                  </p>

                  {project.createdAt && (
                    <p className="mt-3 text-xs text-slate-500">
                      Created:{" "}
                      {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  )}

                  {canManageProject(project) && (
                    <button
                      type="button"
                      onClick={() => handleEditProject(project)}
                      className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                    >
                      Edit Project
                    </button>
                  )}

                  {editingProject === projectId && (
                    <form
                      onSubmit={(e) => handleUpdateProject(e, projectId)}
                      className="mt-4 space-y-3"
                    >
                      <input
                        type="text"
                        required
                        minLength={3}
                        maxLength={50}
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Project name"
                        className="w-full rounded-xl border border-white/10 bg-[#090d19] px-3 py-3 text-sm text-white"
                      />

                      <textarea
                        maxLength={500}
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Project description"
                        className="w-full rounded-xl border border-white/10 bg-[#090d19] px-3 py-3 text-sm text-white"
                      />

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={updatingProject}
                          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          {updatingProject ? "Saving..." : "Save Changes"}
                        </button>

                        <button
                          type="button"
                          disabled={updatingProject}
                          onClick={() => setEditingProject(null)}
                          className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/5 bg-black/10 p-3">
                    <p className="text-xs text-slate-500">Project Owner</p>
                    <p className="mt-1 break-words text-sm font-medium text-slate-200">
                      {owner?.name || owner?.email || "Unknown"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-black/10 p-3">
                    <p className="text-xs text-slate-500">Team Members</p>
                    <p className="mt-1 text-sm font-medium text-slate-200">
                      {members.length}{" "}
                      {members.length === 1 ? "member" : "members"}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-200">
                      Project Team
                    </h4>
                    <span className="text-xs text-slate-500">
                      {members.length} people
                    </span>
                  </div>

                  {members.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {members.map((member, index) => {
                        const memberId = getId(member);
                        const memberName =
                          member?.name || member?.email || "Unknown member";

                        const isOwner = String(memberId) === String(ownerId);

                        const isRemoving =
                          removingMember === `${projectId}:${memberId}`;

                        return (
                          <div
                            key={memberId || index}
                            title={member?.email || memberName}
                            className="flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-2"
                          >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300">
                              {memberName.charAt(0).toUpperCase()}
                            </span>

                            <span className="max-w-40 truncate text-xs text-slate-300">
                              {memberName}
                            </span>

                            {canManageProject(project) && !isOwner && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveMember(project, member)
                                }
                                disabled={removingMember !== null}
                                aria-label={`Remove ${memberName} from project`}
                                className="rounded-full px-2 py-1 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isRemoving ? "Removing..." : "Remove"}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      No team members listed.
                    </p>
                  )}
                </div>

                {canManageProject(project) && (
                  <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddMember(projectId);
                      }}
                      className="flex flex-col gap-2 sm:flex-row"
                    >
                      <input
                        type="email"
                        required
                        maxLength={254}
                        placeholder="Enter member email"
                        aria-label={`Add member to ${project.name || "project"}`}
                        value={emails[projectId] || ""}
                        onChange={(e) =>
                          setEmails((prev) => ({
                            ...prev,
                            [projectId]: e.target.value,
                          }))
                        }
                        disabled={addingProject === projectId}
                        className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#090d19] px-3.5 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 disabled:opacity-50"
                      />

                      <button
                        type="submit"
                        disabled={
                          addingProject !== null || !emails[projectId]?.trim()
                        }
                        className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {addingProject === projectId
                          ? "Adding..."
                          : "+ Add Member"}
                      </button>
                    </form>

                    {onDeleteProject && (
                      <button
                        type="button"
                        disabled={deletingProject !== null}
                        onClick={() => handleDeleteProject(projectId)}
                        className="w-full rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-2.5 text-sm font-medium text-red-300 transition hover:border-red-500/40 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingProject === projectId
                          ? "Deleting Project..."
                          : "Delete Project"}
                      </button>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ProjectList;
