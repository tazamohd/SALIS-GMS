import { storage } from "../storage";
import type { InsertNotification } from "@shared/schema";

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface SendEmailParams {
  to: string;
  recipientId: string;
  garageId?: string;
  template: EmailTemplate;
  category: string;
  metadata?: any;
}

class EmailService {
  private apiKey: string;
  private apiUrl = 'https://api.getresponse.com/v3';

  constructor() {
    this.apiKey = process.env.GETRESPONSE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('GETRESPONSE_API_KEY not configured. Email notifications will be stored but not sent.');
    }
  }

  async sendEmail({ to, recipientId, garageId, template, category, metadata }: SendEmailParams): Promise<void> {
    // Create notification record
    const notificationData: InsertNotification = {
      type: 'email',
      category,
      status: 'pending',
      recipientId,
      garageId,
      title: template.subject,
      message: template.text,
      metadata,
    };

    const notification = await storage.createNotification(notificationData);

    if (!this.apiKey) {
      await storage.markNotificationAsFailed(
        notification.id, 
        'GetResponse API key not configured. Please add GETRESPONSE_API_KEY to environment variables.'
      );
      console.log('Email notification marked as failed (no API key):', notification.id);
      return;
    }

    try {
      // GetResponse API call to send email
      const response = await fetch(`${this.apiUrl}/transactional-emails`, {
        method: 'POST',
        headers: {
          'X-Auth-Token': `api-key ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients: {
            to: [to]
          },
          subject: template.subject,
          html: template.html,
          text: template.text,
        }),
      });

      if (response.ok) {
        await storage.markNotificationAsSent(notification.id);
        console.log('Email sent successfully:', notification.id);
      } else {
        const error = await response.text();
        await storage.markNotificationAsFailed(notification.id, `GetResponse API error: ${error}`);
        console.error('Failed to send email:', error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await storage.markNotificationAsFailed(notification.id, errorMessage);
      console.error('Error sending email:', error);
    }
  }

  // Email Templates

  appointmentConfirmation(params: {
    customerName: string;
    appointmentDate: string;
    appointmentTime: string;
    serviceName: string;
    garageName: string;
    garagePhone?: string;
  }): EmailTemplate {
    const { customerName, appointmentDate, appointmentTime, serviceName, garageName, garagePhone } = params;
    
    return {
      subject: `Appointment Confirmation - ${garageName}`,
      text: `
Dear ${customerName},

Your appointment has been confirmed!

Appointment Details:
- Date: ${appointmentDate}
- Time: ${appointmentTime}
- Service: ${serviceName}
- Location: ${garageName}

${garagePhone ? `For any questions, please call us at ${garagePhone}` : ''}

We look forward to seeing you!

Best regards,
${garageName} Team
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #2563eb; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Appointment Confirmed</h1>
    </div>
    <div class="content">
      <p>Dear ${customerName},</p>
      <p>Your appointment has been successfully confirmed!</p>
      <div class="details">
        <p><strong>Date:</strong> ${appointmentDate}</p>
        <p><strong>Time:</strong> ${appointmentTime}</p>
        <p><strong>Service:</strong> ${serviceName}</p>
        <p><strong>Location:</strong> ${garageName}</p>
      </div>
      ${garagePhone ? `<p>For any questions, please call us at <strong>${garagePhone}</strong></p>` : ''}
      <p>We look forward to seeing you!</p>
    </div>
    <div class="footer">
      <p>Best regards,<br>${garageName} Team</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    };
  }

  invoiceNotification(params: {
    customerName: string;
    invoiceNumber: string;
    totalAmount: string;
    dueDate: string;
    garageName: string;
    invoiceLink?: string;
  }): EmailTemplate {
    const { customerName, invoiceNumber, totalAmount, dueDate, garageName, invoiceLink } = params;
    
    return {
      subject: `Invoice ${invoiceNumber} - ${garageName}`,
      text: `
Dear ${customerName},

Your invoice is ready!

Invoice Details:
- Invoice Number: ${invoiceNumber}
- Total Amount: $${totalAmount}
- Due Date: ${dueDate}

${invoiceLink ? `View Invoice: ${invoiceLink}` : ''}

Please contact us if you have any questions.

Best regards,
${garageName} Team
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #059669; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .invoice { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #059669; }
    .amount { font-size: 24px; color: #059669; font-weight: bold; }
    .button { display: inline-block; padding: 12px 24px; background: #059669; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Invoice Ready</h1>
    </div>
    <div class="content">
      <p>Dear ${customerName},</p>
      <p>Your invoice is now available.</p>
      <div class="invoice">
        <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
        <p><strong>Due Date:</strong> ${dueDate}</p>
        <p><strong>Total Amount:</strong> <span class="amount">$${totalAmount}</span></p>
      </div>
      ${invoiceLink ? `<a href="${invoiceLink}" class="button">View Invoice</a>` : ''}
      <p>Please contact us if you have any questions.</p>
    </div>
    <div class="footer">
      <p>Best regards,<br>${garageName} Team</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    };
  }

  jobCompletedNotification(params: {
    customerName: string;
    jobCardNumber: string;
    vehicleInfo: string;
    completedDate: string;
    garageName: string;
    pickupInstructions?: string;
  }): EmailTemplate {
    const { customerName, jobCardNumber, vehicleInfo, completedDate, garageName, pickupInstructions } = params;
    
    return {
      subject: `Job Completed - ${jobCardNumber}`,
      text: `
Dear ${customerName},

Great news! Your vehicle service is complete.

Job Details:
- Job Card: ${jobCardNumber}
- Vehicle: ${vehicleInfo}
- Completed: ${completedDate}

${pickupInstructions ? `Pickup Instructions: ${pickupInstructions}` : 'Your vehicle is ready for pickup.'}

Thank you for choosing ${garageName}!

Best regards,
${garageName} Team
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0891b2; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .job-info { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #0891b2; }
    .highlight { background: #ecfeff; padding: 10px; border-radius: 5px; margin: 15px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Job Completed!</h1>
    </div>
    <div class="content">
      <p>Dear ${customerName},</p>
      <p>Great news! Your vehicle service is complete.</p>
      <div class="job-info">
        <p><strong>Job Card:</strong> ${jobCardNumber}</p>
        <p><strong>Vehicle:</strong> ${vehicleInfo}</p>
        <p><strong>Completed:</strong> ${completedDate}</p>
      </div>
      ${pickupInstructions ? `<div class="highlight"><strong>Pickup Instructions:</strong><br>${pickupInstructions}</div>` : '<p>Your vehicle is ready for pickup.</p>'}
      <p>Thank you for choosing ${garageName}!</p>
    </div>
    <div class="footer">
      <p>Best regards,<br>${garageName} Team</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    };
  }

  feedbackRequest(params: {
    customerName: string;
    serviceName: string;
    garageName: string;
    feedbackLink?: string;
  }): EmailTemplate {
    const { customerName, serviceName, garageName, feedbackLink } = params;
    
    return {
      subject: `How was your experience with ${garageName}?`,
      text: `
Dear ${customerName},

Thank you for choosing ${garageName} for your ${serviceName}.

We'd love to hear about your experience! Your feedback helps us improve our service.

${feedbackLink ? `Share Your Feedback: ${feedbackLink}` : 'Please reply to this email with your feedback.'}

Thank you for your time!

Best regards,
${garageName} Team
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #7c3aed; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; text-align: center; }
    .button { display: inline-block; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>We Value Your Feedback</h1>
    </div>
    <div class="content">
      <p>Dear ${customerName},</p>
      <p>Thank you for choosing ${garageName} for your ${serviceName}.</p>
      <p>We'd love to hear about your experience! Your feedback helps us improve our service.</p>
      ${feedbackLink ? `<a href="${feedbackLink}" class="button">Share Your Feedback</a>` : '<p>Please reply to this email with your feedback.</p>'}
      <p>Thank you for your time!</p>
    </div>
    <div class="footer">
      <p>Best regards,<br>${garageName} Team</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    };
  }

  appointmentReminder(params: {
    customerName: string;
    appointmentDate: string;
    appointmentTime: string;
    serviceName: string;
    garageName: string;
    garageAddress?: string;
  }): EmailTemplate {
    const { customerName, appointmentDate, appointmentTime, serviceName, garageName, garageAddress } = params;
    
    return {
      subject: `Reminder: Appointment Tomorrow - ${garageName}`,
      text: `
Dear ${customerName},

This is a reminder about your upcoming appointment.

Appointment Details:
- Date: ${appointmentDate}
- Time: ${appointmentTime}
- Service: ${serviceName}
${garageAddress ? `- Location: ${garageAddress}` : ''}

See you soon!

Best regards,
${garageName} Team
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .reminder { background: #fef3c7; padding: 15px; margin: 15px 0; border-left: 4px solid #f59e0b; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Appointment Reminder</h1>
    </div>
    <div class="content">
      <p>Dear ${customerName},</p>
      <p>This is a reminder about your upcoming appointment.</p>
      <div class="reminder">
        <p><strong>Date:</strong> ${appointmentDate}</p>
        <p><strong>Time:</strong> ${appointmentTime}</p>
        <p><strong>Service:</strong> ${serviceName}</p>
        ${garageAddress ? `<p><strong>Location:</strong> ${garageAddress}</p>` : ''}
      </div>
      <p>See you soon!</p>
    </div>
    <div class="footer">
      <p>Best regards,<br>${garageName} Team</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    };
  }
}

export const emailService = new EmailService();
