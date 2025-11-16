import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TabsPageLayout } from "@/components/layouts";
import { Activity, AlertTriangle, CheckCircle, Code, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function OBDDiagnosticViewer() {
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");

  const { data: vehicles = [] } = useQuery<any[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: diagnosticData } = useQuery({
    queryKey: ["/api/diagnostics/obd", selectedVehicle],
    enabled: !!selectedVehicle,
  });

  const tabs = [
    {
      id: "live",
      label: "Live Data",
      icon: Activity,
      content: (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time OBD-II Parameters</CardTitle>
              <CardDescription>Live sensor readings from vehicle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-sm text-muted-foreground">Engine RPM</p>
                  <p className="text-2xl font-bold">2,450</p>
                  <p className="text-xs text-muted-foreground">Normal range</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-sm text-muted-foreground">Speed</p>
                  <p className="text-2xl font-bold">45 mph</p>
                  <p className="text-xs text-muted-foreground">Current speed</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-sm text-muted-foreground">Coolant Temp</p>
                  <p className="text-2xl font-bold">92°C</p>
                  <p className="text-xs text-muted-foreground">Normal</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-sm text-muted-foreground">Fuel Level</p>
                  <p className="text-2xl font-bold">68%</p>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-sm text-muted-foreground">MAF Sensor</p>
                  <p className="text-2xl font-bold">5.2 g/s</p>
                  <p className="text-xs text-muted-foreground">Air flow</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-sm text-muted-foreground">Throttle Pos</p>
                  <p className="text-2xl font-bold">24%</p>
                  <p className="text-xs text-muted-foreground">Position</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "codes",
      label: "Diagnostic Codes",
      icon: Code,
      badge: 2,
      content: (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Diagnostic Trouble Codes (DTCs)</CardTitle>
              <CardDescription>Current error codes from vehicle ECU</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-900/10 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="destructive">P0420</Badge>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <p className="font-medium">Catalyst System Efficiency Below Threshold</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Bank 1 - The catalytic converter is not operating efficiently
                      </p>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                </div>
                <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-yellow-500">P0171</Badge>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <p className="font-medium">System Too Lean (Bank 1)</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Fuel trim correction indicates lean air/fuel mixture
                      </p>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "freeze",
      label: "Freeze Frame",
      icon: FileText,
      content: (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Freeze Frame Data</CardTitle>
              <CardDescription>Snapshot of sensor values when DTC was set</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-sm font-medium mb-3">Freeze Frame for P0420</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Engine RPM:</span>
                      <span className="ml-2 font-medium">2,850</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Speed:</span>
                      <span className="ml-2 font-medium">62 mph</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Coolant Temp:</span>
                      <span className="ml-2 font-medium">95°C</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Load:</span>
                      <span className="ml-2 font-medium">45%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fuel Status:</span>
                      <span className="ml-2 font-medium">Closed Loop</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">O2 Sensor:</span>
                      <span className="ml-2 font-medium">0.85V</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "history",
      label: "History",
      icon: CheckCircle,
      content: (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic History</CardTitle>
              <CardDescription>Past diagnostic scans and cleared codes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Scan performed on Nov 10, 2025</p>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Cleared
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Codes found: P0420, P0171</p>
                  <p className="text-sm text-muted-foreground">Action: Replaced catalytic converter</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Scan performed on Oct 15, 2025</p>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      No Issues
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">No diagnostic codes found</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <TabsPageLayout
      title="OBD Diagnostic Viewer"
      description="View and analyze OBD-II diagnostic data from vehicles"
      icon={Activity}
      tabs={tabs}
      headerContent={
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">Select Vehicle</p>
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger data-testid="select-vehicle">
                    <SelectValue placeholder="Choose a vehicle..." />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle: any) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button disabled={!selectedVehicle} data-testid="button-scan">
                <Activity className="mr-2 h-4 w-4" />
                Start Scan
              </Button>
            </div>
          </CardContent>
        </Card>
      }
    />
  );
}
