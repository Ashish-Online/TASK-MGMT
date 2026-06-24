import { Task, TaskAttachment } from "../models/index.js";
import cloudinary from "../config/cloudinary.js";
import AppError from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import {
  PERMISSIONS,
  TASK_ACTIVITY_ACTIONS,
} from "../constants/permissions.js";
import { sendNotification } from "./notification.service.js";
import { createTaskActivity } from "./taskActivity.service.js";

// ---------------------------------------------------------------------------
// findAccessibleTask
// Shared access-check helper — mirrors the rule used in task-comment.service.js
// so attachments follow the exact same visibility/ownership rules as comments:
// org-scoped, and only canViewAllTasks OR the assignee OR the reviewer.
// ---------------------------------------------------------------------------
const findAccessibleTask = async (taskId, currentUser) => {
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

  return task;
};

// ---------------------------------------------------------------------------
// notifyAssigneeAndReviewer
// Sends a notification to assignee + reviewer, skipping whoever triggered
// the action and de-duplicating if assignee === reviewer.
// ---------------------------------------------------------------------------
const notifyAssigneeAndReviewer = async (
  task,
  currentUser,
  { title, message, type },
) => {
  const targets = new Set();
  if (task.assignedTo) targets.add(Number(task.assignedTo));
  if (task.reviewerId) targets.add(Number(task.reviewerId));
  targets.delete(Number(currentUser.id));

  for (const userId of targets) {
    await sendNotification({
      userId,
      organizationId: task.organizationId,
      title,
      message,
      type,
    });
  }
};


// ---------------------------------------------------------------------------
// Helper: get cloudinary resource_type from mimetype
// ---------------------------------------------------------------------------
const getCloudinaryResourceType = (fileType) => {
  if (!fileType) return "raw";
  if (fileType.startsWith("image/")) return "image";
  if (fileType.startsWith("video/")) return "video";
  return "raw"; // PDFs and other files go here
};

// ---------------------------------------------------------------------------
// createAttachmentService
// ---------------------------------------------------------------------------
export const createAttachmentService = async (taskId, files, currentUser) => {
  const task = await findAccessibleTask(taskId, currentUser);

  const attachments = [];

  for (const file of files) {
    const attachment = await TaskAttachment.create({
      taskId: task.id,
      fileName: file.originalname,
      fileUrl: file.path, // Cloudinary secure_url stored by multer-storage-cloudinary
      fileType: file.mimetype,
      cloudinaryPublicId: file.filename, // Cloudinary public_id
      uploadedBy: currentUser.id,
    });

    attachments.push(attachment);
  }

  await createTaskActivity({
    taskId: task.id,
    organizationId: currentUser.organizationId,
    userId: currentUser.id,
    action: TASK_ACTIVITY_ACTIONS.ATTACHMENT_ADDED,
    description:
      attachments.length === 1
        ? `Attachment "${attachments[0].fileName}" added to task`
        : `${attachments.length} attachments added to task`,
    oldValue: null,
    newValue: JSON.stringify({
      attachments: attachments.map((a) => ({ id: a.id, fileName: a.fileName })),
    }),
  });

  await notifyAssigneeAndReviewer(task, currentUser, {
    title: "New Attachment",
    message: `${currentUser.firstName} attached ${
      attachments.length > 1 ? `${attachments.length} files` : "a file"
    } to task "${task.title}"`,
    type: "TASK_ATTACHMENT_ADDED",
  });

  return attachments;
};

// ---------------------------------------------------------------------------
// deleteTaskAttachmentService
// ---------------------------------------------------------------------------
export const deleteTaskAttachmentService = async (
  attachmentId,
  currentUser,
) => {
  const attachment = await TaskAttachment.findOne({
    where: { id: attachmentId },
  });

  if (!attachment) {
    throw new AppError("Attachment not found", HTTP_STATUS.NOT_FOUND);
  }

  const task = await findAccessibleTask(attachment.taskId, currentUser);

  const oldValue = { fileName: attachment.fileName, taskId: attachment.taskId };

  await cloudinary.uploader.destroy(attachment.cloudinaryPublicId, {
  resource_type: getCloudinaryResourceType(attachment.fileType),
});

  await attachment.destroy();

  await createTaskActivity({
    taskId: task.id,
    organizationId: currentUser.organizationId,
    userId: currentUser.id,
    action: TASK_ACTIVITY_ACTIONS.ATTACHMENT_DELETED,
    description: `Attachment "${oldValue.fileName}" deleted`,
    oldValue: JSON.stringify(oldValue),
    newValue: null,
  });

  await notifyAssigneeAndReviewer(task, currentUser, {
    title: "Attachment Removed",
    message: `${currentUser.firstName} removed an attachment from task "${task.title}"`,
    type: "TASK_ATTACHMENT_DELETED",
  });

  return {
    success: true,
    message: "Attachment deleted successfully",
  };
};

// update attachment service
// Add to taskAttachment.service.js
export const updateTaskAttachmentService = async (
  attachmentId,
  file,
  currentUser,
) => {
  const attachment = await TaskAttachment.findOne({
    where: { id: attachmentId },
  });

  if (!attachment) {
    throw new AppError("Attachment not found", HTTP_STATUS.NOT_FOUND);
  }

  // Verify task access (same org + visibility rules)
  const task = await findAccessibleTask(attachment.taskId, currentUser);

  const oldValue = {
    fileName: attachment.fileName,
    fileUrl: attachment.fileUrl,
  };

  await cloudinary.uploader.destroy(attachment.cloudinaryPublicId, {
  resource_type: getCloudinaryResourceType(attachment.fileType),
});

  // Update record with new file
  await attachment.update({
    fileName: file.originalname,
    fileUrl: file.path,
    fileType: file.mimetype,
    cloudinaryPublicId: file.filename,
  });

  await createTaskActivity({
    taskId: task.id,
    organizationId: currentUser.organizationId,
    userId: currentUser.id,
    action: TASK_ACTIVITY_ACTIONS.ATTACHMENT_UPDATED,
    description: `Attachment updated from "${oldValue.fileName}" to "${file.originalname}"`,
    oldValue: JSON.stringify(oldValue),
    newValue: JSON.stringify({
      fileName: attachment.fileName,
      fileUrl: attachment.fileUrl,
    }),
  });

  await notifyAssigneeAndReviewer(task, currentUser, {
    title: "Attachment Updated",
    message: `${currentUser.firstName} updated an attachment in task "${task.title}"`,
    type: "TASK_ATTACHMENT_UPDATED",
  });

  return attachment;
};

// ---------------------------------------------------------------------------
// getTaskAttachmentsService
// ---------------------------------------------------------------------------
export const getTaskAttachmentsService = async (taskId, currentUser) => {
  // BUG FIX: previously fetched attachments for ANY taskId with zero
  // permission/org checks. Now scoped exactly like comments.
  const task = await findAccessibleTask(taskId, currentUser);

  const attachments = await TaskAttachment.findAll({
    where: { taskId: task.id },
    order: [["createdAt", "DESC"]],
  });

  return attachments;
};
