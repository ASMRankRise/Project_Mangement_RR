import { useState } from "react";
import Modal from "../common/Modal";
import Alert from "../common/Alert";
import { PlusIcon } from "../common/Icons";

export function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
  onCreate,
  loading = false,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [validationError, setValidationError] = useState("");

  const submitAction = onSubmit || onCreate;

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

    if (!submitAction || loading) return;

    try {
      const created = await submitAction(trimmedName, description.trim());
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
      title="Create Workspace"
      subtitle="Establish a new workspace for your team and track project milestones."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {validationError && <Alert message={validationError} type="error" />}

        <div>
          <label
            htmlFor="projectName"
            className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
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
            className="h-9 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] px-3 text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition shadow-2xs"
          />
          <p className="mt-1 text-right text-[10px] text-slate-400">
            {name.length}/50 characters
          </p>
        </div>

        <div>
          <label
            htmlFor="projectDesc"
            className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            Description <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="projectDesc"
            rows={3}
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Outline objectives, scope, or target timeline..."
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] p-2.5 text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition resize-none shadow-2xs"
          />
          <p className="mt-1 text-right text-[10px] text-slate-400">
            {description.length}/500 characters
          </p>
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
            disabled={loading || !name.trim()}
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
