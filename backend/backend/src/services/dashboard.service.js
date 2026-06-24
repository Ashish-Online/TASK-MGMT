import { Task, TaskActivity, User, Role, Permission, Notification } from "../models/index.js";
import { Op, Sequelize } from "sequelize";
import { PERMISSIONS } from "../constants/permissions.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// getDashboardOverviewService
export const getDashboardOverviewService = async (currentUser) => {
  const organizationId = currentUser.organizationId;

  const canViewAllTasks = currentUser.role.permissions.some(
    (permission) => permission.code === PERMISSIONS.VIEW_ALL_TASKS,
  );

  const where = { organizationId };

  if (!canViewAllTasks) {
    where.assignedTo = currentUser.id;
  }

  // Task stats + system counts in parallel
  const [
    totalTasks,
    completedTasks,
    inProgressTasks,
    pendingReviewTasks,
    rejectedTasks,
    totalUsers,
    totalRoles,
    totalPermissions,
    unreadNotifications,
  ] = await Promise.all([
    Task.count({ where }),
    Task.count({ where: { ...where, status: "APPROVED" } }),
    Task.count({ where: { ...where, status: "IN_PROGRESS" } }),
    Task.count({ where: { ...where, status: "REVIEW" } }),
    Task.count({ where: { ...where, status: "REJECTED" } }),
    User.count({ where: { organizationId, isActive: true } }),
    Role.count({ where: { organizationId } }),
    Permission.count({}),
    Notification.count({ where: { userId: currentUser.id, isRead: false } }),
  ]);

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    pendingReviewTasks,
    rejectedTasks,
    totalUsers,
    totalRoles,
    totalPermissions,
    unreadNotifications,
  };
};

// getRecentTasksService
export const getRecentTasksService = async (currentUser) => {
  const canViewAllTasks = currentUser.role.permissions.some(
    (p) => p.code === PERMISSIONS.VIEW_ALL_TASKS,
  );

  const where = {
    organizationId: currentUser.organizationId,
  };

  if (!canViewAllTasks) {
    where.assignedTo = currentUser.id;
  }

  const tasks = await Task.findAll({
    where,
    include: [
      {
        model: User,
        as: "assignee",
        attributes: ["id", "firstName", "lastName"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit: 10,
  });

  return tasks;
};

// getRecentActivitiesService
export const getRecentActivitiesService = async (currentUser) => {
  const activities = await TaskActivity.findAll({
    where: {
      organizationId: currentUser.organizationId,
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "firstName", "lastName"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit: 15,
  });

  return activities;
};

// getTaskStatusChartService
export const getTaskStatusChartService = async (currentUser) => {
  const canViewAllTasks = currentUser.role.permissions.some(
    (p) => p.code === PERMISSIONS.VIEW_ALL_TASKS,
  );

  const where = {
    organizationId: currentUser.organizationId,
  };

  if (!canViewAllTasks) {
    where.assignedTo = currentUser.id;
  }

  const data = await Task.findAll({
    where,
    attributes: [
      "status",
      [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
    ],
    group: ["status"],
  });

  /*
  |--------------------------------------------------------------------------
  | FORMAT RESPONSE FOR FRONTEND
  |--------------------------------------------------------------------------
  */

  const result = {};

  data.forEach((item) => {
    result[item.status] = Number(item.get("count"));
  });

  return result;
};

// getProductivityService
export const getProductivityService = async (currentUser) => {
  const canViewAllTasks = currentUser.role.permissions.some(
    (p) => p.code === PERMISSIONS.VIEW_ALL_TASKS,
  );

  const where = {
    organizationId: currentUser.organizationId,
  };

  if (!canViewAllTasks) {
    where.assignedTo = currentUser.id;
  }

  /*
  |--------------------------------------------------------------------------
  | OVERDUE TASKS
  |--------------------------------------------------------------------------
  */

  const overdueTasks = await Task.count({
    where: {
      ...where,
      dueDate: {
        [Op.lt]: new Date(),
      },
      status: {
        [Op.notIn]: ["COMPLETED", "APPROVED"],
      },
    },
  });

  /*
  |--------------------------------------------------------------------------
  | TOTAL TASKS
  |--------------------------------------------------------------------------
  */

  const totalTasks = await Task.count({ where });

  /*
  |--------------------------------------------------------------------------
  | COMPLETED TASKS
  |--------------------------------------------------------------------------
  */

  const completedTasks = await Task.count({
    where: {
      ...where,
      status: "APPROVED",
    },
  });

  /*
  |--------------------------------------------------------------------------
  | PRODUCTIVITY CALCULATION
  |--------------------------------------------------------------------------
  */

  const productivity =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  /*
  |--------------------------------------------------------------------------
  | RETURN RESPONSE
  |--------------------------------------------------------------------------
  */

  return {
    totalTasks,
    completedTasks,
    overdueTasks,
    productivityPercentage: productivity,
  };
};

// getTeamPerformanceService
export const getTeamPerformanceService = async (currentUser) => {
  const users = await User.findAll({
    where: {
      organizationId: currentUser.organizationId,
      isActive: true,
    },
    attributes: ["id", "firstName", "lastName"],
  });

  const result = [];

  for (const user of users) {
    const totalTasks = await Task.count({
      where: {
        assignedTo: user.id,
        organizationId: currentUser.organizationId,
        isActive: true,
      },
    });

    const approvedTasks = await Task.count({
      where: {
        assignedTo: user.id,
        organizationId: currentUser.organizationId,
        status: "APPROVED",
        isActive: true,
      },
    });

    const pendingTasks = await Task.count({
      where: {
        assignedTo: user.id,
        organizationId: currentUser.organizationId,
        status: ["TODO", "IN_PROGRESS", "COMPLETED"],
        isActive: true,
      },
    });

    const rejectedTasks = await Task.count({
      where: {
        assignedTo: user.id,
        organizationId: currentUser.organizationId,
        status: "REJECTED",
        isActive: true,
      },
    });

    result.push({
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`,
      totalTasks,
      approvedTasks,
      pendingTasks,
      rejectedTasks,
      productivity:
        totalTasks === 0 ? 0 : Math.round((approvedTasks / totalTasks) * 100),
      productivityPercentage:
        totalTasks === 0 ? 0 : Math.round((approvedTasks / totalTasks) * 100),
    });
  }

  return result.sort((a, b) => b.productivity - a.productivity);
};

// getPendingReviewsService
export const getPendingReviewsService = async (currentUser) => {
  const tasks = await Task.findAll({
    where: {
      organizationId: currentUser.organizationId,
      reviewerId: currentUser.id,
      status: "COMPLETED",
      isActive: true,
    },

    include: [
      {
        model: User,
        as: "assignee",
        attributes: ["id", "firstName", "lastName", "email"],
      },
    ],

    order: [["updatedAt", "DESC"]],
  });

  return {
    count: tasks.length,
    tasks,
  };
};

// getOverdueTasksService
export const getOverdueTasksService = async (currentUser) => {
  const canViewAllTasks = currentUser.role.permissions.some(
    (permission) => permission.code === PERMISSIONS.VIEW_ALL_TASKS,
  );

  const where = {
    organizationId: currentUser.organizationId,

    isActive: true,

    dueDate: {
      [Op.lt]: new Date(),
    },

    status: {
      [Op.notIn]: ["APPROVED"],
    },
  };

  /*
  |--------------------------------------------------------------------------
  | User Can View Only Own Tasks
  |--------------------------------------------------------------------------
  */

  if (!canViewAllTasks) {
    where.assignedTo = currentUser.id;
  }

  const tasks = await Task.findAll({
    where,

    include: [
      {
        model: User,
        as: "assignee",

        attributes: ["id", "firstName", "lastName", "email"],
      },

      {
        model: User,
        as: "reviewer",

        attributes: ["id", "firstName", "lastName", "email"],
      },
    ],

    order: [["dueDate", "ASC"]],
  });

  return {
    count: tasks.length,

    tasks,
  };
};

// getTaskPriorityChartService
export const getTaskPriorityChartService = async (currentUser) => {
  const canViewAllTasks = currentUser.role.permissions.some(
    (permission) => permission.code === PERMISSIONS.VIEW_ALL_TASKS,
  );

  const where = {
    organizationId: currentUser.organizationId,
    isActive: true,
  };

  /*
  |--------------------------------------------------------------------------
  | User vs Admin Data Scope
  |--------------------------------------------------------------------------
  */

  if (!canViewAllTasks) {
    where.assignedTo = currentUser.id;
  }

  const data = await Task.findAll({
    where,

    attributes: [
      "priority",
      [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
    ],

    group: ["priority"],
  });

  /*
  |--------------------------------------------------------------------------
  | Format Response
  |--------------------------------------------------------------------------
  */

  const result = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0,
  };

  data.forEach((item) => {
    result[item.priority] = Number(item.get("count"));
  });

  return result;
};

// getMonthlyTaskTrendService
export const getMonthlyTaskTrendService = async (currentUser) => {
  const canViewAllTasks = currentUser.role.permissions.some(
    (permission) => permission.code === PERMISSIONS.VIEW_ALL_TASKS,
  );

  const where = {
    organizationId: currentUser.organizationId,
    isActive: true,
  };

  /*
  |--------------------------------------------------------------------------
  | Scope Control
  |--------------------------------------------------------------------------
  */

  if (!canViewAllTasks) {
    where.assignedTo = currentUser.id;
  }

  const data = await Task.findAll({
    where,

    attributes: [
      [Sequelize.fn("MONTH", Sequelize.col("createdAt")), "month"],
      [Sequelize.fn("COUNT", Sequelize.col("id")), "totalTasks"],
    ],

    group: [Sequelize.fn("MONTH", Sequelize.col("createdAt"))],

    order: [[Sequelize.fn("MONTH", Sequelize.col("createdAt")), "ASC"]],
  });

  /*
  |--------------------------------------------------------------------------
  | Format Response
  |--------------------------------------------------------------------------
  */

 
  const result = Array(12).fill(0);

  data.forEach((item) => {
    const monthIndex = item.get("month") - 1;
    result[monthIndex] = Number(item.get("totalTasks"));
  });

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return result.map((count, i) => ({ month: months[i], count }));
  
};

// getTopPerformersService
export const getTopPerformersService = async (currentUser) => {
  const canViewAllTasks = currentUser.role.permissions.some(
    (permission) => permission.code === PERMISSIONS.VIEW_ALL_TASKS,
  );

  const users = await User.findAll({
    where: {
      organizationId: currentUser.organizationId,
      isActive: true,
    },
    attributes: ["id", "firstName", "lastName"],
  });

  const result = [];

  for (const user of users) {
    const where = {
      assignedTo: user.id,
      organizationId: currentUser.organizationId,
      isActive: true,
    };

    const total = await Task.count({ where });

    const completed = await Task.count({
      where: {
        ...where,
        status: "APPROVED",
      },
    });

    const rejected = await Task.count({
      where: {
        ...where,
        status: "REJECTED",
      },
    });

    const productivity =
      total === 0 ? 0 : Math.round((completed / total) * 100);

    result.push({
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      totalTasks: total,
      completedTasks: completed,
      rejectedTasks: rejected,
      productivity,
    });
  }

  return result.sort((a, b) => b.productivity - a.productivity).slice(0, 5);
};

//exportDashboardReportService
export const exportDashboardReportService = async (currentUser) => {
  const canViewAllTasks = currentUser.role.permissions.some(
    (permission) => permission.code === PERMISSIONS.VIEW_ALL_TASKS,
  );

  const where = {
    organizationId: currentUser.organizationId,
    isActive: true,
  };

  if (!canViewAllTasks) {
    where.assignedTo = currentUser.id;
  }

  const tasks = await Task.findAll({
    where,
    include: [
      {
        model: User,
        as: "assignee",
        attributes: ["firstName", "lastName"],
      },
    ],
  });

  /*
  |--------------------------------------------------------------------------
  | Create Excel Report
  |--------------------------------------------------------------------------
  */

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Dashboard Report");

  sheet.columns = [
    { header: "Task Title", key: "title", width: 30 },
    { header: "Status", key: "status", width: 15 },
    { header: "Priority", key: "priority", width: 15 },
    { header: "Assignee", key: "assignee", width: 25 },
  ];

  tasks.forEach((task) => {
    sheet.addRow({
      title: task.title,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee
        ? `${task.assignee.firstName} ${task.assignee.lastName}`
        : "Unassigned",
    });
  });

  /*
  |--------------------------------------------------------------------------
  | Save File
  |--------------------------------------------------------------------------
  */

  const filePath = path.join("uploads", `dashboard-report-${Date.now()}.xlsx`);

  await workbook.xlsx.writeFile(filePath);

  return {
    path: filePath,
  };
};

// exportTaskActivityService
export const exportTaskActivityService = async (taskId, currentUser) => {
  const task = await Task.findOne({
    where: {
      id: taskId,
      organizationId: currentUser.organizationId,
    },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  const activities = await TaskActivity.findAll({
    where: {
      taskId: task.id,
      organizationId: currentUser.organizationId,
    },

    include: [
      {
        model: User,
        as: "user",
        attributes: ["firstName", "lastName"],
      },
    ],

    order: [["createdAt", "ASC"]],
  });

  /*
  |--------------------------------------------------------------------------
  | CREATE EXCEL REPORT
  |--------------------------------------------------------------------------
  */

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Task Activity");

  sheet.columns = [
    { header: "User", key: "user", width: 25 },
    { header: "Action", key: "action", width: 20 },
    { header: "Description", key: "description", width: 40 },
    { header: "Old Value", key: "oldValue", width: 30 },
    { header: "New Value", key: "newValue", width: 30 },
    { header: "Date", key: "date", width: 25 },
  ];

  activities.forEach((act) => {
    sheet.addRow({
      user: act.user ? `${act.user.firstName} ${act.user.lastName}` : "System",
      action: act.action,
      description: act.description,
      oldValue: act.oldValue,
      newValue: act.newValue,
      date: act.created_at,
    });
  });

  const filePath = path.join(
    "uploads",
    `task-activity-${taskId}-${Date.now()}.xlsx`,
  );

  await workbook.xlsx.writeFile(filePath);

  return {
    path: filePath,
  };
};
