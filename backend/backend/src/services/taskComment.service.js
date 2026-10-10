import { Task, TaskComment, User } from "../models/index.js";
import AppError from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { PERMISSIONS, TASK_ACTIVITY_ACTIONS } from "../constants/permissions.js";
import { sendNotification } from "./notification.service.js";
import { createTaskActivity } from "./taskActivity.service.js";



const notifyReviewer = async (task, currentUser, { title, message, type }) => {
  if (
    task.reviewerId &&
    Number(task.reviewerId) !== Number(currentUser.id) &&
    Number(task.reviewerId) !== Number(task.assignedTo)
  ) {
    await sendNotification({
      userId: task.reviewerId,
      organizationId: task.organizationId,
      title,
      message,
      type,
    });
  }
};

// ---------------------------------------------------------------------------
// createCommentService
// ---------------------------------------------------------------------------
export const createCommentService = async (taskId, message, currentUser) => {
  const canViewAllTasks = currentUser.role.permissions.some(
    (permission) => permission.code === PERMISSIONS.VIEW_ALL_TASKS,
  );

  const taskWhere = {
    id: taskId,
    organizationId: currentUser.organizationId,
    isActive: true,
  };

  if (!canViewAllTasks) {
    taskWhere[Symbol.for("sequelize.or")] = [
      { assignedTo: currentUser.id },
      { reviewerId: currentUser.id },
    ];
  }

  const task = await Task.findOne({ where: taskWhere });

  if (!task) {
    throw new AppError("Task not found", HTTP_STATUS.NOT_FOUND);
  }

  /*
  |--------------------------------------------------------------------------
  | Create Comment
  |--------------------------------------------------------------------------
  */

  const comment = await TaskComment.create({
    taskId: task.id,
    userId: currentUser.id,
    organizationId: currentUser.organizationId,
    message,
  });

  /*
  |--------------------------------------------------------------------------
  | Activity Log
  |--------------------------------------------------------------------------
  */

  await createTaskActivity({
    taskId: task.id,
    organizationId: currentUser.organizationId,
    userId: currentUser.id,
    action: TASK_ACTIVITY_ACTIONS.COMMENT_ADDED,
    description: "Comment added to task",
    oldValue: null,
    newValue: JSON.stringify({
      commentId: comment.id,
      message: comment.message,
    }),
  });

  /*
  |--------------------------------------------------------------------------
  | Notify Assignee
  |--------------------------------------------------------------------------
  */

  if (task.assignedTo && Number(task.assignedTo) !== Number(currentUser.id)) {
    await sendNotification({
      userId: task.assignedTo,
      organizationId: task.organizationId,
      title: "New Comment",
      message: `${currentUser.firstName} commented on task "${task.title}"`,
      type: "TASK_COMMENT",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Notify Reviewer — BUG FIX: was missing
  |--------------------------------------------------------------------------
  */

  await notifyReviewer(task, currentUser, {
    title: "New Comment",
    message: `${currentUser.firstName} commented on task "${task.title}"`,
    type: "TASK_COMMENT",
  });

  /*
  |--------------------------------------------------------------------------
  | Notify Creator (if different from assignee and commenter)
  |--------------------------------------------------------------------------
  */

  if (
    task.createdBy &&
    Number(task.createdBy) !== Number(currentUser.id) &&
    Number(task.createdBy) !== Number(task.assignedTo)
  ) {
    await sendNotification({
      userId: task.createdBy,
      organizationId: task.organizationId,
      title: "New Comment",
      message: `${currentUser.firstName} commented on task "${task.title}"`,
      type: "TASK_COMMENT",
    });
  }

  return comment;
};

// ---------------------------------------------------------------------------
// getCommentsService
// ---------------------------------------------------------------------------
export const getCommentsService = async (taskId, query, currentUser) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const offset = (page - 1) * limit;

  const canViewAllTasks = currentUser.role.permissions.some(
    (permission) => permission.code === PERMISSIONS.VIEW_ALL_TASKS,
  );

  const taskWhere = {
    id: taskId,
    organizationId: currentUser.organizationId,
    isActive: true,
  };

  if (!canViewAllTasks) {
    taskWhere[Symbol.for("sequelize.or")] = [
      { assignedTo: currentUser.id },
      { reviewerId: currentUser.id },
    ];
  }

  const task = await Task.findOne({ where: taskWhere });

  if (!task) {
    throw new AppError("Task not found", HTTP_STATUS.NOT_FOUND);
  }

  const { rows, count } = await TaskComment.findAndCountAll({
    where: {
      taskId: task.id,
      organizationId: currentUser.organizationId,
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "firstName", "lastName"],
      },
    ],
    order: [["createdAt", "ASC"]],
    limit,
    offset,
  });

  return {
    comments: rows,
    pagination: {
      page,
      limit,
      totalRecords: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

// ---------------------------------------------------------------------------
// updateCommentService
// ---------------------------------------------------------------------------
export const updateCommentService = async (commentId, message, currentUser) => {
  const comment = await TaskComment.findOne({
    where: {
      id: commentId,
      organizationId: currentUser.organizationId,
    },
  });

  if (!comment) {
    throw new AppError("Comment not found", HTTP_STATUS.NOT_FOUND);
  }

  const canViewAllTasks = currentUser.role.permissions.some(
    (permission) => permission.code === PERMISSIONS.VIEW_ALL_TASKS,
  );

  if (!canViewAllTasks && Number(comment.userId) !== Number(currentUser.id)) {
    throw new AppError(
      "You can update only your own comments",
      HTTP_STATUS.FORBIDDEN,
    );
  }

  const oldValue = { message: comment.message };

  comment.message = message;
  await comment.save();

  /*
  |--------------------------------------------------------------------------
  | Activity
  |--------------------------------------------------------------------------
  */

  await createTaskActivity({
    taskId: comment.taskId,
    organizationId: currentUser.organizationId,
    userId: currentUser.id,
    action: TASK_ACTIVITY_ACTIONS.COMMENT_UPDATED,
    description: "Comment updated",
    oldValue: JSON.stringify(oldValue),
    newValue: JSON.stringify({ message: comment.message }),
  });

  /*
  |--------------------------------------------------------------------------
  | Notify Assignee + Reviewer — BUG FIX: reviewer notification was missing
  |--------------------------------------------------------------------------
  */

  const task = await Task.findOne({ where: { id: comment.taskId } });

  if (task) {
    if (task.assignedTo && Number(task.assignedTo) !== Number(currentUser.id)) {
      await sendNotification({
        userId: task.assignedTo,
        organizationId: currentUser.organizationId,
        title: "Comment Updated",
        message: `${currentUser.firstName} updated a comment on task "${task.title}"`,
        type: "COMMENT_UPDATED",
      });
    }

    await notifyReviewer(task, currentUser, {
      title: "Comment Updated",
      message: `${currentUser.firstName} updated a comment on task "${task.title}"`,
      type: "COMMENT_UPDATED",
    });
  }

  return comment;
};

// ---------------------------------------------------------------------------
// deleteCommentService
// ---------------------------------------------------------------------------
export const deleteCommentService = async (commentId, currentUser) => {
  const comment = await TaskComment.findOne({
    where: {
      id: commentId,
      organizationId: currentUser.organizationId,
    },
  });

  if (!comment) {
    throw new AppError("Comment not found", HTTP_STATUS.NOT_FOUND);
  }

  const canViewAllTasks = currentUser.role.permissions.some(
    (permission) => permission.code === PERMISSIONS.VIEW_ALL_TASKS,
  );

  if (!canViewAllTasks && Number(comment.userId) !== Number(currentUser.id)) {
    throw new AppError(
      "You can delete only your own comments",
      HTTP_STATUS.FORBIDDEN,
    );
  }

  const oldValue = {
    message: comment.message,
    userId: comment.userId,
  };

  const taskId = comment.taskId;

  await comment.destroy();

  /*
  |--------------------------------------------------------------------------
  | Activity
  |--------------------------------------------------------------------------
  */

  await createTaskActivity({
    taskId,
    organizationId: currentUser.organizationId,
    userId: currentUser.id,
    action: TASK_ACTIVITY_ACTIONS.COMMENT_DELETED,
    description: "Comment deleted",
    oldValue: JSON.stringify(oldValue),
    newValue: null,
  });

  /*
  |--------------------------------------------------------------------------
  | Notify Assignee + Reviewer — BUG FIX: reviewer notification was missing
  |--------------------------------------------------------------------------
  */

  const task = await Task.findOne({ where: { id: taskId } });

  if (task) {
    if (task.assignedTo && Number(task.assignedTo) !== Number(currentUser.id)) {
      await sendNotification({
        userId: task.assignedTo,
        organizationId: currentUser.organizationId,
        title: "Comment Deleted",
        message: `${currentUser.firstName} deleted a comment on task "${task.title}"`,
        type: "COMMENT_DELETED",
      });
    }

    await notifyReviewer(task, currentUser, {
      title: "Comment Deleted",
      message: `${currentUser.firstName} deleted a comment on task "${task.title}"`,
      type: "COMMENT_DELETED",
    });
  }

  return true;
};