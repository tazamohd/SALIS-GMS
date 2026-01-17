import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Plus } from "lucide-react";

export default function LeaveRequests() {
  const { t } = useTranslation();

  const leaveRequests = [
    { id: 1, employee: "Ahmed Hassan", type: "Annual Leave", startDate: "2026-01-15", endDate: "2026-01-20", days: 5, status: "approved", reason: "Family vacation" },
    { id: 2, employee: "Mohammed Ali", type: "Sick Leave", startDate: "2026-01-10", endDate: "2026-01-11", days: 2, status: "approved", reason: "Medical appointment" },
    { id: 3, employee: "Khalid Omar", type: "Personal Leave", startDate: "2026-01-25", endDate: "2026-01-26", days: 2, status: "pending", reason: "Personal matters" },
    { id: 4, employee: "Sara Ahmed", type: "Emergency Leave", startDate: "2026-01-08", endDate: "2026-01-09", days: 2, status: "approved", reason: "Family emergency" },
    { id: 5, employee: "Fatima Khalid", type: "Annual Leave", startDate: "2026-02-01", endDate: "2026-02-05", days: 5, status: "rejected", reason: "Travel plans" },
  ];

  const getStatusBadge = (status: string, id: number) => {
    switch (status) {
      case "approved": return <Badge data-testid={`status-approved-${id}`} className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><CheckCircle className="w-3 h-3 mr-1" />{t('statusLabels.approved', 'Approved')}</Badge>;
      case "pending": return <Badge data-testid={`status-pending-${id}`} className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><AlertCircle className="w-3 h-3 mr-1" />{t('statusLabels.pending', 'Pending')}</Badge>;
      case "rejected": return <Badge data-testid={`status-rejected-${id}`} className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />{t('statusLabels.rejected', 'Rejected')}</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050510] via-[#0a0a1a] to-[#050510] p-6" data-testid="leave-requests-page">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white" data-testid="page-title">{t('leaveRequests.title', 'Leave Requests')}</h1>
            <p className="text-gray-400 mt-1" data-testid="page-description">{t('leaveRequests.description', 'Manage employee leave requests and approvals')}</p>
          </div>
          <Button data-testid="button-new-request" className="bg-sky-500 hover:bg-sky-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            {t('leaveRequests.newRequest', 'New Request')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-total-requests">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-500/20"><Calendar className="w-5 h-5 text-sky-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white" data-testid="text-total-requests">12</p>
                  <p className="text-sm text-gray-400">{t('leaveRequests.totalRequests', 'Total Requests')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-pending">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20"><Clock className="w-5 h-5 text-yellow-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white" data-testid="text-pending">3</p>
                  <p className="text-sm text-gray-400">{t('statusLabels.pending', 'Pending')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-approved">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20"><CheckCircle className="w-5 h-5 text-emerald-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white" data-testid="text-approved">8</p>
                  <p className="text-sm text-gray-400">{t('statusLabels.approved', 'Approved')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-rejected">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20"><XCircle className="w-5 h-5 text-red-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white" data-testid="text-rejected">1</p>
                  <p className="text-sm text-gray-400">{t('statusLabels.rejected', 'Rejected')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-recent-requests">
          <CardHeader>
            <CardTitle className="text-white">{t('leaveRequests.recentRequests', 'Recent Leave Requests')}</CardTitle>
            <CardDescription className="text-gray-400">{t('leaveRequests.reviewManage', 'Review and manage employee leave requests')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaveRequests.map((request) => (
                <div key={request.id} data-testid={`request-row-${request.id}`} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:border-sky-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-sky-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white" data-testid={`text-employee-${request.id}`}>{request.employee}</p>
                      <p className="text-sm text-gray-400">{t(`leaveRequests.types.${request.type.toLowerCase().replace(/\s+/g, '')}`, request.type)} • {request.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-white">{request.startDate} - {request.endDate}</p>
                      <p className="text-sm text-gray-400">{request.days} {t('common.days', 'days')}</p>
                    </div>
                    {getStatusBadge(request.status, request.id)}
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
