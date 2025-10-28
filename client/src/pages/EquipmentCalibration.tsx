import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Wrench, AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function EquipmentCalibration() {
  const { toast } = useToast();

  // Fetch calibration records from backend
  const { data: records = [] } = useQuery<any[]>({
    queryKey: ['/api/calibration/due'],
  });

  // Add calibration mutation
  const addCalibrationMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/calibration', {
        equipmentId: 'sample-equipment-id',
        equipmentName: 'Sample Equipment',
        calibrationDate: new Date().toISOString(),
        nextDueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        certificationNumber: `CAL-${Date.now()}`,
        calibratedBy: 'Technician',
        notes: 'Standard calibration performed',
      });
    },
    onSuccess: () => {
      toast({
        title: "Calibration Added",
        description: "Calibration record has been added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/calibration/due'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add",
        description: error.message || "Failed to add calibration record",
        variant: "destructive",
      });
    },
  });

  // Calculate statistics from records
  const stats = {
    totalEquipment: records.length,
    valid: records.filter((r: any) => r.status === 'valid').length,
    due: records.filter((r: any) => r.status === 'due').length,
    overdue: records.filter((r: any) => r.status === 'overdue').length,
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
        <Button 
          onClick={() => addCalibrationMutation.mutate()}
          disabled={addCalibrationMutation.isPending}
          data-testid="button-add-calibration"
        >
          {addCalibrationMutation.isPending ? "Adding..." : "Add Calibration"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Equipment</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-total-equipment">{stats.totalEquipment}</h3>
              </div>
              <Wrench className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Valid</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-valid">{stats.valid}</h3>
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
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-due">{stats.due}</h3>
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
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-overdue">{stats.overdue}</h3>
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
          {records.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No calibration records available. Click "Add Calibration" to create a new record.
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((record: any) => (
                <div key={record.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg" data-testid={`calibration-${record.id}`}>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{record.toolName || `#${record.toolNumber}`}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {record.calibrationType || 'Standard Calibration'}
                    </p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Due: {record.nextCalibrationDue ? new Date(record.nextCalibrationDue).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  {getStatusBadge(record.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
