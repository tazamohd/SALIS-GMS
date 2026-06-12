import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? `repl ${  process.env.REPL_IDENTITY}` 
    : process.env.WEB_REPL_RENEWAL 
    ? `depl ${  process.env.WEB_REPL_RENEWAL}` 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    `https://${  hostname  }/api/v2/connection?include_secrets=true&connector_names=google-calendar`,
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Calendar not connected');
  }
  return accessToken;
}

export async function getUncachableGoogleCalendarClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

export async function syncAppointmentToGoogleCalendar(appointment: any) {
  try {
    const calendar = await getUncachableGoogleCalendarClient();
    
    const event = {
      summary: `Appointment - ${appointment.service || 'Service'}`,
      description: appointment.notes || '',
      start: {
        dateTime: appointment.appointmentDate,
        timeZone: 'UTC',
      },
      end: {
        dateTime: appointment.appointmentEndDate || appointment.appointmentDate,
        timeZone: 'UTC',
      },
      attendees: appointment.customerEmail ? [{ email: appointment.customerEmail }] : [],
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return {
      success: true,
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
    };
  } catch (error: any) {
    console.error('Google Calendar sync error:', error);
    return {
      success: false,
      error: error.message || 'Failed to sync to Google Calendar',
    };
  }
}

export async function updateGoogleCalendarEvent(eventId: string, appointment: any) {
  try {
    const calendar = await getUncachableGoogleCalendarClient();
    
    const event = {
      summary: `Appointment - ${appointment.service || 'Service'}`,
      description: appointment.notes || '',
      start: {
        dateTime: appointment.appointmentDate,
        timeZone: 'UTC',
      },
      end: {
        dateTime: appointment.appointmentEndDate || appointment.appointmentDate,
        timeZone: 'UTC',
      },
    };

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId,
      requestBody: event,
    });

    return {
      success: true,
      eventId: response.data.id,
    };
  } catch (error: any) {
    console.error('Google Calendar update error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update Google Calendar event',
    };
  }
}

export async function deleteGoogleCalendarEvent(eventId: string) {
  try {
    const calendar = await getUncachableGoogleCalendarClient();
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Google Calendar delete error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete Google Calendar event',
    };
  }
}

export async function listGoogleCalendarEvents(timeMin?: string, timeMax?: string) {
  try {
    const calendar = await getUncachableGoogleCalendarClient();
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin || new Date().toISOString(),
      timeMax,
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return {
      success: true,
      events: response.data.items || [],
    };
  } catch (error: any) {
    console.error('Google Calendar list error:', error);
    return {
      success: false,
      error: error.message || 'Failed to list Google Calendar events',
      events: [],
    };
  }
}
