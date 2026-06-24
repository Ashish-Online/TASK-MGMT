import { Sequelize } from 'sequelize';

import { env } from './env.js';

export const sequelize = new Sequelize(
  env.DB_NAME,
  env.DB_USER,
  env.DB_PASSWORD,
  {
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    dialect: 'mysql',

    logging: false
  }
);