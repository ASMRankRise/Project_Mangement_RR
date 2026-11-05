const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const requireRole = require("../middleware/role");
const requireProjectOwner = require("../middleware/project.middleware");

const {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
} = require("../controllers/project.controller");

router.post("/", authMiddleware, createProject);

router.get("/", authMiddleware, getProjects);

router.patch("/:projectId", authMiddleware, requireProjectOwner, updateProject);

router.delete(
  "/:projectId",
  authMiddleware,
  requireRole("admin"),
  requireProjectOwner,
  deleteProject,
);

router.post(
  "/:projectId/members",
  authMiddleware,
  requireProjectOwner,
  addProjectMember,
);

router.delete(
  "/:projectId/members/:memberId",
  authMiddleware,
  requireProjectOwner,
  removeProjectMember,
);

router.get("/admin-check", authMiddleware, requireRole("admin"), (req, res) => {
  return res.status(200).json({
    message: "Welcome Admin!",
  });
});

module.exports = router;
