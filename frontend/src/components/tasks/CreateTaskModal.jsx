import { useState } from "react";
import Modal from "../common/Modal";
import Alert from "../common/Alert";
import { PlusIcon } from "../common/Icons";

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  projects = [],
  onSubmit,
  onCreate,
  loading = false,
}) {
  const submitAction = onSubmit || onCreate;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [project, setProject] = useState(projects.length === 1 ? (projects[0]._id || projects[0].id) : "");
  const [priority, setPriority] = useState("low");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState(getTodayDate());
  const [validationError, setValidationError] = useState("");

  const selectedProject = projects.find(
    (item) => String(item._id || item.id) === String(project),
  );

  const projectMembers = [
    ...(selectedProject?.owner ? [selectedProject.owner] : []),
    ...(selectedProject?.members || []),
  ].filter(
    (member, index, members) =>
      member?.email &&
      members.findIndex(
        (item) => item.email?.toLowerCase() === member.email.toLowerCase(),
      ) === index,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    if (!title.trim()) {
      setValidationError("Task title is required.");
      return;
    }

    if (!project) {
      setValidationError("Please select a target project workspace.");
      return;
    }

    if (!assignedTo) {
      setValidationError("Please select at least one task assignee.");
      return;
    }

    if (
      assignedTo !== "ALL" &&
      !projectMembers.some((member) => member.email === assignedTo)
    ) {
      setValidationError("Please select a valid project member.");
      return;
    }

    if (!submitAction || loading) return;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      priority,
      status: "todo",
      project,
      ...(assignedTo === "ALL"
        ? { assignToAll: true }
        : { assignedTo: [assignedTo] }),
      ...(dueDate ? { dueDate } : {}),
    };

    try {
      const created = await submitAction(payload);
      if (created?.success !== false) {
        setTitle("");
        setDescription("");
        setProject("");
        setPriority("low");
        setAssignedTo("");
        setDueDate(getTodayDate());
        setValidationError("");
        onClose?.();
      }
    } catch (err) {
      console.error("Create task failed:", err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Task"
      subtitle="Define actionable work, schedule deadlines, and assign team ownership."
      size="lg"
    >
      {projects.length === 0 ? (
        <div className="rounded-md border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-4 text-center text-xs text-amber-800 dark:text-amber-300">
          <p className="font-medium">No active workspaces available.</p>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Please create or join a project workspace first before creating tasks.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {validationError && <Alert message={validationError} type="error" />}

          {/* Project Workspace Selector */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Workspace / Project <span className="text-rose-500">*</span>
            </label>
            <select
              value={project}
              onChange={(e) => {
                setProject(e.target.value);
                setAssignedTo("");
              }}
              required
              className="h-9 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-600 transition cursor-pointer shadow-2xs"
            >
              <option value="">Select project workspace...</option>
              {projects.map((item) => (
                <option key={item._id || item.id} value={item._id || item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement OAuth2 session refresh"
              className="h-9 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] px-3 text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition shadow-2xs"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Description <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide delivery context, acceptance criteria, or technical details..."
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] p-2.5 text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition resize-none shadow-2xs"
            />
          </div>

          {/* Priority & Assignee Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="h-9 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-600 transition cursor-pointer shadow-2xs"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Assigned Team Member <span className="text-rose-500">*</span>
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                disabled={!project}
                required
                className="h-9 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-600 transition cursor-pointer shadow-2xs disabled:opacity-50"
              >
                <option value="">
                  {project ? "Select assignee..." : "Choose a workspace first..."}
                </option>
                {projectMembers.length > 1 && (
                  <option value="ALL">All Project Members ({projectMembers.length})</option>
                )}
                {projectMembers.map((m) => (
                  <option key={m._id || m.email} value={m.email}>
                    {m.name || m.email} ({m.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-9 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-600 transition shadow-2xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-8 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !title.trim() || !project || !assignedTo}
              className="h-8 inline-flex items-center gap-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 px-3 text-xs font-medium text-white shadow-2xs transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <PlusIcon className="h-3.5 w-3.5" />
                  <span>Create Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default CreateTaskModal;
