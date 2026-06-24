import {Notification} from "../models/index.js";
import { getIO } from "../socket/index.js";
import { userSocketMap } from "../socket/socketEvents.js";

// getNotificationsService
export const getNotificationsService = async (query, currentUser) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const offset = (page - 1) * limit;

  const { rows, count } = await Notification.findAndCountAll({
    where: {
      userId: currentUser.id,
      organizationId: currentUser.organizationId,
    },

    limit,
    offset,

    order: [["created_at", "DESC"]],
  });

  return {
    notifications: rows,
    pagination: {
      page,
      limit,
      totalRecords: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

// markAsReadService
export const markAsReadService = async (notificationId, currentUser) => {
  const notification = await Notification.findOne({
    where: {
      id: notificationId,
      userId: currentUser.id,
    },
  });

  if (!notification) {
    throw new AppError("Notification not found", HTTP_STATUS.NOT_FOUND);
  }

  notification.isRead = true;

  await notification.save();

  return notification;
};

// markAllAsReadService
export const markAllAsReadService = async (currentUser) => {
  await Notification.update(
    { isRead: true },
    {
      where: {
        userId: currentUser.id,
        isRead: false,
      },
    },
  );

  return true;
};

// getUnreadCountService
export const getUnreadCountService = async (currentUser) => {
  const count = await Notification.count({
    where: {
      userId: currentUser.id,
      isRead: false,
    },
  });

  return { unreadCount: count };
};


// send and store notification service (utility file)
export const sendNotification = async ({
  userId,
  organizationId,
  title,
  message,
  type,
}) => {
  // 1. Save in DB
  const notification = await Notification.create({
    userId,
    organizationId,
    title,
    message,
    type,
  });

  // 2. Send real-time via socket
  const sockets = userSocketMap.get(Number(userId));

  if (sockets) {
    for (const socketId of sockets) {
      getIO().to(socketId).emit("notification", {
        id: notification.id,
        title,
        message,
        type,
        createdAt: notification.created_at,
      });
    }
  }

  return notification;
};



