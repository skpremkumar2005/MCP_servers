# VS Code Extension for Meeting Scheduler MCP

This VS Code extension provides a user-friendly interface to interact with the Meeting Scheduler MCP server directly from within VS Code.

## Features

- **Schedule Meeting** (`Ctrl+Shift+M`): Schedule meetings using natural language
- **List Meetings**: View upcoming meetings in your calendar
- **Check Availability**: Check if specific time slots are available
- **Extract Meeting Details**: Extract structured meeting information from text

## Installation

1. Navigate to the extension directory:
   ```bash
   cd vscode-extension
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Compile the TypeScript:
   ```bash
   npm run compile
   ```

4. Press `F5` in VS Code to launch a new Extension Development Host window with the extension loaded.

## Usage

### Command Palette
- Open Command Palette (`Ctrl+Shift+P`)
- Type "Meeting Scheduler" to see available commands

### Keyboard Shortcuts
- `Ctrl+Shift+M` (or `Cmd+Shift+M` on Mac): Quick schedule meeting

### Commands Available

1. **Meeting Scheduler: Schedule Meeting**
   - Opens input dialog for natural language meeting description
   - Processes the request and shows confirmation

2. **Meeting Scheduler: List Meetings**
   - Shows upcoming meetings in a new document
   - Allows you to specify number of days to look ahead

3. **Meeting Scheduler: Check Availability**
   - Check if a specific time slot is available
   - Requires start and end times in ISO format

4. **Meeting Scheduler: Extract Meeting Details**
   - Extract structured meeting details from selected text or input
   - Shows results in a new JSON document

## Development

To modify the extension:

1. Edit files in `src/`
2. Run `npm run compile` to build
3. Press `F5` to test in Extension Development Host

## Publishing

To package the extension:

1. Install vsce: `npm install -g vsce`
2. Package: `vsce package`
3. Install: `code --install-extension meeting-scheduler-mcp-0.0.1.vsix`
