import dotenv from 'dotenv';

dotenv.config();

export const config = {
  gemini: {
    // Fallback to the provided key so local runs work even if .env is missing
    apiKey: process.env.GEMINI_API_KEY || 'AIzaSyCa5xfG486cy_rSOdLU_BVNJfK_EQDjc_o',
    // Model is pinned to the supported default to avoid 404s from deprecated names
    model: 'gemini-2.5-flash'
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'railway',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },
  server: {
    port: parseInt(process.env.PORT) || 5000
  }
};

// Validate API key exists
if (!config.gemini.apiKey) {
  console.error('❌ GEMINI_API_KEY not found in .env');
  console.error('Get your API key from: https://makersuite.google.com/app/apikey');
  process.exit(1);
}
