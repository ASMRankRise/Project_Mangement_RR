export function getEntityId(entity) {
  if (!entity) return "";

  if (typeof entity === "object") {
    const val = entity._id || entity.id || entity.userId;
    if (val !== undefined && val !== null) return String(val).trim();

    if (
      typeof entity.toString === "function" &&
      entity.toString !== Object.prototype.toString
    ) {
      const s = entity.toString();
      if (s !== "[object Object]") return s.trim();
    }

    return "";
  }

  return String(entity).trim();
}

/**
 * Computes normalized task permissions across Super Admin, Project Owner, Project Head, and Member roles.
 *
 * Permission Hierarchy:
 * - Super Admin: Global task management across all projects (Create, Assign, Priority, Status, Edit, Delete).
 * - Project Owner: Full task management within their owned projects.
 * - Project Head: Full task management within their assigned project (Create, Assign, Priority, Status, Edit, Delete).
 * - Assigned Member: Status updates only for tasks assigned to them.
 * - Unassigned Member: No task update permissions.
 */
export function getTaskPermissions(task, project, user) {
  if (!task || !user) {
    return {
      canView: false,
      canChangeStatus: false,
      canChangePriority: false,
      canEditDetails: false,
      canDeleteTask: false,
      isSuperAdmin: false,
      isAdmin: false,
      isProjectOwner: false,
      isProjectHead: false,
      isAssigned: false,
    };
  }

  const currentUserId = getEntityId(user);
  const isSuperAdmin = user.role === "superadmin";
  const isAdmin = ["admin", "superadmin"].includes(user.role);

  const resolvedProject =
    project || (typeof task.project === "object" ? task.project : null);

  const ownerId = getEntityId(resolvedProject?.owner);
  const headId = getEntityId(resolvedProject?.projectHead);

  const isProjectOwner =
    currentUserId !== "" && ownerId !== "" && ownerId === currentUserId;

  const isProjectHead =
    currentUserId !== "" && headId !== "" && headId === currentUserId;

  const assignedUsers = Array.isArray(task.assignedTo)
    ? task.assignedTo
    : task.assignedTo
    ? [task.assignedTo]
    : [];

  const isAssigned =
    currentUserId !== "" &&
    assignedUsers.some((u) => getEntityId(u) === currentUserId);

  const canManageTask = isSuperAdmin || (isAdmin && isProjectOwner) || isProjectOwner || isProjectHead;

  return {
    isSuperAdmin,
    isAdmin,
    isProjectOwner,
    isProjectHead,
    isAssigned,
    canView: canManageTask || isAssigned,
    canChangeStatus: canManageTask || isAssigned,
    canChangePriority: canManageTask,
    canEditDetails: canManageTask,
    canDeleteTask: canManageTask,
  };
}
