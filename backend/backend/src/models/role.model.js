import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Role = sequelize.define(
  'Role',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },

    organizationId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    description: {
      type: DataTypes.STRING(255)
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    tableName: 'roles',

    timestamps: true,

    createdAt: 'createdAt',

    updatedAt: 'updatedAt'
  }
);

export default Role;