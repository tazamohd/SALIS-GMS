// SMS Service using Twilio for appointment reminders
// Saudi Arabia uses +966 country code

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client only if credentials are available
let twilioClient: ReturnType<typeof twilio> | null = null;

if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken);
}

export interface SMSMessage {
  to: string; // Phone number with country code (e.g., +966501234567)
  body: string;
}

/**
 * Send SMS via Twilio
 * @param message - SMS message details
 * @returns Promise with result
 */
export async function sendSMS(message: SMSMessage): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  // Check if Twilio is configured
  if (!twilioClient || !twilioPhoneNumber) {
    console.warn('Twilio not configured. SMS not sent:', message.body);
    return {
      success: false,
      error: 'SMS service not configured. Please add Twilio credentials.',
    };
  }

  try {
    const result = await twilioClient.messages.create({
      body: message.body,
      from: twilioPhoneNumber,
      to: message.to,
    });

    console.log(`SMS sent successfully: ${result.sid}`);
    return {
      success: true,
      messageId: result.sid,
    };
  } catch (error: any) {
    console.error('Failed to send SMS:', error);
    return {
      success: false,
      error: error.message || 'Failed to send SMS',
    };
  }
}

/**
 * Format phone number for Saudi Arabia
 * Ensures phone number has +966 country code
 * @param phone - Phone number (with or without country code)
 * @returns Formatted phone number with +966 prefix
 */
export function formatSaudiPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // If starts with 966, add +
  if (cleaned.startsWith('966')) {
    return `+${cleaned}`;
  }

  // If starts with 0, replace with +966
  if (cleaned.startsWith('0')) {
    return `+966${cleaned.substring(1)}`;
  }

  // If doesn't have country code, add +966
  if (cleaned.length === 9) {
    return `+966${cleaned}`;
  }

  // Return as-is with + if already formatted
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}

/**
 * Send appointment reminder SMS
 * @param customerPhone - Customer phone number
 * @param customerName - Customer name
 * @param appointmentDate - Appointment date
 * @param garageName - Garage name
 */
export async function sendAppointmentReminder(
  customerPhone: string,
  customerName: string,
  appointmentDate: Date,
  garageName: string
): Promise<{ success: boolean; error?: string }> {
  const formattedPhone = formatSaudiPhoneNumber(customerPhone);
  const dateStr = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = appointmentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const message = `Hi ${customerName}! This is a reminder about your appointment at ${garageName} on ${dateStr} at ${timeStr}. Reply CONFIRM to confirm or call us to reschedule.`;

  return await sendSMS({
    to: formattedPhone,
    body: message,
  });
}

/**
 * Send job completion notification
 * @param customerPhone - Customer phone number
 * @param customerName - Customer name
 * @param jobNumber - Job card number
 * @param garageName - Garage name
 */
export async function sendJobCompletionSMS(
  customerPhone: string,
  customerName: string,
  jobNumber: string,
  garageName: string
): Promise<{ success: boolean; error?: string }> {
  const formattedPhone = formatSaudiPhoneNumber(customerPhone);

  const message = `Hi ${customerName}! Good news - your vehicle service (Job #${jobNumber}) is complete and ready for pickup at ${garageName}. Call us to arrange pickup.`;

  return await sendSMS({
    to: formattedPhone,
    body: message,
  });
}

/**
 * Send invoice payment reminder
 * @param customerPhone - Customer phone number
 * @param customerName - Customer name
 * @param invoiceNumber - Invoice number
 * @param amountDue - Amount due
 * @param dueDate - Due date
 */
export async function sendPaymentReminderSMS(
  customerPhone: string,
  customerName: string,
  invoiceNumber: string,
  amountDue: number,
  dueDate: Date
): Promise<{ success: boolean; error?: string }> {
  const formattedPhone = formatSaudiPhoneNumber(customerPhone);
  const dateStr = dueDate.toLocaleDateString('en-US');

  const message = `Hi ${customerName}! Reminder: Invoice #${invoiceNumber} for SAR ${amountDue.toFixed(
    2
  )} is due on ${dateStr}. Pay online or visit us. Thank you!`;

  return await sendSMS({
    to: formattedPhone,
    body: message,
  });
}

/**
 * Send promotional SMS (with opt-out)
 * @param customerPhone - Customer phone number
 * @param customerName - Customer name
 * @param message - Promotional message
 */
export async function sendPromotionalSMS(
  customerPhone: string,
  customerName: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const formattedPhone = formatSaudiPhoneNumber(customerPhone);

  const fullMessage = `Hi ${customerName}! ${message} Reply STOP to unsubscribe.`;

  return await sendSMS({
    to: formattedPhone,
    body: fullMessage,
  });
}

/**
 * Bulk send SMS to multiple customers
 * @param messages - Array of SMS messages
 * @returns Array of results
 */
export async function sendBulkSMS(
  messages: SMSMessage[]
): Promise<Array<{ success: boolean; to: string; error?: string }>> {
  const results = await Promise.allSettled(
    messages.map((msg) => sendSMS(msg))
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return {
        success: result.value.success,
        to: messages[index].to,
        error: result.value.error,
      };
    } 
      return {
        success: false,
        to: messages[index].to,
        error: result.reason.message || 'Unknown error',
      };
    
  });
}

/**
 * Check if SMS service is configured
 * @returns boolean
 */
export function isSMSServiceConfigured(): boolean {
  return !!(accountSid && authToken && twilioPhoneNumber);
}
