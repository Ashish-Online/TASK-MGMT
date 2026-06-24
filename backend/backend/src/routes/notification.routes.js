import express from "express";
import auth from "../middleware/auth.middleware.js";
import authorize from "../middleware/authorize.middleware.js";
import { PERMISSIONS } from "../constants/permissions.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from "../controllers/notification.controller.js";

const router = express();


router.get("/", auth,  authorize(PERMISSIONS.NOTIFICATION_VIEW), getNotifications);
router.get("/unread-count", auth, authorize(PERMISSIONS.NOTIFICATION_VIEW), getUnreadCount);
router.patch("/:id/read", auth, authorize(PERMISSIONS.NOTIFICATION_VIEW), markAsRead);
router.patch("/read-all", auth, authorize(PERMISSIONS.NOTIFICATION_VIEW), markAllAsRead);

export default router;
