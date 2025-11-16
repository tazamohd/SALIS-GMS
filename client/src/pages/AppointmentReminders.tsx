import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

  const recentReminders = reminderLogs.filter((log: any) => 
    new Date(log.sentAt) >= thirtyDaysAgo
  );

  const deliveredReminders = recentReminders.filter((log: any) => 
    log.deliveryStatus === 'delivered'
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

  const statsCards = (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="bg-white dark:bg-salis-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Reminders Sent</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{recentReminders.length}</p>
              </div>
              <Send className="h-12 w-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Rate</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{deliveryRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Confirmation Rate</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{confirmationRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">No-Show Rate</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{noShowRate.toFixed(1)}%</p>
              </div>
              <UserX className="h-12 w-12 text-red-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Revenue Loss</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">${totalRevenueLoss.toFixed(0)}</p>
              </div>
              <DollarSign className="h-12 w-12 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-salis-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-900 dark:text-white">SMS</span>
              </div>
              <Badge className={reminderSettings.smsEnabled ? 'bg-green-500' : 'bg-gray-500'}>
                {reminderSettings.smsEnabled ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{smsReminders}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">messages sent</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-gray-900 dark:text-white">Email</span>
              </div>
              <Badge className={reminderSettings.emailEnabled ? 'bg-green-500' : 'bg-gray-500'}>
                {reminderSettings.emailEnabled ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{emailReminders}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">emails sent</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <SiWhatsapp className="h-5 w-5 text-green-500" />
                <span className="font-semibold text-gray-900 dark:text-white">WhatsApp</span>
              </div>
              <Badge className={reminderSettings.whatsappEnabled ? 'bg-green-500' : 'bg-gray-500'}>
                {reminderSettings.whatsappEnabled ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{whatsappReminders}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">messages sent</p>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const tabs: TabConfig[] = [
    {
      id: "overview",
      label: "Reminder Logs",
      icon: Send,
      content: (
        <Card className="bg-white dark:bg-salis-black">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Send className="h-5 w-5 text-blue-600" />
                Recent Reminder Activity
              </span>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-send-manual-reminder">
                Send Manual Reminder
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentReminders.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">No reminders sent yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentReminders.slice(0, 10).map((log: any) => (
                  <div
                    key={log.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    data-testid={`reminder-${log.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {log.reminderType === 'sms' && <MessageSquare className="h-4 w-4 text-blue-600" />}
                          {log.reminderType === 'email' && <Mail className="h-4 w-4 text-green-600" />}
                          {log.reminderType === 'whatsapp' && <SiWhatsapp className="h-4 w-4 text-green-500" />}
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {log.reminderTiming} reminder
                          </span>
                          <Badge className={
                            log.deliveryStatus === 'delivered' ? 'bg-green-500' :
                            log.deliveryStatus === 'failed' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }>
                            {log.deliveryStatus}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          To: {log.recipientPhone || log.recipientEmail}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Sent: {new Date(log.sentAt).toLocaleString()}
                        </p>
                        {log.responseAction && (
                          <div className="mt-2 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-600">
                              Customer {log.responseAction}ed
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
      label: "No-Show Tracking",
      icon: UserX,
      content: (
        <Card className="bg-white dark:bg-salis-black">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <UserX className="h-5 w-5 text-red-600" />
                No-Show History
              </span>
              <div className="flex gap-2">
                <Button variant="outline" data-testid="button-export-noshows">
                  Export Report
                </Button>
                <Button className="bg-red-600 hover:bg-red-700" data-testid="button-mark-noshow">
                  Mark No-Show
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentNoShows.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-400" />
                <p className="text-gray-500 dark:text-gray-400">No no-shows recorded in the last 30 days!</p>
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
                            Customer No-Show
                          </span>
                          {noShow.rescheduled && (
                            <Badge className="bg-green-500">Rescheduled</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Scheduled: {new Date(noShow.scheduledTime).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Est. Loss</p>
                        <p className="text-lg font-bold text-red-600">
                          ${Number(noShow.estimatedRevenueLoss || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Contact Attempts</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {noShow.contactAttempts || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Fee Charged</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {noShow.noShowFeeCharged ? `$${Number(noShow.feeAmount || 0).toFixed(2)}` : 'None'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Status</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {noShow.feePaid ? 'Paid' : noShow.feeWaived ? 'Waived' : 'Unpaid'}
                        </p>
                      </div>
                    </div>

                    {noShow.customerReason && (
                      <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Reason:</p>
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
      label: "Settings",
      icon: Settings,
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-salis-black">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Reminder Channels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">SMS Reminders</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">24h, 2h before appointment</p>
                  </div>
                </div>
                <Switch checked={reminderSettings.smsEnabled} data-testid="switch-sms" />
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Email Reminders</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">72h, 24h before appointment</p>
                  </div>
                </div>
                <Switch checked={reminderSettings.emailEnabled} data-testid="switch-email" />
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <SiWhatsapp className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">WhatsApp Reminders</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">24h before appointment</p>
                  </div>
                </div>
                <Switch checked={reminderSettings.whatsappEnabled} data-testid="switch-whatsapp" />
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Post-Appointment Follow-up</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">24h after service completion</p>
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
                No-Show Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auto-mark-time">Auto-mark no-show after (minutes)</Label>
                <Input
                  id="auto-mark-time"
                  type="number"
                  defaultValue={30}
                  placeholder="30"
                  data-testid="input-noshow-minutes"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="noshow-fee">No-show fee amount ($)</Label>
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
                <Label htmlFor="reschedule-enabled">Allow no-show rescheduling</Label>
                <Switch id="reschedule-enabled" defaultChecked data-testid="switch-reschedule" />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="blacklist-repeat">Blacklist repeat offenders (3+ no-shows)</Label>
                <Switch id="blacklist-repeat" data-testid="switch-blacklist" />
              </div>

              <Button className="w-full bg-orange-600 hover:bg-orange-700" data-testid="button-save-noshow-settings">
                Save No-Show Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "templates",
      label: "Templates",
      icon: MessageSquare,
      content: (
        <Card className="bg-white dark:bg-salis-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              Message Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="sms-template">SMS Template</Label>
              <Textarea
                id="sms-template"
                rows={3}
                defaultValue="Hi {customerName}, reminder: Your appointment at {garageName} is scheduled for {appointmentTime}. Reply CONFIRM or CANCEL."
                data-testid="textarea-sms-template"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Available variables: {"{customerName}"}, {"{garageName}"}, {"{appointmentTime}"}, {"{vehicleMake}"}, {"{vehicleModel}"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-template">Email Template</Label>
              <Textarea
                id="email-template"
                rows={5}
                defaultValue="Dear {customerName},&#10;&#10;This is a friendly reminder that your appointment is scheduled for {appointmentTime} at {garageName}.&#10;&#10;Service: {serviceType}&#10;Vehicle: {vehicleMake} {vehicleModel}&#10;&#10;Please reply to confirm or contact us to reschedule.&#10;&#10;Thank you!"
                data-testid="textarea-email-template"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="followup-template">Follow-up Template</Label>
              <Textarea
                id="followup-template"
                rows={4}
                defaultValue="Hi {customerName}, thank you for visiting {garageName}! We hope you're satisfied with our service. Please rate your experience and let us know if you need anything else."
                data-testid="textarea-followup-template"
              />
            </div>

            <Button className="w-full bg-purple-600 hover:bg-purple-700" data-testid="button-save-templates">
              Save Templates
            </Button>
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <TabsPageLayout
      title="Appointment Reminder System"
      description="Multi-channel reminders (SMS, Email, WhatsApp) with no-show tracking and analytics"
      icon={Bell}
      headerContent={statsCards}
      tabs={tabs}
      defaultTab="overview"
      activeTab={selectedTab}
      onTabChange={setSelectedTab}
    />
  );
}
