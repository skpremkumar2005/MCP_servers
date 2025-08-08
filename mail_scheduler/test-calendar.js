#!/usr/bin/env node

/**
 * Test script specifically for Google Calendar integration
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPath = join(__dirname, 'src', 'server.js');

function sendMcpRequest(method, params = {}) {
  return new Promise((resolve, reject) => {
    const server = spawn('node', [serverPath]);
    let response = '';
    let errorOutput = '';

    const request = {
      jsonrpc: '2.0',
      id: 1,
      method,
      params
    };

    server.stdout.on('data', (data) => {
      response += data.toString();
    });

    server.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    server.on('close', (code) => {
      try {
        // Filter out stderr messages and find the JSON response
        const lines = response.trim().split('\n');
        const jsonLine = lines.find(line => {
          try {
            JSON.parse(line);
            return true;
          } catch {
            return false;
          }
        });
        
        if (jsonLine) {
          resolve(JSON.parse(jsonLine));
        } else {
          reject(new Error('No JSON response found'));
        }
      } catch (err) {
        reject(new Error(`Parse error: ${err.message}\nResponse: ${response}\nError: ${errorOutput}`));
      }
    });

    server.stdin.write(JSON.stringify(request) + '\n');
    server.stdin.end();
  });
}

async function testCalendarIntegration() {
  console.log('🗓️  Testing Google Calendar Integration...\n');

  try {
    // Test scheduling a real meeting
    console.log('📅 Scheduling a test meeting...');
    const scheduleResponse = await sendMcpRequest('tools/call', {
      name: 'schedule_meeting',
      arguments: {
        text: 'Schedule a test meeting tomorrow at 3pm for 1 hour to test the calendar integration'
      }
    });
    
    console.log('Response:', scheduleResponse.result.content[0].text);
    
    if (scheduleResponse.result.content[0].text.includes('successfully')) {
      console.log('✅ Meeting scheduled in Google Calendar!\n');
    } else {
      console.log('❌ Meeting scheduling failed\n');
    }

    // Test listing meetings
    console.log('📋 Listing current meetings...');
    const listResponse = await sendMcpRequest('tools/call', {
      name: 'list_meetings',
      arguments: { days: 3 }
    });
    
    console.log('Current meetings:', listResponse.result.content[0].text);
    console.log('✅ Meeting list retrieved\n');

  } catch (error) {
    console.error('❌ Calendar integration test failed:', error.message);
    
    if (error.message.includes('invalid_grant')) {
      console.log('\n🔧 Fix: Your Google refresh token may have expired. Please regenerate it.');
    } else if (error.message.includes('insufficient permissions')) {
      console.log('\n🔧 Fix: Make sure your Google OAuth app has Calendar API permissions.');
    } else {
      console.log('\n🔧 Check your .env file configuration and Google API credentials.');
    }
  }
}

testCalendarIntegration();
