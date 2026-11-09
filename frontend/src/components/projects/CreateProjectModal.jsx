import { useState } from "react";
import Modal from "../common/Modal";
import Alert from "../common/Alert";
import { PlusIcon } from "../common/Icons";

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
      if (created?.success !== false) {
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
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {validationError && <Alert message={validationError} type="error" />}

        <div>
          <label
            htmlFor="projectName"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            Project Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="projectName"
            type="text"
            required
            minLength={3}
            maxLength={50}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Core Banking Platform"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070a13] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-indigo-500 transition shadow-xs"
          />
          <p className="mt-1 text-right text-[10px] text-slate-400">
            {name.length}/50 characters
          </p>
        </div>

        <div>
          <label
            htmlFor="projectDesc"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            Description <span className="text-slate-400 font-normal lowercase">(optional)</span>
          </label>
          <textarea
            id="projectDesc"
            rows={3}
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Outline objectives, scope, or target timeline..."
            className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070a13] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-indigo-500 transition resize-none shadow-xs"
          />
          <p className="mt-1 text-right text-[10px] text-slate-400">
            {description.length}/500 characters
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <PlusIcon className="h-3.5 w-3.5" />
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
