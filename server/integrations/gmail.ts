import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-mail',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Gmail not connected');
  }
  return accessToken;
}

export async function getUncachableGmailClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}) {
  try {
    const gmail = await getUncachableGmailClient();
    
    const message = [
      `To: ${options.to}`,
      `Subject: ${options.subject}`,
      options.isHtml ? 'Content-Type: text/html; charset=utf-8' : 'Content-Type: text/plain; charset=utf-8',
      '',
      options.body,
    ].join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return {
      success: true,
      messageId: response.data.id,
    };
  } catch (error: any) {
    console.error('Gmail send error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

export async function sendAppointmentConfirmationEmail(appointment: any, customer: any) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Appointment Confirmation</h2>
      <p>Dear ${customer.fullName || 'Customer'},</p>
      <p>Your appointment has been confirmed with the following details:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Service:</strong> ${appointment.service || 'N/A'}</p>
        <p><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleString()}</p>
        <p><strong>Vehicle:</strong> ${appointment.vehicleInfo || 'N/A'}</p>
        ${appointment.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ''}
      </div>
      <p>If you need to reschedule or have any questions, please contact us.</p>
      <p>Thank you for choosing our service!</p>
    </div>
  `;

  return await sendEmail({
    to: customer.email,
    subject: 'Appointment Confirmation',
    body: html,
    isHtml: true,
  });
}

export async function sendInvoiceEmail(invoice: any, customer: any) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Invoice #${invoice.invoiceNumber}</h2>
      <p>Dear ${customer.fullName || 'Customer'},</p>
      <p>Thank you for your business. Please find your invoice details below:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
        <p><strong>Invoice Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
        <p><strong>Total Amount:</strong> $${invoice.totalAmount}</p>
        <p><strong>Status:</strong> ${invoice.status}</p>
        ${invoice.dueDate ? `<p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>` : ''}
      </div>
      ${invoice.status === 'pending' || invoice.status === 'sent' ? '<p>Please make payment at your earliest convenience.</p>' : ''}
      <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
      <p>Best regards,<br>Your Service Team</p>
    </div>
  `;

  return await sendEmail({
    to: customer.email,
    subject: `Invoice #${invoice.invoiceNumber}`,
    body: html,
    isHtml: true,
  });
}

export async function sendServiceReminderEmail(reminder: any, customer: any, vehicle: any) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Service Reminder</h2>
      <p>Dear ${customer.fullName || 'Customer'},</p>
      <p>This is a friendly reminder that your vehicle is due for service:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Vehicle:</strong> ${vehicle.year} ${vehicle.make} ${vehicle.model}</p>
        <p><strong>Service Type:</strong> ${reminder.serviceType}</p>
        <p><strong>Due Date:</strong> ${new Date(reminder.dueDate).toLocaleDateString()}</p>
        ${reminder.notes ? `<p><strong>Notes:</strong> ${reminder.notes}</p>` : ''}
      </div>
      <p>Please contact us to schedule an appointment at your convenience.</p>
      <p>Regular maintenance helps keep your vehicle running smoothly and can prevent costly repairs.</p>
      <p>Best regards,<br>Your Service Team</p>
    </div>
  `;

  return await sendEmail({
    to: customer.email,
    subject: 'Service Reminder - Vehicle Maintenance Due',
    body: html,
    isHtml: true,
  });
}
