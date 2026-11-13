import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import { Avatar } from "../common/Avatar";
import { RoleBadge } from "../common/Badge";
import Alert from "../common/Alert";
import Modal from "../common/Modal";
import {
  SearchIcon,
  RotateCwIcon,
  TableIcon,
  GridIcon,
  MailIcon,
  CalendarIcon,
  ShieldIcon,
  CopyIcon,
  CheckCircleIcon,
  UserIcon,
} from "../common/Icons";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

export function ManageUsers() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === "superadmin";

  const { success: toastSuccess, error: toastError } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingEmail, setUpdatingEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" | "cards"
  const [selectedUser, setSelectedUser] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.get("/admin/users");
      setUsers(Array.isArray(response.data?.users) ? response.data.users : []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to fetch employee directory.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (email, newRole) => {
    if (!isSuperAdmin) {
      toastError("Only Super Admin can change user roles.");
      return;
    }

    const targetUser = users.find((user) => user.email === email);
    if (!targetUser) return;

    if (targetUser.role === "superadmin") {
      toastError("Super Admin accounts cannot be modified.");
      return;
    }

    if (targetUser.email === currentUser?.email) {
      toastError("You cannot modify your own role.");
      return;
    }

    if (!["admin", "user"].includes(newRole)) {
      toastError("Invalid role selected. Only Admin or Employee can be assigned.");
      return;
    }

    if (targetUser.role === newRole) return;

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

      // If this user is open in modal, update modal state
      if (selectedUser && selectedUser.email === email) {
        setSelectedUser((prev) => ({ ...prev, role: updatedRole }));
      }

      const msg = `${targetUser.name || email}'s role was updated to ${
        updatedRole === "admin" ? "Administrator" : "Employee"
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

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    toastSuccess("Email copied to clipboard");
    setTimeout(() => setCopiedEmail(""), 2000);
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

  const superAdminCount = users.filter((u) => u.role === "superadmin").length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const employeeCount = users.filter((u) => u.role === "user").length;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            <span>Organization Workforce</span>
          </div>
          <h1 className="mt-1.5 text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Employee Directory
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Browse company employees, inspect profile details, and manage system access privileges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              title="Table View"
              className={`rounded p-1.5 transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white shadow-2xs"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              title="Card Directory View"
              className={`rounded p-1.5 transition cursor-pointer ${
                viewMode === "cards"
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white shadow-2xs"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <GridIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading || Boolean(updatingEmail)}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            <RotateCwIcon
              className={`h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 ${loading ? "animate-spin" : ""}`}
            />
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {error && <Alert message={error} type="error" />}
      {success && <Alert message={success} type="success" />}

      {/* Directory Metrics Strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] p-3.5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Workforce
          </p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {users.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Registered accounts</span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] p-3.5">
          <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Leadership & Admins
          </p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
              {superAdminCount + adminCount}
            </span>
            <span className="text-xs text-indigo-600/70 dark:text-indigo-400/70 font-medium">
              {superAdminCount > 0 ? `${superAdminCount} Super · ` : ""}{adminCount} Admin
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] p-3.5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Team Staff
          </p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-700 dark:text-slate-300">
              {employeeCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Standard members</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] p-3">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees by name or email..."
            className="h-9 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] py-1.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-600 transition shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-600 transition cursor-pointer shadow-2xs"
          >
            <option value="">All Roles ({users.length})</option>
            {superAdminCount > 0 && (
              <option value="superadmin">Super Admins ({superAdminCount})</option>
            )}
            <option value="admin">Administrators ({adminCount})</option>
            <option value="user">Employees ({employeeCount})</option>
          </select>

          <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Showing {filteredUsers.length} of {users.length}
          </span>
        </div>
      </div>

      {/* Employee List Presentation */}
      {loading && users.length === 0 ? (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] p-12 text-center text-xs text-slate-500 dark:text-slate-400">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <p className="mt-2.5 font-medium">Loading employee roster...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#161B22] p-12 text-center text-xs text-slate-500 dark:text-slate-400">
          <UserIcon className="mx-auto h-8 w-8 text-slate-400 mb-2 opacity-60" />
          <p className="font-semibold text-slate-800 dark:text-slate-200">No employees found</p>
          <p className="mt-0.5">Try adjusting your search query or role filter.</p>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th scope="col" className="py-2.5 pl-4 pr-3">Employee</th>
                  <th scope="col" className="px-3 py-2.5">System Role</th>
                  <th scope="col" className="px-3 py-2.5">Joined Date</th>
                  <th scope="col" className="px-3 py-2.5">Role Permission</th>
                  <th scope="col" className="py-2.5 pl-3 pr-4 text-right">Profile</th>
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
                    : "—";

                  return (
                    <tr
                      key={u._id}
                      className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    >
                      {/* Name & Email */}
                      <td className="py-3 pl-4 pr-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar user={u} size="md" />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white truncate text-xs">
                              {u.name}
                            </p>
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                              <span className="truncate">{u.email}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyEmail(u.email)}
                                title="Copy email"
                                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                              >
                                {copiedEmail === u.email ? (
                                  <CheckCircleIcon className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <CopyIcon className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Current Role Badge */}
                      <td className="px-3 py-3">
                        <RoleBadge role={u.role} size="xs" />
                      </td>

                      {/* Joined Date */}
                      <td className="px-3 py-3 text-slate-500 dark:text-slate-400">
                        {formattedDate}
                      </td>

                      {/* Role Dropdown Selector */}
                      <td className="px-3 py-3">
                        {!isSuperAdmin ? (
                          <div className="flex items-center gap-1.5">
                            <RoleBadge role={u.role} size="xs" />
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                              (Protected)
                            </span>
                          </div>
                        ) : u.role === "superadmin" ? (
                          <div className="flex items-center gap-1.5">
                            <RoleBadge role="superadmin" size="xs" />
                            <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                              Root
                            </span>
                          </div>
                        ) : u.email === currentUser?.email ? (
                          <div className="flex items-center gap-1.5">
                            <RoleBadge role={u.role} size="xs" />
                            <span className="text-[10px] text-slate-400 italic">
                              (You)
                            </span>
                          </div>
                        ) : (
                          <select
                            aria-label={`Role selector for ${u.email}`}
                            value={u.role}
                            disabled={loading || isUpdating}
                            onChange={(e) => handleRoleChange(u.email, e.target.value)}
                            className="h-8 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] px-2.5 py-1 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-600 transition cursor-pointer disabled:opacity-50"
                          >
                            <option value="user">Employee</option>
                            <option value="admin">Administrator</option>
                          </select>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 pl-3 pr-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedUser(u)}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer shadow-2xs"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* DIRECTORY CARDS VIEW (Rippling / Deel style) */
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredUsers.map((u) => {
            const isUpdating = updatingEmail === u.email;
            const formattedDate = u.createdAt
              ? new Date(u.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "—";

            return (
              <div
                key={u._id}
                className="group flex flex-col justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] p-4 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-2xs text-left"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Avatar user={u} size="lg" />
                    <RoleBadge role={u.role} size="xs" />
                  </div>

                  <div className="mt-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                      {u.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <MailIcon className="h-3 w-3 shrink-0 text-slate-400" />
                      <span className="truncate">{u.email}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyEmail(u.email);
                        }}
                        title="Copy email"
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5"
                      >
                        {copiedEmail === u.email ? (
                          <CheckCircleIcon className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <CopyIcon className="h-3 w-3" />
                        )}
                      </button>
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                      <CalendarIcon className="h-3 w-3" />
                      <span>Member since {formattedDate}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  {!isSuperAdmin ? (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      Managed by Super Admin
                    </span>
                  ) : u.role === "superadmin" ? (
                    <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                      Super Admin (Root)
                    </span>
                  ) : u.email === currentUser?.email ? (
                    <span className="text-[10px] text-slate-400 italic">Your Account</span>
                  ) : (
                    <select
                      aria-label={`Role selector for ${u.email}`}
                      value={u.role}
                      disabled={loading || isUpdating}
                      onChange={(e) => handleRoleChange(u.email, e.target.value)}
                      className="h-7 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2 text-[11px] text-slate-900 dark:text-white outline-none focus:border-indigo-600 transition cursor-pointer disabled:opacity-50"
                    >
                      <option value="user">Employee</option>
                      <option value="admin">Admin</option>
                    </select>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedUser(u)}
                    className="h-7 inline-flex items-center rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
                  >
                    Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Employee Details Modal */}
      {selectedUser && (
        <Modal
          isOpen={Boolean(selectedUser)}
          onClose={() => setSelectedUser(null)}
          title="Employee Profile"
          subtitle="Workforce profile record and administrative privileges"
          size="md"
        >
          <div className="space-y-4">
            {/* Profile Overview */}
            <div className="flex items-center gap-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4">
              <Avatar user={selectedUser} size="xl" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {selectedUser.name}
                  </h3>
                  <RoleBadge role={selectedUser.role} size="xs" />
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <span className="truncate">{selectedUser.email}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyEmail(selectedUser.email)}
                    title="Copy email"
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    {copiedEmail === selectedUser.email ? (
                      <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <CopyIcon className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Employment Record Details */}
            <div className="space-y-2.5 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Workforce Credentials
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">System Account ID</span>
                  <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                    {selectedUser._id}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Onboarding Date</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium block mt-0.5">
                    {selectedUser.createdAt
                      ? new Date(selectedUser.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Not available"}
                  </span>
                </div>
              </div>
            </div>

            {/* Privilege & Role Governance */}
            <div className="space-y-2.5 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <ShieldIcon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Access Permissions</span>
                  </h4>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {selectedUser.role === "superadmin"
                      ? "Root governance control: system-wide authority to manage roles, elevate administrators, and oversee all organizational operations."
                      : selectedUser.role === "admin"
                      ? "Full administrative control: oversee employee directory, create team projects, and review company deliverables."
                      : "Standard employee access: collaborate on assigned team projects, update task statuses, and view organizational deliverables."}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  System Role Status
                </span>
                {isSuperAdmin &&
                selectedUser.role !== "superadmin" &&
                selectedUser.email !== currentUser?.email ? (
                  <select
                    aria-label="Update Role in Profile Modal"
                    value={selectedUser.role}
                    disabled={loading || updatingEmail === selectedUser.email}
                    onChange={(e) => handleRoleChange(selectedUser.email, e.target.value)}
                    className="h-8 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] px-2.5 py-1 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-600 transition cursor-pointer"
                  >
                    <option value="user">Standard Employee</option>
                    <option value="admin">System Administrator</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <RoleBadge role={selectedUser.role} size="xs" />
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      {selectedUser.role === "superadmin"
                        ? "(Root Account)"
                        : selectedUser.email === currentUser?.email
                        ? "(Your Account)"
                        : "(Managed by Super Admin)"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="h-8 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ManageUsers;
