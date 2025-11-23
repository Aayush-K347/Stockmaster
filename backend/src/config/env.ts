import dotenv from 'dotenv';

dotenv.config();

const pickEnv = (keys: string[], fallback?: string) => {
  for (const key of keys) {
    const value = process.env[key];
    if (value !== undefined && value !== '') {
      return value;
    }
  }
  if (fallback !== undefined) {
    return fallback;
  }
  throw new Error(`Environment variable ${keys.join(' or ')} is required`);
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  appName: process.env.APP_NAME || 'stockmaster',
  jwtSecret: pickEnv(['JWT_SECRET']),
  firebase: {
    projectId: pickEnv(['FIREBASE_PROJECT_ID']),
    clientEmail: pickEnv(['FIREBASE_CLIENT_EMAIL']),
    privateKey: pickEnv(['FIREBASE_PRIVATE_KEY']),
  },
  db: {
    host: pickEnv(['DB_HOST', 'MYSQLHOST']),
    port: Number(pickEnv(['DB_PORT', 'MYSQLPORT'], '3306')),
    user: pickEnv(['DB_USER', 'MYSQLUSER']),
    password: pickEnv(['DB_PASSWORD', 'MYSQLPASSWORD']),
    database: pickEnv(['DB_NAME', 'MYSQLDATABASE']),
  },
};
