import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const TaskAttachment = sequelize.define("TaskAttachment", {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },

  taskId: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },

  fileName: {
    type: DataTypes.STRING,
  },

  fileUrl: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  fileType: {
    type: DataTypes.STRING,
  },

  cloudinaryPublicId: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  uploadedBy: {
    type: DataTypes.BIGINT,
  },
});


export default TaskAttachment;
