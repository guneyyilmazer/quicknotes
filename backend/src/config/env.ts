import { config } from 'dotenv';
config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
};

if (!env.databaseUrl) {
  // eslint-disable-next-line no-console
  console.warn('[env] DATABASE_URL is not set. Using empty string which will fail to connect.');
} 