import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

/*
|--------------------------------------------------------------------------
| NOTIFICATION TYPES — Complete list of all types emitted across codebase
|--------------------------------------------------------------------------
| BUG-1  fix: Expanded from original 4 types to cover all service usages.
| BUG-9  fix: Added COMMENT_UPDATED and COMMENT_DELETED emitted by
|             taskComment.service.js updateCommentService /
|             deleteCommentService — were missing even after BUG-1 fix.
|
| Sources:
|   task.service.js        → TASK_ASSIGNED, TASK_REASSIGNED, TASK_UNASSIGNED,
|                            TASK_REVIEW_ASSIGNED, TASK_READY_FOR_REVIEW,
|                            TASK_APPROVED, TASK_REJECTED,
|                            TASK_DELETED, TASK_RESTORED
|   taskComment.service.js → TASK_COMMENT, COMMENT_UPDATED, COMMENT_DELETED
|   cron/dueDateReminder   → TASK_DUE_REMINDER
|   cron/autoReminder      → TASK_REMINDER
|--------------------------------------------------------------------------
*/

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    organizationId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM(
        // Task assignment lifecycle
        "TASK_ASSIGNED",
        "TASK_REASSIGNED",
        "TASK_UNASSIGNED",
        // Task review lifecycle
        "TASK_REVIEW_ASSIGNED",
        "TASK_READY_FOR_REVIEW",
        "TASK_APPROVED",
        "TASK_REJECTED",
        // Task soft-delete lifecycle
        "TASK_DELETED",
        "TASK_RESTORED",
        // Comments — BUG-9 fix: all three types added
        "TASK_COMMENT",
        "COMMENT_UPDATED",
        "COMMENT_DELETED",
        // Cron-generated reminders
        "TASK_DUE_REMINDER",
        "TASK_REMINDER"
      ),
      allowNull: false,
    },

    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "notifications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Notification;
