# MCP Configuration for Meeting Scheduler

## Description
Model Context Protocol server that provides meeting scheduling capabilities using natural language processing and calendar integration.

## Server Details
- **Name**: meeting-scheduler
- **Version**: 1.0.0
- **Transport**: stdio
- **Language**: JavaScript (ES Modules)

## Available Tools

### schedule_meeting
Schedule a meeting using natural language input.
- **Input**: `text` (string) - Natural language description of the meeting
- **Output**: Confirmation with meeting details and event ID

### list_meetings
List upcoming meetings in the calendar.
- **Input**: `days` (number, optional) - Number of days to look ahead (default: 7)
- **Output**: List of upcoming meetings with titles, times, and participants

### check_availability
Check availability for a specific time slot.
- **Input**: `start_time` (string), `end_time` (string) - Times in ISO format
- **Output**: Availability status (Available/Busy)

### extract_meeting_details
Extract structured meeting details from natural language.
- **Input**: `text` (string) - Natural language text containing meeting information
- **Output**: Structured JSON with meeting details

## Integration
This MCP server can be integrated with any MCP-compatible client or LLM that supports tool calling.
