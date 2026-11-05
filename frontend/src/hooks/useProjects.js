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
        return false;
      }

      if (name.trim().length > 100) {
        setError("Project name cannot exceed 100 characters.");
        return false;
      }

      if (typeof description !== "string") {
        setError("Project description must be text.");
        return false;
      }

      try {
        await api.post("/projects", {
          name: name.trim(),
          description: description.trim(),
        });

        const refreshed = await fetchProjects();

        if (!refreshed) {
          setSuccess("Project created, but refreshing the list failed.");
          return true;
        }

        setSuccess("Project created successfully!");
        return true;
      } catch (err) {
        setError(err.response?.data?.message || "Failed to create project.");
        return false;
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
  };
}

export default useProjects;
