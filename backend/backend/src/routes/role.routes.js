import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import authorize from "../middleware/authorize.middleware.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { validate } from "../middleware/validation.middleware.js";
import { createRoleSchema, updateRoleSchema, assignPermissionsSchema } from "../validations/role.validation.js";
import { createRole, getRoles, getRoleById, updateRole, deleteRole, assignPermissionsToRole, restoreRole } from "../controllers/role.controller.js";

const router = Router();

router.post( "/", auth, authorize(PERMISSIONS.CREATE_ROLE), validate(createRoleSchema), createRole);
router.get("/", auth, authorize(PERMISSIONS.VIEW_ROLES), getRoles);
router.get("/:id", auth, authorize(PERMISSIONS.VIEW_ROLES), getRoleById);
router.patch("/:id", auth, authorize(PERMISSIONS.UPDATE_ROLE), validate(updateRoleSchema), updateRole);
router.delete("/:id", auth, authorize(PERMISSIONS.DELETE_ROLE), deleteRole);
router.put("/:id/permissions", auth, authorize(PERMISSIONS.UPDATE_ROLE), validate(assignPermissionsSchema), assignPermissionsToRole);
router.patch("/:id/restore",auth,authorize(PERMISSIONS.UPDATE_ROLE),restoreRole);

export default router;
