import { Role, User, Permission } from "../models/index.js";
import AppError from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { Op } from "sequelize";
import { sequelize } from "../config/database.js";

// Create Roles Service
export const createRoleService = async (data, currentUser) => {
  const existingRole = await Role.findOne({
    where: {
      organizationId: currentUser.organizationId,
      name: data.name.trim().toUpperCase(),
    },
  });

  if (existingRole) {
    throw new AppError("Role already exists", HTTP_STATUS.CONFLICT);
  }

  const role = await Role.create({
    organizationId: currentUser.organizationId,
    name: data.name.trim().toUpperCase(),
    description: data.description || null,
  });

  return role;
};

// Get Roles Service
export const getRolesService = async (query, currentUser) => {
  const page = Number(query.page) || 1;

  const limit = Number(query.limit) || 10;

  const offset = (page - 1) * limit;

  const search = query.search?.trim() || "";

  const allowedSortFields = ["name", "createdAt", "updatedAt"];

  const sortBy = allowedSortFields.includes(query.sortBy)
    ? query.sortBy
    : "createdAt";

  const sortOrder = query.sortOrder?.toUpperCase() === "ASC" ? "ASC" : "DESC";

  const where = {
    organizationId: currentUser.organizationId,
  };

  /*
  |--------------------------------------------------------------------------
  | Search Filter
  |--------------------------------------------------------------------------
  */

  if (search) {
    where.name = {
      [Op.like]: `%${search}%`,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Active / Inactive Filter
  |--------------------------------------------------------------------------
  */

  if (query.isActive !== undefined) {
    where.isActive = query.isActive === "true";
  }

  const { rows, count } = await Role.findAndCountAll({
    where,

    attributes: [
      "id",
      "name",
      "description",
      "isActive",
      "createdAt",
      "updatedAt",
    ],

    limit,

    offset,

    order: [[sortBy, sortOrder]],
  });

  return {
    roles: rows,

    pagination: {
      page,

      limit,

      totalRecords: count,

      totalPages: Math.ceil(count / limit),
    },
  };
};

// Get Role By Id Service
export const getRoleByIdService = async (roleId, currentUser) => {
  const role = await Role.findOne({
    where: {
      id: roleId,

      organizationId: currentUser.organizationId,
    },

    attributes: [
      "id",

      "name",

      "description",

      "isActive",

      "createdAt",

      "updatedAt",
    ],

    include: [
      {
        model: Permission,

        as: "permissions",

        attributes: ["id", "name", "code", "description"],

        through: {
          attributes: [],
        },
      },
    ],
  });

  if (!role) {
    throw new AppError("Role not found", HTTP_STATUS.NOT_FOUND);
  }

  return role;
};

// Update Role Service
export const updateRoleService = async (roleId, data, currentUser) => {
  const role = await Role.findOne({
    where: {
      id: roleId,
      organizationId: currentUser.organizationId,
    },
  });

  if (!role) {
    throw new AppError("Role not found", HTTP_STATUS.NOT_FOUND);
  }

  /*
  |--------------------------------------------------------------------------
  | Protect ADMIN Role Name
  |--------------------------------------------------------------------------
  */

  if (role.name === "ADMIN" && data.name) {
    throw new AppError(
      "Admin role name cannot be changed",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Update Name
  |--------------------------------------------------------------------------
  */

  if (data.name) {
    const normalizedName = data.name.trim().toUpperCase();

    const existingRole = await Role.findOne({
      where: {
        organizationId: currentUser.organizationId,
        name: normalizedName,
        id: {
          [Op.ne]: role.id,
        },
      },
    });

    if (existingRole) {
      throw new AppError("Role already exists", HTTP_STATUS.CONFLICT);
    }

    role.name = normalizedName;
  }

  /*
  |--------------------------------------------------------------------------
  | Update Description
  |--------------------------------------------------------------------------
  */

  if (data.description !== undefined) {
    role.description = data.description;
  }

  await role.save();

  return role;
};

// Delete Role
export const deleteRoleService = async (roleId, currentUser) => {
  const role = await Role.findOne({
    where: {
      id: roleId,
      organizationId: currentUser.organizationId,
    },
  });

  if (!role) {
    throw new AppError("Role not found", HTTP_STATUS.NOT_FOUND);
  }

  /*
  |--------------------------------------------------------------------------
  | ADMIN Protection
  |--------------------------------------------------------------------------
  */

  if (role.name === "ADMIN") {
    throw new AppError("Admin role cannot be deleted", HTTP_STATUS.BAD_REQUEST);
  }

  /*
  |--------------------------------------------------------------------------
  | Already Deleted Check
  |--------------------------------------------------------------------------
  */

  if (!role.isActive) {
    throw new AppError("Role already deleted", HTTP_STATUS.BAD_REQUEST);
  }

  /*
  |--------------------------------------------------------------------------
  | Active Users Assigned ?
  |--------------------------------------------------------------------------
  */

  const assignedUsers = await User.count({
    where: {
      roleId: role.id,
      isActive: true,
    },
  });

  if (assignedUsers > 0) {
    throw new AppError(
      `Role has ${assignedUsers} active users assigned`,
      HTTP_STATUS.CONFLICT,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Soft Delete
  |--------------------------------------------------------------------------
  */

  role.isActive = false;

  await role.save();

  return {
    id: role.id,
    name: role.name,
    isActive: role.isActive,
  };
};

// Update AssignPermission of Role
export const assignPermissionsToRoleService = async (
  roleId,
  permissionIds,
  currentUser,
) => {
  const role = await Role.findOne({
    where: {
      id: roleId,
      organizationId: currentUser.organizationId,
    },
  });

  if (!role) {
    throw new AppError("Role not found", HTTP_STATUS.NOT_FOUND);
  }

  /*
  |--------------------------------------------------------------------------
  | ADMIN Protection
  |--------------------------------------------------------------------------
  */

  if (role.name === "ADMIN") {
    throw new AppError(
      "Admin permissions cannot be modified",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Permission Validation
  |--------------------------------------------------------------------------
  */

  const uniquePermissionIds = [...new Set(permissionIds)];

  if (uniquePermissionIds.length === 0) {
    throw new AppError(
      "At least one permission is required",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const permissions = await Permission.findAll({
    where: {
      id: uniquePermissionIds,
    },
  });

  if (permissions.length !== uniquePermissionIds.length) {
    throw new AppError(
      "One or more permissions are invalid",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const transaction = await sequelize.transaction();

  try {
    await role.setPermissions(permissions, { transaction });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();

    throw error;
  }

  return await Role.findByPk(role.id, {
    attributes: ["id", "name", "description", "isActive"],

    include: [
      {
        model: Permission,
        as: "permissions",

        attributes: ["id", "name", "code"],

        through: {
          attributes: [],
        },
      },
    ],
  });
};

// restore role service
export const restoreRoleService = async (roleId, currentUser) => {
  const role = await Role.findOne({
    where: {
      id: roleId,
      organizationId: currentUser.organizationId,
    },
  });

  if (!role) {
    throw new AppError("Role not found", HTTP_STATUS.NOT_FOUND);
  }

  /*
  |--------------------------------------------------------------------------
  | Already Active Check
  |--------------------------------------------------------------------------
  */

  if (role.isActive) {
    throw new AppError("Role is already active", HTTP_STATUS.BAD_REQUEST);
  }

  /*
  |--------------------------------------------------------------------------
  | ADMIN Protection (Extra Safety)
  |--------------------------------------------------------------------------
  */

  if (role.name === "ADMIN") {
    throw new AppError("Admin role is always active", HTTP_STATUS.BAD_REQUEST);
  }

  /*
  |--------------------------------------------------------------------------
  | Restore Role
  |--------------------------------------------------------------------------
  */

  role.isActive = true;

  await role.save();

  return {
    id: role.id,
    name: role.name,
    description: role.description,
    isActive: role.isActive,
  };
};
