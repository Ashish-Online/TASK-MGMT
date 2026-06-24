import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const TaskActivity = sequelize.define(
  "TaskActivity",
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

    organizationId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    oldValue: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    newValue: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "task_activities",

    timestamps: true,

    createdAt: "createdAt",

    updatedAt: false,
  },
);

export default TaskActivity;