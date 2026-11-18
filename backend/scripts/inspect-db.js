const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Project = mongoose.model("Project", new mongoose.Schema({}, { strict: false }));
  const User = mongoose.model("User", new mongoose.Schema({}, { strict: false }));
  const users = await User.find({}, "name email role");
  console.log("USERS:", users.map(u => ({ id: u._id.toString(), email: u.email, role: u.role })));
  const projs = await Project.find({});
  console.log("PROJECTS:", JSON.stringify(projs.map(p => ({
    id: p._id.toString(),
    name: p.name,
    owner: p.owner ? p.owner.toString() : null,
    head: p.projectHead ? p.projectHead.toString() : null,
    members: (p.members || []).map(m => m.toString())
  })), null, 2));
  await mongoose.disconnect();
}
check().catch(console.error);
