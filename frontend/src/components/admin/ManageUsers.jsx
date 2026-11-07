import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import Avatar from "../common/Avatar";
import { RoleBadge } from "../common/Badge";
import Alert from "../common/Alert";
import Icon from "../common/Icons";

export function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingEmail, setUpdatingEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.get("/admin/users");
      setUsers(Array.isArray(response.data?.users) ? response.data.users : []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to fetch user directory.",
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
        currentUsers.map((u) =>
          u.email === email ? { ...u, role: updatedRole } : u,
        ),
      );

      setSuccess(
        `${email} access permissions updated to ${
          updatedRole === "admin" ? "Administrator" : "Member"
        }.`,
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not update user role.",
      );
      await fetchUsers();
    } finally {
      setUpdatingEmail("");
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const adminCount = users.filter((u) => u.role === "admin").length;
  const memberCount = users.filter((u) => u.role === "user").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
            Access Control
          </span>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            User Directory & Roles
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Oversee user accounts, verify access privileges, and manage administrator permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          disabled={loading || Boolean(updatingEmail)}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/10 disabled:opacity-50"
        >
          <Icon name="sparkles" className="h-4 w-4 text-indigo-400" />
          <span>{loading ? "Refreshing..." : "Refresh Directory"}</span>
        </button>
      </div>

      {error && <Alert message={error} type="error" />}
      {success && <Alert message={success} type="success" />}

      {/* Directory Metrics Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Users
          </p>
          <p className="mt-2 text-2xl font-bold text-white">{users.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Administrators
          </p>
          <p className="mt-2 text-2xl font-bold text-indigo-300">{adminCount}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Standard Members
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-300">{memberCount}</p>
        </div>
      </div>

      {/* Search & Role Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <Icon
            name="search"
            className="absolute left-3.5 top-3 h-4 w-4 text-slate-500"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email address..."
            className="w-full rounded-xl border border-white/10 bg-[#070a13] py-2 pl-10 pr-4 text-xs text-white outline-none placeholder:text-slate-500 focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#070a13] px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="admin">Administrators Only</option>
            <option value="user">Members Only</option>
          </select>

          <span className="text-xs text-slate-400">
            {filteredUsers.length} shown
          </span>
        </div>
      </div>

      {/* User Directory Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#070a13] shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <p className="mt-3">Loading registered accounts...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No users match your search parameters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-white/[0.03] text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th scope="col" className="py-3.5 pl-6 pr-3">User Profile</th>
                  <th scope="col" className="px-3 py-3.5">Assigned Role</th>
                  <th scope="col" className="px-3 py-3.5">Joined Date</th>
                  <th scope="col" className="py-3.5 pl-3 pr-6 text-right">Modify Permission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => {
                  const isUpdating = updatingEmail === u.email;
                  const formattedDate = u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Unknown";

                  return (
                    <tr
                      key={u._id}
                      className="transition hover:bg-white/[0.02]"
                    >
                      {/* Name & Email */}
                      <td className="py-4 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} email={u.email} size="md" />
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate text-sm">
                              {u.name}
                            </p>
                            <p className="text-slate-400 truncate text-xs mt-0.5">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Current Role Badge */}
                      <td className="px-3 py-4">
                        <RoleBadge role={u.role} size="md" />
                      </td>

                      {/* Joined Date */}
                      <td className="px-3 py-4 text-slate-400">
                        {formattedDate}
                      </td>

                      {/* Role Dropdown Selector */}
                      <td className="py-4 pl-3 pr-6 text-right">
                        <select
                          aria-label={`Role selector for ${u.email}`}
                          value={u.role}
                          disabled={loading || isUpdating}
                          onChange={(e) => handleRoleChange(u.email, e.target.value)}
                          className="rounded-xl border border-white/10 bg-[#0f1424] px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500 transition cursor-pointer disabled:opacity-50"
                        >
                          <option value="user">Member</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageUsers;
