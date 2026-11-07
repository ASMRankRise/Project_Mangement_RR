import { useState } from "react";
import Modal from "../common/Modal";
import Avatar from "../common/Avatar";
import Alert from "../common/Alert";
import Icon from "../common/Icons";

export function MemberManagementModal({
  isOpen,
  onClose,
  project,
  canManage,
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
      if (res !== false) {
        setSuccess(`Invitation sent to ${email.trim()}`);
        setEmail("");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add member.");
    }
  };

  const handleRemove = async (member) => {
    setError("");
    setSuccess("");
    const memberName = member?.name || member?.email || "this member";

    if (!window.confirm(`Are you sure you want to remove ${memberName} from this project?`)) {
      return;
    }

    try {
      await onRemoveMember?.(project, member);
      setSuccess(`${memberName} removed from project.`);
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
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        {error && <Alert message={error} type="error" />}
        {success && <Alert message={success} type="success" />}

        {/* Add Member Form (if permitted) */}
        {canManage && (
          <form
            onSubmit={handleAdd}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
          >
            <label
              htmlFor="memberEmail"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300"
            >
              Invite Registered Team Member
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Icon
                  name="mail"
                  className="absolute left-3 top-3.5 h-4 w-4 text-slate-500"
                />
                <input
                  id="memberEmail"
                  type="email"
                  required
                  placeholder="collaborator@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#070a13] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 transition"
                />
              </div>
              <button
                type="submit"
                disabled={addingMember || !email.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50 transition"
              >
                {addingMember ? "Adding..." : "+ Invite"}
              </button>
            </div>
          </form>
        )}

        {/* Member Directory */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-slate-400 uppercase">
            <span>Project Collaborators ({members.length})</span>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-white/5 rounded-xl border border-white/10 bg-[#070a13]">
            {members.map((member, idx) => {
              const mId = typeof member === "object" ? member?._id || member?.id : member;
              const isOwner = String(mId) === String(ownerId);
              const mName = member?.name || member?.email || "Unknown Member";
              const mEmail = member?.email || "";

              return (
                <div
                  key={mId || idx}
                  className="flex items-center justify-between p-3.5 transition hover:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={mName} email={mEmail} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-white">
                          {mName}
                        </p>
                        {isOwner && (
                          <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                            Owner
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-slate-400">
                        {mEmail}
                      </p>
                    </div>
                  </div>

                  {canManage && !isOwner && (
                    <button
                      type="button"
                      onClick={() => handleRemove(member)}
                      disabled={Boolean(removingMember)}
                      className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default MemberManagementModal;
