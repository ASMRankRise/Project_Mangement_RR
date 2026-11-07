import { useState } from "react";

function TaskCard({ task, projects = [], user, onUpdate, onDelete }) {
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAdmin = user?.role === "admin";

  const getId = (value) =>
    typeof value === "object" && value !== null ? value._id || value.id : value;

  const currentUserId = String(getId(user) || "");

  const assignedUsers = Array.isArray(task.assignedTo)
    ? task.assignedTo
    : task.assignedTo
      ? [task.assignedTo]
      : [];

  const isAssignedToMe =
    currentUserId !== "" &&
    assignedUsers.some(
      (member) => String(getId(member) || "") === currentUserId,
    );

  const projectId = getId(task.project);

  const project = projects.find(
    (item) => String(getId(item)) === String(projectId),
  );

  const projectOwnerId = String(getId(project?.owner) || "");

  const isProjectOwner =
    currentUserId !== "" && projectOwnerId === currentUserId;

  const canManageTask = isAdmin || isProjectOwner;

  const canUpdateStatus = canManageTask || isProjectOwner || isAssignedToMe;

  const assignedNames = assignedUsers
    .map((member) => {
      if (typeof member === "object" && member !== null) {
        return member.name || member.email || null;
      }

      return null;
    })
    .filter(Boolean);

  const handleChange = async (field, value) => {
    if (!onUpdate || updating) return;

    setUpdating(true);

    try {
      await onUpdate(task._id || task.id, { [field]: value });
    } catch (error) {
      console.error("Task update failed:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || deleting) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      await onDelete(task._id || task.id);
    } catch (error) {
      console.error("Task deletion failed:", error);
    } finally {
      setDeleting(false);
    }
  };

  const statusColors = {
    todo: "bg-gray-700 text-gray-200",
    "in-progress": "bg-blue-900 text-blue-200",
    completed: "bg-green-900 text-green-200",
    testing: "bg-purple-900 text-purple-200",
    done: "bg-emerald-900 text-emerald-200",
  };

  const priorityColors = {
    low: "bg-gray-700 text-gray-200",
    medium: "bg-yellow-900 text-yellow-200",
    high: "bg-red-900 text-red-200",
  };

  const formattedCreatedDate = task.createdAt
    ? new Date(task.createdAt).toLocaleDateString()
    : "Not available";

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString()
    : "No due date";

  return (
    <article className="space-y-4 rounded-xl border border-white/10 bg-[#111629] p-5 text-white">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-lg font-semibold">{task.title}</h3>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            priorityColors[task.priority] || priorityColors.medium
          }`}
        >
          {task.priority || "medium"}
        </span>
      </div>

      <p className="text-sm text-gray-400">
        {task.description || "No description"}
      </p>

      <div className="space-y-2 text-sm">
        <p>
          <strong>Project:</strong>{" "}
          {project?.name || task.project?.name || "Unknown"}
        </p>

        <p>
          <strong>Assigned to:</strong>{" "}
          {assignedNames.length > 0
            ? assignedNames.join(", ")
            : assignedUsers.length > 0
              ? "Member details unavailable"
              : "Unassigned"}
        </p>

        <p>
          <strong>Created date:</strong> {formattedCreatedDate}
        </p>

        <p>
          <strong>Due date:</strong> {formattedDueDate}
        </p>
      </div>

      <div>
        <label
          htmlFor={`status-${task._id || task.id}`}
          className="mb-2 block text-sm font-medium"
        >
          Status
        </label>

        {canUpdateStatus ? (
          <select
            id={`status-${task._id || task.id}`}
            value={task.status || "todo"}
            disabled={updating}
            onChange={(e) => handleChange("status", e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#0e1222] px-3 py-2 disabled:opacity-50"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="testing">Testing</option>
            <option value="completed">Completed</option>
            <option value="done">Done</option>
          </select>
        ) : (
          <span
            className={`inline-block rounded-full px-3 py-1 text-sm ${
              statusColors[task.status] || statusColors.todo
            }`}
          >
            {task.status || "todo"}
          </span>
        )}
      </div>

      <div>
        <label
          htmlFor={`priority-${task._id || task.id}`}
          className="mb-2 block text-sm font-medium"
        >
          Priority
        </label>

        {canManageTask ? (
          <select
            id={`priority-${task._id || task.id}`}
            value={task.priority || "medium"}
            disabled={updating}
            onChange={(e) => handleChange("priority", e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#0e1222] px-3 py-2 disabled:opacity-50"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        ) : (
          <span
            className={`inline-block rounded-full px-3 py-1 text-sm ${
              priorityColors[task.priority] || priorityColors.medium
            }`}
          >
            {task.priority || "medium"}
          </span>
        )}
      </div>

      {canManageTask && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete Task"}
        </button>
      )}
    </article>
  );
}

export default TaskCard;
