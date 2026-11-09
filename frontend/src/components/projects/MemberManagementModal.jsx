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
      title={`${project.name} • Team Roster`}
      subtitle="Manage collaborators, assignees, and project access permissions."
      size="md"
    >
      <div className="space-y-5 text-slate-800 dark:text-slate-200">
        {error && <Alert message={error} type="error" />}
        {success && <Alert message={success} type="success" />}

        {/* Add Member Form (if permitted) */}
        {canManage && (
          <form
            onSubmit={handleAdd}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-3.5"
          >
            <label
              htmlFor="memberEmail"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Add Registered Member
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MailIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="memberEmail"
                  type="email"
                  required
                  placeholder="collaborator@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#070a13] py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-indigo-500 transition shadow-xs"
                />
              </div>
              <button
                type="submit"
                disabled={addingMember || !email.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-50 transition"
              >
                {addingMember ? "Adding..." : "+ Add"}
              </button>
            </div>
          </form>
        )}

        {/* Member Directory */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            <span>Project Collaborators ({members.length})</span>
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070a13]">
            {/* Owner Row */}
            {owner && (
              <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar user={owner} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                      {owner?.name || owner?.email || "Project Owner"}
                    </p>
                    <p className="truncate text-[10px] text-slate-400">
                      {owner?.email}
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                  Owner
                </span>
              </div>
            )}

            {/* Member Rows */}
            {members.map((member, idx) => {
              const mId = typeof member === "object" ? member?._id || member?.id : member;
              const isOwner = String(mId) === String(ownerId);
              if (isOwner) return null;

              const mName = member?.name || member?.email || "Unknown Member";
              const mEmail = member?.email || "";

              return (
                <div
                  key={mId || idx}
                  className="flex items-center justify-between p-3 transition hover:bg-slate-50 dark:hover:bg-slate-900/40"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar user={member} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                        {mName}
                      </p>
                      <p className="truncate text-[10px] text-slate-400">
                        {mEmail}
                      </p>
                    </div>
                  </div>

                  {canManage && (
                    <button
                      type="button"
                      onClick={() => handleRemove(member)}
                      disabled={Boolean(removingMember)}
                      className="rounded-md border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}

            {members.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-400">
                No external members in this project.
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default MemberManagementModal;
