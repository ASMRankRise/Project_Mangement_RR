require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../src/models/User");

async function setAdmin() {
  try {
    const email = process.argv[2]?.trim().toLowerCase();

    if (!email) {
      console.log("Please provide a registered email.");
      process.exitCode = 1;
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found. Register this email first.");
      process.exitCode = 1;
      return;
    }

    user.role = "admin";
    await user.save();

    console.log(`${user.email} is now an Admin.`);
  } catch (error) {
    console.error("Error:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

setAdmin();
