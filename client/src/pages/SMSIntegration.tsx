import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, CheckCircle, XCircle, Clock, Settings, Phone } from "lucide-react";

export default function SMSIntegration() {
  const { t } = useTranslation();

  const messages = [
    { id: 1, to: "+966 50 XXX XXXX", content: "Your vehicle is ready for pickup. Thank you for choosing SALIS AUTO.", status: "delivered", time: "10:30 AM" },
    { id: 2, to: "+966 55 XXX XXXX", content: "Reminder: Your appointment is tomorrow at 9:00 AM.", status: "delivered", time: "10:15 AM" },
    { id: 3, to: "+966 54 XXX XXXX", content: "Your service estimate has been approved. Work will begin shortly.", status: "pending", time: "10:00 AM" },
    { id: 4, to: "+966 56 XXX XXXX", content: "Invoice #1234 is ready. Total: SAR 1,500.", status: "failed", time: "9:45 AM" },
  ];

  const getStatusBadge = (status: string, id: number) => {
    switch (status) {
      case "delivered": return <Badge data-testid={`status-delivered-${id}`} className="bg-emerald-500/20 text-emerald-400"><CheckCircle className="w-3 h-3 mr-1" />Delivered</Badge>;
      case "pending": return <Badge data-testid={`status-pending-${id}`} className="bg-yellow-500/20 text-yellow-400"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "failed": return <Badge data-testid={`status-failed-${id}`} className="bg-red-500/20 text-red-400"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050510] via-[#0a0a1a] to-[#050510] p-6" data-testid="sms-integration-page">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white" data-testid="page-title">{t('sms.title', 'SMS Integration')}</h1>
            <p className="text-gray-400 mt-1" data-testid="page-description">{t('sms.description', 'Send SMS notifications to customers via Twilio')}</p>
          </div>
          <div className="flex gap-3">
            <Button data-testid="button-settings" variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button data-testid="button-send-sms" className="bg-sky-500 hover:bg-sky-600 text-white">
              <Send className="w-4 h-4 mr-2" />
              Send SMS
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-total-sent">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-500/20"><MessageSquare className="w-5 h-5 text-sky-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white" data-testid="text-total-sent">1,247</p>
                  <p className="text-sm text-gray-400">Total Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-delivered">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20"><CheckCircle className="w-5 h-5 text-emerald-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white" data-testid="text-delivered">1,198</p>
                  <p className="text-sm text-gray-400">Delivered</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-failed">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20"><XCircle className="w-5 h-5 text-red-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white" data-testid="text-failed">12</p>
                  <p className="text-sm text-gray-400">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-delivery-rate">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20"><Phone className="w-5 h-5 text-purple-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white" data-testid="text-delivery-rate">96.1%</p>
                  <p className="text-sm text-gray-400">Delivery Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-recent-messages">
          <CardHeader>
            <CardTitle className="text-white">Recent Messages</CardTitle>
            <CardDescription className="text-gray-400">Latest SMS notifications sent to customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} data-testid={`message-row-${msg.id}`} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-sky-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white" data-testid={`text-recipient-${msg.id}`}>{msg.to}</p>
                      <p className="text-sm text-gray-400 max-w-md truncate">{msg.content}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400" data-testid={`text-time-${msg.id}`}>{msg.time}</span>
                    {getStatusBadge(msg.status, msg.id)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
