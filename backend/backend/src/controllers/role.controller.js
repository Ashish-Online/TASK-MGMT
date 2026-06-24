import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createRoleService,
  getRolesService,
  getRoleByIdService,
  updateRoleService,
  deleteRoleService,
  assignPermissionsToRoleService,
  restoreRoleService
} from "../services/role.service.js";

// Create Roles
export const createRole = asyncHandler(async (req, res) => {
  const role = await createRoleService(req.body, req.user);

  return res.status(201).json({
    success: true,
    message: "Role created successfully",
    data: role,
  });
});

// Get Roles
export const getRoles = asyncHandler(async (req, res) => {
  const result = await getRolesService(req.query, req.user);

  return res.status(200).json({
    success: true,
    data: result,
  });
});

// Get By Id
export const getRoleById = asyncHandler(async (req, res) => {
  const role = await getRoleByIdService(req.params.id, req.user);

  return res.status(200).json({
    success: true,
    data: role,
  });
});

// Update Role
export const updateRole = asyncHandler(async (req, res) => {
  const role = await updateRoleService(req.params.id, req.body, req.user);

  return res.status(200).json({
    success: true,
    message: "Role updated successfully",
    data: role,
  });
});

// Delete Role
export const deleteRole = asyncHandler(async (req, res) => {
  await deleteRoleService(req.params.id, req.user);

  return res.status(200).json({
    success: true,
    message: "Role deleted successfully",
  });
});

// Update AssignPermission of Role
export const assignPermissionsToRole = asyncHandler(async (req, res) => {
  const role = await assignPermissionsToRoleService(
    req.params.id,
    req.body.permissionIds,
    req.user,
  );

  return res.status(200).json({
    success: true,
    message: "Permissions assigned successfully",
    data: role,
  });
});

// restore role
export const restoreRole = asyncHandler(async (req, res) => {
  const role = await restoreRoleService(req.params.id, req.user);

  return res.status(200).json({
    success: true,
    message: "Role restored successfully",
    data: role,
  });
});
