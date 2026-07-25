import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { TabsPageLayout } from "@/components/layouts";
import { Activity, AlertTriangle, CheckCircle, Code, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface OBDResponse {
  live: {
    engineRpm: number | null;
    speedMph: number | null;
    coolantTempC: number | null;
    fuelLevelPct: number | null;
    mafGramsPerSec: number | null;
    throttlePosPct: number | null;
    capturedAt: string;
  } | null;
  activeDtcs: Array<{ code: string; description: string; severity: string; status: string }>;
  freezeFrames: Array<{ forCode: string; snapshot: Record<string, any> }>;
  history: Array<{ scannedAt: string; codesFound: string[]; action: string }>;
}

const fmt = (n: number | null | undefined, suffix = "") => (typeof n === "number" ? `${n}${suffix}` : "—");

// Safe JSON.stringify — defensive against circular references in raw OBD payloads.
const safeJson = (value: unknown): string => {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "[unprintable snapshot — contains a circular reference]";
  }
};

export default function OBDDiagnosticViewer() {
  const { t } = useTranslation();
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");

  const { data: vehicles = [] } = useQuery<any[]>({ queryKey: ["/api/vehicles"] });

  const { data: obd, isLoading } = useQuery<OBDResponse>({
    queryKey: [`/api/diagnostics/obd/${selectedVehicle}`],
    enabled: !!selectedVehicle,
  });

  const live = obd?.live;
  const activeDtcs = obd?.activeDtcs ?? [];
  const freezeFrames = obd?.freezeFrames ?? [];
  const history = obd?.history ?? [];

  const severityClass = (sev: string) => {
    if (sev === "critical" || sev === "high") return "bg-red-500/10 text-red-600 dark:text-red-400";
    if (sev === "medium" || sev === "warning") return "bg-[#F97316]/10 text-[#F97316]";
    return "bg-[#0A5ED7]/10 text-[#0A5ED7]";
  };

  const tabs = [
    {
      id: "live",
      label: t('obd.liveData', 'Live Data'),
      icon: Activity,
      content: (
        <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('obd.realtimeParameters', 'Real-time OBD-II Parameters')}</CardTitle>
            <CardDescription className="text-[#64748B]">
              {live ? `${t('obd.capturedAt', 'Captured at')} ${new Date(live.capturedAt).toLocaleString()}` : t('obd.noLiveData', 'No live readings yet for this vehicle.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!live ? (
              <p className="text-sm text-[#64748B] py-12 text-center">
                {isLoading ? t('common.loading', 'Loading...') : t('obd.noLiveData', 'No live readings yet for this vehicle.')}
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: t('obd.engineRpm', 'Engine RPM'), value: fmt(live.engineRpm) },
                  { label: t('obd.speed', 'Speed'), value: fmt(live.speedMph, " mph") },
                  { label: t('obd.coolantTemp', 'Coolant Temp'), value: fmt(live.coolantTempC, "°C") },
                  { label: t('obd.fuelLevel', 'Fuel Level'), value: fmt(live.fuelLevelPct, "%") },
                  { label: t('obd.mafSensor', 'MAF Sensor'), value: fmt(live.mafGramsPerSec, " g/s") },
                  { label: t('obd.throttlePos', 'Throttle Pos'), value: fmt(live.throttlePosPct, "%") },
                ].map((m, idx) => (
                  <div key={idx} className="p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
                    <p className="text-sm text-[#64748B]">{m.label}</p>
                    <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid={`live-${idx}`}>{m.value}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ),
    },
    {
      id: "codes",
      label: t('obd.diagnosticCodes', 'Diagnostic Codes'),
      icon: Code,
      badge: activeDtcs.length || undefined,
      content: (
        <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('obd.activeDtcs', 'Active Diagnostic Trouble Codes (DTCs)')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('obd.currentErrorCodes', 'Current error codes from the vehicle ECU')}</CardDescription>
          </CardHeader>
          <CardContent>
            {activeDtcs.length === 0 ? (
              <p className="text-sm text-[#64748B] py-12 text-center">
                {isLoading ? t('common.loading', 'Loading...') : t('obd.noCodesFound', 'No active diagnostic codes')}
              </p>
            ) : (
              <div className="space-y-3">
                {activeDtcs.map((dtc, idx) => (
                  <div key={idx} className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg" data-testid={`dtc-${idx}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={severityClass(dtc.severity)}>
                            {/* visible severity label — avoids color-only indicator */}
                            <span className="font-mono">{dtc.code}</span>
                            <span className="ml-1 uppercase text-[10px] tracking-wide">{t(`obd.severity.${dtc.severity}`, dtc.severity)}</span>
                          </Badge>
                          <Badge variant="outline" className="border-[#E2E8F0] dark:border-[#232A36] text-[#64748B]">{dtc.status}</Badge>
                        </div>
                        <p className="font-medium text-[#0B1F3B] dark:text-white">{dtc.description}</p>
                      </div>
                      <AlertTriangle className="h-5 w-5 text-[#F97316]" aria-label={t(`obd.severity.${dtc.severity}`, dtc.severity)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ),
    },
    {
      id: "freeze",
      label: t('obd.freezeFrame', 'Freeze Frame'),
      icon: FileText,
      content: (
        <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('obd.freezeFrameData', 'Freeze Frame Data')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('obd.freezeFrameDescription', 'Snapshot of sensor values when each DTC was set')}</CardDescription>
          </CardHeader>
          <CardContent>
            {freezeFrames.length === 0 ? (
              <p className="text-sm text-[#64748B] py-12 text-center">
                {isLoading ? t('common.loading', 'Loading...') : t('obd.noFreezeFrames', 'No freeze frame snapshots recorded.')}
              </p>
            ) : (
              <div className="space-y-4">
                {freezeFrames.map((ff, idx) => (
                  <div key={idx} className="p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
                    <p className="text-sm font-medium mb-3 text-[#0B1F3B] dark:text-white">
                      {t('obd.freezeFrameFor', 'Freeze Frame for')} {ff.forCode}
                    </p>
                    <pre className="text-xs text-[#0B1F3B] dark:text-white whitespace-pre-wrap break-all">
                      {safeJson(ff.snapshot)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ),
    },
    {
      id: "history",
      label: t('obd.history', 'History'),
      icon: CheckCircle,
      content: (
        <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('obd.diagnosticHistory', 'Diagnostic History')}</CardTitle>
            <CardDescription className="text-[#64748B]">{t('obd.pastScansDescription', 'Past diagnostic scans for this vehicle')}</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-[#64748B] py-12 text-center">
                {isLoading ? t('common.loading', 'Loading...') : t('obd.noHistory', 'No diagnostic history yet.')}
              </p>
            ) : (
              <div className="space-y-3">
                {history.map((h, idx) => (
                  <div key={idx} className="p-3 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-[#0B1F3B] dark:text-white">
                        {new Date(h.scannedAt).toLocaleString()}
                      </p>
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                        {h.codesFound.length === 0 ? t('obd.noIssues', 'No Issues') : `${h.codesFound.length} ${t('obd.codes', 'code(s)')}`}
                      </Badge>
                    </div>
                    {h.codesFound.length > 0 && (
                      <p className="text-sm text-[#64748B]">{t('obd.codesFound', 'Codes found')}: {h.codesFound.join(", ")}</p>
                    )}
                    <p className="text-sm text-[#64748B]">{t('obd.actionTaken', 'Action')}: {h.action}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <TabsPageLayout
      title={t('obd.title', 'OBD Diagnostic Viewer')}
      description={t('obd.description', 'Inspect live OBD-II parameters, DTCs, and scan history per vehicle')}
      icon={Activity}
      tabs={tabs}
      headerContent={
        <Card className="mb-6 border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-[#64748B] mb-2">{t('obd.selectVehicle', 'Select Vehicle')}</p>
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger data-testid="select-vehicle" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                    <SelectValue placeholder={t('obd.chooseVehicle', 'Choose a vehicle...')} />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                    {vehicles.map((vehicle: any) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.make} {vehicle.model} {vehicle.licensePlate ? `- ${vehicle.licensePlate}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button disabled={!selectedVehicle} data-testid="button-scan" className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90">
                <Activity className="mr-2 h-4 w-4" />
                {t('obd.startScan', 'Refresh Scan')}
              </Button>
            </div>
          </CardContent>
        </Card>
      }
    />
  );
}
