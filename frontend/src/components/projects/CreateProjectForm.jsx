import { useState } from "react";
import Alert from "../common/Alert";

function CreateProjectForm({ onCreate, loading = false, error, success }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    if (!name.trim()) {
      setValidationError("Project name is required.");
      return;
    }

    if (name.trim().length > 100) {
      setValidationError("Project name cannot exceed 100 characters.");
      return;
    }

    if (loading || !onCreate) return;

    try {
      const created = await onCreate(name.trim(), description.trim());

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
          maxLength={100}
          required
          className="w-full rounded-xl border border-white/10 bg-[#090d19] px-4 py-3 outline-none focus:border-indigo-500"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Project description"
          rows={3}
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
