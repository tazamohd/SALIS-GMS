import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Car, CheckCircle, Clock } from "lucide-react";
import { StandardPageLayout } from "@/components/layouts";

export default function LicensePlateRecognition() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const { data: scans = [], isLoading: loadingScans } = useQuery<any[]>({
    queryKey: ["/api/license-plate/scans"],
  });

  const { data: entryLogs = [], isLoading: loadingLogs } = useQuery<any[]>({
    queryKey: ["/api/license-plate/entry-logs"],
  });

  const recordScanMutation = useMutation({
    mutationFn: async (scanData: {
      plateNumber: string;
      confidence: number;
      scanType: string;
      vehicleId?: string;
      location?: string;
    }) => {
      return await apiRequest("POST", "/api/license-plate/scan", scanData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/license-plate/scans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/license-plate/entry-logs"] });
      toast({
        title: t('common.success', 'Success'),
        description: t('licensePlate.scanRecorded', 'License plate scan recorded successfully'),
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t('common.error', 'Error'),
        description: error.message || t('licensePlate.scanFailed', 'Failed to record scan'),
      });
    },
  });

  const stats = {
    todayScans: scans.length || 0,
    autoMatched: scans.filter((s: any) => s.matchedAutomatically).length || 0,
    manualReview: scans.filter((s: any) => !s.matchedAutomatically).length || 0,
    avgConfidence: scans.length > 0
      ? (scans.reduce((sum: number, s: any) => sum + (parseFloat(s.confidence) || 0), 0) / scans.length).toFixed(1)
      : 0,
  };

  const simulateScan = () => {
    const plateNumbers = ["ABC 1234", "XYZ 5678", "DEF 9012"];
    const randomPlate = plateNumbers[Math.floor(Math.random() * plateNumbers.length)];
    
    recordScanMutation.mutate({
      plateNumber: randomPlate,
      confidence: Math.random() * 20 + 80,
      scanType: Math.random() > 0.5 ? "entry" : "exit",
      location: "Main Entrance",
    });
  };

  return (
    <StandardPageLayout
      title={t('licensePlate.title', 'License Plate Recognition')}
      description={t('licensePlate.description', 'Automatic vehicle identification and entry tracking')}
      icon={Camera}
      actions={[
        {
          label: t('licensePlate.simulateScan', 'Simulate Scan'),
          onClick: simulateScan,
        },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('licensePlate.todaysScans', "Today's Scans")}</p>
                <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white" data-testid="stat-today-scans">{stats.todayScans}</h3>
              </div>
              <Camera className="h-12 w-12 text-[#0A5ED7]" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('licensePlate.autoMatched', 'Auto-Matched')}</p>
                <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white" data-testid="stat-auto-matched">{stats.autoMatched}</h3>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('licensePlate.manualReview', 'Manual Review')}</p>
                <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white" data-testid="stat-manual-review">{stats.manualReview}</h3>
              </div>
              <Clock className="h-12 w-12 text-[#F97316]" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('licensePlate.avgConfidence', 'Avg Confidence')}</p>
                <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white" data-testid="stat-avg-confidence">{stats.avgConfidence}%</h3>
              </div>
              <Car className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('licensePlate.recentPlateScans', 'Recent Plate Scans')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingScans ? (
            <div className="text-center py-8">
              <p className="text-[#64748B]">{t('licensePlate.loadingScans', 'Loading scans...')}</p>
            </div>
          ) : scans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#64748B]">{t('licensePlate.noScansYet', 'No license plate scans recorded yet. Scans will appear here automatically.')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scans.map((scan: any) => (
                <div key={scan.id} className="flex items-center justify-between p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg" data-testid={`scan-${scan.id}`}>
                  <div className="flex items-center gap-4">
                    <div className="bg-[#0A5ED7]/10 dark:bg-[#0A5ED7]/20 px-4 py-2 rounded font-mono font-bold text-[#0B1F3B] dark:text-white">
                      {scan.plateNumber}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#0B1F3B] dark:text-white">
                        {scan.vehicleMake && scan.vehicleModel 
                          ? `${scan.vehicleMake} ${scan.vehicleModel}` 
                          : t('licensePlate.unknownVehicle', 'Unknown Vehicle')}
                      </h3>
                      <p className="text-sm text-[#64748B]">
                        {scan.customerName || t('licensePlate.noMatchFound', 'No match found')} • {t('licensePlate.confidence', 'Confidence')}: {parseFloat(scan.confidence).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={scan.scanType === "entry" ? "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" : "bg-[#F8FAFC] dark:bg-[#232A36] text-[#64748B]"}>
                      {scan.scanType === "entry" ? t('licensePlate.entry', 'entry') : t('licensePlate.exit', 'exit')}
                    </Badge>
                    {scan.matchedAutomatically ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Button size="sm" variant="outline" className="border-[#E2E8F0] dark:border-[#232A36]">{t('licensePlate.matchManually', 'Match Manually')}</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('licensePlate.vehicleEntryLog', 'Vehicle Entry Log')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingLogs ? (
            <div className="text-center py-8">
              <p className="text-[#64748B]">{t('licensePlate.loadingEntryLogs', 'Loading entry logs...')}</p>
            </div>
          ) : entryLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#64748B]">{t('licensePlate.noEntryLogsYet', 'No entry logs recorded yet.')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entryLogs.map((log: any) => (
                <div key={log.id} className="flex items-center justify-between p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg" data-testid={`entry-log-${log.id}`}>
                  <div>
                    <h3 className="font-semibold text-[#0B1F3B] dark:text-white">
                      {log.vehicleMake && log.vehicleModel 
                        ? `${log.vehicleMake} ${log.vehicleModel} (${log.plateNumber})` 
                        : log.plateNumber}
                    </h3>
                    <p className="text-sm text-[#64748B]">{log.customerName || t('licensePlate.unknown', 'Unknown')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[#64748B]">
                      {t('licensePlate.entryTime', 'Entry')}: {log.entryTime ? new Date(log.entryTime).toLocaleTimeString() : ""}
                    </p>
                    {log.exitTime ? (
                      <>
                        <p className="text-sm text-[#64748B]">
                          {t('licensePlate.exitTime', 'Exit')}: {new Date(log.exitTime).toLocaleTimeString()}
                        </p>
                        <p className="text-sm font-semibold text-[#0B1F3B] dark:text-white">
                          {t('licensePlate.duration', 'Duration')}: {log.duration} {t('licensePlate.min', 'min')}
                        </p>
                      </>
                    ) : (
                      <Badge className="bg-[#F97316]/10 text-[#F97316]">{t('common.inProgress', 'In Progress')}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
}
