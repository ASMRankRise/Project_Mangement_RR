require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User");
const Project = require("../src/models/Project");

const defaultPassword = "Password123!";

const testUsers = [
  { name: "Super Admin", email: "superadmin@test.com", role: "superadmin" },
  { name: "Admin A", email: "adminA@test.com", role: "admin" },
  { name: "Admin B", email: "adminB@test.com", role: "admin" },
  { name: "Project Head", email: "head@test.com", role: "user" },
  { name: "Member A", email: "memberA@test.com", role: "user" },
  { name: "Member B", email: "memberB@test.com", role: "user" },
  { name: "Legacy Owner", email: "legacy_owner@test.com", role: "user" },
];

async function setupTestUsers() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI is not set in environment or .env file.");
      process.exitCode = 1;
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    for (const u of testUsers) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = await User.create({
          name: u.name,
          email: u.email,
          password: hashedPassword,
          role: u.role,
        });
        console.log(`Created user: ${u.email} (Role: ${u.role})`);
      } else {
        user.role = u.role;
        user.password = hashedPassword;
        user.tokenVersion = (user.tokenVersion ?? 0) + 1;
        await user.save();
        console.log(`Updated user: ${u.email} (Role: ${u.role})`);
      }
    }

    // Ensure Legacy Project exists for legacy_owner@test.com
    const legacyOwner = await User.findOne({ email: "legacy_owner@test.com" });
    let legacyProject = await Project.findOne({ name: "Legacy Project", owner: legacyOwner._id });
    if (!legacyProject) {
      legacyProject = await Project.create({
        name: "Legacy Project",
        description: "Existing normal-user owned project created before restrictions",
        owner: legacyOwner._id,
        members: [legacyOwner._id],
      });
      console.log(`Created Legacy Project: ${legacyProject._id}`);
    } else {
      console.log(`Existing Legacy Project found: ${legacyProject._id}`);
    }

    console.log("\n=======================================================");
    console.log("TEST FIXTURE SETUP COMPLETE");
    console.log("=======================================================");
    console.log(`Copy this into Postman Environment 'proj_legacy_id': ${legacyProject._id}`);
    console.log(`Default password for all test users: ${defaultPassword}\n`);
  } catch (error) {
    console.error("Setup error:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

setupTestUsers();
