import {asyncHandler} from "../utils/asyncHandler.js";
import {
  createTaskService,
  getTasksService,
  getTaskByIdService,
  updateTaskService,
  assignTaskService,
  updateTaskStatusService,
  deleteTaskService,
  restoreTaskService,
  getReviewQueueService,
} from "../services/task.service.js";

// create task
export const createTask = asyncHandler(async (req, res) => {
  const task = await createTaskService(req.body, req.user);

  return res.status(201).json({
    success: true,

    message: "Task created successfully",

    data: task,
  });
});

// updateTaskStatus
export const updateTaskStatus = asyncHandler(async (req, res) => {

     const { status, reviewReason } = req.body;

  const task = await updateTaskStatusService(
    req.params.id,
    status,
    reviewReason,
    req.user,
  );

  return res.status(200).json({
    success: true,

    message: "Task status updated successfully",

    data: task,
  });
});

// get tasks
export const getTasks = asyncHandler(async (req, res) => {
  const tasks = await getTasksService(req.query, req.user);

  return res.status(200).json({
    success: true,
    data: tasks,
  });
});

// get task by Id
export const getTaskById = asyncHandler(async (req, res) => {
  const task = await getTaskByIdService(req.params.id, req.user);

  return res.status(200).json({
    success: true,

    data: task,
  });
});

// update task
export const updateTask = asyncHandler(async (req, res) => {
  const task = await updateTaskService(req.params.id, req.body, req.user);

  return res.status(200).json({
    success: true,

    message: "Task updated successfully",

    data: task,
  });
});

// assign task
export const assignTask = asyncHandler(async (req, res) => {
  const task = await assignTaskService(
    req.params.id,
    req.body.assignedTo,
    req.user,
  );

  return res.status(200).json({
    success: true,

    message: "Task assigned successfully",

    data: task,
  });
});

// delete task
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await deleteTaskService(req.params.id, req.user);

  return res.status(200).json({
    success: true,
    message: "Task deleted successfully",
    data: task,
  });
});

// restore task
export const restoreTask = asyncHandler(async (req, res) => {
  const task = await restoreTaskService(req.params.id, req.user);

  return res.status(200).json({
    success: true,
    message: "Task restored successfully",
    data: task,
  });
});

// get review
export const getReviewQueue = asyncHandler(async (req, res) => {
  const result = await getReviewQueueService(req.query, req.user);

  res.status(200).json({
    success: true,
    message: "Review queue fetched successfully",
    data: result,
  });
});
