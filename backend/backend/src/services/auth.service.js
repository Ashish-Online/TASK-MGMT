import bcrypt from "bcryptjs";

import {
  Role,
  Permission,
  Organization,
  RolePermission,
  User,
} from "../models/index.js";
import { sequelize } from "../config/database.js";
import { slugify } from "../utils/slugify.js";
import AppError from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { generateToken } from "../utils/jwt.js";

// Organization and Admin Registration Service
export const registerOrganizationService = async (data) => {
  const transaction = await sequelize.transaction();

  try {
    const organizationName = data.organizationName.trim();
    const adminName = data.adminName.trim();
    const email = data.email.trim().toLowerCase();
    const { password } = data;

    const slug = slugify(organizationName);

    /*
    |--------------------------------------------------------------------------
    | Check Organization Exists
    |--------------------------------------------------------------------------
    */

    const existingOrganization = await Organization.findOne({
      where: {
        slug,
      },
    });

    if (existingOrganization) {
      throw new AppError("Organization already exists", HTTP_STATUS.CONFLICT);
    }

    /*
    |--------------------------------------------------------------------------
    | Check Email Exists
    |--------------------------------------------------------------------------
    */

    const existingUser = await User.findOne({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new AppError("Email already exists", HTTP_STATUS.CONFLICT);
    }

    /*
    |--------------------------------------------------------------------------
    | Create Organization
    |--------------------------------------------------------------------------
    */

    const organization = await Organization.create(
      {
        name: organizationName,
        slug,
      },
      { transaction },
    );

    /*
    |--------------------------------------------------------------------------
    | Create Admin Role
    |--------------------------------------------------------------------------
    */

    const adminRole = await Role.create(
      {
        organizationId: organization.id,
        name: "ADMIN",
        description: "Organization Administrator",
        isActive: true,
      },
      { transaction },
    );

    /*
    |--------------------------------------------------------------------------
    | Get All Permissions
    |--------------------------------------------------------------------------
    */

    const permissions = await Permission.findAll({
      transaction,
    });

    /*
    |--------------------------------------------------------------------------
    | Assign All Permissions To Admin Role
    |--------------------------------------------------------------------------
    */

    const rolePermissions = permissions.map((permission) => ({
      roleId: adminRole.id,
      permissionId: permission.id,
    }));

    await RolePermission.bulkCreate(rolePermissions, { transaction });

    /*
    |--------------------------------------------------------------------------
    | Hash Password
    |--------------------------------------------------------------------------
    */

    const hashedPassword = await bcrypt.hash(password, 10);

    /*
    |--------------------------------------------------------------------------
    | Create Admin User
    |--------------------------------------------------------------------------
    */

    const adminUser = await User.create(
      {
        organizationId: organization.id,
        roleId: adminRole.id,
        firstName: adminName,
        email,
        password: hashedPassword,
        isActive: true,
      },
      { transaction },
    );

    await transaction.commit();

    return {
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },

      adminUser: {
        id: adminUser.id,
        firstName: adminUser.firstName,
        email: adminUser.email,
      },
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Login Service
export const loginService = async (data) => {
  const { email, password } = data;

  const user = await User.findOne({
    where: {
      email,
    },

    include: [
      {
        model: Role,
        as: "role",

        attributes: ["id", "name", "isActive"],

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
      },

      {
        model: Organization,
        as: "organization",

        attributes: ["id", "name", "slug", "isActive"],
      },
    ],
  });

  /*
  |--------------------------------------------------------------------------
  | User Exists
  |--------------------------------------------------------------------------
  */

  if (!user) {
    throw new AppError("Invalid email or password", HTTP_STATUS.UNAUTHORIZED);
  }

  /*
  |--------------------------------------------------------------------------
  | User Active
  |--------------------------------------------------------------------------
  */

  if (!user.isActive) {
    throw new AppError("Account is inactive", HTTP_STATUS.FORBIDDEN);
  }

  /*
  |--------------------------------------------------------------------------
  | Role Exists
  |--------------------------------------------------------------------------
  */

  if (!user.role) {
    throw new AppError("Role not found", HTTP_STATUS.FORBIDDEN);
  }

  /*
  |--------------------------------------------------------------------------
  | Role Active
  |--------------------------------------------------------------------------
  */

  if (!user.role.isActive) {
    throw new AppError("Role is inactive", HTTP_STATUS.FORBIDDEN);
  }

  /*
  |--------------------------------------------------------------------------
  | Organization Exists
  |--------------------------------------------------------------------------
  */

  if (!user.organization) {
    throw new AppError("Organization not found", HTTP_STATUS.FORBIDDEN);
  }

  /*
  |--------------------------------------------------------------------------
  | Organization Active
  |--------------------------------------------------------------------------
  */

  if (!user.organization.isActive) {
    throw new AppError("Organization is inactive", HTTP_STATUS.FORBIDDEN);
  }

  /*
  |--------------------------------------------------------------------------
  | Password Verify
  |--------------------------------------------------------------------------
  */

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid email or password", HTTP_STATUS.UNAUTHORIZED);
  }

  user.lastLoginAt = new Date();

  await user.save();

  /*
  |--------------------------------------------------------------------------
  | Generate Token
  |--------------------------------------------------------------------------
  */

  const token = generateToken({
    userId: user.id,

    organizationId: user.organizationId,

    roleId: user.roleId,
  });

  /*
  |--------------------------------------------------------------------------
  | Response
  |--------------------------------------------------------------------------
  */

  return {
    accessToken: token,

    user: {
      id: user.id,

      firstName: user.firstName,

      lastName: user.lastName,

      email: user.email,

      isActive: user.isActive,

      role: {
        id: user.role.id,
        name: user.role.name,

        permissions: user.role.permissions.map((permission) => ({
          id: permission.id,
          name: permission.name,
          code: permission.code,
        })),
      },

      organization: {
        id: user.organization.id,
        name: user.organization.name,
        slug: user.organization.slug,
      },
    },
  };
};

// change password service
export const changePasswordService = async (data, currentUser) => {
  const { currentPassword, newPassword } = data;

  const user = await User.findOne({ where: { id: currentUser.id } });

  if (!user) throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch)
    throw new AppError(
      "Current password is incorrect",
      HTTP_STATUS.BAD_REQUEST,
    );

  if (currentPassword === newPassword)
    throw new AppError(
      "New password must be different",
      HTTP_STATUS.BAD_REQUEST,
    );

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return { message: "Password changed successfully" };
};
