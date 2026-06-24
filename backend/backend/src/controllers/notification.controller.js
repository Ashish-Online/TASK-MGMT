import {asyncHandler} from "../utils/asyncHandler.js";
import {
  getNotificationsService,
  markAsReadService,
  markAllAsReadService,
  getUnreadCountService,
} from "../services/notification.service.js";

// getNotifications
export const getNotifications = asyncHandler(async (req, res) => {
  const data = await getNotificationsService(req.query, req.user);

  res.status(200).json({
    success: true,
    data,
  });
});

// markAsRead
export const markAsRead = asyncHandler(async (req, res) => {
  const data = await markAsReadService(req.params.id, req.user);

  res.status(200).json({
    success: true,
    message: "Marked as read",
    data,
  });
});

// markAllAsRead
export const markAllAsRead = asyncHandler(async (req, res) => {
  await markAllAsReadService(req.user);

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
  });
});

// getUnreadCount
export const getUnreadCount = asyncHandler(async (req, res) => {
  const data = await getUnreadCountService(req.user);

  res.status(200).json({
    success: true,
    data,
  });
});
