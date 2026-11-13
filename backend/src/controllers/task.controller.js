const Task = require("../models/Task");

const Project = require("../models/Project");

const User = require("../models/User");

const mongoose = require("mongoose");

const validStatuses = ["todo", "in-progress", "completed", "testing", "done"];

const validPriorities = ["low", "medium", "high"];

const crypto = require("crypto");

const redis = require("../config/redis");

const {
  TASK_CACHE_VERSION_KEY,

  invalidateTaskRelatedCaches,
} = require("../utils/cache");

// CREATE TASK

// Admin, project owner, or project member

const createTask = async (req, res) => {
  try {
    const { userId, role } = req.user;

    const {
      title,

      description,

      status,

      priority,

      project: projectId,

      assignedTo,

      assignToAll,

      dueDate,
    } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    if (title.trim().length > 150) {
      return res.status(400).json({
        message: "Task title cannot exceed 150 characters",
      });
    }

    if (description && typeof description === "string" && description.trim().length > 1000) {
      return res.status(400).json({
        message: "Task description cannot exceed 1000 characters",
      });
    }

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({
        message: "Valid project ID is required",
      });
    }

    const foundProject = await Project.findById(projectId);

    if (!foundProject) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isAdmin = role === "admin" || role === "superadmin";
    const isOwner = foundProject.owner.toString() === userId.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        message: "Only Admin or Project Owner can create tasks",
      });
    }

    const taskStatus = status ?? "todo";

    const taskPriority = priority ?? "low";

    if (!validStatuses.includes(taskStatus)) {
      return res.status(400).json({
        message: "Invalid status",

        allowed: validStatuses,
      });
    }

    if (!validPriorities.includes(taskPriority)) {
      return res.status(400).json({
        message: "Invalid priority",

        allowed: validPriorities,
      });
    }

    let parsedDueDate = null;

    if (dueDate !== undefined && dueDate !== null && dueDate !== "") {
      parsedDueDate = new Date(dueDate);

      if (Number.isNaN(parsedDueDate.getTime())) {
        return res.status(400).json({
          message: "Invalid due date",
        });
      }
    }

    if (
      assignToAll !== true &&
      (!Array.isArray(assignedTo) || assignedTo.length === 0)
    ) {
      return res.status(400).json({
        message: "Please assign this task to at least one member",
      });
    }

    const eligibleIds = [
      foundProject.owner.toString(),

      ...foundProject.members.map((id) => id.toString()),
    ];

    const uniqueEligibleIds = [...new Set(eligibleIds)];

    let assignedUserIds = [];

    if (assignToAll === true) {
      assignedUserIds = uniqueEligibleIds;
    } else {
      if (!Array.isArray(assignedTo)) {
        return res.status(400).json({
          message: "Assigned users must be provided as an array",
        });
      }

      const emails = assignedTo.map((email) => {
        if (typeof email !== "string" || !email.trim()) {
          return null;
        }

        return email.trim().toLowerCase();
      });

      if (emails.some((email) => !email)) {
        return res.status(400).json({
          message: "Assigned user email is invalid",
        });
      }

      const uniqueEmails = [...new Set(emails)];

      const users = await User.find({
        email: { $in: uniqueEmails },
      }).select("_id email");

      if (users.length !== uniqueEmails.length) {
        return res.status(404).json({
          message: "One or more assigned users were not found",
        });
      }

      const invalidUser = users.find(
        (user) => !uniqueEligibleIds.includes(user._id.toString()),
      );

      if (invalidUser) {
        return res.status(400).json({
          message: "All assignees must belong to this project",
        });
      }

      assignedUserIds = users.map((user) => user._id);
    }

    if (assignedUserIds.length === 0) {
      return res.status(400).json({
        message: "Please assign this task to at least one member",
      });
    }

    const task = await Task.create({
      title: title.trim(),

      description: typeof description === "string" ? description.trim() : "",

      status: taskStatus,

      priority: taskPriority,

      project: foundProject._id,

      assignedTo: assignedUserIds,

      createdBy: userId,

      dueDate: parsedDueDate,
    });

    await task.populate([
      { path: "project", select: "name" },

      { path: "assignedTo", select: "name email" },

      { path: "createdBy", select: "name email" },
    ]);

    await invalidateTaskRelatedCaches();

    return res.status(201).json({
      message: "Task created successfully",

      task,
    });
  } catch (error) {
    console.error("Create task error:", error);

    return res.status(500).json({
      message: "Failed to create task",
    });
  }
};

// GET TASKS

const getTasks = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const {
      status,

      priority,

      search,

      assignedTo,

      page = 1,

      limit = 10,
    } = req.query;

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",

        allowed: validStatuses,
      });
    }

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        message: "Invalid priority",

        allowed: validPriorities,
      });
    }

    if (assignedTo && !mongoose.isValidObjectId(assignedTo)) {
      return res.status(400).json({
        message: "Invalid assigned user ID",
      });
    }

    const filter = {};

    const isAdmin = role === "admin" || role === "superadmin";

    if (!isAdmin) {
      const projects = await Project.find({
        $or: [{ owner: userId }, { members: userId }],
      }).select("_id");

      filter.project = {
        $in: projects.map((item) => item._id),
      };

      if (assignedTo) {
        if (assignedTo !== userId.toString()) {
          return res.status(403).json({
            message: "You can only view your own assigned tasks",
          });
        }
        filter.assignedTo = assignedTo;
      }
    } else if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    if (status) filter.status = status;

    if (priority) filter.priority = priority;

    if (search && search.trim()) {
      const escapedSearch = search

        .trim()

        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$and = [
        ...(filter.$and || []),

        {
          $or: [
            {
              title: {
                $regex: escapedSearch,

                $options: "i",
              },
            },

            {
              description: {
                $regex: escapedSearch,

                $options: "i",
              },
            },
          ],
        },
      ];
    }

    const pageNumber = Math.max(Number(page) || 1, 1);

    const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 100);

    const skip = (pageNumber - 1) * limitNumber;

    const cacheParams = {
      userId: userId.toString(),

      role: role,

      status: status || "",

      priority: priority || "",

      search: search?.trim() || "",

      assignedTo: assignedTo || "",

      page: pageNumber,

      limit: limitNumber,
    };

    const cacheHash = crypto

      .createHash("sha256")

      .update(JSON.stringify(cacheParams))

      .digest("hex");

    let cacheKey = null;

    let cacheVersion = null;

    try {
      cacheVersion = (await redis.get(TASK_CACHE_VERSION_KEY)) ?? 0;

      cacheKey = `tasks:v${cacheVersion}:user:${userId}:role:${role}:${cacheHash}`;

      const cachedTasks = await redis.get(cacheKey);

      if (cachedTasks !== null) {
        console.log("Tasks fetched from Redis");

        return res.status(200).json(cachedTasks);
      }

      console.log("Tasks cache miss");
    } catch (error) {
      console.error("Tasks Redis cache read error:", error);

      cacheKey = null;
    }

    const [tasks, totalTasks] = await Promise.all([
      Task.find(filter)

        .populate("project", "name")

        .populate("assignedTo", "name email")

        .populate("createdBy", "name email")

        .sort({ createdAt: -1 })

        .skip(skip)

        .limit(limitNumber),

      Task.countDocuments(filter),
    ]);

    const responseData = {
      count: tasks.length,

      totalTasks,

      currentPage: pageNumber,

      totalPages: Math.ceil(totalTasks / limitNumber),

      tasks,
    };

    if (cacheKey) {
      try {
        const latestVersion = (await redis.get(TASK_CACHE_VERSION_KEY)) ?? 0;

        if (String(latestVersion) === String(cacheVersion)) {
          await redis.set(cacheKey, responseData, {
            ex: 60,
          });
        }
      } catch (error) {
        console.error("Tasks Redis cache write error:", error);
      }
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Get tasks error:", error);

    return res.status(500).json({
      message: "Failed to fetch tasks",
    });
  }
};

// UPDATE TASK

const updateTask = async (req, res) => {
  try {
    const { userId, role } = req.user;

    const { taskId } = req.params;

    if (!mongoose.isValidObjectId(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isAdmin = role === "admin" || role === "superadmin";
    const isProjectOwner = project.owner.toString() === userId.toString();

    const isAssignedUser = task.assignedTo.some(
      (id) => id.toString() === userId.toString(),
    );

    if (!isAdmin && !isProjectOwner) {
      if (!isAssignedUser) {
        return res.status(403).json({
          message: "You can only update tasks assigned to you",
        });
      }

      const keys = Object.keys(req.body);

      const onlyStatus =
        keys.length === 1 &&
        keys[0] === "status" &&
        validStatuses.includes(req.body.status);

      if (!onlyStatus) {
        return res.status(403).json({
          message: "Members can only update task status",
        });
      }

      task.status = req.body.status;
    } else {
      const { title, description, status, priority, dueDate, assignedTo } =
        req.body;

      if (title !== undefined) {
        if (typeof title !== "string" || !title.trim()) {
          return res.status(400).json({
            message: "Task title cannot be empty",
          });
        }

        if (title.trim().length > 150) {
          return res.status(400).json({
            message: "Task title cannot exceed 150 characters",
          });
        }

        task.title = title.trim();
      }

      if (description !== undefined) {
        if (typeof description !== "string") {
          return res.status(400).json({
            message: "Description must be a string",
          });
        }

        if (description.trim().length > 1000) {
          return res.status(400).json({
            message: "Task description cannot exceed 1000 characters",
          });
        }

        task.description = description.trim();
      }

      if (status !== undefined) {
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            message: "Invalid status",
            allowed: validStatuses,
          });
        }

        task.status = status;
      }

      if (priority !== undefined) {
        if (!validPriorities.includes(priority)) {
          return res.status(400).json({
            message: "Invalid priority",
            allowed: validPriorities,
          });
        }

        task.priority = priority;
      }

      if (dueDate !== undefined) {
        if (dueDate === null || dueDate === "") {
          task.dueDate = null;
        } else {
          const parsedDueDate = new Date(dueDate);

          if (Number.isNaN(parsedDueDate.getTime())) {
            return res.status(400).json({
              message: "Invalid due date",
            });
          }

          task.dueDate = parsedDueDate;
        }
      }

      if (assignedTo !== undefined) {
        if (!Array.isArray(assignedTo) || assignedTo.length === 0) {
          return res.status(400).json({
            message: "At least one assignee is required",
          });
        }

        const eligibleIds = [
          project.owner.toString(),
          ...project.members.map((id) => id.toString()),
        ];

        const emails = assignedTo.map((email) =>
          typeof email === "string" ? email.trim().toLowerCase() : "",
        );

        if (emails.some((email) => !email)) {
          return res.status(400).json({
            message: "Assigned user email is invalid",
          });
        }

        const uniqueEmails = [...new Set(emails)];

        const users = await User.find({
          email: { $in: uniqueEmails },
        }).select("_id email");

        if (users.length !== uniqueEmails.length) {
          return res.status(404).json({
            message: "One or more assigned users were not found",
          });
        }

        if (users.some((user) => !eligibleIds.includes(user._id.toString()))) {
          return res.status(400).json({
            message: "All assignees must belong to this project",
          });
        }

        task.assignedTo = users.map((user) => user._id);
      }
    }

    await task.save();

    await invalidateTaskRelatedCaches();

    await task.populate([
      { path: "project", select: "name" },
      { path: "assignedTo", select: "name email" },
      { path: "createdBy", select: "name email" },
    ]);

    return res.status(200).json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("Update task error:", error);

    return res.status(500).json({
      message: "Failed to update task",
    });
  }
};

// DELETE TASK: ADMIN OR PROJECT OWNER

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!mongoose.isValidObjectId(taskId)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);
    const isAdmin =
      req.user.role === "admin" || req.user.role === "superadmin";
    const isProjectOwner =
      project && project.owner.toString() === req.user.userId;

    if (!isAdmin && !isProjectOwner) {
      return res.status(403).json({
        message: "Only Admin or Project Owner can delete tasks",
      });
    }

    await task.deleteOne();

    await invalidateTaskRelatedCaches();

    return res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    return res.status(500).json({
      message: "Failed to delete task",
    });
  }
};

module.exports = {
  createTask,

  getTasks,

  updateTask,

  deleteTask,
};
