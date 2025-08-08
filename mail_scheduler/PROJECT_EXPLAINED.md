# Meeting Scheduler Project - Complete Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [What is MCP (Model Context Protocol)?](#what-is-mcp)
3. [Technologies Used](#technologies-used)
4. [Project Architecture](#project-architecture)
5. [How It Works](#how-it-works)
6. [File Structure Explained](#file-structure-explained)
7. [Setting Up the Project](#setting-up-the-project)
8. [Using the System](#using-the-system)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

This project is a **Meeting Scheduler** that can:
- Understand natural language requests like "Schedule a meeting tomorrow at 2pm with John"
- Automatically extract meeting details (time, participants, title)
- Create real events in your Google Calendar
- List your upcoming meetings
- Check if you're available at specific times

### What Makes It Special?
- **AI-Powered**: Uses Google's Gemini AI to understand natural language
- **Real Calendar Integration**: Actually creates events in Google Calendar
- **Multiple Interfaces**: Works as both a VS Code extension and standalone MCP server
- **Smart Parsing**: Converts casual language into structured meeting data

---

## 🤖 What is MCP (Model Context Protocol)?

**MCP** is a way for AI assistants (like Claude, ChatGPT) to use external tools and services.

### Think of it like this:
- **Before MCP**: AI can only chat with you
- **With MCP**: AI can actually DO things (schedule meetings, read files, call APIs)

### How MCP Works:
1. **AI Assistant** says: "I need to schedule a meeting"
2. **MCP Server** (our project) receives the request
3. **MCP Server** processes it and creates the calendar event
4. **AI Assistant** gets the result and tells you "Meeting scheduled!"

### MCP vs Regular Applications:
- **Regular App**: You click buttons in a UI
- **MCP Server**: AI can use it automatically through conversation

---

## 🛠️ Technologies Used

### Core Technologies:

#### 1. **Node.js & JavaScript (ES Modules)**
- **What**: JavaScript runtime for building servers
- **Why**: Allows us to build a server that can process requests
- **ES Modules**: Modern way to import/export code (`import/export` instead of `require`)

#### 2. **Model Context Protocol (MCP) SDK**
- **What**: Framework for building AI-compatible tools
- **Why**: Makes our server compatible with AI assistants
- **Package**: `@modelcontextprotocol/sdk`

#### 3. **Google Gemini Flash API**
- **What**: Google's AI for understanding natural language
- **Why**: Converts "meeting tomorrow at 2pm" into structured data
- **Example**: "Team standup Friday 9am" → `{title: "Team standup", time: "2025-08-11T09:00:00Z"}`

#### 4. **Google Calendar API**
- **What**: Interface to create/read Google Calendar events
- **Why**: Actually puts meetings in your real calendar
- **Package**: `googleapis`

#### 5. **VS Code Extension (TypeScript)**
- **What**: Plugin for Visual Studio Code
- **Why**: Easy-to-use interface for developers
- **Language**: TypeScript (JavaScript with types)

### Supporting Technologies:

- **dotenv**: Manages API keys and secrets
- **axios**: Makes HTTP requests to APIs
- **child_process**: Runs the MCP server from VS Code

---

## 🏗️ Project Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   VS Code       │    │   MCP Server    │    │  Google APIs    │
│   Extension     │───▶│   (Node.js)     │───▶│                 │
│                 │    │                 │    │ • Gemini AI     │
│ • User clicks   │    │ • Process text  │    │ • Calendar API  │
│ • Send request  │    │ • Extract data  │    │                 │
│ • Show results  │    │ • Create events │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow:
1. **User Input**: "Schedule team meeting tomorrow 2pm"
2. **VS Code Extension**: Sends to MCP server
3. **MCP Server**: Processes the request
4. **Gemini AI**: Extracts meeting details
5. **Google Calendar**: Creates the event
6. **Response**: "Meeting scheduled! Event ID: xyz123"

---

## ⚙️ How It Works

### Step-by-Step Process:

#### 1. **Natural Language Processing (NLP)**
```javascript
Input: "Schedule a team meeting tomorrow at 2pm with John and Sarah"

Gemini AI extracts:
{
  "title": "team meeting",
  "start_time": "2025-08-09T14:00:00.000Z",
  "end_time": "2025-08-09T15:00:00.000Z",
  "participants": ["john@example.com", "sarah@example.com"],
  "description": "team meeting",
  "location": ""
}
```

#### 2. **Calendar Integration**
```javascript
// The extracted data is sent to Google Calendar API
const event = {
  summary: "team meeting",
  start: { dateTime: "2025-08-09T14:00:00.000Z" },
  end: { dateTime: "2025-08-09T15:00:00.000Z" },
  attendees: [
    { email: "john@example.com" },
    { email: "sarah@example.com" }
  ]
}

// Google Calendar creates the event and returns an ID
```

#### 3. **Response Generation**
```
✅ Meeting scheduled successfully!

Title: team meeting
Time: 2025-08-09T14:00:00.000Z
Participants: john@example.com, sarah@example.com
Event ID: abc123xyz
Google Calendar Link: https://calendar.google.com/event?eid=...
```

### Communication Protocols:

#### MCP Protocol (JSON-RPC):
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "schedule_meeting",
    "arguments": {
      "text": "Schedule team meeting tomorrow 2pm"
    }
  }
}
```

#### VS Code Extension Communication:
- Uses `child_process.spawn()` to run MCP server
- Sends JSON-RPC requests via stdin
- Receives responses via stdout
- Parses responses and shows in VS Code UI

---

## 📁 File Structure Explained

```
meeting-scheduler/
├── src/                          # Main application code
│   ├── server.js                # 🏛️ Main MCP server
│   ├── config/
│   │   ├── settings.js          # ⚙️ Configuration management
│   │   └── .env                 # 🔑 API keys and secrets
│   └── services/
│       ├── geminiService.js     # 🤖 AI text processing
│       └── calendarService.js   # 📅 Google Calendar integration
├── vscode-extension/             # VS Code plugin
│   ├── src/
│   │   └── extension.ts         # 🔌 VS Code extension logic
│   ├── package.json             # Extension configuration
│   └── tsconfig.json            # TypeScript settings
├── package.json                 # 📦 Project dependencies
├── test-mcp.js                  # 🧪 Test script
└── README.md                    # 📖 Project documentation
```

### Key Files Explained:

#### `src/server.js` - The Heart of the System
```javascript
// Defines what tools are available
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      { name: 'schedule_meeting', description: '...' },
      { name: 'list_meetings', description: '...' },
      // ... more tools
    ]
  };
});

// Handles when tools are called
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case 'schedule_meeting':
      // Process meeting scheduling
      break;
    // ... handle other tools
  }
});
```

#### `src/services/geminiService.js` - AI Brain
```javascript
export async function extractMeetingDetails(text) {
  // Sends text to Gemini AI
  const response = await axios.post('gemini-api-url', {
    prompt: `Extract meeting details from: "${text}"`
  });
  
  // Returns structured data
  return {
    title: "Meeting",
    start_time: "2025-08-09T14:00:00Z",
    // ... other details
  };
}
```

#### `src/services/calendarService.js` - Calendar Interface
```javascript
export async function createEvent(details) {
  // Authenticates with Google
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
  // Creates the event
  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: {
      summary: details.title,
      start: { dateTime: details.start_time },
      // ... other event data
    }
  });
  
  return response.data;
}
```

#### `vscode-extension/src/extension.ts` - VS Code Interface
```typescript
// Registers commands that appear in VS Code
const scheduleMeeting = vscode.commands.registerCommand(
  'meetingScheduler.scheduleMeeting', 
  async () => {
    // Gets user input
    const meetingText = await vscode.window.showInputBox({
      prompt: 'Describe the meeting...'
    });
    
    // Sends to MCP server
    const response = await sendMcpRequest('tools/call', {
      name: 'schedule_meeting',
      arguments: { text: meetingText }
    });
    
    // Shows result
    vscode.window.showInformationMessage(response.result);
  }
);
```

---

## 🚀 Setting Up the Project

### Prerequisites:
1. **Node.js** (version 16+)
2. **VS Code** (for the extension)
3. **Google Account** (for calendar access)

### Step 1: Install Dependencies
```bash
npm install
cd vscode-extension
npm install
```

### Step 2: Get API Keys

#### Google Gemini API Key:
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create an API key
3. Copy the key

#### Google Calendar Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Get client ID, client secret, and refresh token

### Step 3: Configure Environment
Create `src/config/.env`:
```env
GEMINI_API_KEY=your-gemini-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
```

### Step 4: Test the Setup
```bash
npm test  # Tests the MCP server
```

### Step 5: Install VS Code Extension
```bash
cd vscode-extension
npm run compile
vsce package
code --install-extension meeting-scheduler-mcp-0.0.1.vsix
```

---

## 🎮 Using the System

### Method 1: VS Code Extension (Easiest)

#### Quick Meeting Scheduling:
1. Press `Ctrl+Shift+M`
2. Type: "Schedule team standup tomorrow at 9am"
3. Press Enter
4. Check your Google Calendar!

#### Command Palette:
1. Press `Ctrl+Shift+P`
2. Type "Meeting Scheduler"
3. Choose from:
   - Schedule Meeting
   - List Meetings
   - Check Availability
   - Extract Meeting Details

#### Extract from Text:
1. Select any text with meeting info
2. Run "Extract Meeting Details"
3. See structured data

### Method 2: Direct MCP Server

#### Test via Command Line:
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"schedule_meeting","arguments":{"text":"Meeting tomorrow 2pm"}}}' | node src/server.js
```

#### Integrate with AI Assistants:
Add to Claude Desktop config:
```json
{
  "mcpServers": {
    "meeting-scheduler": {
      "command": "node",
      "args": ["/path/to/project/src/server.js"]
    }
  }
}
```

### What Happens Behind the Scenes:

1. **Input Processing**: Your text is sent to Gemini AI
2. **Data Extraction**: AI extracts meeting details
3. **Calendar Creation**: Event is created in Google Calendar
4. **Confirmation**: You get a success message with details

---

## 🔧 Troubleshooting

### Common Issues:

#### "No JSON response found"
- **Cause**: MCP server output mixing with debug messages
- **Fix**: Already fixed in latest version with improved JSON parsing

#### "Google Calendar not configured"
- **Cause**: Missing or invalid Google API credentials
- **Fix**: Check your `.env` file and API keys

#### "Failed to schedule meeting"
- **Cause**: Various API issues
- **Fix**: Check error message for specific details

#### VS Code Extension Not Working
- **Cause**: Extension not properly installed or compiled
- **Fix**: 
  ```bash
  cd vscode-extension
  npm run compile
  vsce package
  code --install-extension meeting-scheduler-mcp-0.0.1.vsix --force
  ```

### Debug Steps:

1. **Test MCP Server**: Run `npm test`
2. **Check Environment**: Run `node debug-env.js`
3. **Verify Calendar API**: Check Google Cloud Console
4. **Check Extension Logs**: VS Code → Help → Toggle Developer Tools

### Common Error Messages:

- **"invalid_grant"**: Google tokens expired, refresh them
- **"insufficient permissions"**: Enable Google Calendar API
- **"SyntaxError: Expected property name"**: Fixed in latest version

---

## 🎓 Learning More

### Key Concepts to Understand:

1. **APIs**: How applications talk to each other
2. **JSON**: Data format for exchanging information
3. **OAuth**: Secure way to access Google services
4. **Natural Language Processing**: How AI understands human language
5. **Event-Driven Programming**: How the extension responds to user actions

### Next Steps:

1. **Experiment**: Try different meeting descriptions
2. **Customize**: Modify the prompts in `geminiService.js`
3. **Extend**: Add new MCP tools
4. **Integrate**: Connect with other AI assistants

### Useful Resources:

- [MCP Documentation](https://modelcontextprotocol.io/)
- [Google Calendar API](https://developers.google.com/calendar)
- [VS Code Extension API](https://code.visualstudio.com/api)
- [Node.js Documentation](https://nodejs.org/docs/)

---

## 🎉 Congratulations!

You now have a complete understanding of:
- How the Meeting Scheduler works
- What each file does
- How to use and modify it
- How AI, APIs, and calendar integration work together

This project demonstrates modern software development with AI integration, API usage, and multiple user interfaces - skills that are highly valuable in today's tech landscape!
