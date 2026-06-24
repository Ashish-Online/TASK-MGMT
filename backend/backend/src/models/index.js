import Organization from "./organization.model.js";
import Permission from "./permission.model.js";
import Role from "./role.model.js";
import RolePermission from "./rolePermission.model.js";
import User from "./user.model.js";
import Task from "./task.model.js";
import Notification from "./notification.model.js";
import TaskComment from "./taskComment.model.js";
import TaskActivity from "./taskActivity.model.js";
import TaskAttachment from "./taskAttachment.model.js";


/*
|--------------------------------------------------------------------------
| Organization ↔ Role
|--------------------------------------------------------------------------
*/

Organization.hasMany(Role, {
  foreignKey: "organizationId",
  as: "roles",
});

Role.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});

/*
|--------------------------------------------------------------------------
| Role ↔ Permission (many-to-many via RolePermission)
|--------------------------------------------------------------------------
*/

Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: "roleId",
  otherKey: "permissionId",
  as: "permissions",
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: "permissionId",
  otherKey: "roleId",
  as: "roles",
});

/*
|--------------------------------------------------------------------------
| Organization ↔ User
|--------------------------------------------------------------------------
*/

Organization.hasMany(User, {
  foreignKey: "organizationId",
  as: "users",
});

User.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});

/*
|--------------------------------------------------------------------------
| Role ↔ User
|--------------------------------------------------------------------------
*/

Role.hasMany(User, {
  foreignKey: "roleId",
  as: "users",
});

User.belongsTo(Role, {
  foreignKey: "roleId",
  as: "role",
});

/*
|--------------------------------------------------------------------------
| User ↔ Task — Assignee
|--------------------------------------------------------------------------
*/

User.hasMany(Task, {
  foreignKey: "assignedTo",
  as: "assignedTasks",
});

Task.belongsTo(User, {
  foreignKey: "assignedTo",
  as: "assignee",
});

/*
|--------------------------------------------------------------------------
| User ↔ Task — Creator
|--------------------------------------------------------------------------
*/

User.hasMany(Task, {
  foreignKey: "createdBy",
  as: "createdTasks",
});

Task.belongsTo(User, {
  foreignKey: "createdBy",
  as: "creator",
});

/*
|--------------------------------------------------------------------------
| User ↔ Task — Reviewer
|--------------------------------------------------------------------------
| FIX (BUG-7): This association was completely missing from the original
| models/index.js. task.service.js uses include: [{ model: User, as:
| "reviewer" }] in getTasksService and getTaskByIdService, which throws
| "reviewer is not associated to Task" Sequelize error at runtime,
| crashing GET /task and GET /task/:id for all users.
|--------------------------------------------------------------------------
*/

User.hasMany(Task, {
  foreignKey: "reviewerId",
  as: "reviewingTasks",
});

Task.belongsTo(User, {
  foreignKey: "reviewerId",
  as: "reviewer",
});

/*
|--------------------------------------------------------------------------
| User ↔ Notification
|--------------------------------------------------------------------------
*/

User.hasMany(Notification, {
  foreignKey: "userId",
  as: "notifications",
});

Notification.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

/*
|--------------------------------------------------------------------------
| Task ↔ TaskComment ↔ User
|--------------------------------------------------------------------------
*/

Task.hasMany(TaskComment, {
  foreignKey: "taskId",
  as: "comments",
});

TaskComment.belongsTo(Task, {
  foreignKey: "taskId",
  as: "task",
});

TaskComment.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

User.hasMany(TaskComment, {
  foreignKey: "userId",
  as: "comments",
});

/*
|--------------------------------------------------------------------------
| Task ↔ TaskActivity ↔ User
|--------------------------------------------------------------------------
*/

Task.hasMany(TaskActivity, {
  foreignKey: "taskId",
  as: "activities",
});

TaskActivity.belongsTo(Task, {
  foreignKey: "taskId",
  as: "task",
});

User.hasMany(TaskActivity, {
  foreignKey: "userId",
  as: "taskActivities",
});

TaskActivity.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

/*
|--------------------------------------------------------------------------
| Task ↔ TaskAttachment ↔ User
|--------------------------------------------------------------------------
| FIX (BUG-4): These associations were completely absent from the original
| models/index.js. Without them, any Sequelize eager-load that includes
| TaskAttachment via a Task (or vice versa) throws "TaskAttachment is not
| associated to Task". Also added uploadedBy → User association so
| attachment queries can include the uploader's details.
|--------------------------------------------------------------------------
*/

Task.hasMany(TaskAttachment, {
  foreignKey: "taskId",
  as: "attachments",
});

TaskAttachment.belongsTo(Task, {
  foreignKey: "taskId",
  as: "task",
});

TaskAttachment.belongsTo(User, {
  foreignKey: "uploadedBy",
  as: "uploader",
});

User.hasMany(TaskAttachment, {
  foreignKey: "uploadedBy",
  as: "uploadedAttachments",
});


export {
  Organization,
  Permission,
  Role,
  RolePermission,
  User,
  Task,
  Notification,
  TaskComment,
  TaskActivity,
  TaskAttachment,
};
