import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Heart, Save, CheckCircle, Calculator, FileText } from "lucide-react";

export default function ZakatSettings() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050510] via-[#0a0a1a] to-[#050510] p-6" data-testid="zakat-settings-page">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white" data-testid="page-title">{t('zakatSettings.title', 'Zakat Settings')}</h1>
            <p className="text-gray-400 mt-1" data-testid="page-description">{t('zakatSettings.description', 'Configure Zakat calculation and reporting settings')}</p>
          </div>
          <Badge data-testid="status-configured-zakat-0" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <CheckCircle className="w-3 h-3 mr-1" /> Configured
          </Badge>
        </div>

        <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-registration">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><Heart className="w-5 h-5 text-emerald-400" /> Zakat Registration</CardTitle>
            <CardDescription className="text-gray-400">Your Zakat registration with ZATCA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Zakat Registration Number</Label>
                <Input data-testid="input-zakat-number" defaultValue="ZKT-2024-000001" className="bg-white/5 border-white/10 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Fiscal Year End</Label>
                <Input data-testid="input-fiscal-year" type="date" defaultValue="2026-12-31" className="bg-white/5 border-white/10 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Business Type</Label>
              <Input data-testid="input-business-type" defaultValue="Automotive Services" className="bg-white/5 border-white/10 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-calculation">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><Calculator className="w-5 h-5 text-sky-400" /> Zakat Calculation</CardTitle>
            <CardDescription className="text-gray-400">Configure Zakat calculation parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div data-testid="rate-display" className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <span className="text-white">Standard Zakat Rate</span>
                <Badge data-testid="badge-zakat-rate" className="bg-emerald-500/20 text-emerald-400 text-lg px-4">2.5%</Badge>
              </div>
              <p className="text-sm text-gray-400 mt-2">Applied to eligible assets as per Islamic guidelines</p>
            </div>
            {[
              { id: "cash", asset: "Cash & Bank Balances", included: true },
              { id: "receivable", asset: "Accounts Receivable", included: true },
              { id: "inventory", asset: "Inventory (Spare Parts)", included: true },
              { id: "fixed", asset: "Fixed Assets", included: false },
            ].map((item) => (
              <div key={item.id} data-testid={`asset-${item.id}`} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-white">{item.asset}</span>
                <Switch data-testid={`switch-${item.id}`} defaultChecked={item.included} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-reporting">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><FileText className="w-5 h-5 text-sky-400" /> Reporting</CardTitle>
            <CardDescription className="text-gray-400">Zakat reporting and submission settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: "auto-report", label: "Auto-generate Zakat Report", desc: "Generate annual Zakat report automatically" },
              { id: "financial", label: "Include in Financial Statements", desc: "Show Zakat liability in financial reports" },
              { id: "reminders", label: "Email Reminders", desc: "Send reminders before Zakat due dates" },
            ].map((item) => (
              <div key={item.id} data-testid={`setting-${item.id}`} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div>
                  <p className="text-white font-medium">{item.label}</p>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
                <Switch data-testid={`switch-${item.id}`} defaultChecked />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button data-testid="button-save" className="bg-sky-500 hover:bg-sky-600 text-white">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
