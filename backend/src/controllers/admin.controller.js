const User = require("../models/User");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Get all registered users
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("name email role createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Change a user's role
const updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        message: "Only Super Admin can change user roles",
      });
    }

    const { email, role } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      !["admin", "user"].includes(role)
    ) {
      return res.status(400).json({
        message: "Valid email and role (admin/user) are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found. Register them first.",
      });
    }

    if (user.role === "superadmin") {
      return res.status(403).json({
        message: "Super Admin accounts cannot be modified or demoted",
      });
    }

    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({
        message: "You cannot modify your own role",
      });
    }

    if (user.role === "admin" && role === "user") {
      const adminCount = await User.countDocuments({ role: "admin" });

      if (adminCount <= 1) {
        return res.status(400).json({
          message: "At least one Admin account must remain",
        });
      }
    }

    user.role = role;
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();

    return res.status(200).json({
      message: `User role updated to ${role}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update user role error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getUsers, updateUserRole };
