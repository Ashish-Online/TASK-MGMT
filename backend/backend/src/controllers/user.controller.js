import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createUserService,
  getUsersService,
  getUserByIdService,
  updateUserService,
  changeUserRoleService,
  deleteUserService,
  restoreUserService,
  getOnlineUsersService,
} from "../services/user.service.js";

// create user
export const createUser = asyncHandler(async (req, res) => {
  const user = await createUserService(req.body, req.user);

  return res.status(201).json({
    success: true,
    message: "User created successfully",
    data: user,
  });
});

// get user
export const getUsers = asyncHandler(async (req, res) => {
  const result = await getUsersService(req.query, req.user);

  return res.status(200).json({
    success: true,
    ...result,
  });
});

// get user by id
export const getUserById = asyncHandler(async (req, res) => {
  const user = await getUserByIdService(req.params.id, req.user);

  return res.status(200).json({
    success: true,
    data: user,
  });
});

// update user
export const updateUser = asyncHandler(async (req, res) => {
  const user = await updateUserService(req.params.id, req.body, req.user);

  return res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
});

// change user role
export const changeUserRole = asyncHandler(async (req, res) => {
  const user = await changeUserRoleService(
    req.params.id,
    req.body.roleId,
    req.user,
  );

  return res.status(200).json({
    success: true,

    message: "User role updated successfully",

    data: user,
  });
});

// update user status
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await deleteUserService(req.params.id, req.user);

  return res.status(200).json({
    success: true,

    message: "User deleted successfully",

    data: user,
  });
});

// restore user
export const restoreUser = asyncHandler(async (req, res) => {
  const user = await restoreUserService(req.params.id, req.user);

  return res.status(200).json({
    success: true,
    message: "User restored successfully",
    data: user,
  });
});

// online users
// controllers/socket.controller.js
export const getOnlineUsersController = asyncHandler(async (req, res, next) => {
  try {
    const data = await getOnlineUsersService();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});
