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
    const manufacturers: { [key: string]: { bg: string; text: string } } = {
      Bosch: { bg: 'bg-[#0A5ED7]/10', text: 'text-[#0A5ED7]' },
      Launch: { bg: 'bg-[#F97316]/10', text: 'text-[#F97316]' },
      Autel: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
    };
    const config = manufacturers[manufacturer] || { bg: 'bg-[#64748B]/10', text: 'text-[#64748B]' };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {manufacturer}
      </span>
    );
  };

  const getSessionStatusBadge = (status: string) => {
    const statusColors: { [key: string]: { bg: string; text: string } } = {
      active: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
      completed: { bg: 'bg-[#0A5ED7]/10', text: 'text-[#0A5ED7]' },
      error: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
    };
    const config = statusColors[status] || { bg: 'bg-[#64748B]/10', text: 'text-[#64748B]' };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {status === 'active' ? t('common.active', 'Active') : status === 'completed' ? t('common.completed', 'Completed') : t('common.error', 'Error')}
      </span>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const severityColors: { [key: string]: { bg: string; text: string } } = {
      critical: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
      warning: { bg: 'bg-[#F97316]/10', text: 'text-[#F97316]' },
      info: { bg: 'bg-[#0A5ED7]/10', text: 'text-[#0A5ED7]' },
    };
    const config = severityColors[severity] || { bg: 'bg-[#64748B]/10', text: 'text-[#64748B]' };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {severity === 'critical' ? t('diagnosticsOBD.critical', 'Critical') : severity === 'warning' ? t('common.warning', 'Warning') : t('common.info', 'Info')}
      </span>
    );
  };

  const devicesTab = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-lg text-[#0B1F3B] dark:text-white">{t('diagnosticsOBD.obdDevices', 'OBD Devices')}</h2>
        <Button 
          onClick={() => { deviceForm.reset(); setShowDeviceDialog(true); }} 
          data-testid="button-add-device"
          className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('diagnosticsOBD.registerDevice', 'Register Device')}
        </Button>
      </div>

      <Card className="border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                <TableHead className="text-[#64748B]">{t('diagnosticsOBD.serialNumber', 'Serial #')}</TableHead>
                <TableHead className="text-[#64748B]">{t('diagnosticsOBD.manufacturer', 'Manufacturer')}</TableHead>
                <TableHead className="text-[#64748B]">{t('diagnosticsOBD.model', 'Model')}</TableHead>
                <TableHead className="text-[#64748B]">{t('diagnosticsOBD.firmware', 'Firmware')}</TableHead>
                <TableHead className="text-[#64748B]">{t('common.status', 'Status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id} className="border-[#E2E8F0] dark:border-[#232A36]">
                  <TableCell className="font-mono font-semibold text-[#0B1F3B] dark:text-white">{device.deviceId}</TableCell>
                  <TableCell>{getManufacturerBadge(device.manufacturer || '')}</TableCell>
                  <TableCell className="text-[#0B1F3B] dark:text-white">{device.model || t('common.notAvailable', 'N/A')}</TableCell>
                  <TableCell className="font-mono text-xs text-[#64748B]">{device.firmwareVersion || t('common.notAvailable', 'N/A')}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${device.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-[#64748B]/10 text-[#64748B]'}`}>
                      {device.status === 'active' ? t('diagnosticsOBD.online', 'Online') : t('diagnosticsOBD.offline', 'Offline')}
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
        <h2 className="font-semibold text-lg text-[#0B1F3B] dark:text-white">{t('diagnosticsOBD.activeDiagnosticSessions', 'Active Diagnostic Sessions')}</h2>
        <Button 
          onClick={() => { sessionForm.reset(); setShowSessionDialog(true); }} 
          data-testid="button-start-session"
          className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('diagnosticsOBD.startSession', 'Start Session')}
        </Button>
      </div>

      <Card className="border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                <TableHead className="text-[#64748B]">{t('diagnosticsOBD.sessionId', 'Session ID')}</TableHead>
                <TableHead className="text-[#64748B]">{t('diagnosticsOBD.device', 'Device')}</TableHead>
                <TableHead className="text-[#64748B]">{t('common.status', 'Status')}</TableHead>
                <TableHead className="text-[#64748B]">{t('diagnosticsOBD.started', 'Started')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id} className="border-[#E2E8F0] dark:border-[#232A36]">
                  <TableCell className="font-mono text-xs text-[#0B1F3B] dark:text-white">{session.id.substring(0, 8)}</TableCell>
                  <TableCell className="text-[#0B1F3B] dark:text-white">{devices.find(d => d.id === session.deviceId)?.deviceId || t('common.notAvailable', 'N/A')}</TableCell>
                  <TableCell>{getSessionStatusBadge(session.status || '')}</TableCell>
                  <TableCell className="text-[#64748B]">{session.startTime ? new Date(session.startTime).toLocaleString() : t('common.notAvailable', 'N/A')}</TableCell>
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
        <h2 className="font-semibold text-lg text-[#0B1F3B] dark:text-white">{t('diagnosticsOBD.diagnosticReports', 'Diagnostic Reports')}</h2>
      </div>

      <Card className="border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                <TableHead className="text-[#64748B]">{t('diagnosticsOBD.reportId', 'Report ID')}</TableHead>
                <TableHead className="text-[#64748B]">{t('diagnosticsOBD.session', 'Session')}</TableHead>
                <TableHead className="text-[#64748B]">{t('diagnosticsOBD.severity', 'Severity')}</TableHead>
                <TableHead className="text-[#64748B]">{t('diagnosticsOBD.dtcCodes', 'DTC Codes')}</TableHead>
                <TableHead className="text-[#64748B]">{t('diagnosticsOBD.generated', 'Generated')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id} className="border-[#E2E8F0] dark:border-[#232A36]">
                  <TableCell className="font-mono text-xs text-[#0B1F3B] dark:text-white">{report.id.substring(0, 8)}</TableCell>
                  <TableCell className="font-mono text-xs text-[#64748B]">{report.sessionId.substring(0, 8)}</TableCell>
                  <TableCell>{getSeverityBadge(report.severity || '')}</TableCell>
                  <TableCell className="font-mono text-xs text-[#0B1F3B] dark:text-white">{Array.isArray(report.faultCodes) ? report.faultCodes.join(', ') : t('common.none', 'None')}</TableCell>
                  <TableCell className="text-[#64748B]">{report.generatedAt ? new Date(report.generatedAt).toLocaleString() : t('common.notAvailable', 'N/A')}</TableCell>
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
        <h2 className="font-semibold text-lg text-[#0B1F3B] dark:text-white">{t('diagnosticsOBD.deviceAssignments', 'Device Assignments')}</h2>
      </div>

      <Card className="border border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                <TableHead className="text-[#64748B]">{t('diagnosticsOBD.device', 'Device')}</TableHead>
                <TableHead className="text-[#64748B]">{t('diagnosticsOBD.branch', 'Branch')}</TableHead>
                <TableHead className="text-[#64748B]">{t('diagnosticsOBD.assignedDate', 'Assigned Date')}</TableHead>
                <TableHead className="text-[#64748B]">{t('common.status', 'Status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id} className="border-[#E2E8F0] dark:border-[#232A36]">
                  <TableCell className="text-[#0B1F3B] dark:text-white">{devices.find(d => d.id === assignment.deviceId)?.deviceId || t('common.notAvailable', 'N/A')}</TableCell>
                  <TableCell className="text-[#0B1F3B] dark:text-white">{assignment.technicianId || t('diagnosticsOBD.unassigned', 'Unassigned')}</TableCell>
                  <TableCell className="text-[#64748B]">{assignment.assignedAt ? new Date(assignment.assignedAt).toLocaleDateString() : t('common.notAvailable', 'N/A')}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${assignment.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-[#64748B]/10 text-[#64748B]'}`}>
                      {assignment.status === 'active' ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
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
        <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('diagnosticsOBD.registerOBDDevice', 'Register OBD Device')}</DialogTitle>
          </DialogHeader>
          <Form {...deviceForm}>
            <form onSubmit={deviceForm.handleSubmit((data) => createDeviceMutation.mutate(data))} className="space-y-4">
              <FormField control={deviceForm.control} name="deviceId" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#0B1F3B] dark:text-white">{t('diagnosticsOBD.deviceId', 'Device ID')}</FormLabel>
                  <FormControl><Input {...field} placeholder="BSH-2024-001" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" /></FormControl>
                </FormItem>
              )} />
              <FormField control={deviceForm.control} name="deviceName" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#0B1F3B] dark:text-white">{t('diagnosticsOBD.deviceName', 'Device Name')}</FormLabel>
                  <FormControl><Input {...field} placeholder={t('diagnosticsOBD.obdScanner', 'OBD Scanner 1')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" /></FormControl>
                </FormItem>
              )} />
              <FormField control={deviceForm.control} name="manufacturer" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#0B1F3B] dark:text-white">{t('diagnosticsOBD.manufacturer', 'Manufacturer')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                    <FormControl><SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                      <SelectItem value="Bosch">Bosch</SelectItem>
                      <SelectItem value="Launch">Launch</SelectItem>
                      <SelectItem value="Autel">Autel</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={deviceForm.control} name="model" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#0B1F3B] dark:text-white">{t('diagnosticsOBD.model', 'Model')}</FormLabel>
                  <FormControl><Input {...field} value={field.value || ''} placeholder="KTS 590" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" /></FormControl>
                </FormItem>
              )} />
              <FormField control={deviceForm.control} name="firmwareVersion" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#0B1F3B] dark:text-white">{t('diagnosticsOBD.firmwareVersion', 'Firmware Version')}</FormLabel>
                  <FormControl><Input {...field} value={field.value || ''} placeholder="v2.5.1" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" /></FormControl>
                </FormItem>
              )} />
              <Button type="submit" className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90" disabled={createDeviceMutation.isPending}>
                {createDeviceMutation.isPending ? t('diagnosticsOBD.registering', 'Registering...') : t('diagnosticsOBD.registerDevice', 'Register Device')}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
