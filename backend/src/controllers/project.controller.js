const mongoose = require("mongoose");
const Project = require("../models/Project");
const User = require("../models/User");
const Task = require("../models/Task");
const getCurrentUser = async (userId) => {
  if (!mongoose.isValidObjectId(userId)) return null;

  return User.findById(userId).select("role");
};

const createProject = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req.user.userId);

    if (!currentUser) {
      return res.status(401).json({ message: "User not found" });
    }

    if (currentUser.role !== "admin") {
      return res.status(403).json({
        message: "Only Admin can create projects",
      });
    }

    // Allow only name and description
    const allowedFields = ["name", "description"];
    const extraFields = Object.keys(req.body).filter(
      (key) => !allowedFields.includes(key),
    );

    if (extraFields.length > 0) {
      return res.status(400).json({
        message: "Unexpected fields are not allowed",
        fields: extraFields,
      });
    }

    const { name, description } = req.body;

    // Validate name
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

    // Validate description
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

    const project = await Project.create({
      name: trimmedName,
      description: trimmedDescription,
      owner: req.user.userId,
      members: [req.user.userId],
    });

    await project.populate([
      { path: "owner", select: "name email" },
      { path: "members", select: "name email" },
    ]);

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

const getProjects = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req.user.userId);

    if (!currentUser) {
      return res.status(401).json({ message: "User not found" });
    }

    const filter =
      currentUser.role === "admin"
        ? {}
        : {
            $or: [{ owner: req.user.userId }, { members: req.user.userId }],
          };

    const projects = await Project.find(filter)
      .populate("owner", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);

    return res.status(500).json({
      message: "Failed to fetch projects",
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = req.project;
    const { name, description } = req.body;

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          message: "Project name cannot be empty",
        });
      }

      project.name = name.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({
          message: "Description must be a string",
        });
      }

      project.description = description.trim();
    }

    await project.save();

    await project.populate([
      { path: "owner", select: "name email" },
      { path: "members", select: "name email" },
    ]);

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

const deleteProject = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req.user.userId);

    if (!currentUser) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    if (currentUser.role !== "admin") {
      return res.status(403).json({
        message: "Only Admin can delete projects",
      });
    }

    const project = req.project;

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    await Task.deleteMany({
      project: project._id,
    });

    await project.deleteOne();

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
        message: "User not found. Please register first",
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

    await project.populate([
      { path: "owner", select: "name email" },
      { path: "members", select: "name email" },
    ]);

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

    await project.save();

    await project.populate([
      { path: "owner", select: "name email" },
      { path: "members", select: "name email" },
    ]);

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

module.exports = {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
};
