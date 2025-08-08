# Meeting Scheduler MCP Server

A Model Context Protocol (MCP) server for scheduling meetings using natural language processing with Gemini Flash API and Google Calendar integration.

## Features
- Schedule meetings using natural language input
- Extract structured meeting details from text
- List upcoming meetings
- Check calendar availability
- Google Calendar integration
- Gemini Flash API for NLP processing
- **VS Code Extension for easy integration**

## MCP Tools Available
- `schedule_meeting`: Schedule a meeting from natural language
- `list_meetings`: List upcoming meetings
- `check_availability`: Check if a time slot is available
- `extract_meeting_details`: Extract structured data from text

## VS Code Integration

### Option 1: VS Code Extension (Recommended)
We've included a VS Code extension that provides a user-friendly interface:

1. **Install and compile the extension:**
   ```bash
   cd vscode-extension
   npm install
   npm run compile
   ```

2. **Launch the extension:**
   - Press `F5` in VS Code to open Extension Development Host
   - Or use the "Launch Extension" debug configuration

3. **Use the extension:**
   - `Ctrl+Shift+M`: Quick schedule meeting
   - Command Palette → "Meeting Scheduler" commands
   - Extract meeting details from selected text

### Option 2: Direct MCP Client Integration

#### Claude Desktop Configuration
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

#### Other MCP Clients
Any MCP-compatible client can connect to the server running on stdio.

## Setup
1. Install dependencies: `npm install`
2. Configure environment variables in `src/config/.env`:
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `GOOGLE_CLIENT_ID`: Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
   - `GOOGLE_REFRESH_TOKEN`: Google OAuth refresh token
3. Start the MCP server: `npm start`

## Usage Examples

### With VS Code Extension
- Open Command Palette (`Ctrl+Shift+P`)
- Type "Meeting Scheduler: Schedule Meeting"
- Enter: "Schedule a team standup tomorrow at 9am"

### With MCP Client
Once configured, you can interact through natural language:
- "Schedule a team meeting tomorrow at 2pm"
- "What meetings do I have this week?"
- "Check if I'm available Friday at 3pm"
- "Extract meeting details from this email..."

## Development
- Run with hot reload: `npm run dev`
- Test the MCP server: `npm test`
- The server communicates via stdio (standard input/output)

## License
MIT
