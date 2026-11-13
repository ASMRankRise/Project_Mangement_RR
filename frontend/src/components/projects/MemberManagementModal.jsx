import { useState } from "react";
import Modal from "../common/Modal";
import Avatar from "../common/Avatar";
import Alert from "../common/Alert";
import { MailIcon } from "../common/Icons";

export function MemberManagementModal({
  isOpen,
  onClose,
  project,
  canManage = true,
  onAddMember,
  onRemoveMember,
  addingMember,
  removingMember,
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!project) return null;

  const owner = project.owner;
  const ownerId = typeof owner === "object" ? owner?._id || owner?.id : owner;
  const members = Array.isArray(project.members) ? project.members : [];

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter a valid user email.");
      return;
    }

    try {
      const res = await onAddMember?.(project._id || project.id, email.trim());
      if (res?.success !== false) {
        setSuccess(`Added ${email.trim()} to project.`);
        setEmail("");
      } else {
        setError(res?.error || "Failed to add member.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add member.");
    }
  };

  const handleRemove = async (member) => {
    setError("");
    setSuccess("");
    const memberName = member?.name || member?.email || "this member";
    const memberId = typeof member === "object" ? member?._id || member?.id : member;

    if (!window.confirm(`Are you sure you want to remove ${memberName} from this project?`)) {
      return;
    }

    try {
      const res = await onRemoveMember?.(project._id || project.id, memberId);
      if (res?.success !== false) {
        setSuccess(`${memberName} removed from project.`);
      } else {
        setError(res?.error || "Failed to remove member.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to remove member.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${project.name} • Project Team Roster`}
      subtitle="Assign employees to this project workspace and manage collaboration privileges."
      size="md"
    >
      <div className="space-y-4 text-slate-800 dark:text-slate-200">
        {error && <Alert message={error} type="error" />}
        {success && <Alert message={success} type="success" />}

        {/* Add Member Form (if permitted) */}
        {canManage && (
          <form
            onSubmit={handleAdd}
            className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3"
          >
            <label
              htmlFor="memberEmail"
              className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Assign Employee by Email
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MailIcon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  id="memberEmail"
                  type="email"
                  required
                  placeholder="employee@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-8 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] py-1 pl-8 pr-2.5 text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-indigo-600 transition shadow-2xs"
                />
              </div>
              <button
                type="submit"
                disabled={addingMember || !email.trim()}
                className="h-8 inline-flex items-center gap-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 px-3 text-xs font-medium text-white shadow-2xs disabled:opacity-50 transition cursor-pointer"
              >
                {addingMember ? "Assigning..." : "+ Assign"}
              </button>
            </div>
          </form>
        )}

        {/* Member Directory */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span>Assigned Employees ({members.length})</span>
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1117]">
            {/* Owner Row */}
            {owner && (
              <div className="flex items-center justify-between p-2.5 bg-slate-50/70 dark:bg-slate-900/40">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar user={owner} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                      {owner?.name || owner?.email || "Project Lead"}
                    </p>
                    <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                      {owner?.email}
                    </p>
                  </div>
                </div>

                <span className="rounded border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                  Lead
                </span>
              </div>
            )}

            {/* Member Rows */}
            {members.map((member) => {
              const mId = typeof member === "object" ? member?._id || member?.id : member;
              const isOwner = String(mId) === String(ownerId);
              if (isOwner) return null;

              return (
                <div
                  key={mId}
                  className="flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar user={member} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                        {member?.name || member?.email || "Team Employee"}
                      </p>
                      <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                        {member?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                      Employee
                    </span>

                    {canManage && (
                      <button
                        type="button"
                        disabled={removingMember}
                        onClick={() => handleRemove(member)}
                        className="rounded p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-xs transition"
                        title="Remove employee from project"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {members.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                No employees have been assigned to this project team yet.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="h-8 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default MemberManagementModal;
