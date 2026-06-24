import { Router } from 'express';
import auth from "../middleware/auth.middleware.js";
import authorize from "../middleware/authorize.middleware.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { getPermissions } from '../controllers/permission.controller.js';

const router = Router();

router.get("/", auth, authorize(PERMISSIONS.VIEW_PERMISSIONS), getPermissions);

export default router;
