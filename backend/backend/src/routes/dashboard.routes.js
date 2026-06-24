import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import authorize from "../middleware/authorize.middleware.js";
import {PERMISSIONS} from '../constants/permissions.js';
import {
    getDashboardOverviewController, 
    getRecentTasksController, 
    getRecentActivitiesController, 
    getTaskStatusChartController, 
    getProductivityController,
    getTeamPerformanceController,
    getPendingReviewsController,
    getOverdueTasksController,
    getTaskPriorityChartController,
    getMonthlyTaskTrendController,
    getTopPerformersController,
    exportDashboardReportController,
    exportTaskActivityController,
} from '../controllers/dashboard.controller.js';

const router = Router();


router.get("/overview", auth, getDashboardOverviewController);
router.get("/recent-tasks", auth, getRecentTasksController);
router.get("/recent-activities", auth, authorize(PERMISSIONS.VIEW_AUDIT_LOG), getRecentActivitiesController);
router.get("/task-status-chart", auth, getTaskStatusChartController);
router.get("/productivity", auth, getProductivityController);
router.get("/team-performance", auth, authorize(PERMISSIONS.VIEW_ALL_TASKS), getTeamPerformanceController);
router.get("/pending-reviews", auth, getPendingReviewsController);
router.get("/overdue-tasks", auth, getOverdueTasksController);
router.get("/task-priority-chart", auth, getTaskPriorityChartController);
router.get("/monthly-task-trend", auth, getMonthlyTaskTrendController);
router.get("/top-performers", auth, getTopPerformersController);
router.get("/export-report", auth, exportDashboardReportController);
router.get("/:taskId/activity/export", auth, authorize(PERMISSIONS.VIEW_AUDIT_LOG), exportTaskActivityController);

export default router;
