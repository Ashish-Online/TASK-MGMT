import { sequelize } from './database.js';

export const connectDatabase = async () => {
  try {

    await sequelize.authenticate();

    console.log(
      'Database Connected Successfully'
    );

  } catch (error) {

    console.error(
      'Database Connection Failed'
    );

    console.error(error);

    process.exit(1);
  }
};