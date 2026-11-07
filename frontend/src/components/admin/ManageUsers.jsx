import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingEmail, setUpdatingEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.get("/admin/users");
      setUsers(Array.isArray(response.data?.users) ? response.data.users : []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to fetch users.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (email, newRole) => {
    const selectedUser = users.find((user) => user.email === email);

    if (!selectedUser) return;

    if (!["admin", "user"].includes(newRole)) {
      setError("Invalid role selected.");
      return;
    }

    if (selectedUser.role === newRole) return;

    setError("");
    setSuccess("");
    setUpdatingEmail(email);

    try {
      const response = await api.patch("/admin/users/role", {
        email,
        role: newRole,
      });

      const updatedRole = response.data.user?.role;

      if (!updatedRole) {
        throw new Error("The server did not return the updated role.");
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.email === email ? { ...user, role: updatedRole } : user,
        ),
      );

      setSuccess(
        `${email} role updated to ${
          updatedRole === "admin" ? "Admin" : "Member"
        }.`,
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not update user role.",
      );

      // Restore the latest server data after a failed update.
      await fetchUsers();
    } finally {
      setUpdatingEmail("");
    }
  };

  return (
    <section className="mt-8 rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
      <div className="mb-5">
        <h2 className="text-xl font-bold">Manage Users</h2>
        <p className="mt-1 text-sm text-slate-400">
          View registered users and manage their roles.
        </p>
      </div>

      {error && (
        <p role="alert" className="mb-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="mb-3 text-sm text-green-400">
          {success}
        </p>
      )}

      {loading ? (
        <p className="text-slate-400">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="text-slate-400">No registered users found.</p>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user._id}
              className="flex flex-col gap-3 rounded-xl border border-slate-700 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-slate-400">{user.email}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Current role: {user.role === "admin" ? "Admin" : "Member"}
                </p>
              </div>

              <select
                aria-label={`Role for ${user.email}`}
                value={user.role}
                disabled={loading || Boolean(updatingEmail)}
                onChange={(event) =>
                  handleRoleChange(user.email, event.target.value)
                }
                className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white disabled:opacity-50"
              >
                <option value="user">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={fetchUsers}
        disabled={loading || Boolean(updatingEmail)}
        className="mt-4 rounded-lg bg-slate-700 px-4 py-2 text-sm hover:bg-slate-600 disabled:opacity-50"
      >
        {loading ? "Loading..." : "Refresh Users"}
      </button>
    </section>
  );
}

export default ManageUsers;
