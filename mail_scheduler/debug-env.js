#!/usr/bin/env node

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, 'src', 'config', '.env');
console.log('Loading .env from:', envPath);

const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('✅ .env file loaded successfully');
}

// Check environment variables
console.log('\n🔍 Environment Variables Check:');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Not set');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Not set');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Not set');
console.log('GOOGLE_REFRESH_TOKEN:', process.env.GOOGLE_REFRESH_TOKEN ? '✅ Set' : '❌ Not set');

// Import and check config
import config from './src/config/settings.js';
console.log('\n📋 Config Values:');
console.log('GEMINI_API_KEY:', config.GEMINI_API_KEY ? '✅ Loaded' : '❌ Not loaded');
console.log('GOOGLE_CLIENT_ID:', config.GOOGLE_CLIENT_ID ? '✅ Loaded' : '❌ Not loaded');
console.log('GOOGLE_CLIENT_SECRET:', config.GOOGLE_CLIENT_SECRET ? '✅ Loaded' : '❌ Not loaded');
console.log('GOOGLE_REFRESH_TOKEN:', config.GOOGLE_REFRESH_TOKEN ? '✅ Loaded' : '❌ Not loaded');
