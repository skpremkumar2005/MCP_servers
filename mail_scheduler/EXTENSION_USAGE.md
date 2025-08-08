# VS Code Extension Installation & Usage Guide

## ✅ Extension Successfully Installed!

The Meeting Scheduler MCP extension is now installed in your VS Code. Here's how to use it:

## How to Use the Extension

### Method 1: Command Palette (Recommended)
1. **Open Command Palette**: Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. **Type**: `Meeting Scheduler`
3. **Select** one of the available commands:
   - `Meeting Scheduler: Schedule Meeting`
   - `Meeting Scheduler: List Meetings`
   - `Meeting Scheduler: Check Availability`
   - `Meeting Scheduler: Extract Meeting Details`

### Method 2: Keyboard Shortcut
- **Press `Ctrl+Shift+M`** (or `Cmd+Shift+M` on Mac) for quick meeting scheduling

### Method 3: Extract from Selected Text
1. **Select text** in any document that contains meeting information
2. **Open Command Palette** (`Ctrl+Shift+P`)
3. **Run**: `Meeting Scheduler: Extract Meeting Details`
4. The extension will extract structured meeting data from the selected text

## Example Usage

### Quick Schedule Meeting
1. Press `Ctrl+Shift+M`
2. Enter: "Schedule a team standup tomorrow at 9am with John and Sarah"
3. The extension will process and schedule the meeting

### Extract Meeting Details
1. Select this text: "Let's have a project review meeting next Tuesday at 2pm"
2. Use Command Palette → `Meeting Scheduler: Extract Meeting Details`
3. View the extracted structured data

### List Upcoming Meetings
1. Command Palette → `Meeting Scheduler: List Meetings`
2. Enter number of days to look ahead (default: 7)
3. View meetings in a new document

## Troubleshooting

### If F5 Debug Launch Doesn't Work:
The extension is already installed, so you can use it directly without F5!

### Alternative Debug Methods:
1. **Use the installed extension** (current setup)
2. **Manual debug launch**:
   ```bash
   cd /home/premkumar/GitHub/Projects/mail_scheduler
   code --extensionDevelopmentPath=./vscode-extension .
   ```

### Check Extension Status:
- Go to Extensions view (`Ctrl+Shift+X`)
- Search for "Meeting Scheduler MCP"
- Ensure it's enabled

## Next Steps

1. **Test the extension** using Command Palette
2. **Configure your API keys** in `src/config/.env`
3. **Start the MCP server** with `npm start` from the main project directory
4. **Enjoy scheduling meetings** with natural language!

The extension communicates with your MCP server to provide intelligent meeting scheduling capabilities directly in VS Code.
