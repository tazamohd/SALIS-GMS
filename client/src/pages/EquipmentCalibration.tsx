import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tool, AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function EquipmentCalibration() {
  const mockRecords = [
    { id: "1", toolName: "Torque Wrench #1", calibrationType: "Torque Accuracy", lastCalibration: "2024-09-15", nextDue: "2024-12-15", status: "valid", certNumber: "CAL-2024-001" },
    { id: "2", toolName: "Alignment Machine", calibrationType: "4-Wheel Alignment", lastCalibration: "2024-08-20", nextDue: "2024-11-20", status: "due", certNumber: "CAL-2024-002" },
    { id: "3", toolName: "Diagnostic Scanner", calibrationType: "OBD-II Compliance", lastCalibration: "2024-06-10", nextDue: "2024-10-15", status: "overdue", certNumber: "CAL-2024-003" },
  ];

  const stats = {
    totalEquipment: 24,
    valid: 18,
    due: 3,
    overdue: 3,
  };

  const getStatusBadge = (status: string) => {
    const config = {
      valid: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      due: { variant: "secondary" as const, icon: Clock, color: "text-yellow-600" },
      overdue: { variant: "destructive" as const, icon: AlertCircle, color: "text-red-600" },
    };
    const { variant, icon: Icon, color } = config[status as keyof typeof config] || config.valid;
    return (
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <Badge variant={variant}>{status}</Badge>
      </div>
    );
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white">
            🔧 Equipment Calibration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track tool calibration and certifications</p>
        </div>
        <Button data-testid="button-add-calibration">Add Calibration</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Equipment</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.totalEquipment}</h3>
              </div>
              <Tool className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Valid</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.valid}</h3>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Due Soon</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.due}</h3>
              </div>
              <Clock className="h-12 w-12 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.overdue}</h3>
              </div>
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Calibration Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg" data-testid={`calibration-${record.id}`}>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{record.toolName}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{record.calibrationType} • Cert: {record.certNumber}</p>
                </div>
                <div className="text-right mr-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last: {new Date(record.lastCalibration).toLocaleDateString()}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Due: {new Date(record.nextDue).toLocaleDateString()}</p>
                </div>
                {getStatusBadge(record.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
