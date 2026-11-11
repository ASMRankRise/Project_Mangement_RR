import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import { Avatar } from "../common/Avatar";
import { RoleBadge } from "../common/Badge";
import Alert from "../common/Alert";
import {
  SearchIcon,
  RotateCwIcon,
} from "../common/Icons";
import { useToast } from "../../context/ToastContext";

export function ManageUsers() {
  const { success: toastSuccess, error: toastError } = useToast();
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
      toastError("Invalid role selected.");
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

      const msg = `${email} role updated to ${
        updatedRole === "admin" ? "Administrator" : "Member"
      }.`;
      setSuccess(msg);
      toastSuccess(msg);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Could not update user role.";
      setError(msg);
      toastError(msg);
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Access Control
          </span>
          <h1 className="mt-1 text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            User Directory & Roles
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Oversee user accounts, verify access privileges, and assign administration permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          disabled={loading || Boolean(updatingEmail)}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition disabled:opacity-50 cursor-pointer shadow-2xs"
        >
          <RotateCwIcon className={`h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Refreshing..." : "Refresh Directory"}</span>
        </button>
      </div>

      {error && <Alert message={error} type="error" />}
      {success && <Alert message={success} type="success" />}

      {/* Directory Metrics Strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] p-3.5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Users
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{users.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] p-3.5">
          <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Administrators
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-300">{adminCount}</p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] p-3.5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Standard Members
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-700 dark:text-slate-300">{memberCount}</p>
        </div>
      </div>

      {/* Search & Role Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] p-3">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="h-9 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] py-1.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-600 transition shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-600 transition cursor-pointer shadow-2xs"
          >
            <option value="">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="user">Members</option>
          </select>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            {filteredUsers.length} users
          </span>
        </div>
      </div>

      {/* User Directory Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22]">
        {loading && users.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            <p className="mt-2.5">Loading accounts...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400">
            No users match your search parameters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th scope="col" className="py-2.5 pl-4 pr-3">User Profile</th>
                  <th scope="col" className="px-3 py-2.5">Assigned Role</th>
                  <th scope="col" className="px-3 py-2.5">Joined Date</th>
                  <th scope="col" className="py-2.5 pl-3 pr-4 text-right">Modify Permission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
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
                      className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    >
                      {/* Name & Email */}
                      <td className="py-2.5 pl-4 pr-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar user={u} size="md" />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white truncate text-xs">
                              {u.name}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 truncate text-[11px]">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Current Role Badge */}
                      <td className="px-3 py-2.5">
                        <RoleBadge role={u.role} size="xs" />
                      </td>

                      {/* Joined Date */}
                      <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">
                        {formattedDate}
                      </td>

                      {/* Role Dropdown Selector */}
                      <td className="py-2.5 pl-3 pr-4 text-right">
                        <select
                          aria-label={`Role selector for ${u.email}`}
                          value={u.role}
                          disabled={loading || isUpdating}
                          onChange={(e) => handleRoleChange(u.email, e.target.value)}
                          className="h-8 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] px-2.5 py-1 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-600 transition cursor-pointer disabled:opacity-50"
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
