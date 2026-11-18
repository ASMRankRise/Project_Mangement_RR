const assert = require("assert");

console.log("\n=======================================================");
console.log("TESTING FRONTEND TASK PERMISSION LOGIC ON /tasks PAGE");
console.log("=======================================================\n");

// Replicate the exact helper logic from TasksPage.jsx and CreateTaskModal.jsx
const getEntityId = (entity) => {
  if (!entity) return "";
  if (typeof entity === "object") {
    return String(entity._id || entity.id || entity.userId || "").trim();
  }
  return String(entity).trim();
};

const canUserCreateTaskInProject = (project, user) => {
  if (!project || !user) return false;
  if (user.role === "superadmin") return true;

  const currentUserId = getEntityId(user);
  if (!currentUserId) return false;

  const ownerId = getEntityId(project.owner);
  const headId = getEntityId(project.projectHead);

  const isOwner = ownerId !== "" && ownerId === currentUserId;
  const isHead = headId !== "" && headId === currentUserId;

  return isOwner || isHead;
};

function getTasksPagePermittedProjects(projects, user, projectFilter = "") {
  const isSuperAdmin = user?.role === "superadmin";
  const permitted = isSuperAdmin
    ? projects
    : projects.filter((p) => canUserCreateTaskInProject(p, user));

  if (!projectFilter) return permitted;
  return permitted.filter((p) => getEntityId(p) === String(projectFilter));
}

// Test Fixtures
const superAdmin = { id: "user_sa", email: "superadmin@test.com", role: "superadmin" };
const adminA = { id: "user_adminA", email: "adminA@test.com", role: "admin" };
const adminB = { id: "user_adminB", email: "adminB@test.com", role: "admin" };
const head = { id: "user_head", email: "head@test.com", role: "user" };
const memberA = { id: "user_memA", email: "memberA@test.com", role: "user" };
const memberB = { id: "user_memB", email: "memberB@test.com", role: "user" };
const legacyOwner = { id: "user_legacy", email: "legacy_owner@test.com", role: "user" };

const projectA = {
  _id: "proj_A",
  name: "Project A",
  owner: { _id: "user_adminA", email: "adminA@test.com", name: "Admin A" },
  projectHead: { _id: "user_head", email: "head@test.com", name: "Project Head" },
  members: [
    { _id: "user_adminA", email: "adminA@test.com" },
    { _id: "user_adminB", email: "adminB@test.com" },
    { _id: "user_head", email: "head@test.com" },
    { _id: "user_memA", email: "memberA@test.com" },
    { _id: "user_memB", email: "memberB@test.com" },
  ],
};

const projectB = {
  _id: "proj_B",
  name: "Project B",
  owner: { _id: "user_adminB", email: "adminB@test.com", name: "Admin B" },
  projectHead: null,
  members: [
    { _id: "user_adminB", email: "adminB@test.com" },
  ],
};

const legacyProject = {
  _id: "proj_legacy",
  name: "Legacy Project",
  owner: { _id: "user_legacy", email: "legacy_owner@test.com", name: "Legacy Owner" },
  projectHead: null,
  members: [
    { _id: "user_legacy", email: "legacy_owner@test.com" },
  ],
};

const allProjects = [projectA, projectB, legacyProject];

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}: ${err.message}`);
  }
}

// 1. Super Admin
runTest("Super Admin: can create tasks across all projects", () => {
  const permitted = getTasksPagePermittedProjects(allProjects, superAdmin);
  assert.strictEqual(permitted.length, 3);
  const canCreate = permitted.length > 0;
  assert.strictEqual(canCreate, true);
});

// 2. Admin A (Project Owner of Project A)
runTest("Admin A: can create tasks in owned Project A", () => {
  const permitted = getTasksPagePermittedProjects(allProjects, adminA);
  assert.strictEqual(permitted.length, 1);
  assert.strictEqual(permitted[0]._id, "proj_A");
  assert.strictEqual(permitted.length > 0, true);
});

// 3. Admin B (Owner of Project B, Member in Project A)
runTest("Admin B: can create tasks in Project B (owned), but NOT in Project A (member)", () => {
  // Unfiltered: sees Project B permitted
  const permitted = getTasksPagePermittedProjects(allProjects, adminB);
  assert.strictEqual(permitted.length, 1);
  assert.strictEqual(permitted[0]._id, "proj_B");

  // Filtered by Project A (where Admin B is member):
  const filteredProjectA = getTasksPagePermittedProjects(allProjects, adminB, "proj_A");
  assert.strictEqual(filteredProjectA.length, 0, "Admin B cannot create tasks in Project A");

  // Filtered by Project B (where Admin B is owner):
  const filteredProjectB = getTasksPagePermittedProjects(allProjects, adminB, "proj_B");
  assert.strictEqual(filteredProjectB.length, 1, "Admin B can create tasks in Project B");
});

// 4. Project Head (head@test.com)
runTest("Project Head: can create tasks in assigned Project A", () => {
  const permitted = getTasksPagePermittedProjects(allProjects, head);
  assert.strictEqual(permitted.length, 1);
  assert.strictEqual(permitted[0]._id, "proj_A");
  assert.strictEqual(permitted.length > 0, true);
});

runTest("Project Head: cannot create tasks in Project B (not head)", () => {
  const filteredProjectB = getTasksPagePermittedProjects(allProjects, head, "proj_B");
  assert.strictEqual(filteredProjectB.length, 0);
});

// 5. Normal Member A (memberA@test.com)
runTest("Member A: CANNOT create tasks in Project A (New Task button hidden)", () => {
  const permitted = getTasksPagePermittedProjects(allProjects, memberA);
  assert.strictEqual(permitted.length, 0);
  const canCreate = permitted.length > 0;
  assert.strictEqual(canCreate, false);
});

// 6. Normal Member B (memberB@test.com)
runTest("Member B: CANNOT create tasks in Project A (New Task button hidden)", () => {
  const permitted = getTasksPagePermittedProjects(allProjects, memberB);
  assert.strictEqual(permitted.length, 0);
  const canCreate = permitted.length > 0;
  assert.strictEqual(canCreate, false);
});

// 7. Legacy Owner (role: 'user', owns Legacy Project)
runTest("Legacy Owner: retains task creation in own project despite role === 'user'", () => {
  const permitted = getTasksPagePermittedProjects(allProjects, legacyOwner);
  assert.strictEqual(permitted.length, 1);
  assert.strictEqual(permitted[0]._id, "proj_legacy");
  assert.strictEqual(permitted.length > 0, true);
});

// 8. Legacy Owner: cannot create tasks in Project A (not owner)
runTest("Legacy Owner: cannot create tasks in Project A", () => {
  const filteredProjectA = getTasksPagePermittedProjects(allProjects, legacyOwner, "proj_A");
  assert.strictEqual(filteredProjectA.length, 0);
});

// 9. Edge Cases: unauthenticated / null user / empty strings
runTest("Unauthenticated / empty user cannot create tasks in any project", () => {
  assert.strictEqual(canUserCreateTaskInProject(projectA, null), false);
  assert.strictEqual(canUserCreateTaskInProject(projectA, {}), false);
  assert.strictEqual(canUserCreateTaskInProject(projectA, { id: "" }), false);
  assert.strictEqual(canUserCreateTaskInProject(projectA, { id: "null" }), false);
});

// 10. Edge Cases: project with null/undefined projectHead and owner
runTest("Project with null head does not match empty/null userId", () => {
  const orphanProject = { _id: "p_orphan", owner: null, projectHead: null };
  assert.strictEqual(canUserCreateTaskInProject(orphanProject, memberA), false);
  assert.strictEqual(canUserCreateTaskInProject(orphanProject, { id: "" }), false);
  assert.strictEqual(canUserCreateTaskInProject(orphanProject, { id: null }), false);
});

console.log("\n=======================================================");
console.log(`RESULTS: ${passed}/${total} TESTS PASSED`);
console.log("=======================================================\n");

if (passed !== total) process.exit(1);
