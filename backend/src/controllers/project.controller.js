const mongoose = require("mongoose");
const Project = require("../models/Project");
const User = require("../models/User");
const Task = require("../models/Task");
const Comment = require("../models/Comment");

const redis = require("../config/redis");

const {
  invalidateProjectRelatedCaches,
  PROJECT_CACHE_VERSION_KEY,
} = require("../utils/cache");

const projectPopulateFields = [
  { path: "owner", select: "name email" },
  { path: "members", select: "name email" },
  { path: "projectHead", select: "name email" },
];

// Create Project
const createProject = async (req, res) => {
  try {
    const allowedFields = ["name", "description", "projectHead"];

    const extraFields = Object.keys(req.body).filter(
      (key) => !allowedFields.includes(key),
    );

    if (extraFields.length > 0) {
      return res.status(400).json({
        message: "Unexpected fields are not allowed",
        fields: extraFields,
      });
    }

    const { name, description, projectHead } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 3 || trimmedName.length > 50) {
      return res.status(400).json({
        message: "Project name must be between 3 and 50 characters",
      });
    }

    if (!/^[\p{L}\p{N}][\p{L}\p{N}\s_-]*$/u.test(trimmedName)) {
      return res.status(400).json({
        message: "Project name contains invalid characters",
      });
    }

    if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({
        message: "Description must be a string",
      });
    }

    const trimmedDescription = description?.trim() || "";

    if (trimmedDescription.length > 500) {
      return res.status(400).json({
        message: "Description cannot exceed 500 characters",
      });
    }

    let headUserId = null;
    if (projectHead) {
      let headUser = null;
      if (mongoose.isValidObjectId(projectHead)) {
        headUser = await User.findById(projectHead).select("_id");
      } else if (typeof projectHead === "string" && projectHead.trim()) {
        headUser = await User.findOne({
          email: projectHead.trim().toLowerCase(),
        }).select("_id");
      }

      if (!headUser) {
        return res.status(404).json({
          message: "Project Head user not found",
        });
      }
      headUserId = headUser._id;
    }

    const project = await Project.create({
      name: trimmedName,
      description: trimmedDescription,
      owner: req.user.userId,
      projectHead: headUserId,
      members: [req.user.userId],
    });

    await project.populate(projectPopulateFields);

    await invalidateProjectRelatedCaches();

    return res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Create project error:", error);

    return res.status(500).json({
      message: "Failed to create project",
    });
  }
};

// Get Projects with Redis Cache

const getProjects = async (req, res) => {
  try {
    let version = 0;

    try {
      version = Number(await redis.get(PROJECT_CACHE_VERSION_KEY)) || 0;
    } catch (error) {
      console.error("Projects Redis version error:", error.message);
    }

    const cacheKey = `projects:v${version}:user:${req.user.userId}:role:${req.user.role}`;

    try {
      const cachedProjects = await redis.get(cacheKey);

      if (cachedProjects !== null) {
        console.log("Projects fetched from Redis");
        return res.status(200).json(cachedProjects);
      }

      console.log("Projects Redis cache miss");
    } catch (error) {
      console.error("Projects Redis cache read error:", error.message);
    }

    const isSuperAdmin = req.user.role === "superadmin";

    const filter = isSuperAdmin
      ? {}
      : {
        $or: [
          { owner: req.user.userId },
          { members: req.user.userId },
          { projectHead: req.user.userId },
        ],
      };

    const projects = await Project.find(filter)
      .populate(projectPopulateFields)
      .sort({ createdAt: -1 });

    const responseData = {
      count: projects.length,
      projects,
    };

    console.log("Projects fetched from MongoDB");

    try {
      const latestVersion =
        Number(await redis.get(PROJECT_CACHE_VERSION_KEY)) || 0;

      if (version === latestVersion) {
        await redis.set(cacheKey, responseData, { ex: 60 });
        console.log("Projects saved to Redis cache");
      }
    } catch (error) {
      console.error("Projects Redis cache write error:", error.message);
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Get projects error:", error);

    return res.status(500).json({
      message: "Failed to fetch projects",
    });
  }
};

// Update Project
const updateProject = async (req, res) => {
  try {
    const project = req.project;
    const { name, description, projectHead } = req.body;

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          message: "Project name cannot be empty",
        });
      }

      const trimmedName = name.trim();

      if (trimmedName.length < 3 || trimmedName.length > 50) {
        return res.status(400).json({
          message: "Project name must be between 3 and 50 characters",
        });
      }

      if (!/^[\p{L}\p{N}][\p{L}\p{N}\s_-]*$/u.test(trimmedName)) {
        return res.status(400).json({
          message: "Project name contains invalid characters",
        });
      }

      project.name = trimmedName;
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({
          message: "Description must be a string",
        });
      }

      const trimmedDescription = description.trim();

      if (trimmedDescription.length > 500) {
        return res.status(400).json({
          message: "Description cannot exceed 500 characters",
        });
      }

      project.description = trimmedDescription;
    }

    if (projectHead !== undefined) {
      if (projectHead === null || projectHead === "") {
        project.projectHead = null;
      } else {
        let headUser = null;
        if (mongoose.isValidObjectId(projectHead)) {
          headUser = await User.findById(projectHead).select("_id");
        } else if (typeof projectHead === "string" && projectHead.trim()) {
          headUser = await User.findOne({
            email: projectHead.trim().toLowerCase(),
          }).select("_id");
        }

        if (!headUser) {
          return res.status(404).json({
            message: "Project Head user not found",
          });
        }

        if (
          project.projectHead &&
          project.projectHead.toString() !== headUser._id.toString()
        ) {
          return res.status(400).json({
            message:
              "Project already has a Project Head. Remove the current Project Head before assigning a new one.",
          });
        }

        const isMember = project.members.some(
          (id) => (id._id || id).toString() === headUser._id.toString(),
        );

        if (!isMember) {
          return res.status(400).json({
            message: "Project Head must already be a member of this project",
          });
        }

        project.projectHead = headUser._id;
      }
    }

    await project.save();

    await project.populate(projectPopulateFields);

    await invalidateProjectRelatedCaches();

    return res.status(200).json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("Update project error:", error);

    return res.status(500).json({
      message: "Failed to update project",
    });
  }
};

// Delete Project
const deleteProject = async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === "superadmin";
    const isOwner =
      req.project &&
      req.project.owner &&
      req.project.owner.toString() === req.user.userId;

    if (!isSuperAdmin && !isOwner) {
      return res.status(403).json({
        message: "Only Super Admin or Project Owner can delete projects",
      });
    }

    const project = req.project;

    await Task.deleteMany({
      project: project._id,
    });

    await Comment.deleteMany({
      project: project._id,
    });

    await project.deleteOne();

    await invalidateProjectRelatedCaches();

    return res.status(200).json({
      message: "Project and its tasks deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);

    return res.status(500).json({
      message: "Failed to delete project",
    });
  }
};

// Add Project Member
const addProjectMember = async (req, res) => {
  try {
    const project = req.project;
    const { email } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        message: "Member email is required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("_id name email role");

    if (!user) {
      return res.status(404).json({
        message: "User not found. Please register them first",
      });
    }

    const userId = user._id.toString();

    const alreadyMember = project.members.some(
      (memberId) => memberId.toString() === userId,
    );

    if (alreadyMember) {
      return res.status(409).json({
        message: "User is already a project member",
      });
    }

    project.members.push(user._id);

    await project.save();

    await project.populate(projectPopulateFields);

    await invalidateProjectRelatedCaches();

    return res.status(200).json({
      message: "Project member added successfully",
      project,
    });
  } catch (error) {
    console.error("Add project member error:", error);

    return res.status(500).json({
      message: "Failed to add project member",
    });
  }
};

// Remove Project Member
const removeProjectMember = async (req, res) => {
  try {
    const project = req.project;
    const { memberId } = req.params;

    if (!mongoose.isValidObjectId(memberId)) {
      return res.status(400).json({
        message: "Invalid member ID",
      });
    }

    if (project.owner.toString() === memberId) {
      return res.status(400).json({
        message: "Project owner cannot be removed",
      });
    }

    const isMember = project.members.some((id) => id.toString() === memberId);

    if (!isMember) {
      return res.status(404).json({
        message: "Member not found in this project",
      });
    }

    project.members = project.members.filter(
      (id) => id.toString() !== memberId,
    );

    // If removed member was also projectHead, clear projectHead
    if (project.projectHead && project.projectHead.toString() === memberId) {
      project.projectHead = null;
    }

    await project.save();

    // Also unassign this member from any tasks in this project
    await Task.updateMany(
      { project: project._id },
      { $pull: { assignedTo: memberId } },
    );

    await project.populate(projectPopulateFields);

    await invalidateProjectRelatedCaches();

    return res.status(200).json({
      message: "Project member removed successfully",
      project,
    });
  } catch (error) {
    console.error("Remove project member error:", error);

    return res.status(500).json({
      message: "Failed to remove project member",
    });
  }
};

// Assign Project Head
const assignProjectHead = async (req, res) => {
  try {
    const project = req.project;
    const { email, userId } = req.body;

    if (project.projectHead) {
      return res.status(400).json({
        message:
          "Project already has a Project Head. Remove the current Project Head before assigning a new one.",
      });
    }

    let user = null;
    if (userId && mongoose.isValidObjectId(userId)) {
      user = await User.findById(userId).select("_id name email");
    } else if (typeof email === "string" && email.trim()) {
      user = await User.findOne({
        email: email.trim().toLowerCase(),
      }).select("_id name email");
    } else {
      return res.status(400).json({
        message: "Valid user ID or email is required to assign Project Head",
      });
    }

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMember = project.members.some(
      (id) => (id._id || id).toString() === user._id.toString(),
    );

    if (!isMember) {
      return res.status(400).json({
        message: "Project Head must already be a member of this project",
      });
    }

    project.projectHead = user._id;

    await project.save();

    await project.populate(projectPopulateFields);

    await invalidateProjectRelatedCaches();

    return res.status(200).json({
      message: "Project Head assigned successfully",
      project,
    });
  } catch (error) {
    console.error("Assign Project Head error:", error);

    return res.status(500).json({
      message: "Failed to assign Project Head",
    });
  }
};

// Remove Project Head
const removeProjectHead = async (req, res) => {
  try {
    const project = req.project;
    project.projectHead = null;

    await project.save();

    await project.populate(projectPopulateFields);

    await invalidateProjectRelatedCaches();

    return res.status(200).json({
      message: "Project Head removed successfully",
      project,
    });
  } catch (error) {
    console.error("Remove Project Head error:", error);

    return res.status(500).json({
      message: "Failed to remove Project Head",
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  assignProjectHead,
  removeProjectHead,
};
