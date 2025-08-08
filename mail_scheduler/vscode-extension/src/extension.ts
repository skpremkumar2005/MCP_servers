import * as vscode from 'vscode';
import { spawn } from 'child_process';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    console.log('Meeting Scheduler MCP extension is now active!');

    // Get the MCP server path relative to the workspace
    function getMcpServerPath(): string {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (workspaceFolder) {
            return path.join(workspaceFolder.uri.fsPath, 'src', 'server.js');
        }
        throw new Error('No workspace folder found');
    }

    // Function to send MCP requests
    async function sendMcpRequest(method: string, params: any = {}): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                const serverPath = getMcpServerPath();
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
                            // Filter out stderr messages and find the JSON response
                            const lines = response.trim().split('\n');
                            let jsonLine = null;
                            
                            // Look for the actual JSON response (should contain "jsonrpc" and "result")
                            for (const line of lines) {
                                if (line.trim().startsWith('{') && line.includes('"jsonrpc"')) {
                                    try {
                                        const parsed = JSON.parse(line);
                                        if (parsed.jsonrpc && (parsed.result || parsed.error)) {
                                            jsonLine = line;
                                            break;
                                        }
                                    } catch {
                                        continue;
                                    }
                                }
                            }
                            
                            if (jsonLine) {
                                resolve(JSON.parse(jsonLine));
                            } else {
                                console.error('Debug - Full response:', response);
                                console.error('Debug - Error output:', errorOutput);
                                reject(new Error('No valid JSON-RPC response found'));
                            }
                        } catch (err: any) {
                            console.error('Debug - Parse error:', err);
                            console.error('Debug - Response:', response);
                            reject(err);
                        }
                    } else {
                        reject(new Error(`Server exited with code ${code}: ${errorOutput}`));
                    }
                });

                server.stdin.write(JSON.stringify(request) + '\n');
                server.stdin.end();
            } catch (error: any) {
                reject(error);
            }
        });
    }

    // Command: Schedule Meeting
    const scheduleMeeting = vscode.commands.registerCommand('meetingScheduler.scheduleMeeting', async () => {
        try {
            const meetingText = await vscode.window.showInputBox({
                prompt: 'Describe the meeting you want to schedule',
                placeHolder: 'e.g., "Schedule a team meeting tomorrow at 2pm with John and Sarah"'
            });

            if (!meetingText) {
                return;
            }

            vscode.window.showInformationMessage('Scheduling meeting...');

            const response = await sendMcpRequest('tools/call', {
                name: 'schedule_meeting',
                arguments: { text: meetingText }
            });

            const result = response.result?.content?.[0]?.text || 'Meeting scheduled successfully!';
            vscode.window.showInformationMessage(result);

        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to schedule meeting: ${error?.message || error}`);
        }
    });

    // Command: List Meetings
    const listMeetings = vscode.commands.registerCommand('meetingScheduler.listMeetings', async () => {
        try {
            const daysInput = await vscode.window.showInputBox({
                prompt: 'How many days ahead do you want to check?',
                value: '7',
                validateInput: (value: string) => {
                    const num = parseInt(value);
                    if (isNaN(num) || num <= 0) {
                        return 'Please enter a valid positive number';
                    }
                    return null;
                }
            });

            if (!daysInput) {
                return;
            }

            const days = parseInt(daysInput);
            vscode.window.showInformationMessage('Loading meetings...');

            const response = await sendMcpRequest('tools/call', {
                name: 'list_meetings',
                arguments: { days }
            });

            const result = response.result?.content?.[0]?.text || 'No meetings found.';
            
            // Show meetings in a new document
            const doc = await vscode.workspace.openTextDocument({
                content: result,
                language: 'plaintext'
            });
            await vscode.window.showTextDocument(doc);

        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to list meetings: ${error?.message || error}`);
        }
    });

    // Command: Check Availability
    const checkAvailability = vscode.commands.registerCommand('meetingScheduler.checkAvailability', async () => {
        try {
            const startTime = await vscode.window.showInputBox({
                prompt: 'Enter start time (ISO format)',
                placeHolder: 'e.g., 2025-08-10T14:00:00Z'
            });

            if (!startTime) {
                return;
            }

            const endTime = await vscode.window.showInputBox({
                prompt: 'Enter end time (ISO format)',
                placeHolder: 'e.g., 2025-08-10T15:00:00Z'
            });

            if (!endTime) {
                return;
            }

            vscode.window.showInformationMessage('Checking availability...');

            const response = await sendMcpRequest('tools/call', {
                name: 'check_availability',
                arguments: { start_time: startTime, end_time: endTime }
            });

            const result = response.result?.content?.[0]?.text || 'Availability check completed.';
            vscode.window.showInformationMessage(result);

        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to check availability: ${error?.message || error}`);
        }
    });

    // Command: Extract Meeting Details
    const extractMeetingDetails = vscode.commands.registerCommand('meetingScheduler.extractMeetingDetails', async () => {
        try {
            // Get selected text or ask for input
            const editor = vscode.window.activeTextEditor;
            let text = '';

            if (editor && !editor.selection.isEmpty) {
                text = editor.document.getText(editor.selection);
            }

            if (!text) {
                const input = await vscode.window.showInputBox({
                    prompt: 'Enter text to extract meeting details from',
                    placeHolder: 'e.g., "Let\'s meet tomorrow at 2pm to discuss the project"'
                });
                if (!input) {
                    return;
                }
                text = input;
            }

            vscode.window.showInformationMessage('Extracting meeting details...');

            const response = await sendMcpRequest('tools/call', {
                name: 'extract_meeting_details',
                arguments: { text }
            });

            const result = response.result?.content?.[0]?.text || 'No details extracted.';
            
            // Show extracted details in a new document
            const doc = await vscode.workspace.openTextDocument({
                content: result,
                language: 'json'
            });
            await vscode.window.showTextDocument(doc);

        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to extract meeting details: ${error?.message || error}`);
        }
    });

    // Register all commands
    context.subscriptions.push(scheduleMeeting, listMeetings, checkAvailability, extractMeetingDetails);

    // Show welcome message
    vscode.window.showInformationMessage('Meeting Scheduler MCP extension loaded! Use Ctrl+Shift+M to schedule a meeting.');
}

export function deactivate() {}
