import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import authorize from "../middleware/authorize.middleware.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { validate } from "../middleware/validation.middleware.js";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../validations/project.validation.js";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectTasks,
} from "../controllers/project.controller.js";

const router = Router();

// Create project
router.post(
  "/",
  auth,
  authorize(PERMISSIONS.CREATE_PROJECT),
  validate(createProjectSchema),
  createProject
);

// List projects
router.get(
  "/",
  auth,
  authorize(PERMISSIONS.VIEW_PROJECTS),
  getProjects
);

// Get single project details
router.get(
  "/:id",
  auth,
  authorize(PERMISSIONS.VIEW_PROJECTS),
  getProjectById
);

// Get tasks belonging to project
router.get(
  "/:id/tasks",
  auth,
  authorize(PERMISSIONS.VIEW_TASKS),
  getProjectTasks
);

// Update project
router.patch(
  "/:id",
  auth,
  authorize(PERMISSIONS.UPDATE_PROJECT),
  validate(updateProjectSchema),
  updateProject
);

// Delete project
router.delete(
  "/:id",
  auth,
  authorize(PERMISSIONS.DELETE_PROJECT),
  deleteProject
);

export default router;
