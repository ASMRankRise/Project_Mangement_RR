const fs = require("fs");
const path = require("path");

const baseUrl = "{{baseUrl}}";

function createLoginItem(name, emailVar, passVar, storeUserIdVar) {
  const tests = [
    'pm.test("Status is 200 Login Successful", function () {',
    '    pm.response.to.have.status(200);',
    '});',
    'const res = pm.response.json();',
  ];
  if (storeUserIdVar) {
    tests.push(`if (res.user && res.user.id) { pm.environment.set("${storeUserIdVar}", res.user.id); }`);
  }

  return {
    name,
    request: {
      method: "POST",
      header: [{ key: "Content-Type", value: "application/json" }],
      body: {
        mode: "raw",
        raw: JSON.stringify({ email: `{{${emailVar}}}`, password: `{{${passVar}}}` }, null, 2),
      },
      url: {
        raw: `${baseUrl}/api/auth/login`,
        host: ["{{baseUrl}}"],
        path: ["api", "auth", "login"],
      },
    },
    event: [
      {
        listen: "test",
        script: {
          exec: tests,
          type: "text/javascript",
        },
      },
    ],
  };
}

function createRequestItem(name, method, urlPath, query, body, expectedStatus, testLines, preRequestLines) {
  const item = {
    name,
    request: {
      method,
      header: body ? [{ key: "Content-Type", value: "application/json" }] : [],
      url: {
        raw: `${baseUrl}/${urlPath}${query ? "?" + query : ""}`,
        host: ["{{baseUrl}}"],
        path: urlPath.split("/"),
        query: query
          ? query.split("&").map((q) => {
              const [k, v] = q.split("=");
              return { key: k, value: v };
            })
          : [],
      },
    },
    event: [],
  };

  if (body) {
    item.request.body = {
      mode: "raw",
      raw: typeof body === "string" ? body : JSON.stringify(body, null, 2),
    };
  }

  if (preRequestLines && preRequestLines.length > 0) {
    item.event.push({
      listen: "prerequest",
      script: {
        exec: preRequestLines,
        type: "text/javascript",
      },
    });
  }

  const execTests = [
    `pm.test("Status code is ${expectedStatus}", function () {`,
    `    pm.response.to.have.status(${expectedStatus});`,
    `});`,
    ...(testLines || []),
  ];

  item.event.push({
    listen: "test",
    script: {
      exec: execTests,
      type: "text/javascript",
    },
  });

  return item;
}

// Build the 7 suites
const folders = [
  {
    name: "Suite 1: Project Creation, Isolation & Dual-Role (TC-1.1 - TC-1.5)",
    item: [
      createLoginItem("Auth - Login as Admin A", "adminA_email", "adminA_password", "adminA_id"),
      createRequestItem(
        "TC-1.1: Admin A creates Project Alpha",
        "POST",
        "api/projects",
        "",
        { name: "Project Alpha", description: "Admin A primary project" },
        201,
        [
          'const res = pm.response.json();',
          'pm.test("Project object is returned", function () {',
          '    pm.expect(res.project).to.be.an("object");',
          '});',
          'if (res.project && res.project._id) {',
          '    pm.environment.set("proj_alpha_id", res.project._id);',
          '}',
        ]
      ),
      createRequestItem(
        "TC-1.2a: Admin A adds Admin B to Project Alpha",
        "POST",
        "api/projects/{{proj_alpha_id}}/members",
        "",
        { email: "{{adminB_email}}" },
        200,
        [
          'const res = pm.response.json();',
          'const member = res.project && res.project.members ? res.project.members.find(m => m.email === pm.environment.get("adminB_email")) : undefined;',
          'pm.test("Admin B is present in project members", function () {',
          '    pm.expect(member).to.not.be.undefined;',
          '});',
        ]
      ),
      createRequestItem(
        "TC-1.2b: Admin A adds Project Head to Project Alpha",
        "POST",
        "api/projects/{{proj_alpha_id}}/members",
        "",
        { email: "{{projectHead_email}}" },
        200
      ),
      createRequestItem(
        "TC-1.2c: Admin A adds Member A to Project Alpha",
        "POST",
        "api/projects/{{proj_alpha_id}}/members",
        "",
        { email: "{{memberA_email}}" },
        200,
        [
          'const res = pm.response.json();',
          'const member = res.project && res.project.members ? res.project.members.find(m => m.email === pm.environment.get("memberA_email")) : undefined;',
          'if (member) { pm.environment.set("memberA_id", member._id); }',
        ]
      ),
      createRequestItem(
        "TC-1.2d: Admin A adds Member B to Project Alpha",
        "POST",
        "api/projects/{{proj_alpha_id}}/members",
        "",
        { email: "{{memberB_email}}" },
        200
      ),
      createLoginItem("Auth - Login as Admin B", "adminB_email", "adminB_password", "adminB_id"),
      createRequestItem(
        "TC-1.3: Admin B creates Project Beta",
        "POST",
        "api/projects",
        "",
        { name: "Project Beta", description: "Admin B independently owned project" },
        201,
        [
          'const res = pm.response.json();',
          'pm.test("Project Beta object is returned", function () {',
          '    pm.expect(res.project).to.be.an("object");',
          '});',
          'if (res.project && res.project._id) {',
          '    pm.environment.set("proj_beta_id", res.project._id);',
          '}',
        ]
      ),
      createRequestItem(
        "TC-1.4: Admin B manages Project Beta (Owner Rights)",
        "PATCH",
        "api/projects/{{proj_beta_id}}",
        "",
        { name: "Project Beta - Updated", description: "Managed by Admin B" },
        200,
        [
          'const res = pm.response.json();',
          'pm.test("Project Beta name was updated by owner", function () {',
          '    pm.expect(res.project.name).to.eql("Project Beta - Updated");',
          '});',
        ]
      ),
      createRequestItem(
        "TC-1.5: Admin B attempts to manage Project Alpha (Member Restriction)",
        "PATCH",
        "api/projects/{{proj_alpha_id}}",
        "",
        { name: "Unauthorized Alpha Rename" },
        403,
        [
          'const res = pm.response.json();',
          'pm.test("Error message forbids non-owner management", function () {',
          '    pm.expect(res.message).to.include("permission to manage this project");',
          '});',
        ]
      ),
    ],
  },
  {
    name: "Suite 2: Admin B Task Assignment Isolation in Project Alpha (TC-2.1 - TC-2.3)",
    item: [
      createLoginItem("Auth - Login as Admin A", "adminA_email", "adminA_password"),
      createRequestItem(
        "TC-2.1: Admin A assigns task in Alpha to Admin B",
        "POST",
        "api/tasks",
        "",
        {
          title: "Review Alpha Architecture",
          description: "Strictly member task for Admin B",
          project: "{{proj_alpha_id}}",
          priority: "high",
          status: "todo",
          assignedTo: ["{{adminB_email}}"],
        },
        201,
        [
          'const res = pm.response.json();',
          'pm.test("Task object is returned", function () {',
          '    pm.expect(res.task).to.be.an("object");',
          '});',
          'if (res.task && res.task._id) {',
          '    pm.environment.set("task_alpha_adminB_id", res.task._id);',
          '}',
        ]
      ),
      createLoginItem("Auth - Login as Admin B", "adminB_email", "adminB_password"),
      createRequestItem(
        "TC-2.2: Admin B updates status on assigned task in Project Alpha",
        "PATCH",
        "api/tasks/{{task_alpha_adminB_id}}",
        "",
        { status: "in-progress" },
        200,
        [
          'const res = pm.response.json();',
          'pm.test("Task status successfully updated to in-progress", function () {',
          '    pm.expect(res.task.status).to.eql("in-progress");',
          '});',
        ]
      ),
      createRequestItem(
        "TC-2.3: Admin B blocked from editing title or priority on task in Project Alpha",
        "PATCH",
        "api/tasks/{{task_alpha_adminB_id}}",
        "",
        { title: "Admin B Overriding Title", priority: "low" },
        403,
        [
          'const res = pm.response.json();',
          'pm.test("Error message restricts member to status updates only", function () {',
          '    pm.expect(res.message).to.include("Members can only update task status");',
          '});',
        ]
      ),
    ],
  },
  {
    name: "Suite 3: Project Head Life Cycle & Privileges (TC-3.1 - TC-3.5)",
    item: [
      createLoginItem("Auth - Login as Admin A", "adminA_email", "adminA_password"),
      createRequestItem(
        "TC-3.1: Admin A assigns Project Head on Project Alpha",
        "POST",
        "api/projects/{{proj_alpha_id}}/project-head",
        "",
        { email: "{{projectHead_email}}" },
        200,
        [
          'const res = pm.response.json();',
          'pm.test("Project Head is assigned and matches configured email", function () {',
          '    pm.expect(res.project.projectHead).to.not.be.null;',
          '    pm.expect(res.project.projectHead.email).to.eql(pm.environment.get("projectHead_email"));',
          '});',
        ]
      ),
      createLoginItem("Auth - Login as Project Head", "projectHead_email", "projectHead_password"),
      createRequestItem(
        "TC-3.2: Project Head creates task without assignees",
        "POST",
        "api/tasks",
        "",
        {
          title: "Database Schema Audit",
          description: "Refactor slow indexes",
          project: "{{proj_alpha_id}}",
        },
        201,
        [
          'const res = pm.response.json();',
          'pm.test("Task created by Project Head with empty assignees and default low priority", function () {',
          '    pm.expect(res.task).to.be.an("object");',
          '    pm.expect(res.task.assignedTo).to.be.an("array").that.is.empty;',
          '    pm.expect(res.task.priority).to.eql("low");',
          '});',
          'if (res.task && res.task._id) {',
          '    pm.environment.set("task_alpha_2_id", res.task._id);',
          '}',
        ]
      ),
      createRequestItem(
        "TC-3.3a: Project Head blocked from assigning members",
        "POST",
        "api/tasks",
        "",
        {
          title: "Head Assign Attempt",
          project: "{{proj_alpha_id}}",
          assignedTo: ["{{memberA_email}}"],
        },
        403,
        [
          'const res = pm.response.json();',
          'pm.test("Error message forbids Project Head from assigning tasks", function () {',
          '    pm.expect(res.message).to.include("Project Heads cannot assign tasks");',
          '});',
        ]
      ),
      createRequestItem(
        "TC-3.3b: Project Head blocked from setting priority high",
        "POST",
        "api/tasks",
        "",
        {
          title: "Head High Priority Attempt",
          project: "{{proj_alpha_id}}",
          priority: "high",
        },
        403,
        [
          'const res = pm.response.json();',
          'pm.test("Error message forbids Project Head from setting task priority", function () {',
          '    pm.expect(res.message).to.include("Project Heads cannot set task priority");',
          '});',
        ]
      ),
      createRequestItem(
        "TC-3.3c: Project Head blocked from deleting task",
        "DELETE",
        "api/tasks/{{task_alpha_2_id}}",
        "",
        null,
        403,
        [
          'const res = pm.response.json();',
          'pm.test("Error message forbids Project Head from deleting tasks", function () {',
          '    pm.expect(res.message).to.include("Only Super Admin or Project Owner can delete tasks");',
          '});',
        ]
      ),
      createRequestItem(
        "TC-3.3d: Project Head blocked from managing members",
        "POST",
        "api/projects/{{proj_alpha_id}}/members",
        "",
        { email: "intruder@test.com" },
        403,
        [
          'const res = pm.response.json();',
          'pm.test("Error message forbids Project Head from managing project members", function () {',
          '    pm.expect(res.message).to.include("permission to manage this project");',
          '});',
        ]
      ),
      createLoginItem("Auth - Login as Admin A", "adminA_email", "adminA_password"),
      createRequestItem(
        "TC-3.4: Admin A removes Project Head",
        "DELETE",
        "api/projects/{{proj_alpha_id}}/project-head",
        "",
        null,
        200,
        [
          'const res = pm.response.json();',
          'pm.test("Project Head is cleared to null", function () {',
          '    pm.expect(res.project.projectHead).to.be.null;',
          '});',
        ]
      ),
      createLoginItem("Auth - Login as Project Head (Former Head)", "projectHead_email", "projectHead_password"),
      createRequestItem(
        "TC-3.5a: Former Head blocked from creating tasks",
        "POST",
        "api/tasks",
        "",
        { title: "Former Head Task", project: "{{proj_alpha_id}}" },
        403,
        [
          'const res = pm.response.json();',
          'pm.test("Error message forbids former Project Head from creating tasks", function () {',
          '    pm.expect(res.message).to.include("Only Project Owner, Project Head, or Super Admin can create tasks");',
          '});',
        ]
      ),
      createRequestItem(
        "TC-3.5b: Former Head preserves member project view",
        "GET",
        "api/projects",
        "",
        null,
        200,
        [
          'const res = pm.response.json();',
          'const p = res.projects && res.projects.find(x => x._id === pm.environment.get("proj_alpha_id"));',
          'pm.test("Former Head retains project visibility as member", function () {',
          '    pm.expect(p).to.not.be.undefined;',
          '});',
        ]
      ),
      createLoginItem("Auth - Login as Admin A", "adminA_email", "adminA_password"),
      createRequestItem(
        "Setup - Reassign Project Head on Alpha",
        "POST",
        "api/projects/{{proj_alpha_id}}/project-head",
        "",
        { email: "{{projectHead_email}}" },
        200
      ),
    ],
  },
  {
    name: "Suite 4: Member Removal & Cascade Access Revocation (TC-4.1 - TC-4.5)",
    item: [
      createLoginItem("Auth - Login as Admin A", "adminA_email", "adminA_password"),
      createRequestItem(
        "TC-4.1: Admin A creates task_alpha_1 assigned to Member A",
        "POST",
        "api/tasks",
        "",
        {
          title: "Confidential Security Patch",
          description: "Sensitive vulnerability patch details",
          project: "{{proj_alpha_id}}",
          assignedTo: ["{{memberA_email}}"],
          priority: "high",
          status: "todo",
        },
        201,
        [
          'const res = pm.response.json();',
          'pm.test("Task object returned successfully", function () {',
          '    pm.expect(res.task).to.be.an("object");',
          '});',
          'if (res.task && res.task._id) {',
          '    pm.environment.set("task_alpha_1_id", res.task._id);',
          '}',
        ]
      ),
      createRequestItem(
        "TC-4.2: Admin A posts comment on task_alpha_1",
        "POST",
        "api/tasks/{{task_alpha_1_id}}/comments",
        "",
        { content: "Critical fix needed by end of day." },
        201,
        [
          'const res = pm.response.json();',
          'pm.test("Comment object returned successfully", function () {',
          '    pm.expect(res.comment).to.be.an("object");',
          '});',
        ]
      ),
      createLoginItem("Auth - Login as Member A", "memberA_email", "memberA_password"),
      createRequestItem(
        "TC-4.3: Member A validates access BEFORE removal",
        "GET",
        "api/tasks/{{task_alpha_1_id}}",
        "",
        null,
        200,
        [
          'const res = pm.response.json();',
          'pm.test("Member A can access task before removal", function () {',
          '    pm.expect(res.task._id).to.eql(pm.environment.get("task_alpha_1_id"));',
          '});',
        ]
      ),
      createLoginItem("Auth - Login as Admin A", "adminA_email", "adminA_password"),
      createRequestItem(
        "TC-4.4: Admin A removes Member A from Project Alpha",
        "DELETE",
        "api/projects/{{proj_alpha_id}}/members/{{memberA_id}}",
        "",
        null,
        200,
        [
          'const res = pm.response.json();',
          'pm.test("Response confirms member removed successfully", function () {',
          '    pm.expect(res.message).to.include("removed successfully");',
          '});',
        ]
      ),
      createLoginItem("Auth - Login as Member A (Removed Member)", "memberA_email", "memberA_password"),
      createRequestItem(
        "TC-4.5a: Removed Member project list excludes Project Alpha",
        "GET",
        "api/projects",
        "",
        null,
        200,
        [
          'const res = pm.response.json();',
          'const found = res.projects && res.projects.find(p => p._id === pm.environment.get("proj_alpha_id"));',
          'pm.test("Project Alpha is not in removed member projects list", function () {',
          '    pm.expect(found).to.be.undefined;',
          '});',
        ]
      ),
      createRequestItem(
        "TC-4.5b: Removed Member blocked from Project Alpha task list",
        "GET",
        "api/tasks",
        "project={{proj_alpha_id}}",
        null,
        403,
        [
          'const res = pm.response.json();',
          'pm.test("Error message forbids viewing tasks from non-member project", function () {',
          '    pm.expect(res.message).to.include("You can only view tasks from projects you belong to");',
          '});',
        ]
      ),
      createRequestItem(
        "TC-4.5c: Removed Member blocked from task detail by ID",
        "GET",
        "api/tasks/{{task_alpha_1_id}}",
        "",
        null,
        403,
        [
          'const res = pm.response.json();',
          'pm.test("Error message forbids viewing task details after removal", function () {',
          '    pm.expect(res.message).to.include("You do not have permission to view this task");',
          '});',
        ]
      ),
      createRequestItem(
        "TC-4.5d: Removed Member blocked from task update",
        "PATCH",
        "api/tasks/{{task_alpha_1_id}}",
        "",
        { status: "completed" },
        403,
        [
          'const res = pm.response.json();',
          'pm.test("Error message forbids updating task when unassigned", function () {',
          '    pm.expect(res.message).to.include("You can only update tasks assigned to you");',
          '});',
        ]
      ),
      createRequestItem(
        "TC-4.5e: Removed Member blocked from reading task comments",
        "GET",
        "api/tasks/{{task_alpha_1_id}}/comments",
        "",
        null,
        403,
        [
          'const res = pm.response.json();',
          'pm.test("Error message forbids reading comments for unassigned tasks", function () {',
          '    pm.expect(res.message).to.include("Members can only view comments for tasks assigned to them");',
          '});',
        ]
      ),
      createLoginItem("Auth - Login as Admin A", "adminA_email", "adminA_password"),
      createRequestItem(
        "Setup - Re-add Member A to Alpha",
        "POST",
        "api/projects/{{proj_alpha_id}}/members",
        "",
        { email: "{{memberA_email}}" },
        200
      ),
      createRequestItem(
        "Setup - Re-assign task_alpha_1 to Member A",
        "PATCH",
        "api/tasks/{{task_alpha_1_id}}",
        "",
        { assignedTo: ["{{memberA_email}}"] },
        200
      ),
    ],
  },
  {
    name: "Suite 5: Deep JSON Sanitization Verification (TC-5.1 - TC-5.3)",
    item: [
      createLoginItem("Auth - Login as Member B", "memberB_email", "memberB_password"),
      createRequestItem(
        "TC-5.1: Unassigned Member B task list response field-by-field sanitization",
        "GET",
        "api/tasks",
        "project={{proj_alpha_id}}",
        null,
        200,
        [
          'const res = pm.response.json();',
          'const targetTask = res.tasks && res.tasks.find(t => t._id === pm.environment.get("task_alpha_1_id"));',
          'pm.test("Target task exists in list response", function () {',
          '    pm.expect(targetTask).to.not.be.undefined;',
          '});',
          'pm.test("Unassigned task description is masked", function () {',
          '    pm.expect(targetTask.description).to.eql("");',
          '});',
          'pm.test("Unassigned task assignees array is empty", function () {',
          '    pm.expect(targetTask.assignedTo).to.be.an("array").that.is.empty;',
          '});',
          'pm.test("Unassigned task creator is omitted", function () {',
          '    pm.expect(targetTask.createdBy).to.be.undefined;',
          '});',
          'pm.test("Unassigned task project exposes only sanitized fields", function () {',
          '    pm.expect(targetTask.project).to.be.an("object");',
          '    pm.expect(targetTask.project.owner).to.be.undefined;',
          '    pm.expect(targetTask.project.projectHead).to.be.undefined;',
          '    pm.expect(targetTask.project.members).to.be.undefined;',
          '});',
        ]
      ),
      createLoginItem("Auth - Login as Member A", "memberA_email", "memberA_password"),
      createRequestItem(
        "TC-5.2: Assigned Member A task detail response field-by-field sanitization",
        "GET",
        "api/tasks/{{task_alpha_1_id}}",
        "",
        null,
        200,
        [
          'const res = pm.response.json();',
          'const t = res.task;',
          'pm.test("Assigned task ID and non-empty description returned", function () {',
          '    pm.expect(t._id).to.eql(pm.environment.get("task_alpha_1_id"));',
          '    pm.expect(t.description).to.be.a("string").and.not.empty;',
          '});',
          'pm.test("Project object in task detail exposes only _id and name", function () {',
          '    pm.expect(t.project).to.have.all.keys("_id", "name");',
          '    pm.expect(t.project.members).to.be.undefined;',
          '    pm.expect(t.project.owner).to.be.undefined;',
          '    pm.expect(t.project.projectHead).to.be.undefined;',
          '});',
          'pm.test("Assignee exposes name but masks email", function () {',
          '    pm.expect(t.assignedTo[0].name).to.be.a("string");',
          '    pm.expect(t.assignedTo[0].email).to.be.undefined;',
          '});',
          'pm.test("Creator exposes name but masks email", function () {',
          '    pm.expect(t.createdBy.name).to.be.a("string");',
          '    pm.expect(t.createdBy.email).to.be.undefined;',
          '});',
        ]
      ),
      createLoginItem("Auth - Login as Member B", "memberB_email", "memberB_password"),
      createRequestItem(
        "TC-5.3: Unassigned Member B blocked from task detail by ID",
        "GET",
        "api/tasks/{{task_alpha_1_id}}",
        "",
        null,
        403,
        [
          'const res = pm.response.json();',
          'pm.test("Error message restricts task detail view to assignees only", function () {',
          '    pm.expect(res.message).to.include("Members can only view task details for tasks assigned to them");',
          '});',
        ]
      ),
    ],
  },
  {
    name: "Suite 6: Super Admin Omnipresent Management (TC-6.1 - TC-6.4)",
    item: [
      createLoginItem("Auth - Login as Super Admin", "superAdmin_email", "superAdmin_password"),
      createRequestItem(
        "TC-6.1: Super Admin updates Project Alpha without ownership",
        "PATCH",
        "api/projects/{{proj_alpha_id}}",
        "",
        { name: "Project Alpha (Super Admin Supervised)" },
        200,
        [
          'const res = pm.response.json();',
          'pm.test("Super Admin successfully updated Project Alpha name", function () {',
          '    pm.expect(res.project.name).to.eql("Project Alpha (Super Admin Supervised)");',
          '});',
        ]
      ),
      createRequestItem(
        "TC-6.2: Super Admin assigns Project Head on Project Alpha",
        "POST",
        "api/projects/{{proj_alpha_id}}/project-head",
        "",
        { email: "{{projectHead_email}}" },
        200,
        [
          'const res = pm.response.json();',
          'pm.test("Super Admin successfully assigned Project Head", function () {',
          '    pm.expect(res.project.projectHead).to.not.be.null;',
          '});',
        ]
      ),
      createRequestItem(
        "TC-6.3a: Super Admin creates task in Project Alpha",
        "POST",
        "api/tasks",
        "",
        {
          title: "Super Admin Inspection Task",
          project: "{{proj_alpha_id}}",
          assignToAll: true,
        },
        201,
        [
          'const res = pm.response.json();',
          'pm.test("Super Admin task created successfully", function () {',
          '    pm.expect(res.task).to.be.an("object");',
          '});',
          'if (res.task && res.task._id) {',
          '    pm.environment.set("super_task_id", res.task._id);',
          '}',
        ]
      ),
      createRequestItem(
        "TC-6.3b: Super Admin updates task content and priority",
        "PATCH",
        "api/tasks/{{super_task_id}}",
        "",
        { priority: "high", title: "Super Admin Task - Edited" },
        200,
        [
          'const res = pm.response.json();',
          'pm.test("Super Admin task priority updated to high", function () {',
          '    pm.expect(res.task.priority).to.eql("high");',
          '});',
        ]
      ),
      createRequestItem(
        "TC-6.3c: Super Admin deletes task",
        "DELETE",
        "api/tasks/{{super_task_id}}",
        "",
        null,
        200,
        [
          'const res = pm.response.json();',
          'pm.test("Response confirms task deleted successfully", function () {',
          '    pm.expect(res.message).to.include("Task deleted successfully");',
          '});',
        ]
      ),
      createRequestItem(
        "TC-6.4: Super Admin views global dashboard",
        "GET",
        "api/dashboard",
        "",
        null,
        200,
        [
          'const res = pm.response.json();',
          'pm.test("Global dashboard summary contains positive totals", function () {',
          '    pm.expect(res.summary.totalProjects).to.be.at.least(1);',
          '    pm.expect(res.summary.totalTasks).to.be.at.least(1);',
          '    pm.expect(res.summary.totalUsers).to.be.at.least(1);',
          '});',
        ]
      ),
    ],
  },
  {
    name: "Suite 7: Existing Normal Owner Backward Compatibility (TC-7.1 - TC-7.4)",
    item: [
      createLoginItem("Auth - Login as Existing Normal Owner", "legacyOwner_email", "legacyOwner_password"),
      createRequestItem(
        "TC-7.1: Existing Normal Owner updates Project Legacy",
        "PATCH",
        "api/projects/{{proj_legacy_id}}",
        "",
        { description: "Legacy project verified operational" },
        200,
        [
          'const res = pm.response.json();',
          'pm.test("Legacy owner successfully updated project description", function () {',
          '    pm.expect(res.project.description).to.eql("Legacy project verified operational");',
          '});',
        ]
      ),
      createRequestItem(
        "TC-7.2: Existing Normal Owner creates task in Project Legacy",
        "POST",
        "api/tasks",
        "",
        {
          title: "Legacy Maintenance Task",
          project: "{{proj_legacy_id}}",
          assignToAll: true,
        },
        201,
        [
          'const res = pm.response.json();',
          'pm.test("Legacy owner created task successfully", function () {',
          '    pm.expect(res.task).to.be.an("object");',
          '});',
          'if (res.task && res.task._id) {',
          '    pm.environment.set("legacy_task_id", res.task._id);',
          '}',
        ]
      ),
      createRequestItem(
        "TC-7.3: Existing Normal Owner deletes task in Project Legacy",
        "DELETE",
        "api/tasks/{{legacy_task_id}}",
        "",
        null,
        200,
        [
          'const res = pm.response.json();',
          'pm.test("Legacy owner deleted task successfully", function () {',
          '    pm.expect(res.message).to.include("Task deleted successfully");',
          '});',
        ]
      ),
      createRequestItem(
        "TC-7.4: Existing Normal Owner blocked from creating new project",
        "POST",
        "api/projects",
        "",
        { name: "Unauthorized New Project" },
        403,
        [
          'const res = pm.response.json();',
          'pm.test("Error message forbids normal user from creating new project", function () {',
          '    pm.expect(res.message).to.include("You are not allowed to access this resource");',
          '});',
        ]
      ),
    ],
  },
];

const collection = {
  info: {
    _postman_id: "c4608c70-692a-4db5-b3e3-784860b73199",
    name: "Mini Project - Permission Hierarchy Test Suite (29 Cases)",
    description: "Automated API integration test suite validating the four-level permission hierarchy (SuperAdmin, Admin, ProjectHead, Member).",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  item: folders,
};

const environment = {
  id: "e1a90c23-5e91-4d32-b7e1-87291a03f472",
  name: "Mini Project - Local Environment",
  values: [
    { key: "baseUrl", value: "http://localhost:5000", enabled: true },
    { key: "superAdmin_email", value: "superadmin@test.com", enabled: true },
    { key: "superAdmin_password", value: "Password123!", enabled: true },
    { key: "adminA_email", value: "adminA@test.com", enabled: true },
    { key: "adminA_password", value: "Password123!", enabled: true },
    { key: "adminB_email", value: "adminB@test.com", enabled: true },
    { key: "adminB_password", value: "Password123!", enabled: true },
    { key: "projectHead_email", value: "head@test.com", enabled: true },
    { key: "projectHead_password", value: "Password123!", enabled: true },
    { key: "memberA_email", value: "memberA@test.com", enabled: true },
    { key: "memberA_password", value: "Password123!", enabled: true },
    { key: "memberB_email", value: "memberB@test.com", enabled: true },
    { key: "memberB_password", value: "Password123!", enabled: true },
    { key: "legacyOwner_email", value: "legacy_owner@test.com", enabled: true },
    { key: "legacyOwner_password", value: "Password123!", enabled: true },
    { key: "proj_legacy_id", value: "", enabled: true },
    { key: "proj_alpha_id", value: "", enabled: true },
    { key: "proj_beta_id", value: "", enabled: true },
    { key: "adminA_id", value: "", enabled: true },
    { key: "adminB_id", value: "", enabled: true },
    { key: "memberA_id", value: "", enabled: true },
    { key: "task_alpha_1_id", value: "", enabled: true },
    { key: "task_alpha_2_id", value: "", enabled: true },
    { key: "task_alpha_adminB_id", value: "", enabled: true },
    { key: "super_task_id", value: "", enabled: true },
    { key: "legacy_task_id", value: "", enabled: true },
  ],
  _postman_variable_scope: "environment",
};

const outputDir = path.join(__dirname);
fs.writeFileSync(
  path.join(outputDir, "Permission_Hierarchy.postman_collection.json"),
  JSON.stringify(collection, null, 2)
);
fs.writeFileSync(
  path.join(outputDir, "Permission_Hierarchy.postman_environment.json"),
  JSON.stringify(environment, null, 2)
);

console.log("Postman collection and environment files generated successfully in:", outputDir);
