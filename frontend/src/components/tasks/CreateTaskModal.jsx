import { useState } from "react";
import Modal from "../common/Modal";
import Alert from "../common/Alert";
import Icon from "../common/Icons";

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
  onCreate,
  loading = false,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [project, setProject] = useState("");
  const [priority, setPriority] = useState("low");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState(getTodayDate());
  const [validationError, setValidationError] = useState("");

  const selectedProject = projects.find(
    (item) => String(item._id) === String(project),
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

    if (!onCreate || loading) return;

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
      const created = await onCreate(payload);
      if (created) {
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
      title="Create New Task"
      subtitle="Define actionable work, schedule deadlines, and assign team ownership."
      maxWidth="max-w-xl"
    >
      {projects.length === 0 ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-5 text-center text-xs text-amber-200">
          <p className="font-semibold">No active workspaces available.</p>
          <p className="mt-1 text-slate-400">
            Please create or join a project workspace first before creating tasks.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {validationError && <Alert message={validationError} type="error" />}

          {/* Project Workspace Selector */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Workspace / Project <span className="text-rose-400">*</span>
            </label>
            <select
              value={project}
              onChange={(e) => {
                setProject(e.target.value);
                setAssignedTo("");
              }}
              required
              className="w-full rounded-xl border border-white/10 bg-[#070a13] px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition cursor-pointer"
            >
              <option value="">Select project workspace...</option>
              {projects.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement OAuth2 Refresh Interceptor"
              maxLength={150}
              required
              className="w-full rounded-xl border border-white/10 bg-[#070a13] px-4 py-2.5 text-xs text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Description <span className="text-slate-500 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Context, specifications, acceptance criteria, links..."
              rows={3}
              maxLength={1000}
              className="w-full rounded-xl border border-white/10 bg-[#070a13] px-4 py-2.5 text-xs text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 transition resize-none"
            />
          </div>

          {/* Priority & Assignee Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#070a13] px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition cursor-pointer"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Target Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                min={getTodayDate()}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#070a13] px-4 py-2 text-xs text-white outline-none focus:border-indigo-500 transition cursor-pointer"
              />
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Assignee <span className="text-rose-400">*</span>
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              disabled={!project || projectMembers.length === 0}
              required
              className="w-full rounded-xl border border-white/10 bg-[#070a13] px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition cursor-pointer disabled:opacity-50"
            >
              <option value="">
                {!project
                  ? "Select a project first"
                  : projectMembers.length === 0
                    ? "No project members available"
                    : "Select team member..."}
              </option>
              {projectMembers.map((member) => (
                <option key={member._id} value={member.email}>
                  {member.name || member.email} ({member.email})
                </option>
              ))}
              {projectMembers.length > 0 && (
                <option value="ALL">👥 Assign to All Project Members</option>
              )}
            </select>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !project || !assignedTo}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Creating Task...</span>
                </>
              ) : (
                <>
                  <Icon name="plus" className="h-4 w-4" />
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
