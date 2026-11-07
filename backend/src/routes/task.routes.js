const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");

const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../controllers/task.controller");

router.post("/", authMiddleware, createTask);

router.get("/", authMiddleware, getTasks);

router.patch("/:taskId", authMiddleware, updateTask);

router.delete("/:taskId", authMiddleware, deleteTask);

module.exports = router;
