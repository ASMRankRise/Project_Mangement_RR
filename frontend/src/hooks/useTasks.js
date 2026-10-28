import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

function useTasks(user) {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setTotal(0);
      setTotalPages(1);
      return false;
    }

    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: 5,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (priorityFilter) {
        params.priority = priorityFilter;
      }

      const response = await api.get("/tasks", { params });
      const data = response.data;

      setTasks(data.tasks || []);
      setTotal(data.totalTasks ?? data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);

      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch tasks.");

      return false;
    } finally {
      setLoading(false);
    }
  }, [user, page, search, statusFilter, priorityFilter]);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  const createTask = async (payload) => {
    setError("");
    setSuccess("");

    try {
      await api.post("/tasks", payload);

      setSuccess("Task created successfully!");

      if (page !== 1) {
        setPage(1);
      } else {
        await fetchTasks();
      }

      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task.");

      return false;
    }
  };

  const updateTask = async (taskId, changes) => {
    setError("");
    setSuccess("");

    try {
      await api.patch(`/tasks/${taskId}`, changes);

      setSuccess("Task updated successfully!");
      await fetchTasks();

      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task.");

      return false;
    }
  };

  const deleteTask = async (taskId) => {
    setError("");
    setSuccess("");

    try {
      await api.delete(`/tasks/${taskId}`);

      setSuccess("Task deleted successfully!");

      if (tasks.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      } else {
        await fetchTasks();
      }

      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete task.");

      return false;
    }
  };

  return {
    tasks,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    page,
    setPage,
    totalPages,
    total,
    loading,
    error,
    success,
    setError,
    setSuccess,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}

export default useTasks;
