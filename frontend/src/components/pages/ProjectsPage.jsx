import React, { useEffect, useState } from "react";
import api from "../../services/api";
import useProjects from "../../hooks/useProjects";
import ProjectList from "../projects/ProjectList";
import CreateProjectModal from "../projects/CreateProjectModal";
import Alert from "../common/Alert";
import Icon from "../common/Icons";

export function ProjectsPage({ user }) {
  const {
    projects,
    loading,
    error,
    success,
    setError,
    setSuccess,
    fetchProjects,
    createProject,
  } = useProjects();

  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDeleteProject = async (projectId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project and all its tasks? This action cannot be undone.",
    );

    if (!confirmed) return false;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/projects/${projectId}`);
      setSuccess("Project deleted successfully.");
      await fetchProjects();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete project.");
      return false;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
            {user?.role === "admin" ? "Organization Workspace" : "Collaborative Workspaces"}
          </span>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Projects & Workspaces
          </h1>
          <p className="mt-1.5 text-xs text-slate-400">
            Organize teams, assign responsibilities, and oversee project delivery across your organization.
          </p>
        </div>

        {user && (
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:from-indigo-500 hover:to-indigo-600"
          >
            <Icon name="plus" className="h-4 w-4" />
            <span>New Project</span>
          </button>
        )}
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Projects Gallery */}
      <ProjectList
        projects={projects}
        user={user}
        loading={loading}
        onRefresh={fetchProjects}
        onDeleteProject={
          user?.role === "admin" ? handleDeleteProject : undefined
        }
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={createProject}
        loading={loading}
      />
    </div>
  );
}

export default ProjectsPage;
