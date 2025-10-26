import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scan, Package, Wrench, Car } from "lucide-react";

export default function BarcodeScanner() {
  const [scanning, setScanning] = useState(false);

  const mockScans = [
    { id: "1", type: "part_inventory", barcodeData: "PN-12345", itemName: "Oil Filter", location: "Warehouse", scannedBy: "Mike Davis", timestamp: "2024-10-26T10:30:00Z" },
    { id: "2", type: "vehicle_checkin", barcodeData: "VIN-ABC123", itemName: "2020 Honda Civic", location: "Service Bay 1", scannedBy: "Emily Brown", timestamp: "2024-10-26T09:15:00Z" },
    { id: "3", type: "tool_tracking", barcodeData: "TOOL-789", itemName: "Torque Wrench", location: "Bay 2", scannedBy: "John Smith", timestamp: "2024-10-26T08:45:00Z" },
  ];

  const stats = { todayScans: 45, partsScanned: 28, vehicleCheckIns: 12, toolsTracked: 5 };

  const getTypeIcon = (type: string) => {
    if (type === "part_inventory") return <Package className="h-5 w-5 text-blue-600" />;
    if (type === "vehicle_checkin") return <Car className="h-5 w-5 text-green-600" />;
    return <Wrench className="h-5 w-5 text-purple-600" />;
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
          onClick={() => setScanning(!scanning)}
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
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.todayScans}</h3>
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
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.partsScanned}</h3>
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
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.vehicleCheckIns}</h3>
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
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.toolsTracked}</h3>
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
          <div className="space-y-3">
            {mockScans.map((scan) => (
              <div key={scan.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg" data-testid={`scan-${scan.id}`}>
                <div className="flex items-center gap-3">
                  {getTypeIcon(scan.type)}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{scan.itemName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {scan.barcodeData} • {scan.location}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{scan.scannedBy}</p>
                  <p className="text-xs text-gray-500">{new Date(scan.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
