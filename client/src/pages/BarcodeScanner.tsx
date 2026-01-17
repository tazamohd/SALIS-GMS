import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StandardPageLayout } from "@/components/layouts/StandardPageLayout";
import { Scan, Package, Wrench, Car } from "lucide-react";

export default function BarcodeScanner() {
  const { t } = useTranslation();
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();

  const { data: scans = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/barcode/scans"],
  });

  const recordScanMutation = useMutation({
    mutationFn: async (scanData: {
      barcodeData: string;
      scanType: string;
      itemType?: string;
      itemId?: string;
      location?: string;
    }) => {
      return await apiRequest("POST", "/api/barcode/scan", scanData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/barcode/scans"] });
      toast({
        title: t('common.success', 'Success'),
        description: t('inventory.barcodeScanRecorded', 'Barcode scan recorded successfully'),
      });
      setScanning(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t('common.error', 'Error'),
        description: error.message || t('inventory.failedToRecordBarcodeScan', 'Failed to record barcode scan'),
      });
    },
  });

  const stats = {
    todayScans: scans.length || 0,
    partsScanned: scans.filter((s: any) => s.scanType === "part_inventory").length || 0,
    vehicleCheckIns: scans.filter((s: any) => s.scanType === "vehicle_checkin").length || 0,
    toolsTracked: scans.filter((s: any) => s.scanType === "tool_tracking").length || 0,
  };

  const getTypeIcon = (type: string) => {
    if (type === "part_inventory") return <Package className="h-5 w-5 text-[#0A5ED7]" />;
    if (type === "vehicle_checkin") return <Car className="h-5 w-5 text-[#0BB3FF]" />;
    return <Wrench className="h-5 w-5 text-[#64748B]" />;
  };

  const getItemName = (scan: any) => {
    if (scan.partName) return scan.partName;
    if (scan.vehiclePlate) return scan.vehiclePlate;
    if (scan.toolName) return scan.toolName;
    return scan.barcodeData;
  };

  const simulateScan = () => {
    const scanTypes = ["part_inventory", "vehicle_checkin", "tool_tracking"];
    const randomType = scanTypes[Math.floor(Math.random() * scanTypes.length)];
    
    recordScanMutation.mutate({
      barcodeData: `SCAN-${Date.now()}`,
      scanType: randomType,
      location: "Main Warehouse",
    });
  };

  return (
    <StandardPageLayout
      title={t('inventory.barcodeQrScanner', '📱 Barcode & QR Scanner')}
      description={t('inventory.scanPartsVehiclesTools', 'Scan parts, vehicles, and tools')}
      icon={Scan}
      actions={[
        {
          label: scanning ? t('inventory.stopScanner', 'Stop Scanner') : t('inventory.startScanner', 'Start Scanner'),
          onClick: () => {
            if (scanning) {
              setScanning(false);
            } else {
              setScanning(true);
              simulateScan();
            }
          },
          icon: Scan,
          variant: scanning ? "destructive" : "default",
        },
      ]}
    >
      <div className="space-y-6 bg-[#F8FAFC] dark:bg-[#0E1117] p-6 rounded-lg">

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('inventory.todaysScans', "Today's Scans")}</p>
                <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white" data-testid="stat-today-scans">{stats.todayScans}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] flex items-center justify-center">
                <Scan className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('inventory.partsScanned', 'Parts Scanned')}</p>
                <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white" data-testid="stat-parts-scanned">{stats.partsScanned}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('inventory.vehicleCheckIns', 'Vehicle Check-Ins')}</p>
                <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white" data-testid="stat-vehicle-checkins">{stats.vehicleCheckIns}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] flex items-center justify-center">
                <Car className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('inventory.toolsTracked', 'Tools Tracked')}</p>
                <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white" data-testid="stat-tools-tracked">{stats.toolsTracked}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] flex items-center justify-center">
                <Wrench className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {scanning && (
        <Card className="bg-gradient-to-r from-[#0A5ED7]/10 to-[#0BB3FF]/10 dark:from-[#0A5ED7]/20 dark:to-[#0BB3FF]/20 border-[#0A5ED7] dark:border-[#0BB3FF]">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="h-24 w-24 rounded-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] flex items-center justify-center animate-pulse">
                <Scan className="h-12 w-12 text-white" />
              </div>
              <p className="text-lg font-semibold text-[#0B1F3B] dark:text-white">{t('inventory.scannerActive', 'Scanner Active')}</p>
              <p className="text-sm text-[#64748B]">{t('inventory.pointCameraAtBarcode', 'Point camera at barcode or QR code')}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('inventory.recentScans', 'Recent Scans')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-[#64748B]">{t('inventory.loadingScanHistory', 'Loading scan history...')}</p>
            </div>
          ) : scans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#64748B]">{t('inventory.noScansRecorded', 'No scans recorded yet. Start scanning to see results here.')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scans.map((scan: any) => (
                <div key={scan.id} className="flex items-center justify-between p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]" data-testid={`scan-${scan.id}`}>
                  <div className="flex items-center gap-3">
                    {getTypeIcon(scan.scanType)}
                    <div>
                      <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{getItemName(scan)}</h3>
                      <p className="text-sm text-[#64748B]">
                        {scan.barcodeData} • {scan.location || t('inventory.unknownLocation', 'Unknown location')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[#64748B]">{scan.scannedBy || t('common.unknown', 'Unknown')}</p>
                    <p className="text-xs text-[#64748B]">
                      {scan.createdAt ? new Date(scan.createdAt).toLocaleTimeString() : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </StandardPageLayout>
  );
}
