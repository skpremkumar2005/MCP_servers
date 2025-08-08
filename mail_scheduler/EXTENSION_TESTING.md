# VS Code Extension Testing Guide

## ✅ Extension Syntax Errors Fixed!

The TypeScript syntax errors have been resolved:
- Fixed TypeScript typing for error handling
- Added proper type annotations for input validation
- Improved JSON parsing for MCP responses

## How to Test the Extension:

### Method 1: Command Palette Test
1. **Press `Ctrl+Shift+P`** to open Command Palette
2. **Type**: `Meeting Scheduler`
3. **Select**: `Meeting Scheduler: Schedule Meeting`
4. **Enter test text**: "Schedule a quick sync meeting tomorrow at 3pm"
5. **Check result**: Should show success message with calendar link

### Method 2: Extract Meeting Details Test  
1. **Open the file**: `test-meeting-text.txt`
2. **Select all text** in the file (`Ctrl+A`)
3. **Open Command Palette**: `Ctrl+Shift+P`
4. **Run**: `Meeting Scheduler: Extract Meeting Details`
5. **Check result**: Should show extracted meeting details in JSON format

### Method 3: Keyboard Shortcut Test
1. **Press `Ctrl+Shift+M`** (quick shortcut)
2. **Enter**: "Book a team standup for Friday at 10am"
3. **Check your Google Calendar** for the new event

## Expected Results:
- ✅ No syntax errors
- ✅ Proper error messages if API fails
- ✅ Meeting details extracted from text
- ✅ Real events created in Google Calendar
- ✅ Success messages with calendar links

## Troubleshooting:
If you see any errors:
1. Check the VS Code Developer Console (`Help > Toggle Developer Tools`)
2. Look for extension errors in the Console tab
3. Verify your MCP server is working with `npm test`

## What's Fixed:
- TypeScript compilation errors
- JSON parsing issues with MCP responses
- Error handling with proper type annotations
- Better filtering of server output vs JSON responses
