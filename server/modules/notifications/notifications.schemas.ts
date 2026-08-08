/**
 * Notification trigger validation schemas (Phase E). Moved verbatim from the
 * monolith — the request bodies for the email/SMS notification-trigger
 * endpoints. Kept co-located with the domain that owns them.
 */

import { z } from 'zod';

// Email notification validation schemas
export const appointmentConfirmationSchema = z.object({
  customerEmail: z.string().email(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  appointmentDate: z.string(),
  appointmentTime: z.string(),
  serviceName: z.string(),
  garageName: z.string(),
  garagePhone: z.string().optional(),
});

export const invoiceNotificationSchema = z.object({
  customerEmail: z.string().email(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  invoiceNumber: z.string(),
  totalAmount: z.string(),
  dueDate: z.string(),
  garageName: z.string(),
  invoiceLink: z.string().optional(),
});

export const jobCompletedSchema = z.object({
  customerEmail: z.string().email(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  jobCardNumber: z.string(),
  vehicleInfo: z.string(),
  completedDate: z.string(),
  garageName: z.string(),
  pickupInstructions: z.string().optional(),
});

export const feedbackRequestSchema = z.object({
  customerEmail: z.string().email(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  serviceName: z.string(),
  garageName: z.string(),
  feedbackLink: z.string().optional(),
});

export const appointmentReminderSchema = z.object({
  customerEmail: z.string().email(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  appointmentDate: z.string(),
  appointmentTime: z.string(),
  serviceName: z.string(),
  garageName: z.string(),
  garageAddress: z.string().optional(),
});

// SMS notification validation schemas
export const smsAppointmentReminderSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  appointmentDate: z.string(),
  appointmentTime: z.string(),
  garageName: z.string(),
});

export const smsAppointmentConfirmationSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  appointmentDate: z.string(),
  appointmentTime: z.string(),
  garageName: z.string(),
});

export const smsJobStatusSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  jobCardNumber: z.string(),
  status: z.string(),
  garageName: z.string(),
});

export const smsJobCompletedSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  jobCardNumber: z.string(),
  garageName: z.string(),
  totalAmount: z.string().optional(),
});

export const smsInvoiceSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  invoiceNumber: z.string(),
  amount: z.string(),
  dueDate: z.string(),
  garageName: z.string(),
});

export const smsPaymentReceivedSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  invoiceNumber: z.string(),
  amount: z.string(),
  garageName: z.string(),
});

export const smsEstimateSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  estimateNumber: z.string(),
  amount: z.string(),
  garageName: z.string(),
});

export const smsFeedbackRequestSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  garageName: z.string(),
  feedbackLink: z.string().optional(),
});
