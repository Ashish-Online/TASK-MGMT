import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getDashboardOverviewService,
  getRecentTasksService,
  getRecentActivitiesService,
  getTaskStatusChartService,
  getProductivityService,
  getTeamPerformanceService,
  getPendingReviewsService,
  getOverdueTasksService,
  getTaskPriorityChartService,
  getMonthlyTaskTrendService,
  getTopPerformersService,
  exportDashboardReportService,
  exportTaskActivityService,
} from "../services/dashboard.service.js";
import fs from 'fs';

// getDashboardOverviewController
export const getDashboardOverviewController = asyncHandler(async (req, res) => {
  const data = await getDashboardOverviewService(req.user);

  return res.status(200).json({
    success: true,
    data,
  });
});

// getRecentTasksController
export const getRecentTasksController = asyncHandler(async (req, res, next) => {
  try {
    const data = await getRecentTasksService(req.user);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

// getRecentActivitiesController
export const getRecentActivitiesController = asyncHandler(
  async (req, res, next) => {
    try {
      const data = await getRecentActivitiesService(req.user);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
);

// getTaskStatusChartController
export const getTaskStatusChartController = asyncHandler(
  async (req, res, next) => {
    try {
      const data = await getTaskStatusChartService(req.user);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
);

// getProductivityController
export const getProductivityController = asyncHandler(
  async (req, res, next) => {
    try {
      const data = await getProductivityService(req.user);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
);

// getTeamPerformanceController
export const getTeamPerformanceController = asyncHandler(
  async (req, res, next) => {
    try {
      const data = await getTeamPerformanceService(req.user);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
);

// getPendingReviewsController
export const getPendingReviewsController = asyncHandler(
  async (req, res, next) => {
    try {
      const data = await getPendingReviewsService(req.user);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
);

// getOverdueTasksController
export const getOverdueTasksController = asyncHandler(
  async (req, res, next) => {
    try {
      const data = await getOverdueTasksService(req.user);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
);

// getTaskPriorityChartController
export const getTaskPriorityChartController = asyncHandler(
  async (req, res, next) => {
    try {
      const data = await getTaskPriorityChartService(req.user);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
);

// getMonthlyTaskTrendController
export const getMonthlyTaskTrendController = asyncHandler(
  async (req, res, next) => {
    try {
      const data = await getMonthlyTaskTrendService(req.user);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
);

// getTopPerformersController
export const getTopPerformersController = asyncHandler(
  async (req, res, next) => {
    try {
      const data = await getTopPerformersService(req.user);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
);

// exportDashboardReportController
export const exportDashboardReportController = asyncHandler(
  async (req, res, next) => {
    try {
      const file = await exportDashboardReportService(req.user);

      res.download(file.path, (err) => {
        fs.unlink(file.path, () => {}); // download ke baad delete
        if (err) next(err);
      });

    } catch (error) {
      next(error);
    }
  },
);

// exportTaskActivityController
export const exportTaskActivityController = asyncHandler(
  async (req, res, next) => {
    try {
      const file = await exportTaskActivityService(req.params.taskId, req.user);

      res.download(file.path, (err) => {
        fs.unlink(file.path, () => {}); // download ke baad delete
        if (err) next(err);
      });
      
    } catch (error) {
      next(error);
    }
  },
);
