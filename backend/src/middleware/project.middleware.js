const mongoose = require("mongoose");
const Project = require("../models/Project");
const User = require("../models/User");

const requireProjectOwner = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const user = await User.findById(req.user.userId).select("role");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    const isAdmin = user.role === "admin";
    const isOwner = project.owner.toString() === req.user.userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        message: "You do not have permission to manage this project",
      });
    }

    req.project = project;
    next();
  } catch (error) {
    console.error("Project permission error:", error);

    return res.status(500).json({
      message: "Server error while checking project permissions",
    });
  }
};

module.exports = requireProjectOwner;
