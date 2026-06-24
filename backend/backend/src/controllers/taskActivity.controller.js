import { asyncHandler } from "../utils/asyncHandler.js";
import { getTaskActivityService, getGlobalTaskActivityService} from "../services/taskActivity.service.js";

// getTaskActivity
export const getTaskActivity = asyncHandler(async (req, res) => {
  const activities = await getTaskActivityService(req.params.id, req.user);

  return res.status(200).json({
    success: true,

    data: activities,
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
