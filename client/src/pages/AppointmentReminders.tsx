import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Bell,
  Mail,
  MessageSquare,
  Clock,
  UserX,
  CheckCircle,
  TrendingUp,
  Send,
  Settings,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { TabsPageLayout, TabConfig } from "@/components/layouts";

export default function AppointmentReminders() {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("overview");

  const { data: appointmentsData } = useQuery({ queryKey: ["/api/appointments"] });
  const { data: reminderLogsData } = useQuery({ queryKey: ["/api/reminder-logs"] });
  const { data: noShowsData } = useQuery({ queryKey: ["/api/no-shows"] });
  const { data: reminderSettingsData } = useQuery({ queryKey: ["/api/reminder-settings"] });

  const appointments = (appointmentsData as any[]) || [];
  const reminderLogs = (reminderLogsData as any[]) || [];
  const noShows = (noShowsData as any[]) || [];
  const reminderSettings = reminderSettingsData as any || {
    smsEnabled: true,
    emailEnabled: true,
    whatsappEnabled: false,
    postAppointmentFollowup: true,
  };

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const recentReminders = reminderLogs.filter((log: any) => {
    const scheduleDate = new Date(log.scheduledFor || log.sentAt);
    return scheduleDate >= thirtyDaysAgo && scheduleDate <= ninetyDaysFromNow;
  });

  const deliveredReminders = recentReminders.filter((log: any) => 
    log.deliveryStatus === 'delivered' || log.status === 'sent'
  ).length;

  const confirmedAppointments = recentReminders.filter((log: any) => 
    log.responseAction === 'confirm'
  ).length;

  const recentNoShows = noShows.filter((ns: any) => 
    new Date(ns.markedNoShowAt) >= thirtyDaysAgo
  );

  const totalRevenueLoss = recentNoShows.reduce((sum: number, ns: any) => 
    sum + (Number(ns.estimatedRevenueLoss) || 0), 0
  );

  const deliveryRate = recentReminders.length > 0
    ? (deliveredReminders / recentReminders.length) * 100
    : 0;

  const confirmationRate = recentReminders.length > 0
    ? (confirmedAppointments / recentReminders.length) * 100
    : 0;

  const noShowRate = appointments.length > 0
    ? (recentNoShows.length / appointments.length) * 100
    : 0;

  const smsReminders = recentReminders.filter((r: any) => r.reminderType === 'sms').length;
  const emailReminders = recentReminders.filter((r: any) => r.reminderType === 'email').length;
  const whatsappReminders = recentReminders.filter((r: any) => r.reminderType === 'whatsapp').length;

  const escapeCsvField = (value: any): string => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const exportNoShowsToCSV = () => {
    if (recentNoShows.length === 0) {
      alert(t('reminders.noNoShowData', 'No no-show data to export'));
      return;
    }

    try {
      const headers = [
        t('common.date', 'Date'),
        t('customers.customer', 'Customer'),
        t('auth.phone', 'Phone'),
        t('reminders.scheduledTime', 'Scheduled Time'),
        t('reminders.revenueLoss', 'Revenue Loss'),
        t('reminders.contactAttempts', 'Contact Attempts'),
        t('reminders.feeCharged', 'Fee Charged'),
        t('common.status', 'Status'),
        t('reminders.rescheduled', 'Rescheduled'),
        t('reminders.reason', 'Reason')
      ];
      const csvRows = [
        headers.join(','),
        ...recentNoShows.map((ns: any) => {
          const markedDate = ns.markedNoShowAt ? new Date(ns.markedNoShowAt).toLocaleDateString() : 'N/A';
          const scheduledTime = ns.scheduledTime ? new Date(ns.scheduledTime).toLocaleString() : 'N/A';
          const revenueLoss = `$${Number(ns.estimatedRevenueLoss || 0).toFixed(2)}`;
          const feeCharged = ns.noShowFeeCharged ? `$${Number(ns.feeAmount || 0).toFixed(2)}` : t('common.none', 'None');
          const status = ns.feePaid ? t('reminders.paid', 'Paid') : ns.feeWaived ? t('reminders.waived', 'Waived') : t('reminders.unpaid', 'Unpaid');
          
          return [
            escapeCsvField(markedDate),
            escapeCsvField(ns.customerName || 'N/A'),
            escapeCsvField(ns.customerPhone || 'N/A'),
            escapeCsvField(scheduledTime),
            escapeCsvField(revenueLoss),
            escapeCsvField(ns.contactAttempts || 0),
            escapeCsvField(feeCharged),
            escapeCsvField(status),
            escapeCsvField(ns.rescheduled ? t('common.yes', 'Yes') : t('common.no', 'No')),
            escapeCsvField(ns.customerReason || ''),
          ].join(',');
        })
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.setAttribute('href', url);
      link.setAttribute('download', `no-shows-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      alert(t('reminders.exportSuccess', 'No-show report exported successfully!'));
    } catch (error) {
      console.error('Error exporting no-shows:', error);
      alert(t('reminders.exportFailed', 'Failed to export report. Please try again.'));
    }
  };

  const statsCards = (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] p-4 text-white">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute -right-2 -bottom-6 h-20 w-20 rounded-full bg-white/10" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Send className="w-5 h-5" />
              <span className="text-sm font-medium text-white/80">{t('reminders.remindersSent', 'Reminders Sent')}</span>
            </div>
            <p className="text-3xl font-bold">{recentReminders.length}</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36] p-4">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#0A5ED7]/5 dark:bg-[#0A5ED7]/10" />
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-[#0A5ED7]" />
            <span className="text-sm font-medium text-[#64748B]">{t('reminders.deliveryRate', 'Delivery Rate')}</span>
          </div>
          <p className="text-3xl font-bold text-[#0A5ED7]">{deliveryRate.toFixed(1)}%</p>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36] p-4">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#0A5ED7]/5 dark:bg-[#0A5ED7]/10" />
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-[#0A5ED7]" />
            <span className="text-sm font-medium text-[#64748B]">{t('reminders.confirmationRate', 'Confirmation Rate')}</span>
          </div>
          <p className="text-3xl font-bold text-[#0A5ED7]">{confirmationRate.toFixed(1)}%</p>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36] p-4">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#F97316]/5 dark:bg-[#F97316]/10" />
          <div className="flex items-center gap-2 mb-2">
            <UserX className="w-5 h-5 text-[#F97316]" />
            <span className="text-sm font-medium text-[#64748B]">{t('reminders.noShowRate', 'No-Show Rate')}</span>
          </div>
          <p className="text-3xl font-bold text-[#F97316]">{noShowRate.toFixed(1)}%</p>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36] p-4">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#F97316]/5 dark:bg-[#F97316]/10" />
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-[#F97316]" />
            <span className="text-sm font-medium text-[#64748B]">{t('reminders.revenueLoss', 'Revenue Loss')}</span>
          </div>
          <p className="text-3xl font-bold text-[#F97316]">${totalRevenueLoss.toFixed(0)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#0A5ED7]" />
                <span className="font-semibold text-[#0B1F3B] dark:text-white">{t('reminders.sms', 'SMS')}</span>
              </div>
              <Badge className={reminderSettings.smsEnabled ? 'bg-[#0A5ED7]/10 text-[#0A5ED7]' : 'bg-[#64748B]/10 text-[#64748B]'}>
                {reminderSettings.smsEnabled ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{smsReminders}</p>
            <p className="text-sm text-[#64748B]">{t('reminders.messagesSent', 'messages sent')}</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-[#0A5ED7]" />
                <span className="font-semibold text-[#0B1F3B] dark:text-white">{t('reminders.email', 'Email')}</span>
              </div>
              <Badge className={reminderSettings.emailEnabled ? 'bg-[#0A5ED7]/10 text-[#0A5ED7]' : 'bg-[#64748B]/10 text-[#64748B]'}>
                {reminderSettings.emailEnabled ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{emailReminders}</p>
            <p className="text-sm text-[#64748B]">{t('reminders.emailsSent', 'emails sent')}</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <SiWhatsapp className="h-5 w-5 text-[#25D366]" />
                <span className="font-semibold text-[#0B1F3B] dark:text-white">{t('reminders.whatsapp', 'WhatsApp')}</span>
              </div>
              <Badge className={reminderSettings.whatsappEnabled ? 'bg-[#0A5ED7]/10 text-[#0A5ED7]' : 'bg-[#64748B]/10 text-[#64748B]'}>
                {reminderSettings.whatsappEnabled ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{whatsappReminders}</p>
            <p className="text-sm text-[#64748B]">{t('reminders.messagesSent', 'messages sent')}</p>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const tabs: TabConfig[] = [
    {
      id: "overview",
      label: t('reminders.reminderLogs', 'Reminder Logs'),
      icon: Send,
      content: (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Send className="h-5 w-5 text-[#0A5ED7]" />
                <span className="text-[#0B1F3B] dark:text-white">{t('reminders.recentReminderActivity', 'Recent Reminder Activity')}</span>
              </span>
              <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952C1] hover:to-[#0AA3E8] text-white" data-testid="button-send-manual-reminder">
                {t('reminders.sendManualReminder', 'Send Manual Reminder')}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentReminders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#0A5ED7]/20 to-[#0BB3FF]/20 flex items-center justify-center">
                  <Bell className="h-8 w-8 text-[#0A5ED7]" />
                </div>
                <p className="text-[#64748B]">{t('reminders.noRemindersSent', 'No reminders sent yet')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentReminders.slice(0, 10).map((log: any) => (
                  <div
                    key={log.id}
                    className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]"
                    data-testid={`reminder-${log.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {log.reminderType === 'sms' && <MessageSquare className="h-4 w-4 text-[#0A5ED7]" />}
                          {log.reminderType === 'email' && <Mail className="h-4 w-4 text-[#0A5ED7]" />}
                          {log.reminderType === 'whatsapp' && <SiWhatsapp className="h-4 w-4 text-[#25D366]" />}
                          <span className="font-semibold text-[#0B1F3B] dark:text-white">
                            {log.customerName || log.reminderTiming || t('reminders.reminder', 'Reminder')}
                          </span>
                          <Badge className={
                            log.deliveryStatus === 'delivered' || log.status === 'sent' ? 'bg-[#0A5ED7]/10 text-[#0A5ED7]' :
                            log.deliveryStatus === 'failed' || log.status === 'failed' ? 'bg-[#F97316]/10 text-[#F97316]' :
                            log.status === 'cancelled' ? 'bg-[#64748B]/10 text-[#64748B]' :
                            'bg-[#EAB308]/10 text-[#EAB308]'
                          }>
                            {log.status || log.deliveryStatus}
                          </Badge>
                        </div>
                        <p className="text-sm text-[#64748B] mb-1">
                          {t('reminders.to', 'To')}: {log.customerPhone || log.customerEmail || log.recipientPhone || log.recipientEmail}
                        </p>
                        <p className="text-sm text-[#64748B]">
                          {log.sentAt 
                            ? `${t('reminders.sent', 'Sent')}: ${new Date(log.sentAt).toLocaleString()}`
                            : `${t('reminders.scheduledFor', 'Scheduled')}: ${new Date(log.scheduledFor).toLocaleString()}`
                          }
                        </p>
                        {log.serviceType && (
                          <p className="text-sm text-[#64748B]">
                            {t('common.service', 'Service')}: {log.serviceType}
                          </p>
                        )}
                        {log.responseAction && (
                          <div className="mt-2 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-[#0A5ED7]" />
                            <span className="text-sm font-semibold text-[#0A5ED7]">
                              {t('reminders.customerAction', 'Customer {{action}}ed', { action: log.responseAction })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ),
    },
    {
      id: "noshows",
      label: t('reminders.noShowTracking', 'No-Show Tracking'),
      icon: UserX,
      content: (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <UserX className="h-5 w-5 text-[#F97316]" />
                <span className="text-[#0B1F3B] dark:text-white">{t('reminders.noShowHistory', 'No-Show History')}</span>
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportNoShowsToCSV} className="border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10" data-testid="button-export-noshows">
                  {t('reminders.exportReport', 'Export Report')}
                </Button>
                <Button className="bg-red-600 hover:bg-red-700" data-testid="button-mark-noshow">
                  {t('reminders.markNoShow', 'Mark No-Show')}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentNoShows.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-400" />
                <p className="text-gray-500 dark:text-gray-400">{t('reminders.noNoShowsRecorded', 'No no-shows recorded in the last 30 days!')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentNoShows.map((noShow: any) => (
                  <div
                    key={noShow.id}
                    className="p-4 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 rounded-lg"
                    data-testid={`noshow-${noShow.id}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <UserX className="h-5 w-5 text-red-600" />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {t('reminders.customerNoShow', 'Customer No-Show')}
                          </span>
                          {noShow.rescheduled && (
                            <Badge className="bg-green-500">{t('reminders.rescheduled', 'Rescheduled')}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('reminders.scheduledTime', 'Scheduled')}: {new Date(noShow.scheduledTime).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('reminders.estLoss', 'Est. Loss')}</p>
                        <p className="text-lg font-bold text-red-600">
                          ${Number(noShow.estimatedRevenueLoss || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">{t('reminders.contactAttempts', 'Contact Attempts')}</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {noShow.contactAttempts || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">{t('reminders.feeCharged', 'Fee Charged')}</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {noShow.noShowFeeCharged ? `$${Number(noShow.feeAmount || 0).toFixed(2)}` : t('common.none', 'None')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">{t('common.status', 'Status')}</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {noShow.feePaid ? t('reminders.paid', 'Paid') : noShow.feeWaived ? t('reminders.waived', 'Waived') : t('reminders.unpaid', 'Unpaid')}
                        </p>
                      </div>
                    </div>

                    {noShow.customerReason && (
                      <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('reminders.reason', 'Reason')}:</p>
                        <p className="text-sm text-gray-900 dark:text-white">{noShow.customerReason}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ),
    },
    {
      id: "settings",
      label: t('common.settings', 'Settings'),
      icon: Settings,
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-salis-black">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                {t('reminders.reminderChannels', 'Reminder Channels')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{t('reminders.smsReminders', 'SMS Reminders')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('reminders.smsSchedule', '24h, 2h before appointment')}</p>
                  </div>
                </div>
                <Switch checked={reminderSettings.smsEnabled} data-testid="switch-sms" />
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{t('reminders.emailReminders', 'Email Reminders')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('reminders.emailSchedule', '72h, 24h before appointment')}</p>
                  </div>
                </div>
                <Switch checked={reminderSettings.emailEnabled} data-testid="switch-email" />
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <SiWhatsapp className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{t('reminders.whatsappReminders', 'WhatsApp Reminders')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('reminders.whatsappSchedule', '24h before appointment')}</p>
                  </div>
                </div>
                <Switch checked={reminderSettings.whatsappEnabled} data-testid="switch-whatsapp" />
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{t('reminders.postAppointmentFollowup', 'Post-Appointment Follow-up')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('reminders.followupSchedule', '24h after service completion')}</p>
                  </div>
                </div>
                <Switch checked={reminderSettings.postAppointmentFollowup} data-testid="switch-followup" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-salis-black">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                {t('reminders.noShowSettings', 'No-Show Settings')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auto-mark-time">{t('reminders.autoMarkNoShowAfter', 'Auto-mark no-show after (minutes)')}</Label>
                <Input
                  id="auto-mark-time"
                  type="number"
                  defaultValue={30}
                  placeholder="30"
                  data-testid="input-noshow-minutes"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="noshow-fee">{t('reminders.noShowFeeAmount', 'No-show fee amount ($)')}</Label>
                <Input
                  id="noshow-fee"
                  type="number"
                  step="0.01"
                  defaultValue="25.00"
                  placeholder="0.00"
                  data-testid="input-noshow-fee"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="reschedule-enabled">{t('reminders.allowNoShowRescheduling', 'Allow no-show rescheduling')}</Label>
                <Switch id="reschedule-enabled" defaultChecked data-testid="switch-reschedule" />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="blacklist-repeat">{t('reminders.blacklistRepeatOffenders', 'Blacklist repeat offenders (3+ no-shows)')}</Label>
                <Switch id="blacklist-repeat" data-testid="switch-blacklist" />
              </div>

              <Button className="w-full bg-orange-600 hover:bg-orange-700" data-testid="button-save-noshow-settings">
                {t('reminders.saveNoShowSettings', 'Save No-Show Settings')}
              </Button>
            </CardContent>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <TabsPageLayout
      title={t('nav.appointment_reminders', 'Appointment Reminders')}
      description={t('reminders.description', 'Manage automated reminder notifications and no-show tracking')}
      icon={Bell}
      tabs={tabs}
      defaultTab="overview"
      headerContent={statsCards}
    />
  );
}
