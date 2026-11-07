import { useState } from "react";
import Modal from "../common/Modal";
import Alert from "../common/Alert";
import Icon from "../common/Icons";

export function CreateProjectModal({
  isOpen,
  onClose,
  onCreate,
  loading = false,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    const trimmedName = name.trim();

    if (trimmedName.length < 3 || trimmedName.length > 50) {
      setValidationError("Project name must be between 3 and 50 characters.");
      return;
    }

    if (!/^[\p{L}\p{N}][\p{L}\p{N}\s_-]*$/u.test(trimmedName)) {
      setValidationError(
        "Project name can only contain letters, numbers, spaces, underscores, and hyphens.",
      );
      return;
    }

    if (description.trim().length > 500) {
      setValidationError("Description cannot exceed 500 characters.");
      return;
    }

    if (!onCreate || loading) return;

    try {
      const created = await onCreate(trimmedName, description.trim());
      if (created) {
        setName("");
        setDescription("");
        setValidationError("");
        onClose?.();
      }
    } catch (err) {
      console.error("Create project failed:", err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      subtitle="Establish a new workspace for your team and track project milestones."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {validationError && <Alert message={validationError} type="error" />}

        <div>
          <label
            htmlFor="projectName"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300"
          >
            Project Name <span className="text-rose-400">*</span>
          </label>
          <input
            id="projectName"
            type="text"
            required
            minLength={3}
            maxLength={50}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mobile Banking Revamp"
            className="w-full rounded-xl border border-white/10 bg-[#070a13] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
          <p className="mt-1 text-right text-[11px] text-slate-500">
            {name.length}/50 characters
          </p>
        </div>

        <div>
          <label
            htmlFor="projectDesc"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300"
          >
            Description <span className="text-slate-500 font-normal lowercase">(optional)</span>
          </label>
          <textarea
            id="projectDesc"
            rows={3}
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Outline objectives, scope, deliverables, or target timeline..."
            className="w-full rounded-xl border border-white/10 bg-[#070a13] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
          />
          <p className="mt-1 text-right text-[11px] text-slate-500">
            {description.length}/500 characters
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Icon name="plus" className="h-4 w-4" />
                <span>Create Workspace</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateProjectModal;
