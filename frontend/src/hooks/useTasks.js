import { useCallback, useEffect, useRef, useState } from "react";
import api from "../services/api";

function useTasks(user) {
  const userId = user?._id || user?.id || user?.userId;

  const [tasks, setTasks] = useState([]);
  const [search, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilterValue] = useState("");
  const [priorityFilter, setPriorityFilterValue] = useState("");
  const [page, setPageValue] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const requestId = useRef(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timeout);
  }, [search]);

  const setSearch = (value) => {
    setSearchValue(value);
    setPageValue(1);
  };

  const setStatusFilter = (value) => {
    setStatusFilterValue(value);
    setPageValue(1);
  };

  const setPriorityFilter = (value) => {
    setPriorityFilterValue(value);
    setPageValue(1);
  };

  const setPage = (value) => {
    setPageValue((currentPage) =>
      typeof value === "function" ? value(currentPage) : value,
    );
  };

  const fetchTasks = useCallback(async (customPage) => {
    if (!userId) return false;

    const currentRequestId = ++requestId.current;
    const targetPage = typeof customPage === "number" ? customPage : page;

    const params = { page: targetPage, limit: 5 };

    if (debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }

    if (statusFilter) params.status = statusFilter;
    if (priorityFilter) params.priority = priorityFilter;

    setLoading(true);
    setError("");

    try {
      const response = await api.get("/tasks", { params });

      if (currentRequestId !== requestId.current) return false;

      const data = response.data;

      setTasks(data.tasks || []);
      setTotal(data.totalTasks ?? data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);

      return true;
    } catch (err) {
      if (currentRequestId === requestId.current) {
        setError(err.response?.data?.message || "Failed to fetch tasks.");
      }

      return false;
    } finally {
      if (currentRequestId === requestId.current) {
        setLoading(false);
      }
    }
  }, [userId, page, debouncedSearch, statusFilter, priorityFilter]);

  const createTask = async (payload) => {
    setError("");
    setSuccess("");

    try {
      await api.post("/tasks", payload);
      setSuccess("Task created successfully!");
      await fetchTasks();
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
        const prevPage = page - 1;
        setPageValue(prevPage);
        await fetchTasks(prevPage);
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
