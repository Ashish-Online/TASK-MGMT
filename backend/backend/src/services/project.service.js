import AppError from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { Project, Task, User, Organization } from "../models/index.js";
import { Op } from "sequelize";

// ---------------------------------------------------------------------------
// Helper: generate uppercase project key from name
// ---------------------------------------------------------------------------
const generateProjectKey = (name) => {
  const clean = name.replace(/[^a-zA-Z0-9\s]/g, "").trim();
  const words = clean.split(/\s+/);
  if (words.length >= 2) {
    return (words[0].slice(0, 2) + words[1].slice(0, 2)).toUpperCase();
  }
  return clean.slice(0, 4).toUpperCase() || "PROJ";
};

// ---------------------------------------------------------------------------
// createProjectService
// ---------------------------------------------------------------------------
export const createProjectService = async (data, currentUser) => {
  const { name, key, description, status, priority, startDate, endDate } = data;

  const trimmedName = name.trim();

  // Check if project name already exists in this organization
  const existingProject = await Project.findOne({
    where: {
      organizationId: currentUser.organizationId,
      name: trimmedName,
      isActive: true,
    },
  });

  if (existingProject) {
    throw new AppError("A project with this name already exists in your organization", HTTP_STATUS.CONFLICT);
  }

  const projectKey = (key && key.trim().toUpperCase()) || generateProjectKey(trimmedName);

  const project = await Project.create({
    organizationId: currentUser.organizationId,
    name: trimmedName,
    key: projectKey,
    description: description ? description.trim() : null,
    status: status || "ACTIVE",
    priority: priority || "MEDIUM",
    startDate: startDate || null,
    endDate: endDate || null,
    createdBy: currentUser.id,
    isActive: true,
  });

  const createdProject = await Project.findByPk(project.id, {
    include: [
      {
        model: User,
        as: "creator",
        attributes: ["id", "firstName", "lastName", "email"],
      },
    ],
  });

  return createdProject;
};

// ---------------------------------------------------------------------------
// getProjectsService
// ---------------------------------------------------------------------------
export const getProjectsService = async (query, currentUser) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const offset = (page - 1) * limit;

  const where = {
    organizationId: currentUser.organizationId,
  };

  if (query.isActive !== undefined) {
    where.isActive = query.isActive === "true";
  } else {
    where.isActive = true;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.priority) {
    where.priority = query.priority;
  }

  if (query.search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${query.search}%` } },
      { key: { [Op.like]: `%${query.search}%` } },
      { description: { [Op.like]: `%${query.search}%` } },
    ];
  }

  const { rows, count } = await Project.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: "creator",
        attributes: ["id", "firstName", "lastName", "email"],
      },
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  // Calculate task statistics for each project
  const projectIds = rows.map((p) => p.id);

  let taskStatsMap = {};
  if (projectIds.length > 0) {
    const tasks = await Task.findAll({
      where: {
        projectId: { [Op.in]: projectIds },
        organizationId: currentUser.organizationId,
        isActive: true,
      },
      attributes: ["id", "projectId", "status"],
    });

    taskStatsMap = tasks.reduce((acc, task) => {
      if (!acc[task.projectId]) {
        acc[task.projectId] = { total: 0, completed: 0, inProgress: 0, todo: 0 };
      }
      acc[task.projectId].total += 1;
      if (task.status === "COMPLETED" || task.status === "APPROVED") {
        acc[task.projectId].completed += 1;
      } else if (task.status === "IN_PROGRESS") {
        acc[task.projectId].inProgress += 1;
      } else if (task.status === "TODO") {
        acc[task.projectId].todo += 1;
      }
      return acc;
    }, {});
  }

  const projectsWithStats = rows.map((project) => {
    const pJson = project.toJSON();
    const stats = taskStatsMap[project.id] || { total: 0, completed: 0, inProgress: 0, todo: 0 };
    const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    return {
      ...pJson,
      taskStats: stats,
      progress,
    };
  });

  return {
    projects: projectsWithStats,
    pagination: {
      page,
      limit,
      totalRecords: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

// ---------------------------------------------------------------------------
// getProjectByIdService
// ---------------------------------------------------------------------------
export const getProjectByIdService = async (projectId, currentUser) => {
  const project = await Project.findOne({
    where: {
      id: projectId,
      organizationId: currentUser.organizationId,
    },
    include: [
      {
        model: User,
        as: "creator",
        attributes: ["id", "firstName", "lastName", "email"],
      },
      {
        model: Task,
        as: "tasks",
        where: { isActive: true },
        required: false,
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
        order: [["createdAt", "DESC"]],
      },
    ],
  });

  if (!project) {
    throw new AppError("Project not found", HTTP_STATUS.NOT_FOUND);
  }

  const pJson = project.toJSON();
  const tasks = pJson.tasks || [];
  const stats = tasks.reduce(
    (acc, task) => {
      acc.total += 1;
      if (task.status === "COMPLETED" || task.status === "APPROVED") {
        acc.completed += 1;
      } else if (task.status === "IN_PROGRESS") {
        acc.inProgress += 1;
      } else if (task.status === "TODO") {
        acc.todo += 1;
      } else if (task.status === "REJECTED") {
        acc.rejected += 1;
      }
      return acc;
    },
    { total: 0, completed: 0, inProgress: 0, todo: 0, rejected: 0 }
  );

  const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return {
    ...pJson,
    taskStats: stats,
    progress,
  };
};

// ---------------------------------------------------------------------------
// updateProjectService
// ---------------------------------------------------------------------------
export const updateProjectService = async (projectId, data, currentUser) => {
  const project = await Project.findOne({
    where: {
      id: projectId,
      organizationId: currentUser.organizationId,
    },
  });

  if (!project) {
    throw new AppError("Project not found", HTTP_STATUS.NOT_FOUND);
  }

  if (data.name !== undefined) project.name = data.name.trim();
  if (data.key !== undefined) project.key = data.key.trim().toUpperCase();
  if (data.description !== undefined) project.description = data.description ? data.description.trim() : null;
  if (data.status !== undefined) project.status = data.status;
  if (data.priority !== undefined) project.priority = data.priority;
  if (data.startDate !== undefined) project.startDate = data.startDate || null;
  if (data.endDate !== undefined) project.endDate = data.endDate || null;
  if (data.isActive !== undefined) project.isActive = data.isActive;

  await project.save();

  const updated = await Project.findByPk(project.id, {
    include: [
      {
        model: User,
        as: "creator",
        attributes: ["id", "firstName", "lastName", "email"],
      },
    ],
  });

  return updated;
};

// ---------------------------------------------------------------------------
// deleteProjectService (Soft delete)
// ---------------------------------------------------------------------------
export const deleteProjectService = async (projectId, currentUser) => {
  const project = await Project.findOne({
    where: {
      id: projectId,
      organizationId: currentUser.organizationId,
    },
  });

  if (!project) {
    throw new AppError("Project not found", HTTP_STATUS.NOT_FOUND);
  }

  project.isActive = false;
  await project.save();

  return { message: "Project deleted successfully" };
};

// ---------------------------------------------------------------------------
// getProjectTasksService
// ---------------------------------------------------------------------------
export const getProjectTasksService = async (projectId, query, currentUser) => {
  const project = await Project.findOne({
    where: {
      id: projectId,
      organizationId: currentUser.organizationId,
    },
  });

  if (!project) {
    throw new AppError("Project not found", HTTP_STATUS.NOT_FOUND);
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const offset = (page - 1) * limit;

  const where = {
    projectId,
    organizationId: currentUser.organizationId,
  };

  if (query.status) where.status = query.status;
  if (query.priority) where.priority = query.priority;
  if (query.isActive !== undefined) {
    where.isActive = query.isActive === "true";
  } else {
    where.isActive = true;
  }

  if (query.search) {
    where.title = { [Op.like]: `%${query.search}%` };
  }

  const { rows, count } = await Task.findAndCountAll({
    where,
    include: [
      { model: User, as: "assignee", attributes: ["id", "firstName", "lastName", "email"] },
      { model: User, as: "reviewer", attributes: ["id", "firstName", "lastName", "email"] },
      { model: User, as: "creator", attributes: ["id", "firstName", "lastName", "email"] },
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return {
    tasks: rows,
    pagination: {
      page,
      limit,
      totalRecords: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};
