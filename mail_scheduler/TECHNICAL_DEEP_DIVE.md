# Technical Deep Dive - How the Code Works

## 🔍 Code Flow Analysis

### 1. When You Use the VS Code Extension

```
User Action: Ctrl+Shift+M → "Schedule meeting tomorrow 2pm"
    ↓
VS Code Extension (extension.ts)
    ↓
sendMcpRequest() function
    ↓
Spawns Node.js process: node src/server.js
    ↓
Sends JSON-RPC request via stdin
    ↓
MCP Server receives and processes
    ↓
Returns JSON response via stdout
    ↓
Extension parses response and shows result
```

### 2. Inside the MCP Server (server.js)

```javascript
// 1. Request comes in
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  // 2. Route to correct tool
  switch (name) {
    case 'schedule_meeting':
      // 3. Extract details using AI
      const meetingDetails = await extractMeetingDetails(text);
      
      // 4. Create calendar event
      const event = await createEvent(meetingDetails);
      
      // 5. Return success response
      return { content: [{ type: 'text', text: 'Meeting scheduled!' }] };
  }
});
```

### 3. AI Processing (geminiService.js)

```javascript
export async function extractMeetingDetails(text) {
  // 1. Create prompt for AI
  const prompt = `Extract meeting details from: "${text}"`;
  
  // 2. Send to Gemini API
  const response = await axios.post(gemini_url, { prompt });
  
  // 3. Parse AI response
  const meetingDetails = JSON.parse(response.data);
  
  // 4. Return structured data
  return {
    title: "Team Meeting",
    start_time: "2025-08-09T14:00:00Z",
    end_time: "2025-08-09T15:00:00Z",
    participants: ["john@example.com"]
  };
}
```

### 4. Calendar Integration (calendarService.js)

```javascript
export async function createEvent(details) {
  // 1. Setup Google OAuth
  const oauth2Client = new google.auth.OAuth2(client_id, client_secret);
  oauth2Client.setCredentials({ refresh_token });
  
  // 2. Initialize Calendar API
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
  // 3. Create event object
  const event = {
    summary: details.title,
    start: { dateTime: details.start_time },
    end: { dateTime: details.end_time },
    attendees: details.participants.map(email => ({ email }))
  };
  
  // 4. Insert into Google Calendar
  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event
  });
  
  // 5. Return event details
  return {
    id: response.data.id,
    title: details.title,
    htmlLink: response.data.htmlLink
  };
}
```

## 🔄 Data Transformation Examples

### Input → AI Processing → Calendar Event

#### Example 1: Simple Meeting
```
Input: "Team standup tomorrow 9am"

AI Extraction:
{
  "title": "Team standup",
  "start_time": "2025-08-09T09:00:00.000Z",
  "end_time": "2025-08-09T10:00:00.000Z",
  "participants": [],
  "description": "Team standup",
  "location": ""
}

Google Calendar Event:
{
  "summary": "Team standup",
  "start": { "dateTime": "2025-08-09T09:00:00.000Z" },
  "end": { "dateTime": "2025-08-09T10:00:00.000Z" },
  "attendees": []
}

Result: Event created with ID "abc123xyz"
```

#### Example 2: Complex Meeting
```
Input: "Schedule project review next Tuesday 2pm with john@company.com and sarah@company.com in conference room A"

AI Extraction:
{
  "title": "project review",
  "start_time": "2025-08-12T14:00:00.000Z",
  "end_time": "2025-08-12T15:00:00.000Z",
  "participants": ["john@company.com", "sarah@company.com"],
  "description": "project review",
  "location": "conference room A"
}

Google Calendar Event:
{
  "summary": "project review",
  "start": { "dateTime": "2025-08-12T14:00:00.000Z" },
  "end": { "dateTime": "2025-08-12T15:00:00.000Z" },
  "attendees": [
    { "email": "john@company.com" },
    { "email": "sarah@company.com" }
  ],
  "location": "conference room A"
}

Result: Event created with email invitations sent
```

## 🛡️ Error Handling Flow

### 1. API Failures
```javascript
try {
  const response = await axios.post(gemini_url, data);
  return parseResponse(response);
} catch (error) {
  if (error.message.includes('invalid_grant')) {
    throw new Error('Google Calendar authentication failed');
  } else if (error.message.includes('quota exceeded')) {
    throw new Error('API quota exceeded, try again later');
  } else {
    throw new Error(`AI processing failed: ${error.message}`);
  }
}
```

### 2. Extension Error Handling
```typescript
try {
  const response = await sendMcpRequest('tools/call', params);
  const result = response.result?.content?.[0]?.text || 'Success!';
  vscode.window.showInformationMessage(result);
} catch (error: any) {
  // Show user-friendly error
  vscode.window.showErrorMessage(`Failed: ${error?.message || error}`);
  
  // Log detailed error for debugging
  console.error('Full error:', error);
}
```

## 🔌 Communication Protocols

### 1. JSON-RPC (MCP Standard)
```json
// Request
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "schedule_meeting",
    "arguments": { "text": "Meeting tomorrow 2pm" }
  }
}

// Response
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [{
      "type": "text",
      "text": "Meeting scheduled successfully!"
    }]
  }
}
```

### 2. VS Code Extension API
```typescript
// Register command
vscode.commands.registerCommand('meetingScheduler.scheduleMeeting', handler);

// Show input dialog
const input = await vscode.window.showInputBox({
  prompt: 'Describe your meeting',
  placeHolder: 'e.g., "Team standup tomorrow 9am"'
});

// Show result
vscode.window.showInformationMessage('Meeting scheduled!');

// Open new document
const doc = await vscode.workspace.openTextDocument({
  content: jsonData,
  language: 'json'
});
```

### 3. Google APIs
```javascript
// OAuth2 Setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/auth/callback'
);

// Calendar API Call
const response = await calendar.events.insert({
  calendarId: 'primary',
  resource: eventData,
  sendUpdates: 'all'  // Send email notifications
});
```

## 🧪 Testing Strategy

### 1. Unit Tests (Individual Functions)
```javascript
// Test AI extraction
assert.equal(
  extractMeetingDetails("meeting tomorrow 2pm").title,
  "meeting"
);

// Test calendar creation
assert.ok(
  createEvent(testData).id.startsWith('event_')
);
```

### 2. Integration Tests (Full Flow)
```javascript
// Test end-to-end flow
const result = await sendMcpRequest('tools/call', {
  name: 'schedule_meeting',
  arguments: { text: 'test meeting' }
});

assert.ok(result.result.content[0].text.includes('scheduled'));
```

### 3. Manual Testing
```bash
# Test MCP server directly
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"schedule_meeting","arguments":{"text":"test"}}}' | node src/server.js

# Test VS Code extension
# Use Command Palette → Meeting Scheduler commands
```

This technical deep dive shows exactly how each piece of code works together to create a seamless meeting scheduling experience!
