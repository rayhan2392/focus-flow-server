import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.join(process.cwd(), '.env'),
});

interface EnvConfig {
  NODE_ENV: 'development' | 'production';
  PORT: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  GEMINI_API_KEY: string;
  CLIENT_URL: string;
}

const loadEnvVariables = (): EnvConfig => {
  const requiredEnvVariables = [
    'NODE_ENV',
    'PORT',
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'JWT_EXPIRES_IN',
    'JWT_REFRESH_EXPIRES_IN',
    'GEMINI_API_KEY',
    'CLIENT_URL',
  ];

  requiredEnvVariables.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing environment variable: ${key}`);
    }
  });

  return {
    NODE_ENV: process.env.NODE_ENV as 'development' | 'production',
    PORT: process.env.PORT as string,
    DATABASE_URL: process.env.DATABASE_URL as string,
    JWT_SECRET: process.env.JWT_SECRET as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN as string,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN as string,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY as string,
    CLIENT_URL: process.env.CLIENT_URL as string,
  };
};

export const envVars = loadEnvVariables();