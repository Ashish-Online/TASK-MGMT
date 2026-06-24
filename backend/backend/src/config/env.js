import dotenv from "dotenv";

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",

  PORT: process.env.PORT || 5000,

  DB_HOST: process.env.DB_HOST,

  DB_PORT: process.env.DB_PORT,

  DB_NAME: process.env.DB_NAME,

  DB_USER: process.env.DB_USER,

  DB_PASSWORD: process.env.DB_PASSWORD,

  JWT_SECRET: process.env.JWT_SECRET,

  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,

  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,

  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  SMTP_HOST: process.env.SMTP_HOST,

  SMTP_PORT: process.env.SMTP_PORT,

  SMTP_USER: process.env.SMTP_USER,

  SMTP_PASS: process.env.SMTP_PASS,
};
