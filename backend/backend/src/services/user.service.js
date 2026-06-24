import bcrypt from "bcryptjs";
import { User, Role, Task} from "../models/index.js";
import AppError from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { Op } from "sequelize";
import { userSocketMap } from "../socket/socketEvents.js";

// create user service
export const createUserService = async (data, currentUser) => {
  const { firstName, lastName, email, password, roleId } = data;

  /*
  |--------------------------------------------------------------------------
  | Email Exists Check
  |--------------------------------------------------------------------------
  */

  const existingUser = await User.findOne({
    where: {
      email: email.trim().toLowerCase(),
    },
  });

  if (existingUser) {
    throw new AppError("Email already exists", HTTP_STATUS.CONFLICT);
  }

  /*
  |--------------------------------------------------------------------------
  | Role Validation
  |--------------------------------------------------------------------------
  */

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
  | Role Active Check
  |--------------------------------------------------------------------------
  */

  if (!role.isActive) {
    throw new AppError("Cannot assign inactive role", HTTP_STATUS.BAD_REQUEST);
  }

  /*
  |--------------------------------------------------------------------------
  | ADMIN Protection
  |--------------------------------------------------------------------------
  */

  if (role.name === "ADMIN") {
    throw new AppError("Admin user cannot be created", HTTP_STATUS.BAD_REQUEST);
  }

  /*
  |--------------------------------------------------------------------------
  | Password Hash
  |--------------------------------------------------------------------------
  */

  const hashedPassword = await bcrypt.hash(password, 10);

  /*
  |--------------------------------------------------------------------------
  | Create User
  |--------------------------------------------------------------------------
  */

  const user = await User.create({
    organizationId: currentUser.organizationId,
    roleId,
    firstName: firstName.trim(),
    lastName: lastName?.trim() || null,
    email: email.trim().toLowerCase(),
    password: hashedPassword,
    isActive: true,
  });

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    isActive: user.isActive,
    roleId: user.roleId,
  };
};

// get user service
export const getUsersService = async (query, currentUser) => {
  const page = Number(query.page) || 1;

  const limit = Number(query.limit) || 10;

  const { search, roleId, isActive } = query;

  const offset = (page - 1) * limit;

  const where = {
    organizationId: currentUser.organizationId,
  };

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  if (search) {
    where[Op.or] = [
      {
        firstName: {
          [Op.like]: `%${search}%`,
        },
      },

      {
        lastName: {
          [Op.like]: `%${search}%`,
        },
      },

      {
        email: {
          [Op.like]: `%${search}%`,
        },
      },
    ];
  }

  /*
  |--------------------------------------------------------------------------
  | Role Filter
  |--------------------------------------------------------------------------
  */

  if (roleId) {
    where.roleId = roleId;
  }

  /*
  |--------------------------------------------------------------------------
  | Active Filter
  |--------------------------------------------------------------------------
  */

  if (isActive !== undefined) {
    where.isActive = isActive === "true";
  }

  const { rows, count } = await User.findAndCountAll({
    where,

    attributes: {
      exclude: ["password"],
    },

    include: [
      {
        model: Role,
        as: "role",

        attributes: ["id", "name", "isActive"],
      },
    ],

    limit,

    offset,

    order: [["createdAt", "DESC"]],
  });

  return {
    data: rows,

    pagination: {
      page,

      limit,

      totalRecords: count,

      totalPages: Math.ceil(count / limit),
    },
  };
};

// get by id service
export const getUserByIdService = async (userId, currentUser) => {
  const user = await User.findOne({
    where: {
      id: userId,

      organizationId: currentUser.organizationId,
    },

    attributes: [
      "id",

      "firstName",

      "lastName",

      "email",

      "isActive",

      "lastLoginAt",

      "createdAt",

      "updatedAt",
    ],

    include: [
      {
        model: Role,

        as: "role",

        attributes: ["id", "name", "description", "isActive"],
      },
    ],
  });

  if (!user) {
    throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  }

  return user;
};

// update user service
export const updateUserService = async (userId, data, currentUser) => {
  const user = await User.findOne({
    where: {
      id: userId,

      organizationId: currentUser.organizationId,
    },
  });

  if (!user) {
    throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  }

  /*
  |--------------------------------------------------------------------------
  | Email Update
  |--------------------------------------------------------------------------
  */

  if (data.email) {
    const normalizedEmail = data.email.trim().toLowerCase();

    const existingUser = await User.findOne({
      where: {
        email: normalizedEmail,

        id: {
          [Op.ne]: user.id,
        },
      },
    });

    if (existingUser) {
      throw new AppError("Email already exists", HTTP_STATUS.CONFLICT);
    }

    user.email = normalizedEmail;
  }

  /*
  |--------------------------------------------------------------------------
  | First Name
  |--------------------------------------------------------------------------
  */

  if (data.firstName !== undefined) {
    user.firstName = data.firstName.trim();
  }

  /*
  |--------------------------------------------------------------------------
  | Last Name
  |--------------------------------------------------------------------------
  */

  if (data.lastName !== undefined) {
    user.lastName = data.lastName?.trim() || null;
  }

  await user.save();

  return {
    id: user.id,

    firstName: user.firstName,

    lastName: user.lastName,

    email: user.email,

    roleId: user.roleId,

    isActive: user.isActive,
  };
};

// change user role service
export const changeUserRoleService = async (userId, roleId, currentUser) => {
  /*
  |--------------------------------------------------------------------------
  | Self Role Change Protection
  |--------------------------------------------------------------------------
  */

  if (Number(userId) === Number(currentUser.id)) {
    throw new AppError(
      "You cannot change your own role",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | User Exists?
  |--------------------------------------------------------------------------
  */

  const user = await User.findOne({
    where: {
      id: userId,

      organizationId: currentUser.organizationId,
    },
  });

  if (!user) {
    throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  }

  /*
  |--------------------------------------------------------------------------
  | User Active?
  |--------------------------------------------------------------------------
  */

  if (!user.isActive) {
    throw new AppError(
      "Cannot change role of inactive user",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Role Exists?
  |--------------------------------------------------------------------------
  */

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
  | Role Active?
  |--------------------------------------------------------------------------
  */

  if (!role.isActive) {
    throw new AppError("Cannot assign inactive role", HTTP_STATUS.BAD_REQUEST);
  }

  /*
  |--------------------------------------------------------------------------
  | ADMIN Protection
  |--------------------------------------------------------------------------
  */

  if (role.name === "ADMIN") {
    throw new AppError(
      "Admin role cannot be assigned",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Same Role Check
  |--------------------------------------------------------------------------
  */

  if (Number(user.roleId) === Number(role.id)) {
    throw new AppError("User already has this role", HTTP_STATUS.BAD_REQUEST);
  }

  /*
  |--------------------------------------------------------------------------
  | Update Role
  |--------------------------------------------------------------------------
  */

  user.roleId = role.id;

  await user.save();

  return {
    id: user.id,

    firstName: user.firstName,

    email: user.email,

    roleId: user.roleId,

    isActive: user.isActive,
  };
};

// update user status
export const deleteUserService = async (userId, currentUser) => {
  /*
  |--------------------------------------------------------------------------
  | Self Delete Protection
  |--------------------------------------------------------------------------
  */

  if (Number(userId) === Number(currentUser.id)) {
    throw new AppError(
      "You cannot delete your own account",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | User Exists?
  |--------------------------------------------------------------------------
  */

  const user = await User.findOne({
    where: {
      id: userId,

      organizationId: currentUser.organizationId,
    },

    include: [
      {
        model: Role,
        as: "role",
      },
    ],
  });

  if (!user) {
    throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  }

  /*
  |--------------------------------------------------------------------------
  | Already Deleted?
  |--------------------------------------------------------------------------
  */

  if (!user.isActive) {
    throw new AppError("User already deleted", HTTP_STATUS.BAD_REQUEST);
  }


  // can't delete assigned user

  const assignedTaskCount = await Task.count({
    where: {
      assignedTo: user.id,
      isActive: true,
    },
  });

  if (assignedTaskCount > 0) {
    throw new AppError(
      "User has active assigned tasks",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ADMIN Protection
  |--------------------------------------------------------------------------
  */

  if (user.role?.name === "ADMIN") {
    throw new AppError(
      "Admin account cannot be deleted",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Soft Delete
  |--------------------------------------------------------------------------
  */

  user.isActive = false;

  await user.save();

  return {
    id: user.id,

    firstName: user.firstName,

    email: user.email,

    isActive: user.isActive,
  };
};

// restore user service
export const restoreUserService = async (userId, currentUser) => {
  /*
  |--------------------------------------------------------------------------
  | User Exists?
  |--------------------------------------------------------------------------
  */

  const user = await User.findOne({
    where: {
      id: userId,
      organizationId: currentUser.organizationId,
    },
    include: [
      {
        model: Role,
        as: "role",
      },
    ],
  });

  if (!user) {
    throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  }

  /*
  |--------------------------------------------------------------------------
  | Already Active Check
  |--------------------------------------------------------------------------
  */

  if (user.isActive) {
    throw new AppError("User is already active", HTTP_STATUS.BAD_REQUEST);
  }

  /*
  |--------------------------------------------------------------------------
  | Self Restore Protection
  |--------------------------------------------------------------------------
  */

  if (Number(user.id) === Number(currentUser.id)) {
    throw new AppError(
      "You cannot restore your own account",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Role Active Check
  |--------------------------------------------------------------------------
  */

  if (!user.role.isActive) {
    throw new AppError(
      "Cannot restore user because assigned role is inactive",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Restore User
  |--------------------------------------------------------------------------
  */

  user.isActive = true;

  await user.save();

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    roleId: user.roleId,
    isActive: user.isActive,
  };
};

// getOnlineUsersService
export const getOnlineUsersService = async () => {
  return {
    totalOnlineUsers: userSocketMap.size,

    users: [...userSocketMap.keys()],
  };
};
