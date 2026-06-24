import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const User = sequelize.define(
  'User',
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

    roleId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },

    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    lastName: {
      type: DataTypes.STRING(100)
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },

    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: 'users',

    timestamps: true,

    createdAt: 'createdAt',

    updatedAt: 'updatedAt'
  }
);

export default User;