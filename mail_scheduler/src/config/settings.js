import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the .env file in the same directory
dotenv.config({ path: join(__dirname, '.env') });

export default {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'your-gemini-api-key',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN || '',
  OUTLOOK_CLIENT_ID: process.env.OUTLOOK_CLIENT_ID || '',
  OUTLOOK_CLIENT_SECRET: process.env.OUTLOOK_CLIENT_SECRET || '',
  OUTLOOK_REFRESH_TOKEN: process.env.OUTLOOK_REFRESH_TOKEN || '',
  DEFAULT_CALENDAR_ID: process.env.DEFAULT_CALENDAR_ID || 'primary'
};
