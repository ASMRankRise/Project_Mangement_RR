const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const requireRole = require("../middleware/role");

const { getUsers, updateUserRole } = require("../controllers/admin.controller");

router.get("/users", authMiddleware, requireRole("admin"), getUsers);
router.patch(
  "/users/role",
  authMiddleware,
  requireRole("superadmin"),
  updateUserRole,
);

module.exports = router;
