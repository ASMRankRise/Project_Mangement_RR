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
      title="New project"
      subtitle="Create a project to organize tasks and collaborate with team members."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {validationError && <Alert message={validationError} type="error" />}

        <div>
          <label
            htmlFor="projectName"
            className="mb-1 block text-[13px] font-medium text-text-secondary"
          >
            Project name <span className="text-accent">*</span>
          </label>
          <input
            id="projectName"
            type="text"
            required
            minLength={3}
            maxLength={50}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Design System Overhaul"
            className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-brand focus:ring-1 focus:ring-brand transition-colors shadow-subtle"
          />
          <p className="mt-1 text-right text-[12px] text-text-tertiary">
            {name.length}/50 characters
          </p>
        </div>

        <div>
          <label
            htmlFor="projectDesc"
            className="mb-1 block text-[13px] font-medium text-text-secondary"
          >
            Description <span className="text-text-tertiary font-normal">(optional)</span>
          </label>
          <textarea
            id="projectDesc"
            rows={3}
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Outline objectives, scope, or target timeline..."
            className="w-full rounded-md border border-border bg-surface p-3 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-brand focus:ring-1 focus:ring-brand transition-colors resize-none shadow-subtle"
          />
          <p className="mt-1 text-right text-[12px] text-text-tertiary">
            {description.length}/500 characters
          </p>
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
            disabled={loading || !name.trim()}
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
                <span>Create project</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateProjectModal;
