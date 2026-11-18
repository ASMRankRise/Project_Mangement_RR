
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

export function getTaskPermissions(task, project, user) {
  if (!task || !user) {
    return {
      canView: false,
      canChangeStatus: false,
      canChangePriority: false,
      canEditDetails: false,
      canDeleteTask: false,
      isAdmin: false,
      isProjectOwner: false,
      isProjectHead: false,
    };
  }

  const currentUserId = getEntityId(user);
  const isAdmin = ["admin", "superadmin"].includes(user.role);

  const resolvedProject =
    project || (typeof task.project === "object" ? task.project : null);

  const ownerId = getEntityId(resolvedProject?.owner);
  const headId = getEntityId(resolvedProject?.projectHead);

  const isProjectOwner =
    currentUserId !== "" && ownerId !== "" && ownerId === currentUserId;

  const isProjectHead =
    currentUserId !== "" && headId !== "" && headId === currentUserId;

  const canManageTask = isAdmin || isProjectOwner || isProjectHead;

  return {
    isAdmin,
    isProjectOwner,
    isProjectHead,
    canView: canManageTask,
    canChangeStatus: canManageTask,
    canChangePriority: canManageTask,
    canEditDetails: canManageTask,
    canDeleteTask: canManageTask,
  };
}
