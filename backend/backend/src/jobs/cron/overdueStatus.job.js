import cron from "node-cron";
import { Op } from "sequelize";
import { Task } from "../../models/index.js";

/*
|--------------------------------------------------------------------------
| Overdue Task Tracking Job
|--------------------------------------------------------------------------
| Runs every hour. Identifies tasks whose dueDate has passed and that are
| not yet in a terminal state (COMPLETED or APPROVED).
|
| FIX (BUG-2): The original code set task.status = "OVERDUE" which is not
| a valid value in the Task ENUM { TODO, IN_PROGRESS, COMPLETED, APPROVED,
| REJECTED }. Writing an out-of-ENUM value causes a Sequelize/MySQL
| constraint error, crashing the cron job every hour.
|
| SOLUTION: Use the existing `isDelayed` boolean field (already on the
| Task model for SLA tracking). Overdue tasks are identified by:
|   dueDate < NOW  AND  status NOT IN ('COMPLETED', 'APPROVED')
| We flip isDelayed = true to record the overdue state without touching
| the workflow status, preserving the state machine integrity.
|
| Business logic preserved: tasks that are past their due date and not
| completed/approved are flagged. The frontend can filter/highlight
| these using isDelayed = true.
|--------------------------------------------------------------------------
*/

export const startOverdueStatusJob = () => {
  // Runs at the top of every hour
  cron.schedule("0 * * * *", async () => {
    console.log("[Cron] Checking overdue tasks...");

    try {
      const now = new Date();

      const [updatedCount] = await Task.update(
        { isDelayed: true },
        {
          where: {
            isActive: true,
            isDelayed: false,
            dueDate: {
              [Op.lt]: now,
            },
            status: {
              [Op.notIn]: ["COMPLETED", "APPROVED"],
            },
          },
        }
      );

      if (updatedCount > 0) {
        console.log(`[Cron] Marked ${updatedCount} task(s) as overdue (isDelayed=true).`);
      }
    } catch (error) {
      console.error("[Cron] Overdue status job failed:", error.message);
    }
  });
};
