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
      title="New task"
      subtitle="Define work items, set deadlines, and assign team members."
      size="lg"
    >
      {projects.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface-subtle p-4 text-center text-sm text-text-secondary">
          <p className="font-medium text-text-primary">No active projects available.</p>
          <p className="mt-1 text-[13px] text-text-secondary">
            Please create or join a project first before creating tasks.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {validationError && <Alert message={validationError} type="error" />}

          {/* Project Workspace Selector */}
          <div>
            <label className="mb-1 block text-[13px] font-medium text-text-secondary">
              Project <span className="text-accent">*</span>
            </label>
            <select
              value={project}
              onChange={(e) => {
                setProject(e.target.value);
                setAssignedTo("");
              }}
              required
              className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-brand transition-colors cursor-pointer shadow-subtle"
            >
              <option value="">Select project...</option>
              {projects.map((item) => (
                <option key={item._id || item.id} value={item._id || item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="mb-1 block text-[13px] font-medium text-text-secondary">
              Task title <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement user permission checks"
              className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-brand focus:ring-1 focus:ring-brand transition-colors shadow-subtle"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-[13px] font-medium text-text-secondary">
              Description <span className="text-text-tertiary font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide delivery context, acceptance criteria, or technical details..."
              className="w-full rounded-md border border-border bg-surface p-3 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-brand focus:ring-1 focus:ring-brand transition-colors resize-none shadow-subtle"
            />
          </div>

          {/* Priority & Assignee Grid */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[13px] font-medium text-text-secondary">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-brand transition-colors cursor-pointer shadow-subtle"
              >
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[13px] font-medium text-text-secondary">
                Assigned team member <span className="text-accent">*</span>
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                disabled={!project}
                required
                className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-brand transition-colors cursor-pointer shadow-subtle disabled:opacity-50"
              >
                <option value="">
                  {project ? "Select assignee..." : "Choose a project first..."}
                </option>
                {projectMembers.length > 1 && (
                  <option value="ALL">All project members ({projectMembers.length})</option>
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
            <label className="mb-1 block text-[13px] font-medium text-text-secondary">
              Due date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-brand transition-colors shadow-subtle"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-9 rounded-md border border-border bg-surface px-3.5 text-[13px] font-medium text-text-primary hover:bg-surface-subtle transition-colors shadow-subtle cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !title.trim() || !project || !assignedTo}
              className="h-9 inline-flex items-center gap-1.5 rounded-md bg-brand hover:bg-brand-hover px-4 text-[13px] font-medium text-brand-text shadow-subtle transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-text border-t-transparent" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <PlusIcon className="h-4 w-4" />
                  <span>Create task</span>
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
