import { getTwilioClient, getTwilioFromPhoneNumber } from './twilioClient';
import { storage } from '../storage';
import type { InsertNotification } from '@shared/schema';

interface SMSTemplate {
  message: string;
}

interface SendSMSParams {
  to: string;
  recipientId: string;
  garageId: string;
  template: SMSTemplate;
  category: string;
  metadata?: any;
}

class SMSService {
  async sendSMS({ to, recipientId, garageId, template, category, metadata }: SendSMSParams): Promise<void> {
    // Create notification record
    const notificationData: InsertNotification = {
      type: 'sms',
      category,
      status: 'pending',
      recipientId,
      garageId,
      title: `SMS: ${category}`,
      message: template.message,
      metadata,
    };

    const notification = await storage.createNotification(notificationData);

    try {
      const twilioClient = await getTwilioClient();
      const fromPhoneNumber = await getTwilioFromPhoneNumber();

      if (!fromPhoneNumber) {
        throw new Error('Twilio phone number not configured');
      }

      const message = await twilioClient.messages.create({
        body: template.message,
        from: fromPhoneNumber,
        to,
      });

      await storage.markNotificationAsSent(notification.id);
      console.log('SMS sent successfully:', notification.id, 'Twilio SID:', message.sid);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await storage.markNotificationAsFailed(notification.id, errorMessage);
      console.error('Error sending SMS:', error);
    }
  }

  // SMS Templates

  appointmentReminder(params: {
    customerName: string;
    appointmentDate: string;
    appointmentTime: string;
    garageName: string;
  }): SMSTemplate {
    return {
      message: `Hi ${params.customerName}, reminder: Your appointment at ${params.garageName} is on ${params.appointmentDate} at ${params.appointmentTime}. See you soon!`
    };
  }

  appointmentConfirmation(params: {
    customerName: string;
    appointmentDate: string;
    appointmentTime: string;
    garageName: string;
  }): SMSTemplate {
    return {
      message: `Hi ${params.customerName}, your appointment at ${params.garageName} is confirmed for ${params.appointmentDate} at ${params.appointmentTime}.`
    };
  }

  jobStatusUpdate(params: {
    customerName: string;
    jobCardNumber: string;
    status: string;
    garageName: string;
  }): SMSTemplate {
    return {
      message: `Hi ${params.customerName}, your job ${params.jobCardNumber} at ${params.garageName} is now ${status}. Contact us for details.`
    };
  }

  jobCompleted(params: {
    customerName: string;
    jobCardNumber: string;
    garageName: string;
    totalAmount?: string;
  }): SMSTemplate {
    const amountText = params.totalAmount ? ` Total: $${params.totalAmount}.` : '';
    return {
      message: `Hi ${params.customerName}, your vehicle service (${params.jobCardNumber}) at ${params.garageName} is complete!${amountText} Ready for pickup.`
    };
  }

  invoiceNotification(params: {
    customerName: string;
    invoiceNumber: string;
    amount: string;
    dueDate: string;
    garageName: string;
  }): SMSTemplate {
    return {
      message: `Hi ${params.customerName}, invoice ${params.invoiceNumber} from ${params.garageName} for $${params.amount} is due ${params.dueDate}. Please arrange payment.`
    };
  }

  paymentReceived(params: {
    customerName: string;
    invoiceNumber: string;
    amount: string;
    garageName: string;
  }): SMSTemplate {
    return {
      message: `Hi ${params.customerName}, we received your payment of $${params.amount} for invoice ${params.invoiceNumber}. Thank you! - ${params.garageName}`
    };
  }

  estimateReady(params: {
    customerName: string;
    estimateNumber: string;
    amount: string;
    garageName: string;
  }): SMSTemplate {
    return {
      message: `Hi ${params.customerName}, your estimate ${params.estimateNumber} from ${params.garageName} is ready: $${params.amount}. Contact us to proceed.`
    };
  }

  feedbackRequest(params: {
    customerName: string;
    garageName: string;
    feedbackLink?: string;
  }): SMSTemplate {
    const linkText = params.feedbackLink ? ` ${params.feedbackLink}` : '';
    return {
      message: `Hi ${params.customerName}, thank you for choosing ${params.garageName}! We'd love your feedback.${linkText}`
    };
  }
}

export const smsService = new SMSService();
