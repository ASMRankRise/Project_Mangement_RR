import { useState } from "react";
import Alert from "../common/Alert";
import Button from "../common/Button";

function CreateProjectForm({ onCreate, loading = false, error, success }) {
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
      setValidationError("Project name contains invalid characters.");
      return;
    }

    if (description.trim().length > 500) {
      setValidationError("Description cannot exceed 500 characters.");
      return;
    }

    if (loading || !onCreate) return;

    try {
      const created = await onCreate(trimmedName, description.trim());

      if (created) {
        setName("");
        setDescription("");
        setValidationError("");
      }
    } catch (err) {
      console.error("Create project failed:", err);
    }
  };

  return (
    <section className="mt-8 rounded-lg border border-border bg-surface p-5 text-left shadow-subtle sm:p-6">
      <h2 className="text-xl font-bold tracking-tight text-text-primary font-heading">
        New project
      </h2>

      <p className="mt-1 text-sm text-text-secondary">
        Create a project to organize tasks and collaborate with team members.
      </p>

      {validationError && (
        <div className="mt-4">
          <Alert message={validationError} type="error" />
        </div>
      )}
      {error && (
        <div className="mt-4">
          <Alert message={error} type="error" />
        </div>
      )}
      {success && (
        <div className="mt-4">
          <Alert message={success} type="success" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4 max-w-lg">
        <div>
          <label
            htmlFor="projectName"
            className="block text-[13px] font-medium text-text-secondary mb-1"
          >
            Project name *
          </label>
          <input
            id="projectName"
            type="text"
            required
            maxLength={50}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Core Platform Architecture"
            className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors shadow-subtle"
          />
        </div>

        <div>
          <label
            htmlFor="projectDescription"
            className="block text-[13px] font-medium text-text-secondary mb-1"
          >
            Description
          </label>
          <textarea
            id="projectDescription"
            rows={3}
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Outline objectives, scope, or target timeline..."
            className="w-full rounded-md border border-border bg-surface p-3 text-sm text-text-primary outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors resize-none shadow-subtle"
          />
        </div>

        <Button
          variant="primary"
          size="md"
          type="submit"
          disabled={loading || !name.trim()}
        >
          {loading ? "Creating..." : "Create project"}
        </Button>
      </form>
    </section>
  );
}

export default CreateProjectForm;
