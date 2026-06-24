import cron from "node-cron";
import { Task } from "../../models/index.js";
import { sendNotification } from "../../services/notification.service.js";

export const startAutoReminderJob = () => {
  cron.schedule("0 */12 * * *", async () => {
    console.log("Running Auto Reminder Job...");

    const tasks = await Task.findAll({
      where: {
        status: "IN_PROGRESS",
        isActive: true,
      },
    });

    for (const task of tasks) {
      await sendNotification({
        userId: task.assignedTo,
        organizationId: task.organizationId,
        title: "Task Reminder",
        message: `Please continue working on "${task.title}"`,
        type: "TASK_REMINDER",
      });
    }
  });
};