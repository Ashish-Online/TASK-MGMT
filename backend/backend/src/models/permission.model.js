import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Permission = sequelize.define(
  'Permission',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },

    code: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true
    },

    description: {
      type: DataTypes.STRING(255)
    }
  },
  {
    tableName: 'permissions',

    timestamps: true,

    createdAt: 'created_at',

    updatedAt: 'updated_at'
  }
);

export default Permission;