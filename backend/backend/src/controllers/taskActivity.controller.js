import { asyncHandler } from "../utils/asyncHandler.js";
import { getTaskActivityService, getGlobalTaskActivityService} from "../services/taskActivity.service.js";

// getTaskActivity
export const getTaskActivity = asyncHandler(async (req, res) => {
  const result = await getTaskActivityService(req.params.id, req.query, req.user);

  return res.status(200).json({
    success: true,

    data: result,
  });
});


// getGlobalTaskActivityController
export const getGlobalTaskActivityController = asyncHandler(async (req, res, next) => {
  try {
    const data = await getGlobalTaskActivityService(req.query, req.user);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});
