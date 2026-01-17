import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, ClipboardCheck, Eye, Settings } from "lucide-react";

export default function QualityControl() {
  const { t } = useTranslation();

  const inspections = [
    { id: "QC-001", vehicle: "Toyota Camry 2024", service: t('services.engineOverhaul', 'Engine Overhaul'), technician: t('sample.technicianName5', 'Ahmed Hassan'), status: "passed", score: 98, date: "2026-01-07" },
    { id: "QC-002", vehicle: "BMW X5 2023", service: t('services.brakeReplacement', 'Brake Replacement'), technician: t('sample.technicianName6', 'Mohammed Ali'), status: "passed", score: 95, date: "2026-01-07" },
    { id: "QC-003", vehicle: "Honda Accord 2022", service: t('services.acService', 'AC Service'), technician: t('sample.technicianName7', 'Khalid Omar'), status: "pending", score: 0, date: "2026-01-07" },
    { id: "QC-004", vehicle: "Mercedes C-Class 2024", service: t('services.transmissionRepair', 'Transmission Repair'), technician: t('sample.technicianName8', 'Omar Fahad'), status: "failed", score: 72, date: "2026-01-06" },
    { id: "QC-005", vehicle: "Nissan Altima 2023", service: t('services.fullService', 'Full Service'), technician: t('sample.technicianName9', 'Ali Saeed'), status: "passed", score: 92, date: "2026-01-06" },
  ];

  const getStatusBadge = (status: string, id: string) => {
    switch (status) {
      case "passed": return <Badge data-testid={`status-passed-${id}`} className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><CheckCircle className="w-3 h-3 mr-1" />{t('qualityControl.passed', 'Passed')}</Badge>;
      case "pending": return <Badge data-testid={`status-pending-${id}`} className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><AlertTriangle className="w-3 h-3 mr-1" />{t('qualityControl.pending', 'Pending')}</Badge>;
      case "failed": return <Badge data-testid={`status-failed-${id}`} className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />{t('qualityControl.failed', 'Failed')}</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050510] via-[#0a0a1a] to-[#050510] p-6" data-testid="quality-control-page">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white" data-testid="page-title">{t('qualityControl.title', 'Quality Control')}</h1>
            <p className="text-gray-400 mt-1" data-testid="page-description">{t('qualityControl.description', 'Monitor and ensure service quality standards')}</p>
          </div>
          <Button data-testid="button-new-inspection" className="bg-sky-500 hover:bg-sky-600 text-white">
            <ClipboardCheck className="w-4 h-4 mr-2" />
            {t('qualityControl.newInspection', 'New Inspection')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-total-inspections">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-500/20"><ClipboardCheck className="w-5 h-5 text-sky-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white" data-testid="text-total-inspections">156</p>
                  <p className="text-sm text-gray-400">{t('qualityControl.totalInspections', 'Total Inspections')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-passed">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20"><CheckCircle className="w-5 h-5 text-emerald-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white" data-testid="text-passed">142</p>
                  <p className="text-sm text-gray-400">{t('qualityControl.passed', 'Passed')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-failed">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20"><XCircle className="w-5 h-5 text-red-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white" data-testid="text-failed">8</p>
                  <p className="text-sm text-gray-400">{t('qualityControl.failed', 'Failed')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-pass-rate">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20"><Settings className="w-5 h-5 text-purple-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white" data-testid="text-pass-rate">91.0%</p>
                  <p className="text-sm text-gray-400">{t('qualityControl.passRate', 'Pass Rate')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-recent-inspections">
          <CardHeader>
            <CardTitle className="text-white">{t('qualityControl.recentInspections', 'Recent Inspections')}</CardTitle>
            <CardDescription className="text-gray-400">{t('qualityControl.inspectionResults', 'Quality control inspection results')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inspections.map((inspection) => (
                <div key={inspection.id} data-testid={`inspection-row-${inspection.id}`} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:border-sky-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-sky-500/20 flex items-center justify-center">
                      <ClipboardCheck className="w-6 h-6 text-sky-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white" data-testid={`text-inspection-id-${inspection.id}`}>{inspection.id} - {inspection.vehicle}</p>
                      <p className="text-sm text-gray-400">{inspection.service} • {inspection.technician}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-white">{inspection.date}</p>
                      {inspection.score > 0 && <p data-testid={`text-score-${inspection.id}`} className={`text-sm font-bold ${inspection.score >= 90 ? 'text-emerald-400' : inspection.score >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>{t('qualityControl.score', 'Score')}: {inspection.score}%</p>}
                    </div>
                    {getStatusBadge(inspection.status, inspection.id)}
                    <Button data-testid={`button-view-${inspection.id}`} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
