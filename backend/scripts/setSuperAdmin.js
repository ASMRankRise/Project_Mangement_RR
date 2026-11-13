require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../src/models/User");

async function setSuperAdmin() {
  try {
    const email = process.argv[2]?.trim().toLowerCase();

    if (!email) {
      console.log("Please provide a registered email: node scripts/setSuperAdmin.js <email>");
      process.exitCode = 1;
      return;
    }

    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI is not set in environment or .env file.");
      process.exitCode = 1;
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User '${email}' not found. Register this email first.`);
      process.exitCode = 1;
      return;
    }

    user.role = "superadmin";
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();

    console.log(`Success: ${user.email} (${user.name}) is now a Super Admin.`);
  } catch (error) {
    console.error("Error setting Super Admin:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

setSuperAdmin();

