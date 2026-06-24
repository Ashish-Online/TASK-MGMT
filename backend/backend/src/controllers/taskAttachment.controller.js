import {
  createAttachmentService,
  deleteTaskAttachmentService,
  getTaskAttachmentsService,
  updateTaskAttachmentService,
} from "../services/taskAttachment.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const uploadTaskAttachmentController = asyncHandler(
  async (req, res, next) => {
    try {
      const { taskId } = req.params;

      // BUG-11 fix: was req.file → now req.files (array from upload.array)
      const files = req.files;

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded",
        });
      }

      const attachments = await createAttachmentService(
        taskId,
        files,
        req.user,
      );

      res.status(201).json({ success: true, data: attachments });
    } catch (error) {
      next(error);
    }
  },
);

export const deleteTaskAttachmentController = asyncHandler(
  async (req, res, next) => {
    try {
      const { attachmentId } = req.params;
      await deleteTaskAttachmentService(attachmentId, req.user);
      return res
        .status(200)
        .json({ success: true, message: "Attachment deleted successfully" });
    } catch (error) {
      next(error);
    }
  },
);

// Add to taskAttachment.controller.js
export const updateTaskAttachmentController = asyncHandler(
  async (req, res, next) => {
    try {
      const { attachmentId } = req.params;
      const file = req.file;

      if (!file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }

      const updated = await updateTaskAttachmentService(
        attachmentId,
        file,
        req.user,
      );
      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },
);

export const getTaskAttachmentsController = asyncHandler(
  async (req, res, next) => {
    try {
      const { taskId } = req.params;
      const attachments = await getTaskAttachmentsService(taskId, req.user);
      return res.status(200).json({ success: true, data: attachments });
    } catch (error) {
      next(error);
    }
  },
);
