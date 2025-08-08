import axios from 'axios';
import config from '../config/settings.js';

export async function extractMeetingDetails(text) {
  try {
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toISOString();
    
    const prompt = `
You are a meeting scheduling assistant. Extract meeting details from the following text and return ONLY a valid JSON object.

Current date: ${currentDate}
Current time: ${currentTime}

For date/time parsing:
- "tomorrow" = ${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
- "next Tuesday" = calculate the next Tuesday from current date
- If no date specified, assume tomorrow
- If no time specified, assume 2:00 PM
- If no end time specified, assume 1 hour duration
- Use ISO 8601 format for all times

Extract these fields:
{
  "title": "Meeting title/subject",
  "start_time": "YYYY-MM-DDTHH:mm:ss.sssZ",
  "end_time": "YYYY-MM-DDTHH:mm:ss.sssZ", 
  "participants": ["email1@example.com", "email2@example.com"],
  "description": "Meeting description",
  "location": "Meeting location or empty string"
}

Text to parse: "${text}"

Return only the JSON object, no additional text:`;

    // console.log('Sending request to Gemini API...');

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${config.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
      throw new Error('No response from Gemini API');
    }

    // console.log('Gemini response:', generatedText);

    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const meetingDetails = JSON.parse(jsonMatch[0]);
    
    // Validate and fix the meeting details
    if (!meetingDetails.title) {
      meetingDetails.title = 'Meeting';
    }
    
    if (!meetingDetails.start_time) {
      // Default to tomorrow at 2 PM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 0, 0, 0);
      meetingDetails.start_time = tomorrow.toISOString();
    }
    
    if (!meetingDetails.end_time) {
      // Default to 1 hour after start time
      const endTime = new Date(meetingDetails.start_time);
      endTime.setHours(endTime.getHours() + 1);
      meetingDetails.end_time = endTime.toISOString();
    }
    
    if (!Array.isArray(meetingDetails.participants)) {
      meetingDetails.participants = [];
    }
    
    if (!meetingDetails.description) {
      meetingDetails.description = text;
    }
    
    if (!meetingDetails.location) {
      meetingDetails.location = '';
    }

    // console.log('Parsed meeting details:', meetingDetails);
    return meetingDetails;
    
  } catch (error) {
    console.error('Error extracting meeting details:', error.message);
    
    // Return a better fallback with proper date/time parsing
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0); // 2 PM tomorrow
    
    const endTime = new Date(tomorrow);
    endTime.setHours(15, 0, 0, 0); // 3 PM tomorrow
    
    return {
      title: 'Team Meeting',
      start_time: tomorrow.toISOString(),
      end_time: endTime.toISOString(),
      participants: [],
      description: text,
      location: ''
    };
  }
}
