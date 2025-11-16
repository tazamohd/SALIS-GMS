import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TabsPageLayout, TabConfig } from "@/components/layouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Clock, DollarSign, Users } from "lucide-react";

export default function TimeClockPayroll() {
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
      toast({ title: "Clocked In", description: "You have successfully clocked in" });
    },
    onError: (error: any) => {
      toast({ title: "Clock In Failed", description: error.message || "Failed to clock in", variant: "destructive" });
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
      toast({ title: "Clocked Out", description: "You have successfully clocked out" });
    },
    onError: (error: any) => {
      toast({ title: "Clock Out Failed", description: error.message || "Failed to clock out", variant: "destructive" });
    },
  });

  const calculatePayrollMutation = useMutation({
    mutationFn: async (periodId: string) => {
      return apiRequest(`/api/payroll/calculate/${periodId}`, "POST", {});
    },
    onSuccess: () => {
      toast({ title: "Payroll Calculated", description: "Payroll has been calculated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/periods'] });
    },
    onError: (error: any) => {
      toast({ title: "Calculation Failed", description: error.message || "Failed to calculate payroll", variant: "destructive" });
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
        { label: "Period Gross", value: `$${(currentPeriod.totalGrossPay || 0).toLocaleString()}`, icon: DollarSign, color: "green", testId: "text-period-gross" },
        { label: "Deductions", value: `$${(currentPeriod.totalDeductions || 0).toLocaleString()}`, icon: DollarSign, color: "red", testId: "text-deductions" },
        { label: "Net Pay", value: `$${(currentPeriod.totalNetPay || 0).toLocaleString()}`, icon: DollarSign, color: "blue", testId: "text-net-pay" },
        { label: "Employees", value: "12", icon: Users, color: "purple", testId: "text-employees" },
      ].map((stat, i) => (
        <Card key={i} className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid={stat.testId}>{stat.value}</h3>
              </div>
              <stat.icon className={`h-12 w-12 text-${stat.color}-600`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const timeclockContent = (
    <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
      <CardHeader><CardTitle>Recent Time Entries</CardTitle></CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          No time entries available. Clock in to start tracking time.
        </div>
      </CardContent>
    </Card>
  );

  const payrollContent = (
    <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Current Pay Period</CardTitle>
          <Button 
            variant="outline" 
            onClick={() => currentPeriod.id && calculatePayrollMutation.mutate(currentPeriod.id)}
            disabled={calculatePayrollMutation.isPending || !currentPeriod.id}
            data-testid="button-calculate-payroll"
          >
            {calculatePayrollMutation.isPending ? "Calculating..." : "Calculate Payroll"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {periods.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No payroll periods available</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Period</p>
                <p className="font-semibold text-gray-900 dark:text-white" data-testid="text-period-range">
                  {new Date(currentPeriod.periodStart).toLocaleDateString()} - {new Date(currentPeriod.periodEnd).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <Badge data-testid="badge-period-status">{currentPeriod.status}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between p-2">
                <span className="text-gray-600 dark:text-gray-400">Total Gross Pay</span>
                <span className="font-semibold text-gray-900 dark:text-white" data-testid="text-gross-detail">${(currentPeriod.totalGrossPay || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2">
                <span className="text-gray-600 dark:text-gray-400">Total Deductions</span>
                <span className="font-semibold text-red-600" data-testid="text-deductions-detail">-${(currentPeriod.totalDeductions || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-3 bg-blue-50 dark:bg-blue-900 rounded font-semibold">
                <span className="text-gray-900 dark:text-white">Total Net Pay</span>
                <span className="text-gray-900 dark:text-white" data-testid="text-net-detail">${(currentPeriod.totalNetPay || 0).toLocaleString()}</span>
              </div>
            </div>
            <Button className="w-full" data-testid="button-process-payroll">Process Payroll</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const tabs: TabConfig[] = [
    {
      id: "timeclock",
      label: "Time Entries",
      icon: Clock,
      content: timeclockContent,
    },
    {
      id: "payroll",
      label: "Payroll",
      icon: DollarSign,
      content: payrollContent,
    },
  ];

  return (
    <TabsPageLayout
      title="Time Clock & Payroll"
      description="Track time and manage payroll"
      icon={Clock}
      primaryAction={{
        label: isClockedIn ? "Clock Out" : "Clock In",
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
