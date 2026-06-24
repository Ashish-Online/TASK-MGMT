import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const TaskComment = sequelize.define(
  "TaskComment",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    taskId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    organizationId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "task_comments",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

export default TaskComment;