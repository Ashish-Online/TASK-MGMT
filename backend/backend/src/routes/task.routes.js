import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import authorize from "../middleware/authorize.middleware.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { validate } from "../middleware/validation.middleware.js";
import {
  createTaskSchema,
  assignTaskSchema,
  updateTaskStatusSchema,
} from "../validations/task.validation.js";
import {
  createTask,
  updateTaskStatus,
  getTasks,
  getTaskById,
  updateTask,
  assignTask,
  deleteTask,
  restoreTask,
  getReviewQueue,
} from "../controllers/task.controller.js";

const router = Router();

// --- Collection routes (no path params) ---
router.post("/", auth, authorize(PERMISSIONS.CREATE_TASK), validate(createTaskSchema), createTask);
router.get("/", auth, authorize(PERMISSIONS.VIEW_TASKS), getTasks);

// --- Static named routes (MUST come before /:id) ---
router.get("/review-queue", auth, authorize(PERMISSIONS.APPROVE_TASK), getReviewQueue);

// --- Parameterized routes ---
router.get("/:id", auth, authorize(PERMISSIONS.VIEW_TASKS), getTaskById);
router.patch("/:id/status", auth, authorize(PERMISSIONS.UPDATE_TASK), validate(updateTaskStatusSchema), updateTaskStatus);
router.patch("/:id", auth, authorize(PERMISSIONS.EDIT_OWN_TASK, PERMISSIONS.EDIT_ALL_TASKS), updateTask); 
router.patch("/:id/assign", auth, authorize(PERMISSIONS.ASSIGN_TASK), validate(assignTaskSchema), assignTask);
router.delete("/:id/delete", auth, authorize(PERMISSIONS.DELETE_TASK), deleteTask); 
router.patch("/:id/restore", auth, authorize(PERMISSIONS.RESTORE_TASK), restoreTask); 

export default router;
