#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, 'config', '.env') });

// Import services
import { extractMeetingDetails } from './services/geminiService.js';
import { createEvent, checkAvailability, listEvents } from './services/calendarService.js';

const server = new Server(
  {
    name: 'meeting-scheduler',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'schedule_meeting',
        description: 'Schedule a meeting using natural language input',
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Natural language description of the meeting to schedule',
            },
          },
          required: ['text'],
        },
      },
      {
        name: 'list_meetings',
        description: 'List upcoming meetings in the calendar',
        inputSchema: {
          type: 'object',
          properties: {
            days: {
              type: 'number',
              description: 'Number of days to look ahead (default: 7)',
              default: 7,
            },
          },
        },
      },
      {
        name: 'check_availability',
        description: 'Check availability for a specific time slot',
        inputSchema: {
          type: 'object',
          properties: {
            start_time: {
              type: 'string',
              description: 'Start time in ISO format',
            },
            end_time: {
              type: 'string',
              description: 'End time in ISO format',
            },
          },
          required: ['start_time', 'end_time'],
        },
      },
      {
        name: 'extract_meeting_details',
        description: 'Extract structured meeting details from natural language',
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Natural language text containing meeting information',
            },
          },
          required: ['text'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'schedule_meeting': {
        const { text } = args;
        if (!text) {
          throw new McpError(ErrorCode.InvalidParams, 'Text is required');
        }

        // Extract meeting details using Gemini
        const meetingDetails = await extractMeetingDetails(text);
        
        if (!meetingDetails) {
          return {
            content: [
              {
                type: 'text',
                text: 'Could not extract meeting details from the provided text.',
              },
            ],
          };
        }

        // Create the event
        const event = await createEvent(meetingDetails);
        
        return {
          content: [
            {
              type: 'text',
              text: `Meeting scheduled successfully!\n\nTitle: ${event.title}\nTime: ${event.time}\nParticipants: ${event.participants?.join(', ') || 'None'}\nEvent ID: ${event.id}`,
            },
          ],
        };
      }

      case 'list_meetings': {
        const { days = 7 } = args;
        const events = await listEvents(days);
        
        const eventList = events.map(event => 
          `• ${event.title} - ${event.time}${event.participants ? ' with ' + event.participants.join(', ') : ''}`
        ).join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `Upcoming meetings (next ${days} days):\n\n${eventList || 'No meetings found.'}`,
            },
          ],
        };
      }

      case 'check_availability': {
        const { start_time, end_time } = args;
        if (!start_time || !end_time) {
          throw new McpError(ErrorCode.InvalidParams, 'Start time and end time are required');
        }

        const isAvailable = await checkAvailability({ start_time, end_time });
        
        return {
          content: [
            {
              type: 'text',
              text: `Availability from ${start_time} to ${end_time}: ${isAvailable ? 'Available' : 'Busy'}`,
            },
          ],
        };
      }

      case 'extract_meeting_details': {
        const { text } = args;
        if (!text) {
          throw new McpError(ErrorCode.InvalidParams, 'Text is required');
        }

        const details = await extractMeetingDetails(text);
        
        return {
          content: [
            {
              type: 'text',
              text: `Extracted meeting details:\n\n${JSON.stringify(details, null, 2)}`,
            },
          ],
        };
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error.message}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Meeting Scheduler MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
