import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Cpu, Activity, FileText, Wifi, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ObdDevice, DeviceAssignment, ObdSession, DiagnosticReport } from "@shared/schema";

export default function DiagnosticsOBDHub() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("devices");
  const [showDeviceDialog, setShowDeviceDialog] = useState(false);
  const [showSessionDialog, setShowSessionDialog] = useState(false);

  const { data: devices = [] } = useQuery<ObdDevice[]>({ queryKey: ["/api/obd-devices"] });
  const { data: assignments = [] } = useQuery<DeviceAssignment[]>({ queryKey: ["/api/device-assignments"] });
  const { data: sessions = [] } = useQuery<ObdSession[]>({ queryKey: ["/api/obd-sessions"] });
  const { data: reports = [] } = useQuery<DiagnosticReport[]>({ queryKey: ["/api/diagnostic-reports"] });

  const deviceForm = useForm<any>({ defaultValues: { deviceSerial: "", manufacturer: "Bosch", model: "", firmwareVersion: "", isActive: true } });
  const sessionForm = useForm<any>({ defaultValues: { deviceId: "", vehicleId: "", status: "active" } });

  const createDeviceMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/obd-devices", "POST", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/obd-devices"] }); setShowDeviceDialog(false); toast({ title: "Device registered" }); },
  });

  const createSessionMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/obd-sessions", "POST", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/obd-sessions"] }); setShowSessionDialog(false); toast({ title: "Session started" }); },
  });

  const getManufacturerBadge = (manufacturer: string) => {
    const manufacturers: { [key: string]: { bg: string; text: string; icon: string } } = {
      Bosch: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: '🔵' },
      Launch: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', icon: '🟠' },
      Autel: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: '🔴' },
    };
    const config = manufacturers[manufacturer] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', icon: '○' };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span>{config.icon}</span>
        {manufacturer}
      </span>
    );
  };

  const getSessionStatusBadge = (status: string) => {
    const statusColors: { [key: string]: { bg: string; text: string; icon: string } } = {
      active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: '🟢' },
      completed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: '✅' },
      error: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: '❌' },
    };
    const config = statusColors[status] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', icon: '○' };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span>{config.icon}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const severityColors: { [key: string]: { bg: string; text: string; icon: string } } = {
      critical: { bg: 'bg-red-500 dark:bg-red-600', text: 'text-white', icon: '🔥' },
      warning: { bg: 'bg-yellow-500 dark:bg-yellow-600', text: 'text-white', icon: '⚠️' },
      info: { bg: 'bg-blue-500 dark:bg-blue-600', text: 'text-white', icon: 'ℹ️' },
    };
    const config = severityColors[severity] || { bg: 'bg-gray-500', text: 'text-white', icon: '○' };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span>{config.icon}</span>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  return (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-salis-black min-h-screen">
      <div className="mb-6">
        <h1 className="font-montserrat font-semibold text-2xl text-gray-900 dark:text-white" data-testid="text-page-title">Diagnostics & OBD Hub</h1>
        <p className="font-poppins text-sm text-gray-600 dark:text-gray-400 mt-1" data-testid="text-page-description">
          Manage OBD diagnostic devices, real-time vehicle monitoring, and diagnostic reports
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white dark:bg-salis-black/50 border border-gray-200 dark:border-salis-gray-dark" data-testid="tabs-navigation">
          <TabsTrigger value="devices" data-testid="tab-devices" className="gap-2">
            <Cpu className="h-4 w-4" />
            OBD Devices
          </TabsTrigger>
          <TabsTrigger value="sessions" data-testid="tab-sessions" className="gap-2">
            <Activity className="h-4 w-4" />
            Live Sessions
          </TabsTrigger>
          <TabsTrigger value="reports" data-testid="tab-reports" className="gap-2">
            <FileText className="h-4 w-4" />
            Diagnostic Reports
          </TabsTrigger>
          <TabsTrigger value="assignments" data-testid="tab-assignments" className="gap-2">
            <Wifi className="h-4 w-4" />
            Device Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">OBD Devices</h2>
            <Button onClick={() => { deviceForm.reset(); setShowDeviceDialog(true); }} data-testid="button-add-device">
              <Plus className="h-4 w-4 mr-2" />
              Register Device
            </Button>
          </div>

          <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serial #</TableHead>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Firmware</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-mono font-semibold">{device.deviceSerial}</TableCell>
                      <TableCell>{getManufacturerBadge(device.manufacturer)}</TableCell>
                      <TableCell>{device.model}</TableCell>
                      <TableCell className="font-mono text-xs">{device.firmwareVersion}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${device.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                          {device.isActive ? '🟢 Online' : '○ Offline'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">Active Diagnostic Sessions</h2>
            <Button onClick={() => { sessionForm.reset(); setShowSessionDialog(true); }} data-testid="button-start-session">
              <Plus className="h-4 w-4 mr-2" />
              Start Session
            </Button>
          </div>

          <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session ID</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Started</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-mono text-xs">{session.id.substring(0, 8)}</TableCell>
                      <TableCell>{devices.find(d => d.id === session.deviceId)?.deviceSerial || 'N/A'}</TableCell>
                      <TableCell>{getSessionStatusBadge(session.status)}</TableCell>
                      <TableCell>{new Date(session.startedAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">Diagnostic Reports</h2>
          </div>

          <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report ID</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>DTC Codes</TableHead>
                    <TableHead>Generated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-mono text-xs">{report.id.substring(0, 8)}</TableCell>
                      <TableCell className="font-mono text-xs">{report.sessionId.substring(0, 8)}</TableCell>
                      <TableCell>{getSeverityBadge(report.severity)}</TableCell>
                      <TableCell className="font-mono text-xs">{Array.isArray(report.dtcCodes) ? report.dtcCodes.join(', ') : 'None'}</TableCell>
                      <TableCell>{new Date(report.generatedAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">Device Assignments</h2>
          </div>

          <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>{devices.find(d => d.id === assignment.deviceId)?.deviceSerial || 'N/A'}</TableCell>
                      <TableCell>{assignment.branchId}</TableCell>
                      <TableCell>{new Date(assignment.assignedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${assignment.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                          {assignment.isActive ? '✅ Active' : '○ Inactive'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Device Dialog */}
      <Dialog open={showDeviceDialog} onOpenChange={setShowDeviceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register OBD Device</DialogTitle>
          </DialogHeader>
          <Form {...deviceForm}>
            <form onSubmit={deviceForm.handleSubmit((data) => createDeviceMutation.mutate(data))} className="space-y-4">
              <FormField control={deviceForm.control} name="deviceSerial" render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Serial Number</FormLabel>
                  <FormControl><Input {...field} placeholder="BSH-2024-001" /></FormControl>
                </FormItem>
              )} />
              <FormField control={deviceForm.control} name="manufacturer" render={({ field }) => (
                <FormItem>
                  <FormLabel>Manufacturer</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Bosch">Bosch</SelectItem>
                      <SelectItem value="Launch">Launch</SelectItem>
                      <SelectItem value="Autel">Autel</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={deviceForm.control} name="model" render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl><Input {...field} placeholder="KTS 590" /></FormControl>
                </FormItem>
              )} />
              <FormField control={deviceForm.control} name="firmwareVersion" render={({ field }) => (
                <FormItem>
                  <FormLabel>Firmware Version</FormLabel>
                  <FormControl><Input {...field} placeholder="v2.5.1" /></FormControl>
                </FormItem>
              )} />
              <FormField control={deviceForm.control} name="isActive" render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Active</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={createDeviceMutation.isPending}>
                {createDeviceMutation.isPending ? "Registering..." : "Register Device"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
