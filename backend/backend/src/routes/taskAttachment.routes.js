import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import { upload } from "../config/upload.js";
import {
  uploadTaskAttachmentController,
  deleteTaskAttachmentController,
  getTaskAttachmentsController,
  updateTaskAttachmentController,
} from "../controllers/taskAttachment.controller.js";
import authorize from "../middleware/authorize.middleware.js";
import { PERMISSIONS } from "../constants/permissions.js";


const router = Router();

router.post("/:taskId/attachments", auth, authorize(PERMISSIONS.CREATE_ATTACHMENT) , upload.array("files", 10), uploadTaskAttachmentController);
router.delete("/:attachmentId", auth, authorize(PERMISSIONS.DELETE_ATTACHMENT), deleteTaskAttachmentController);
router.patch("/:attachmentId", auth, authorize(PERMISSIONS.UPDATE_ATTACHMENT), upload.single("file"), updateTaskAttachmentController);
router.get("/task/:taskId", auth, getTaskAttachmentsController);

export default router;
