import { useEffect } from "react";
import api from "../../services/api";
import useProjects from "../../hooks/useProjects";

import CreateProjectForm from "../projects/CreateProjectForm";
import ProjectList from "../projects/ProjectList";
import Alert from "../common/Alert";
import Loading from "../common/Loading";

function ProjectsPage({ user }) {
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

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDeleteProject = async (projectId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project and its tasks?",
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/projects/${projectId}`);

      setSuccess("Project deleted successfully.");
      await fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete project.");
    }
  };

  if (loading && projects.length === 0) {
    return <Loading message="Loading projects..." />;
  }

  return (
    <div className="space-y-8 text-white">
      <h1 className="text-3xl font-bold">Projects</h1>

      {user && (
        <section className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-xl font-semibold">Create Project</h2>

          <Alert type="error" message={error} />
          <Alert type="success" message={success} />

          <CreateProjectForm
            onCreate={createProject}
            loading={loading}
            error=""
            success=""
          />
        </section>
      )}

      {user?.role !== "admin" && <Alert type="error" message={error} />}

      <section className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-xl font-semibold">
          {user?.role === "admin" ? "Manage Projects" : "My Projects"}
        </h2>

        <ProjectList
          projects={projects}
          user={user}
          loading={loading}
          onRefresh={fetchProjects}
          onDeleteProject={
            user?.role === "admin" ? handleDeleteProject : undefined
          }
        />
      </section>
    </div>
  );
}

export default ProjectsPage;
