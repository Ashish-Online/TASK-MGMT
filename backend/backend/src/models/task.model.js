import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    organizationId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
    },

    status: {
      type: DataTypes.ENUM(
        "TODO",
        "IN_PROGRESS",
        "COMPLETED",
        "APPROVED",
        "REJECTED",
      ),
      defaultValue: "TODO",
    },

    priority: {
      type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH"),
      defaultValue: "MEDIUM",
    },

    assignedTo: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },

    createdBy: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    reviewerId: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    reviewReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    slaHours: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    isDelayed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "tasks",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
);

export default Task;
