import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Car, CheckCircle, Clock } from "lucide-react";

export default function LicensePlateRecognition() {
  const mockScans = [
    { id: "1", plateNumber: "ABC 1234", vehicle: "2020 Honda Civic", customer: "John Smith", confidence: 98.5, scanType: "entry", timestamp: "2024-10-26T09:00:00Z", matched: true },
    { id: "2", plateNumber: "XYZ 5678", vehicle: "2019 Toyota Camry", customer: "Sarah Johnson", confidence: 95.2, scanType: "exit", timestamp: "2024-10-26T10:30:00Z", matched: true },
    { id: "3", plateNumber: "DEF 9012", vehicle: "Unknown", customer: null, confidence: 87.3, scanType: "entry", timestamp: "2024-10-26T11:15:00Z", matched: false },
  ];

  const mockEntryLogs = [
    { id: "1", vehicle: "2020 Honda Civic", plate: "ABC 1234", customer: "John Smith", entry: "2024-10-26T09:00:00Z", exit: "2024-10-26T15:30:00Z", duration: 390 },
    { id: "2", vehicle: "2019 Toyota Camry", plate: "XYZ 5678", customer: "Sarah Johnson", entry: "2024-10-26T10:30:00Z", exit: null, duration: null },
  ];

  const stats = { todayScans: 45, autoMatched: 38, manualReview: 7, avgConfidence: 94.2 };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white">
            🚗 License Plate Recognition
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Automatic vehicle identification and entry tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Today's Scans</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.todayScans}</h3>
              </div>
              <Camera className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Auto-Matched</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.autoMatched}</h3>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manual Review</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.manualReview}</h3>
              </div>
              <Clock className="h-12 w-12 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Confidence</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.avgConfidence}%</h3>
              </div>
              <Car className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Recent Plate Scans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockScans.map((scan) => (
              <div key={scan.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg" data-testid={`scan-${scan.id}`}>
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded font-mono font-bold text-gray-900 dark:text-white">
                    {scan.plateNumber}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {scan.vehicle !== "Unknown" ? scan.vehicle : "Unknown Vehicle"}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {scan.customer || "No match found"} • Confidence: {scan.confidence}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={scan.scanType === "entry" ? "default" : "secondary"}>
                    {scan.scanType}
                  </Badge>
                  {scan.matched ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Button size="sm" variant="outline">Match Manually</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Vehicle Entry Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockEntryLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{log.vehicle} ({log.plate})</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{log.customer}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Entry: {new Date(log.entry).toLocaleTimeString()}
                  </p>
                  {log.exit ? (
                    <>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Exit: {new Date(log.exit).toLocaleTimeString()}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Duration: {log.duration} min
                      </p>
                    </>
                  ) : (
                    <Badge variant="secondary">In Progress</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
