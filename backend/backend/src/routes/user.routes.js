import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import authorize from "../middleware/authorize.middleware.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { validate } from "../middleware/validation.middleware.js";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  changeUserRole,
  deleteUser,
  restoreUser,
  getOnlineUsersController,
} from "../controllers/user.controller.js";
import {
  createUserSchema,
  getUsersSchema,
  updateUserSchema,
  changeUserRoleSchema,
} from "../validations/user.validation.js";
import { validateQuery } from "../middleware/validateQuery.middleware.js";

const router = Router();

// --- Collection routes (no path params) ---
router.post("/", auth, authorize(PERMISSIONS.CREATE_USER), validate(createUserSchema), createUser);
router.get("/", auth, authorize(PERMISSIONS.VIEW_USERS), validateQuery(getUsersSchema), getUsers);

// --- Static named routes (MUST come before /:id) ---
router.get("/online-users", auth, getOnlineUsersController);

// --- Parameterized routes ---
router.get("/:id", auth, authorize(PERMISSIONS.VIEW_USERS), getUserById);
router.patch("/:id", auth, authorize(PERMISSIONS.UPDATE_USER), validate(updateUserSchema), updateUser);
router.patch("/:id/role", auth, authorize(PERMISSIONS.UPDATE_USER), validate(changeUserRoleSchema), changeUserRole);
router.delete("/:id", auth, authorize(PERMISSIONS.DELETE_USER), deleteUser);
router.patch("/:id/restore", auth, authorize(PERMISSIONS.UPDATE_USER), restoreUser);

export default router;
