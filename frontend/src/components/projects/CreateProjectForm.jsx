import { useState } from "react";
import Alert from "../common/Alert";

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
    <section className="mt-10 rounded-2xl border border-white/10 bg-[#0e1222] p-6 text-white sm:p-8">
      <h2 className="text-2xl font-bold">Create a Project</h2>

      <p className="mt-2 text-sm text-slate-400">
        Create a workspace for your team.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
          maxLength={50}
          required
          className="w-full rounded-xl border border-white/10 bg-[#090d19] px-4 py-3 outline-none focus:border-indigo-500"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Project description"
          rows={3}
          maxLength={500}
          className="w-full rounded-xl border border-white/10 bg-[#090d19] px-4 py-3 outline-none focus:border-indigo-500"
        />

        <Alert message={validationError || error} />
        <Alert message={success} type="success" />

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="rounded-xl bg-indigo-600 px-6 py-3 font-bold transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating..." : "+ Create Project"}
        </button>
      </form>
    </section>
  );
}

export default CreateProjectForm;
