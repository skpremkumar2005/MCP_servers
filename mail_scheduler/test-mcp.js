#!/usr/bin/env node

/**
 * Simple test script to demonstrate MCP server interaction
 * This shows how to send requests to the meeting scheduler MCP server
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
      if (code === 0) {
        try {
          // Parse the JSON response (may have multiple lines)
          const lines = response.trim().split('\n');
          const jsonLine = lines.find(line => line.startsWith('{'));
          if (jsonLine) {
            resolve(JSON.parse(jsonLine));
          } else {
            reject(new Error('No JSON response found'));
          }
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error(`Server exited with code ${code}: ${errorOutput}`));
      }
    });

    // Send the request
    server.stdin.write(JSON.stringify(request) + '\n');
    server.stdin.end();
  });
}

async function testMcpServer() {
  console.log('Testing Meeting Scheduler MCP Server...\n');

  try {
    // Test 1: List available tools
    console.log('1. Listing available tools...');
    const toolsResponse = await sendMcpRequest('tools/list');
    console.log('Available tools:', toolsResponse.result.tools.map(t => t.name).join(', '));
    console.log('✅ Tools list successful\n');

    // Test 2: Extract meeting details
    console.log('2. Extracting meeting details...');
    const extractResponse = await sendMcpRequest('tools/call', {
      name: 'extract_meeting_details',
      arguments: {
        text: 'Schedule a team meeting tomorrow at 2pm with John and Sarah to discuss the project roadmap'
      }
    });
    console.log('Extracted details:', extractResponse.result.content[0].text);
    console.log('✅ Extraction successful\n');

    // Test 3: Schedule a meeting
    console.log('3. Scheduling a meeting...');
    const scheduleResponse = await sendMcpRequest('tools/call', {
      name: 'schedule_meeting',
      arguments: {
        text: 'Book a 1-hour meeting with the development team next Tuesday at 10am to review sprint planning'
      }
    });
    console.log('Schedule result:', scheduleResponse.result.content[0].text);
    console.log('✅ Scheduling successful\n');

    // Test 4: List meetings
    console.log('4. Listing upcoming meetings...');
    const listResponse = await sendMcpRequest('tools/call', {
      name: 'list_meetings',
      arguments: { days: 7 }
    });
    console.log('Meetings:', listResponse.result.content[0].text);
    console.log('✅ Listing successful\n');

    // Test 5: Check availability
    console.log('5. Checking availability...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);
    const endTime = new Date(tomorrow);
    endTime.setHours(15, 0, 0, 0);

    const availabilityResponse = await sendMcpRequest('tools/call', {
      name: 'check_availability',
      arguments: {
        start_time: tomorrow.toISOString(),
        end_time: endTime.toISOString()
      }
    });
    console.log('Availability:', availabilityResponse.result.content[0].text);
    console.log('✅ Availability check successful\n');

    console.log('🎉 All tests passed! The MCP server is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMcpServer();
