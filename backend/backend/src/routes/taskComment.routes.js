import express from "express";
import auth from "../middleware/auth.middleware.js";
import authorize from "../middleware/authorize.middleware.js";
import { PERMISSIONS } from "../constants/permissions.js";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "../controllers/taskComment.controller.js";

const router = express.Router();

router.post("/tasks/:taskId/comments", auth, authorize(PERMISSIONS.CREATE_COMMENT), createComment);
router.get("/tasks/:taskId/comments", auth, authorize(PERMISSIONS.VIEW_TASKS), getComments);
router.patch("/comments/:id", auth, authorize(PERMISSIONS.UPDATE_COMMENT), updateComment);
router.delete("/comments/:id", auth, authorize(PERMISSIONS.DELETE_COMMENT), deleteComment);


export default router;