import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { TabsPageLayout } from "@/components/layouts";
import { Activity, AlertTriangle, CheckCircle, Code, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function OBDDiagnosticViewer() {
  const { t } = useTranslation();
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
      label: t('obd.liveData', 'Live Data'),
      icon: Activity,
      content: (
        <div className="space-y-4">
          <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('obd.realtimeParameters', 'Real-time OBD-II Parameters')}</CardTitle>
              <CardDescription className="text-[#64748B]">{t('obd.liveSensorReadings', 'Live sensor readings from vehicle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
                  <p className="text-sm text-[#64748B]">{t('obd.engineRpm', 'Engine RPM')}</p>
                  <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">2,450</p>
                  <p className="text-xs text-[#64748B]">{t('obd.normalRange', 'Normal range')}</p>
                </div>
                <div className="p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
                  <p className="text-sm text-[#64748B]">{t('obd.speed', 'Speed')}</p>
                  <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">45 mph</p>
                  <p className="text-xs text-[#64748B]">{t('obd.currentSpeed', 'Current speed')}</p>
                </div>
                <div className="p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
                  <p className="text-sm text-[#64748B]">{t('obd.coolantTemp', 'Coolant Temp')}</p>
                  <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">92°C</p>
                  <p className="text-xs text-[#64748B]">{t('obd.normal', 'Normal')}</p>
                </div>
                <div className="p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
                  <p className="text-sm text-[#64748B]">{t('obd.fuelLevel', 'Fuel Level')}</p>
                  <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">68%</p>
                  <p className="text-xs text-[#64748B]">{t('obd.remaining', 'Remaining')}</p>
                </div>
                <div className="p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
                  <p className="text-sm text-[#64748B]">{t('obd.mafSensor', 'MAF Sensor')}</p>
                  <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">5.2 g/s</p>
                  <p className="text-xs text-[#64748B]">{t('obd.airFlow', 'Air flow')}</p>
                </div>
                <div className="p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
                  <p className="text-sm text-[#64748B]">{t('obd.throttlePos', 'Throttle Pos')}</p>
                  <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">24%</p>
                  <p className="text-xs text-[#64748B]">{t('obd.position', 'Position')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "codes",
      label: t('obd.diagnosticCodes', 'Diagnostic Codes'),
      icon: Code,
      badge: 2,
      content: (
        <div className="space-y-4">
          <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('obd.activeDtcs', 'Active Diagnostic Trouble Codes (DTCs)')}</CardTitle>
              <CardDescription className="text-[#64748B]">{t('obd.currentErrorCodes', 'Current error codes from vehicle ECU')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 border border-red-500/20 bg-red-500/5 dark:bg-red-500/10 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20">P0420</Badge>
                        <Badge variant="outline" className="border-[#E2E8F0] dark:border-[#232A36] text-[#64748B]">{t('common.active', 'Active')}</Badge>
                      </div>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">{t('obd.catalystEfficiency', 'Catalyst System Efficiency Below Threshold')}</p>
                      <p className="text-sm text-[#64748B] mt-1">
                        {t('obd.catalystDescription', 'Bank 1 - The catalytic converter is not operating efficiently')}
                      </p>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                </div>
                <div className="p-4 border border-[#F97316]/20 bg-[#F97316]/5 dark:bg-[#F97316]/10 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-[#F97316]/10 text-[#F97316] hover:bg-[#F97316]/20">P0171</Badge>
                        <Badge variant="outline" className="border-[#E2E8F0] dark:border-[#232A36] text-[#64748B]">{t('common.active', 'Active')}</Badge>
                      </div>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">{t('obd.systemTooLean', 'System Too Lean (Bank 1)')}</p>
                      <p className="text-sm text-[#64748B] mt-1">
                        {t('obd.leanMixtureDescription', 'Fuel trim correction indicates lean air/fuel mixture')}
                      </p>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-[#F97316]" />
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
      label: t('obd.freezeFrame', 'Freeze Frame'),
      icon: FileText,
      content: (
        <div className="space-y-4">
          <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('obd.freezeFrameData', 'Freeze Frame Data')}</CardTitle>
              <CardDescription className="text-[#64748B]">{t('obd.freezeFrameDescription', 'Snapshot of sensor values when DTC was set')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
                  <p className="text-sm font-medium mb-3 text-[#0B1F3B] dark:text-white">{t('obd.freezeFrameFor', 'Freeze Frame for P0420')}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-[#64748B]">{t('obd.engineRpm', 'Engine RPM')}:</span>
                      <span className="ml-2 font-medium text-[#0B1F3B] dark:text-white">2,850</span>
                    </div>
                    <div>
                      <span className="text-[#64748B]">{t('obd.speed', 'Speed')}:</span>
                      <span className="ml-2 font-medium text-[#0B1F3B] dark:text-white">62 mph</span>
                    </div>
                    <div>
                      <span className="text-[#64748B]">{t('obd.coolantTemp', 'Coolant Temp')}:</span>
                      <span className="ml-2 font-medium text-[#0B1F3B] dark:text-white">95°C</span>
                    </div>
                    <div>
                      <span className="text-[#64748B]">{t('obd.load', 'Load')}:</span>
                      <span className="ml-2 font-medium text-[#0B1F3B] dark:text-white">45%</span>
                    </div>
                    <div>
                      <span className="text-[#64748B]">{t('obd.fuelStatus', 'Fuel Status')}:</span>
                      <span className="ml-2 font-medium text-[#0B1F3B] dark:text-white">{t('obd.closedLoop', 'Closed Loop')}</span>
                    </div>
                    <div>
                      <span className="text-[#64748B]">{t('obd.o2Sensor', 'O2 Sensor')}:</span>
                      <span className="ml-2 font-medium text-[#0B1F3B] dark:text-white">0.85V</span>
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
      label: t('obd.history', 'History'),
      icon: CheckCircle,
      content: (
        <div className="space-y-4">
          <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('obd.diagnosticHistory', 'Diagnostic History')}</CardTitle>
              <CardDescription className="text-[#64748B]">{t('obd.pastScansDescription', 'Past diagnostic scans and cleared codes')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-[#0B1F3B] dark:text-white">{t('obd.scanPerformedOn', 'Scan performed on Nov 10, 2025')}</p>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                      {t('obd.cleared', 'Cleared')}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#64748B]">{t('obd.codesFound', 'Codes found')}: P0420, P0171</p>
                  <p className="text-sm text-[#64748B]">{t('obd.actionTaken', 'Action')}: {t('obd.replacedCatalyst', 'Replaced catalytic converter')}</p>
                </div>
                <div className="p-3 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-[#0B1F3B] dark:text-white">{t('obd.scanPerformedOn', 'Scan performed on Oct 15, 2025')}</p>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                      {t('obd.noIssues', 'No Issues')}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#64748B]">{t('obd.noCodesFound', 'No diagnostic codes found')}</p>
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
      title={t('obd.title', 'OBD Diagnostic Viewer')}
      description={t('obd.description', 'View and analyze OBD-II diagnostic data from vehicles')}
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
                        {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                disabled={!selectedVehicle} 
                data-testid="button-scan"
                className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90"
              >
                <Activity className="mr-2 h-4 w-4" />
                {t('obd.startScan', 'Start Scan')}
              </Button>
            </div>
          </CardContent>
        </Card>
      }
    />
  );
}
