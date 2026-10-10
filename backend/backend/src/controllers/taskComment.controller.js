import {asyncHandler} from "../utils/asyncHandler.js";

import {
  getCommentsService,
  createCommentService,
  updateCommentService,
  deleteCommentService,
} from "../services/taskComment.service.js";


// createComment
export const createComment = asyncHandler(async (req, res) => {
  const comment = await createCommentService(
    req.params.taskId,
    req.body.message,
    req.user,
  );

  return res.status(201).json({
    success: true,

    message: "Comment created successfully",

    data: comment,
  });
});

// getComments
export const getComments = asyncHandler(async (req, res) => {
  const result = await getCommentsService(req.params.taskId, req.query, req.user);

  return res.status(200).json({
    success: true,

    data: result,
  });
});

// updateComment
export const updateComment = asyncHandler(async (req, res) => {
  const comment = await updateCommentService(
    req.params.id,
    req.body.message,
    req.user,
  );

  return res.status(200).json({
    success: true,

    message: "Comment updated successfully",

    data: comment,
  });
});

// deleteComment
export const deleteComment = asyncHandler(async (req, res) => {
  await deleteCommentService(req.params.id, req.user);

  return res.status(200).json({
    success: true,

    message: "Comment deleted successfully",
  });
});
