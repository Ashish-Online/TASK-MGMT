import { startDueDateReminderJob } from "./cron/dueDateReminder.job.js";
import { startOverdueStatusJob } from "./cron/overdueStatus.job.js";
import { startAutoReminderJob } from "./cron/notificationReminder.job.js";

export const startJobs = () => {
  startDueDateReminderJob();
  startOverdueStatusJob();
  startAutoReminderJob();

  console.log("All cron jobs started...");
};