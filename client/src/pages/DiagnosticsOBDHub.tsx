import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Cpu, Activity, FileText, Wifi, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ObdDevice, DeviceAssignment, ObdSession, DiagnosticReport, InsertObdDevice, InsertObdSession } from "@shared/schema";
import { insertObdDeviceSchema, insertObdSessionSchema } from "@shared/schema";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";

export default function DiagnosticsOBDHub() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showDeviceDialog, setShowDeviceDialog] = useState(false);
  const [showSessionDialog, setShowSessionDialog] = useState(false);

  const { data: devices = [] } = useQuery<ObdDevice[]>({ queryKey: ["/api/obd-devices"] });
  const { data: assignments = [] } = useQuery<DeviceAssignment[]>({ queryKey: ["/api/device-assignments"] });
  const { data: sessions = [] } = useQuery<ObdSession[]>({ queryKey: ["/api/obd-sessions"] });
  const { data: reports = [] } = useQuery<DiagnosticReport[]>({ queryKey: ["/api/diagnostic-reports"] });

  const deviceForm = useForm<InsertObdDevice>({ 
    resolver: zodResolver(insertObdDeviceSchema),
    defaultValues: { deviceId: "", deviceName: "", manufacturer: "", model: "", firmwareVersion: "" } 
  });
  const sessionForm = useForm<InsertObdSession>({ 
    resolver: zodResolver(insertObdSessionSchema),
    defaultValues: { deviceId: "", sessionId: "", vehicleId: "", status: "active" } 
  });

  const createDeviceMutation = useMutation({
    mutationFn: (data: InsertObdDevice) => apiRequest("/api/obd-devices", "POST", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/obd-devices"] }); setShowDeviceDialog(false); toast({ title: t('diagnosticsOBD.deviceRegistered', 'Device registered') }); },
  });

  const createSessionMutation = useMutation({
    mutationFn: (data: InsertObdSession) => apiRequest("/api/obd-sessions", "POST", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/obd-sessions"] }); setShowSessionDialog(false); toast({ title: t('diagnosticsOBD.sessionStarted', 'Session started') }); },
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
        {status === 'active' ? t('common.active', 'Active') : status === 'completed' ? t('common.completed', 'Completed') : t('common.error', 'Error')}
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
        {severity === 'critical' ? t('diagnosticsOBD.critical', 'Critical') : severity === 'warning' ? t('common.warning', 'Warning') : t('common.info', 'Info')}
      </span>
    );
  };

  const devicesTab = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">{t('diagnosticsOBD.obdDevices', 'OBD Devices')}</h2>
        <Button onClick={() => { deviceForm.reset(); setShowDeviceDialog(true); }} data-testid="button-add-device">
          <Plus className="h-4 w-4 mr-2" />
          {t('diagnosticsOBD.registerDevice', 'Register Device')}
        </Button>
      </div>

      <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('diagnosticsOBD.serialNumber', 'Serial #')}</TableHead>
                <TableHead>{t('diagnosticsOBD.manufacturer', 'Manufacturer')}</TableHead>
                <TableHead>{t('diagnosticsOBD.model', 'Model')}</TableHead>
                <TableHead>{t('diagnosticsOBD.firmware', 'Firmware')}</TableHead>
                <TableHead>{t('common.status', 'Status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-mono font-semibold">{device.deviceId}</TableCell>
                  <TableCell>{getManufacturerBadge(device.manufacturer || '')}</TableCell>
                  <TableCell>{device.model || t('common.notAvailable', 'N/A')}</TableCell>
                  <TableCell className="font-mono text-xs">{device.firmwareVersion || t('common.notAvailable', 'N/A')}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${device.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                      {device.status === 'active' ? `🟢 ${t('diagnosticsOBD.online', 'Online')}` : `○ ${t('diagnosticsOBD.offline', 'Offline')}`}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const sessionsTab = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">{t('diagnosticsOBD.activeDiagnosticSessions', 'Active Diagnostic Sessions')}</h2>
        <Button onClick={() => { sessionForm.reset(); setShowSessionDialog(true); }} data-testid="button-start-session">
          <Plus className="h-4 w-4 mr-2" />
          {t('diagnosticsOBD.startSession', 'Start Session')}
        </Button>
      </div>

      <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('diagnosticsOBD.sessionId', 'Session ID')}</TableHead>
                <TableHead>{t('diagnosticsOBD.device', 'Device')}</TableHead>
                <TableHead>{t('common.status', 'Status')}</TableHead>
                <TableHead>{t('diagnosticsOBD.started', 'Started')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-mono text-xs">{session.id.substring(0, 8)}</TableCell>
                  <TableCell>{devices.find(d => d.id === session.deviceId)?.deviceId || t('common.notAvailable', 'N/A')}</TableCell>
                  <TableCell>{getSessionStatusBadge(session.status || '')}</TableCell>
                  <TableCell>{session.startTime ? new Date(session.startTime).toLocaleString() : t('common.notAvailable', 'N/A')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const reportsTab = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">{t('diagnosticsOBD.diagnosticReports', 'Diagnostic Reports')}</h2>
      </div>

      <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('diagnosticsOBD.reportId', 'Report ID')}</TableHead>
                <TableHead>{t('diagnosticsOBD.session', 'Session')}</TableHead>
                <TableHead>{t('diagnosticsOBD.severity', 'Severity')}</TableHead>
                <TableHead>{t('diagnosticsOBD.dtcCodes', 'DTC Codes')}</TableHead>
                <TableHead>{t('diagnosticsOBD.generated', 'Generated')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-mono text-xs">{report.id.substring(0, 8)}</TableCell>
                  <TableCell className="font-mono text-xs">{report.sessionId.substring(0, 8)}</TableCell>
                  <TableCell>{getSeverityBadge(report.severity || '')}</TableCell>
                  <TableCell className="font-mono text-xs">{Array.isArray(report.faultCodes) ? report.faultCodes.join(', ') : t('common.none', 'None')}</TableCell>
                  <TableCell>{report.generatedAt ? new Date(report.generatedAt).toLocaleString() : t('common.notAvailable', 'N/A')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const assignmentsTab = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">{t('diagnosticsOBD.deviceAssignments', 'Device Assignments')}</h2>
      </div>

      <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('diagnosticsOBD.device', 'Device')}</TableHead>
                <TableHead>{t('diagnosticsOBD.branch', 'Branch')}</TableHead>
                <TableHead>{t('diagnosticsOBD.assignedDate', 'Assigned Date')}</TableHead>
                <TableHead>{t('common.status', 'Status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>{devices.find(d => d.id === assignment.deviceId)?.deviceId || t('common.notAvailable', 'N/A')}</TableCell>
                  <TableCell>{assignment.technicianId || t('diagnosticsOBD.unassigned', 'Unassigned')}</TableCell>
                  <TableCell>{assignment.assignedAt ? new Date(assignment.assignedAt).toLocaleDateString() : t('common.notAvailable', 'N/A')}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${assignment.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                      {assignment.status === 'active' ? `✅ ${t('common.active', 'Active')}` : `○ ${t('common.inactive', 'Inactive')}`}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <TabsPageLayout
        title={t('diagnosticsOBD.title', 'Diagnostics & OBD Hub')}
        description={t('diagnosticsOBD.pageDescription', 'Manage OBD diagnostic devices, real-time vehicle monitoring, and diagnostic reports')}
        icon={Cpu}
        tabs={[
          {
            id: "devices",
            label: t('diagnosticsOBD.obdDevices', 'OBD Devices'),
            icon: Cpu,
            content: devicesTab,
          },
          {
            id: "sessions",
            label: t('diagnosticsOBD.liveSessions', 'Live Sessions'),
            icon: Activity,
            content: sessionsTab,
          },
          {
            id: "reports",
            label: t('diagnosticsOBD.diagnosticReports', 'Diagnostic Reports'),
            icon: FileText,
            content: reportsTab,
          },
          {
            id: "assignments",
            label: t('diagnosticsOBD.deviceAssignments', 'Device Assignments'),
            icon: Wifi,
            content: assignmentsTab,
          },
        ]}
        defaultTab="devices"
      />

      <Dialog open={showDeviceDialog} onOpenChange={setShowDeviceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('diagnosticsOBD.registerOBDDevice', 'Register OBD Device')}</DialogTitle>
          </DialogHeader>
          <Form {...deviceForm}>
            <form onSubmit={deviceForm.handleSubmit((data) => createDeviceMutation.mutate(data))} className="space-y-4">
              <FormField control={deviceForm.control} name="deviceId" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('diagnosticsOBD.deviceId', 'Device ID')}</FormLabel>
                  <FormControl><Input {...field} placeholder="BSH-2024-001" /></FormControl>
                </FormItem>
              )} />
              <FormField control={deviceForm.control} name="deviceName" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('diagnosticsOBD.deviceName', 'Device Name')}</FormLabel>
                  <FormControl><Input {...field} placeholder={t('diagnosticsOBD.obdScanner', 'OBD Scanner 1')} /></FormControl>
                </FormItem>
              )} />
              <FormField control={deviceForm.control} name="manufacturer" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('diagnosticsOBD.manufacturer', 'Manufacturer')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
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
                  <FormLabel>{t('diagnosticsOBD.model', 'Model')}</FormLabel>
                  <FormControl><Input {...field} value={field.value || ''} placeholder="KTS 590" /></FormControl>
                </FormItem>
              )} />
              <FormField control={deviceForm.control} name="firmwareVersion" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('diagnosticsOBD.firmwareVersion', 'Firmware Version')}</FormLabel>
                  <FormControl><Input {...field} value={field.value || ''} placeholder="v2.5.1" /></FormControl>
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={createDeviceMutation.isPending}>
                {createDeviceMutation.isPending ? t('diagnosticsOBD.registering', 'Registering...') : t('diagnosticsOBD.registerDevice', 'Register Device')}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
