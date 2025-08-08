# Getting Started with the Meeting Scheduler MCP Server

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `src/config/.env` and add your API keys:
   - Get a Gemini API key from Google AI Studio
   - Set up Google Calendar OAuth credentials
   - Update the `.env` file with your credentials

3. **Test the server:**
   ```bash
   npm test
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

## VS Code Integration (Recommended)

### Install the VS Code Extension

1. **Setup the extension:**
   ```bash
   cd vscode-extension
   npm install
   npm run compile
   ```

2. **Launch the extension:**
   - Press `F5` in VS Code to open Extension Development Host
   - The extension will be automatically loaded

3. **Use the extension:**
   - Press `Ctrl+Shift+M` to quickly schedule a meeting
   - Open Command Palette (`Ctrl+Shift+P`) and type "Meeting Scheduler"
   - Select text in any document and use "Extract Meeting Details"

### Available Commands in VS Code

- **Meeting Scheduler: Schedule Meeting** - Natural language meeting scheduling
- **Meeting Scheduler: List Meetings** - View upcoming meetings
- **Meeting Scheduler: Check Availability** - Check time slot availability  
- **Meeting Scheduler: Extract Meeting Details** - Extract meeting info from text

## MCP Client Integration

### Claude Desktop Configuration
Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "meeting-scheduler": {
      "command": "node",
      "args": ["/path/to/your/project/src/server.js"]
    }
  }
}
```

### Example Usage
Once configured, you can interact with the server through natural language:

- "Schedule a team meeting tomorrow at 2pm"
- "What meetings do I have this week?"
- "Check if I'm available Friday at 3pm"
- "Extract meeting details from this email..."

## API Keys Setup

### Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add it to your `.env` file as `GEMINI_API_KEY`

### Google Calendar Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Google Calendar API
4. Create OAuth 2.0 credentials
5. Add credentials to your `.env` file

## Architecture

The project follows a clean MCP server architecture:

- `src/server.js` - Main MCP server with tool definitions
- `src/services/geminiService.js` - Natural language processing
- `src/services/calendarService.js` - Calendar integration
- `src/config/settings.js` - Configuration management
- `vscode-extension/` - VS Code extension for easy integration

## Debugging

### VS Code Extension Debugging
1. Set breakpoints in `vscode-extension/src/extension.ts`
2. Press `F5` to launch Extension Development Host
3. Use the extension commands to trigger breakpoints

### MCP Server Debugging
1. Add `console.log` statements in `src/server.js`
2. Run `npm test` to see debug output
3. Use VS Code debugger with the "Start MCP Server" task

## Support

For issues or questions, check the MCP documentation at https://modelcontextprotocol.io/
