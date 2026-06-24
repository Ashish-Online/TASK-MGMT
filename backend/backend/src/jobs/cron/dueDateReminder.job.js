import cron from "node-cron";
import { Task } from "../../models/index.js";
import { sendNotification } from "../../services/notification.service.js";

export const startDueDateReminderJob = () => {
  cron.schedule("0 */6 * * *", async () => {
    console.log("Running Due Date Reminder Job...");

    const today = new Date();

    const tasks = await Task.findAll({
      where: {
        isActive: true,
      },
    });

    for (const task of tasks) {
      if (!task.dueDate) continue;

      const dueDate = new Date(task.dueDate);

      const diffDays =
        Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        await sendNotification({
          userId: task.assignedTo,
          organizationId: task.organizationId,
          title: "Task Due Reminder",
          message: `Task "${task.title}" is due tomorrow`,
          type: "TASK_DUE_REMINDER",
        });
      }
    }
  });
};