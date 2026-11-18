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
  assignProjectHead,
  removeProjectHead,
} = require("../controllers/project.controller");

// Only Admin or Super Admin can create new projects
router.post("/", authMiddleware, requireRole("admin"), createProject);

router.get("/", authMiddleware, getProjects);

router.patch("/:projectId", authMiddleware, requireProjectOwner, updateProject);

router.delete(
  "/:projectId",
  authMiddleware,
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

router.post(
  "/:projectId/project-head",
  authMiddleware,
  requireProjectOwner,
  assignProjectHead,
);

router.delete(
  "/:projectId/project-head",
  authMiddleware,
  requireProjectOwner,
  removeProjectHead,
);

router.get("/admin-check", authMiddleware, requireRole("admin"), (req, res) => {
  return res.status(200).json({
    message: "Welcome Admin!",
  });
});

module.exports = router;
