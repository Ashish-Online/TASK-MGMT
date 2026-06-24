import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Organization = sequelize.define(
  'Organization',
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

    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    tableName: 'organizations',

    timestamps: true,

    createdAt: 'created_at',

    updatedAt: 'updated_at'
  }
);

export default Organization;