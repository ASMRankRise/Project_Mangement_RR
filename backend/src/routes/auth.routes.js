const express = require("express");
const { rateLimit } = require("express-rate-limit");

const router = express.Router();

const {
  register,
  login,
  refresh,
  logout,
  getMe,
} = require("../controllers/auth.controller");

const authMiddleware = require("../middleware/auth");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: {
    success: false,
    message: "Too many attempts. Please try again after 15 minutes.",
  },
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);

module.exports = router;
