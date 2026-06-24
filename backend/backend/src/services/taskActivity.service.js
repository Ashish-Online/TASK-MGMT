import { Task, TaskActivity, User } from "../models/index.js";
import AppError from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { Op } from "sequelize";

// create task Activity (utils)
export const createTaskActivity = async ({
  taskId,
  organizationId,
  userId,
  action,
  description,
  oldValue = null,
  newValue = null,
}) => {
  return await TaskActivity.create({
    taskId,
    organizationId,
    userId,
    action,
    description,
    oldValue,
    newValue,
  });
};

// get task Activity service
export const getTaskActivityService = async (taskId, currentUser) => {
  /*
  |--------------------------------------------------------------------------
  | Task Exists?
  |--------------------------------------------------------------------------
  */

  const task = await Task.findOne({
    where: {
      id: taskId,
      organizationId: currentUser.organizationId,
    },
  });

  if (!task) {
    throw new AppError("Task not found", HTTP_STATUS.NOT_FOUND);
  }

  /*
  |--------------------------------------------------------------------------
  | Visibility Rules
  |--------------------------------------------------------------------------
  */

  const canViewAllTasks = currentUser.role.permissions.some(
    (permission) => permission.code === PERMISSIONS.VIEW_ALL_TASKS,
  );

  if (!canViewAllTasks && Number(task.assignedTo) !== Number(currentUser.id)) {
    throw new AppError(
      "You can view activity only for your assigned tasks",
      HTTP_STATUS.FORBIDDEN,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Activities
  |--------------------------------------------------------------------------
  */

  return await TaskActivity.findAll({
    where: {
      taskId: task.id,
      organizationId: currentUser.organizationId,
    },

    include: [
      {
        model: User,
        as: "user",

        attributes: ["id", "firstName", "lastName", "email"],
      },
    ],

    order: [["createdAt", "DESC"]],
  });
};

// getGlobalTaskActivityService
export const getGlobalTaskActivityService = async (query, currentUser) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const offset = (page - 1) * limit;

  const where = {
    organizationId: currentUser.organizationId,
  };

  /*
  |--------------------------------------------------------------------------
  | Filters (Optional)
  |--------------------------------------------------------------------------
  */

  if (query.taskId) {
    where.taskId = query.taskId;
  }

  if (query.userId) {
    where.userId = query.userId;
  }

  if (query.action) {
    where.action = query.action;
  }

  if (query.startDate && query.endDate) {
    where.created_at = {
      [Op.between]: [query.startDate, query.endDate],
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Fetch Activities
  |--------------------------------------------------------------------------
  */

  const { rows, count } = await TaskActivity.findAndCountAll({
    where,

    include: [
      {
        model: Task,
        as: "task",
        attributes: ["id", "title"],
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "firstName", "lastName"],
      },
    ],

    order: [["createdAt", "DESC"]],

    limit,
    offset,
  });

  /*
  |--------------------------------------------------------------------------
  | Response
  |--------------------------------------------------------------------------
  */

  return {
    activities: rows,

    pagination: {
      page,
      limit,
      totalRecords: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};
