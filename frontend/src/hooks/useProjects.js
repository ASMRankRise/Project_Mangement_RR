import { useCallback, useState } from "react";
import api from "../services/api";

function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/projects");
      setProjects(response.data.projects || []);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch projects.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(
    async (name, description = "") => {
      setError("");
      setSuccess("");

      if (typeof name !== "string" || !name.trim()) {
        setError("Project name is required.");
        return { success: false, error: "Project name is required." };
      }

      const trimmedName = name.trim();

      if (trimmedName.length < 3 || trimmedName.length > 50) {
        const msg = "Project name must be between 3 and 50 characters.";
        setError(msg);
        return { success: false, error: msg };
      }

      if (!/^[\p{L}\p{N}][\p{L}\p{N}\s_-]*$/u.test(trimmedName)) {
        const msg = "Project name contains invalid characters.";
        setError(msg);
        return { success: false, error: msg };
      }

      if (typeof description !== "string") {
        const msg = "Project description must be text.";
        setError(msg);
        return { success: false, error: msg };
      }

      if (description.trim().length > 500) {
        const msg = "Description cannot exceed 500 characters.";
        setError(msg);
        return { success: false, error: msg };
      }

      try {
        const response = await api.post("/projects", {
          name: trimmedName,
          description: description.trim(),
        });

        await fetchProjects();
        setSuccess("Project created successfully!");
        return { success: true, project: response.data?.project };
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to create project.";
        setError(msg);
        return { success: false, error: msg };
      }
    },
    [fetchProjects],
  );

  const updateProject = useCallback(
    async (projectId, payload) => {
      setError("");
      setSuccess("");

      try {
        const response = await api.patch(`/projects/${projectId}`, payload);
        await fetchProjects();
        setSuccess("Project updated successfully!");
        return { success: true, project: response.data?.project };
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to update project.";
        setError(msg);
        return { success: false, error: msg };
      }
    },
    [fetchProjects],
  );

  const deleteProject = useCallback(
    async (projectId) => {
      setError("");
      setSuccess("");

      try {
        await api.delete(`/projects/${projectId}`);
        await fetchProjects();
        setSuccess("Project deleted successfully!");
        return { success: true };
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to delete project.";
        setError(msg);
        return { success: false, error: msg };
      }
    },
    [fetchProjects],
  );

  const addMember = useCallback(
    async (projectId, email) => {
      setError("");
      setSuccess("");

      try {
        const response = await api.post(`/projects/${projectId}/members`, {
          email: email.trim().toLowerCase(),
        });
        await fetchProjects();
        setSuccess("Member added successfully!");
        return { success: true, project: response.data?.project };
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to add member.";
        setError(msg);
        return { success: false, error: msg };
      }
    },
    [fetchProjects],
  );

  const removeMember = useCallback(
    async (projectId, memberId) => {
      setError("");
      setSuccess("");

      try {
        const response = await api.delete(`/projects/${projectId}/members/${memberId}`);
        await fetchProjects();
        setSuccess("Member removed successfully!");
        return { success: true, project: response.data?.project };
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to remove member.";
        setError(msg);
        return { success: false, error: msg };
      }
    },
    [fetchProjects],
  );

  const assignProjectHead = useCallback(
    async (projectId, email) => {
      setError("");
      setSuccess("");

      try {
        const response = await api.post(`/projects/${projectId}/project-head`, {
          email: email.trim().toLowerCase(),
        });
        await fetchProjects();
        setSuccess("Project Head assigned successfully!");
        return { success: true, project: response.data?.project };
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to assign Project Head.";
        setError(msg);
        return { success: false, error: msg };
      }
    },
    [fetchProjects],
  );

  const removeProjectHead = useCallback(
    async (projectId) => {
      setError("");
      setSuccess("");

      try {
        const response = await api.delete(`/projects/${projectId}/project-head`);
        await fetchProjects();
        setSuccess("Project Head removed successfully!");
        return { success: true, project: response.data?.project };
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to remove Project Head.";
        setError(msg);
        return { success: false, error: msg };
      }
    },
    [fetchProjects],
  );

  return {
    projects,
    loading,
    error,
    success,
    setError,
    setSuccess,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
    assignProjectHead,
    removeProjectHead,
  };
}

export default useProjects;
