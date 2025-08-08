import { google } from 'googleapis';
import config from '../config/settings.js';

// Initialize Google Calendar API
const oauth2Client = new google.auth.OAuth2(
  config.GOOGLE_CLIENT_ID,
  config.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/auth/callback'
);

// Set credentials if refresh token is available
if (config.GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: config.GOOGLE_REFRESH_TOKEN
  });
}

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

export async function createEvent(details) {
  try {
    if (!config.GOOGLE_REFRESH_TOKEN) {
      throw new Error('Google Calendar not configured. Please set GOOGLE_REFRESH_TOKEN in .env file.');
    }

    // console.log('Creating calendar event:', details);

    const event = {
      summary: details.title,
      description: details.description || '',
      location: details.location || '',
      start: {
        dateTime: details.start_time,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: details.end_time,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: details.participants?.map(email => ({ email })) || [],
    };

    // console.log('Google Calendar event payload:', JSON.stringify(event, null, 2));

    const response = await calendar.events.insert({
      calendarId: config.DEFAULT_CALENDAR_ID,
      resource: event,
      sendUpdates: 'all', // Send email notifications to attendees
    });

    // console.log('Calendar event created successfully:', response.data.id);

    return {
      id: response.data.id,
      title: details.title,
      time: details.start_time,
      participants: details.participants || [],
      location: details.location || '',
      description: details.description || '',
      htmlLink: response.data.htmlLink
    };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    
    // Provide more specific error messages
    if (error.message.includes('invalid_grant')) {
      throw new Error('Google Calendar authentication failed. Please refresh your credentials.');
    } else if (error.message.includes('insufficient permissions')) {
      throw new Error('Insufficient permissions to create calendar events. Please check your OAuth scope.');
    } else {
      throw new Error(`Failed to create calendar event: ${error.message}`);
    }
  }
}

export async function listEvents(days = 7) {
  try {
    if (!config.GOOGLE_REFRESH_TOKEN) {
      throw new Error('Google Calendar not configured. Please set GOOGLE_REFRESH_TOKEN in .env file.');
    }

    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

    // console.log(`Fetching events from ${timeMin} to ${timeMax}`);

    const response = await calendar.events.list({
      calendarId: config.DEFAULT_CALENDAR_ID,
      timeMin,
      timeMax,
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
    });

    // console.log(`Found ${response.data.items?.length || 0} events`);

    return response.data.items?.map(event => ({
      id: event.id,
      title: event.summary,
      time: event.start?.dateTime || event.start?.date,
      participants: event.attendees?.map(attendee => attendee.email) || [],
      location: event.location || '',
      description: event.description || ''
    })) || [];
  } catch (error) {
    console.error('Error listing calendar events:', error);
    throw new Error(`Failed to list calendar events: ${error.message}`);
  }
}

export async function checkAvailability(timeSlot) {
  try {
    if (!config.GOOGLE_REFRESH_TOKEN) {
      throw new Error('Google Calendar not configured. Please set GOOGLE_REFRESH_TOKEN in .env file.');
    }

    // console.log(`Checking availability from ${timeSlot.start_time} to ${timeSlot.end_time}`);

    const response = await calendar.freebusy.query({
      resource: {
        timeMin: timeSlot.start_time,
        timeMax: timeSlot.end_time,
        items: [{ id: config.DEFAULT_CALENDAR_ID }]
      }
    });

    const busyTimes = response.data.calendars?.[config.DEFAULT_CALENDAR_ID]?.busy || [];
    const isAvailable = busyTimes.length === 0;
    
    // console.log(`Availability check result: ${isAvailable ? 'Available' : 'Busy'}`);
    
    return isAvailable;
  } catch (error) {
    console.error('Error checking availability:', error);
    throw new Error(`Failed to check availability: ${error.message}`);
  }
}
