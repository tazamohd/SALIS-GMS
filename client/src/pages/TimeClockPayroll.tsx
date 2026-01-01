import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { TabsPageLayout, TabConfig } from "@/components/layouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Clock, DollarSign, Users } from "lucide-react";

export default function TimeClockPayroll() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isClockedIn, setIsClockedIn] = useState(false);

  const { data: periods = [] } = useQuery<any[]>({
    queryKey: ['/api/payroll/periods'],
  });

  const currentPeriod = periods[0] || {
    periodStart: new Date().toISOString(),
    periodEnd: new Date().toISOString(),
    totalGrossPay: 0,
    totalDeductions: 0,
    totalNetPay: 0,
    status: "draft",
  };

  const clockInMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/timeclock/clock-in", "POST", {
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      setIsClockedIn(true);
      toast({ title: t('timeClock.clockedIn', 'Clocked In'), description: t('timeClock.clockedInSuccess', 'You have successfully clocked in') });
    },
    onError: (error: any) => {
      toast({ title: t('timeClock.clockInFailed', 'Clock In Failed'), description: error.message || t('timeClock.failedToClockIn', 'Failed to clock in'), variant: "destructive" });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/timeclock/clock-out", "POST", {
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      setIsClockedIn(false);
      toast({ title: t('timeClock.clockedOut', 'Clocked Out'), description: t('timeClock.clockedOutSuccess', 'You have successfully clocked out') });
    },
    onError: (error: any) => {
      toast({ title: t('timeClock.clockOutFailed', 'Clock Out Failed'), description: error.message || t('timeClock.failedToClockOut', 'Failed to clock out'), variant: "destructive" });
    },
  });

  const calculatePayrollMutation = useMutation({
    mutationFn: async (periodId: string) => {
      return apiRequest(`/api/payroll/calculate/${periodId}`, "POST", {});
    },
    onSuccess: () => {
      toast({ title: t('payroll.calculated', 'Payroll Calculated'), description: t('payroll.calculatedSuccess', 'Payroll has been calculated successfully') });
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/periods'] });
    },
    onError: (error: any) => {
      toast({ title: t('payroll.calculationFailed', 'Calculation Failed'), description: error.message || t('payroll.failedToCalculate', 'Failed to calculate payroll'), variant: "destructive" });
    },
  });

  const handleClockToggle = () => {
    if (isClockedIn) {
      clockOutMutation.mutate();
    } else {
      clockInMutation.mutate();
    }
  };

  const statsContent = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[
        { label: t('payroll.periodGross', 'Period Gross'), value: `$${(currentPeriod.totalGrossPay || 0).toLocaleString()}`, icon: DollarSign, color: "text-emerald-600 dark:text-emerald-400", testId: "text-period-gross" },
        { label: t('payroll.deductions', 'Deductions'), value: `$${(currentPeriod.totalDeductions || 0).toLocaleString()}`, icon: DollarSign, color: "text-[#F97316]", testId: "text-deductions" },
        { label: t('payroll.netPay', 'Net Pay'), value: `$${(currentPeriod.totalNetPay || 0).toLocaleString()}`, icon: DollarSign, color: "text-[#0A5ED7]", testId: "text-net-pay" },
        { label: t('payroll.employees', 'Employees'), value: "12", icon: Users, color: "text-purple-600 dark:text-purple-400", testId: "text-employees" },
      ].map((stat, i) => (
        <Card key={i} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white" data-testid={stat.testId}>{stat.value}</h3>
              </div>
              <stat.icon className={`h-12 w-12 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const timeclockContent = (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader><CardTitle className="text-[#0B1F3B] dark:text-white">{t('timeClock.recentTimeEntries', 'Recent Time Entries')}</CardTitle></CardHeader>
      <CardContent>
        <div className="text-center py-8 text-[#64748B]">
          {t('timeClock.noTimeEntries', 'No time entries available. Clock in to start tracking time.')}
        </div>
      </CardContent>
    </Card>
  );

  const payrollContent = (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('payroll.currentPayPeriod', 'Current Pay Period')}</CardTitle>
          <Button 
            variant="outline" 
            onClick={() => currentPeriod.id && calculatePayrollMutation.mutate(currentPeriod.id)}
            disabled={calculatePayrollMutation.isPending || !currentPeriod.id}
            className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]"
            data-testid="button-calculate-payroll"
          >
            {calculatePayrollMutation.isPending ? t('payroll.calculating', 'Calculating...') : t('payroll.calculatePayroll', 'Calculate Payroll')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {periods.length === 0 ? (
          <div className="text-center py-8 text-[#64748B]">{t('payroll.noPeriodsAvailable', 'No payroll periods available')}</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg">
              <div>
                <p className="text-sm text-[#64748B]">{t('payroll.period', 'Period')}</p>
                <p className="font-semibold text-[#0B1F3B] dark:text-white" data-testid="text-period-range">
                  {new Date(currentPeriod.periodStart).toLocaleDateString()} - {new Date(currentPeriod.periodEnd).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#64748B]">{t('common.status', 'Status')}</p>
                <Badge className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0" data-testid="badge-period-status">{currentPeriod.status}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between p-2">
                <span className="text-[#64748B]">{t('payroll.totalGrossPay', 'Total Gross Pay')}</span>
                <span className="font-semibold text-[#0B1F3B] dark:text-white" data-testid="text-gross-detail">${(currentPeriod.totalGrossPay || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2">
                <span className="text-[#64748B]">{t('payroll.totalDeductions', 'Total Deductions')}</span>
                <span className="font-semibold text-[#F97316]" data-testid="text-deductions-detail">-${(currentPeriod.totalDeductions || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-3 bg-gradient-to-r from-[#0A5ED7]/10 to-[#0BB3FF]/10 dark:from-[#0A5ED7]/20 dark:to-[#0BB3FF]/20 rounded font-semibold">
                <span className="text-[#0B1F3B] dark:text-white">{t('payroll.totalNetPay', 'Total Net Pay')}</span>
                <span className="text-[#0A5ED7] dark:text-[#0BB3FF]" data-testid="text-net-detail">${(currentPeriod.totalNetPay || 0).toLocaleString()}</span>
              </div>
            </div>
            <Button className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white" data-testid="button-process-payroll">{t('payroll.processPayroll', 'Process Payroll')}</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const tabs: TabConfig[] = [
    {
      id: "timeclock",
      label: t('timeClock.timeEntries', 'Time Entries'),
      icon: Clock,
      content: timeclockContent,
    },
    {
      id: "payroll",
      label: t('payroll.payroll', 'Payroll'),
      icon: DollarSign,
      content: payrollContent,
    },
  ];

  return (
    <TabsPageLayout
      title={t('timeClock.title', 'Time Clock & Payroll')}
      description={t('timeClock.description', 'Track time and manage payroll')}
      icon={Clock}
      primaryAction={{
        label: isClockedIn ? t('timeClock.clockOut', 'Clock Out') : t('timeClock.clockIn', 'Clock In'),
        icon: Clock,
        onClick: handleClockToggle,
        variant: isClockedIn ? "destructive" : "default",
        testId: "button-clock-toggle",
      }}
      headerContent={statsContent}
      tabs={tabs}
      defaultTab="timeclock"
    />
  );
}
