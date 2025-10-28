import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scan, Package, Wrench, Car } from "lucide-react";

export default function BarcodeScanner() {
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();

  // Fetch barcode scan history
  const { data: scans = [], isLoading } = useQuery({
    queryKey: ["/api/barcode/scans"],
  });

  // Record barcode scan mutation
  const recordScanMutation = useMutation({
    mutationFn: async (scanData: {
      barcodeData: string;
      scanType: string;
      itemType?: string;
      itemId?: string;
      location?: string;
    }) => {
      return await apiRequest("/api/barcode/scan", {
        method: "POST",
        body: JSON.stringify(scanData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/barcode/scans"] });
      toast({
        title: "Success",
        description: "Barcode scan recorded successfully",
      });
      setScanning(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to record barcode scan",
      });
    },
  });

  // Calculate KPIs from real data
  const stats = {
    todayScans: scans.length || 0,
    partsScanned: scans.filter((s: any) => s.scanType === "part_inventory").length || 0,
    vehicleCheckIns: scans.filter((s: any) => s.scanType === "vehicle_checkin").length || 0,
    toolsTracked: scans.filter((s: any) => s.scanType === "tool_tracking").length || 0,
  };

  const getTypeIcon = (type: string) => {
    if (type === "part_inventory") return <Package className="h-5 w-5 text-blue-600" />;
    if (type === "vehicle_checkin") return <Car className="h-5 w-5 text-green-600" />;
    return <Wrench className="h-5 w-5 text-purple-600" />;
  };

  const getItemName = (scan: any) => {
    if (scan.partName) return scan.partName;
    if (scan.vehiclePlate) return scan.vehiclePlate;
    if (scan.toolName) return scan.toolName;
    return scan.barcodeData;
  };

  // Simulate scan for testing (in real implementation, this would use camera/scanner hardware)
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
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white">
            📱 Barcode & QR Scanner
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Scan parts, vehicles, and tools</p>
        </div>
        <Button
          size="lg"
          variant={scanning ? "destructive" : "default"}
          onClick={() => {
            if (scanning) {
              setScanning(false);
            } else {
              setScanning(true);
              simulateScan();
            }
          }}
          disabled={recordScanMutation.isPending}
          data-testid="button-toggle-scanner"
        >
          <Scan className="h-5 w-5 mr-2" />
          {scanning ? "Stop Scanner" : "Start Scanner"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Today's Scans</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="stat-today-scans">{stats.todayScans}</h3>
              </div>
              <Scan className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Parts Scanned</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="stat-parts-scanned">{stats.partsScanned}</h3>
              </div>
              <Package className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Vehicle Check-Ins</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="stat-vehicle-checkins">{stats.vehicleCheckIns}</h3>
              </div>
              <Car className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tools Tracked</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="stat-tools-tracked">{stats.toolsTracked}</h3>
              </div>
              <Wrench className="h-12 w-12 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {scanning && (
        <Card className="bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <Scan className="h-24 w-24 text-blue-600 animate-pulse" />
              <p className="text-lg font-semibold text-gray-900 dark:text-white">Scanner Active</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Point camera at barcode or QR code</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">Loading scan history...</p>
            </div>
          ) : scans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No scans recorded yet. Start scanning to see results here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scans.map((scan: any) => (
                <div key={scan.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg" data-testid={`scan-${scan.id}`}>
                  <div className="flex items-center gap-3">
                    {getTypeIcon(scan.scanType)}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{getItemName(scan)}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {scan.barcodeData} • {scan.location || "Unknown location"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{scan.scannedBy || "Unknown"}</p>
                    <p className="text-xs text-gray-500">
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
  );
}
