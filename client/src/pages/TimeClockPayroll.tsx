import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, DollarSign, Users, Calendar } from "lucide-react";

export default function TimeClockPayroll() {
  const [isClockedIn, setIsClockedIn] = useState(false);

  const mockTimeEntries = [
    { id: "1", employee: "Mike Davis", date: "2024-10-26", clockIn: "08:00", clockOut: "17:00", totalHours: 8.5, overtime: 0.5, status: "approved" },
    { id: "2", employee: "Emily Brown", date: "2024-10-26", clockIn: "08:30", clockOut: "17:30", totalHours: 8.5, overtime: 0.5, status: "pending" },
  ];

  const mockPayrollPeriod = {
    periodStart: "2024-10-14",
    periodEnd: "2024-10-27",
    totalGrossPay: 18500,
    totalDeductions: 3200,
    totalNetPay: 15300,
    status: "draft",
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white">
            ⏰ Time Clock & Payroll
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track time and manage payroll</p>
        </div>
        <Button
          size="lg"
          variant={isClockedIn ? "destructive" : "default"}
          onClick={() => setIsClockedIn(!isClockedIn)}
          data-testid="button-clock-toggle"
        >
          <Clock className="h-5 w-5 mr-2" />
          {isClockedIn ? "Clock Out" : "Clock In"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Period Gross", value: `$${mockPayrollPeriod.totalGrossPay.toLocaleString()}`, icon: DollarSign, color: "green" },
          { label: "Deductions", value: `$${mockPayrollPeriod.totalDeductions.toLocaleString()}`, icon: DollarSign, color: "red" },
          { label: "Net Pay", value: `$${mockPayrollPeriod.totalNetPay.toLocaleString()}`, icon: DollarSign, color: "blue" },
          { label: "Employees", value: "12", icon: Users, color: "purple" },
        ].map((stat, i) => (
          <Card key={i} className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stat.value}</h3>
                </div>
                <stat.icon className={`h-12 w-12 text-${stat.color}-600`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="timeclock" className="space-y-4">
        <TabsList className="bg-gray-100 dark:bg-salis-gray-dark">
          <TabsTrigger value="timeclock">Time Entries</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>

        <TabsContent value="timeclock">
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Recent Time Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockTimeEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{entry.employee}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{entry.date} • {entry.clockIn} - {entry.clockOut}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">{entry.totalHours}h {entry.overtime > 0 && `(+${entry.overtime}h OT)`}</p>
                      <Badge variant={entry.status === "approved" ? "default" : "secondary"}>{entry.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll">
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current Pay Period</CardTitle>
                <Button variant="outline" data-testid="button-calculate-payroll">Calculate Payroll</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Period</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {new Date(mockPayrollPeriod.periodStart).toLocaleDateString()} - {new Date(mockPayrollPeriod.periodEnd).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <Badge>{mockPayrollPeriod.status}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between p-2">
                    <span className="text-gray-600 dark:text-gray-400">Total Gross Pay</span>
                    <span className="font-semibold text-gray-900 dark:text-white">${mockPayrollPeriod.totalGrossPay.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-2">
                    <span className="text-gray-600 dark:text-gray-400">Total Deductions</span>
                    <span className="font-semibold text-red-600">-${mockPayrollPeriod.totalDeductions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-blue-50 dark:bg-blue-900 rounded font-semibold">
                    <span className="text-gray-900 dark:text-white">Total Net Pay</span>
                    <span className="text-gray-900 dark:text-white">${mockPayrollPeriod.totalNetPay.toLocaleString()}</span>
                  </div>
                </div>
                <Button className="w-full" data-testid="button-process-payroll">Process Payroll</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
