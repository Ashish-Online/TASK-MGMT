import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import authorize from "../middleware/authorize.middleware.js";
import { PERMISSIONS } from "../constants/permissions.js";
import {getTaskActivity, getGlobalTaskActivityController} from '../controllers/taskActivity.controller.js';

const router = Router();

router.get("/:id/activity", auth, authorize(PERMISSIONS.VIEW_AUDIT_LOG), getTaskActivity);
router.get("/activity", auth, authorize(PERMISSIONS.VIEW_AUDIT_LOG), getGlobalTaskActivityController);

export default router;