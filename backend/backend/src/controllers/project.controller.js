import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createProjectService,
  getProjectsService,
  getProjectByIdService,
  updateProjectService,
  deleteProjectService,
  getProjectTasksService,
} from "../services/project.service.js";

// createProject
export const createProject = asyncHandler(async (req, res) => {
  const project = await createProjectService(req.body, req.user);
  return res.status(201).json({
    success: true,
    message: "Project created successfully",
    data: project,
  });
});

// getProjects
export const getProjects = asyncHandler(async (req, res) => {
  const result = await getProjectsService(req.query, req.user);
  return res.status(200).json({
    success: true,
    data: result,
  });
});

// getProjectById
export const getProjectById = asyncHandler(async (req, res) => {
  const project = await getProjectByIdService(req.params.id, req.user);
  return res.status(200).json({
    success: true,
    data: project,
  });
});

// updateProject
export const updateProject = asyncHandler(async (req, res) => {
  const project = await updateProjectService(req.params.id, req.body, req.user);
  return res.status(200).json({
    success: true,
    message: "Project updated successfully",
    data: project,
  });
});

// deleteProject
export const deleteProject = asyncHandler(async (req, res) => {
  const result = await deleteProjectService(req.params.id, req.user);
  return res.status(200).json({
    success: true,
    message: result.message,
  });
});

// getProjectTasks
export const getProjectTasks = asyncHandler(async (req, res) => {
  const result = await getProjectTasksService(req.params.id, req.query, req.user);
  return res.status(200).json({
    success: true,
    data: result,
  });
});
