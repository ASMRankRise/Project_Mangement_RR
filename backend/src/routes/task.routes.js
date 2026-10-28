const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const requireRole = require("../middleware/role");

const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../controllers/task.controller");

router.post("/", authMiddleware, requireRole("admin"), createTask);

router.get("/", authMiddleware, getTasks);

router.patch("/:taskId", authMiddleware, updateTask);

router.delete("/:taskId", authMiddleware, requireRole("admin"), deleteTask);

module.exports = router;
