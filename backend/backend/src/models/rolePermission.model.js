import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const RolePermission = sequelize.define(
  'RolePermission',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },

    roleId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },

    permissionId: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  },
  {
    tableName: 'role_permissions',

    timestamps: false
  }
);

export default RolePermission;