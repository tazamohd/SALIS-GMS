import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Receipt, Percent, Save, CheckCircle, Settings } from "lucide-react";

export default function VATSettings() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050510] via-[#0a0a1a] to-[#050510] p-6" data-testid="vat-settings-page">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white" data-testid="page-title">{t('vatSettings.title', 'VAT Settings')}</h1>
            <p className="text-gray-400 mt-1" data-testid="page-description">{t('vatSettings.description', 'Configure Value Added Tax settings for Saudi Arabia')}</p>
          </div>
          <Badge data-testid="status-compliant-vat-0" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <CheckCircle className="w-3 h-3 mr-1" /> Compliant
          </Badge>
        </div>

        <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-registration">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><Receipt className="w-5 h-5 text-sky-400" /> VAT Registration</CardTitle>
            <CardDescription className="text-gray-400">Your VAT registration details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">VAT Registration Number (TRN)</Label>
                <Input data-testid="input-trn" defaultValue="300000000000003" className="bg-white/5 border-white/10 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Registration Date</Label>
                <Input data-testid="input-reg-date" type="date" defaultValue="2024-01-01" className="bg-white/5 border-white/10 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Legal Business Name</Label>
              <Input data-testid="input-business-name" defaultValue="SALIS AUTO LLC" className="bg-white/5 border-white/10 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-rates">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><Percent className="w-5 h-5 text-sky-400" /> VAT Rates</CardTitle>
            <CardDescription className="text-gray-400">Configure VAT rates for different categories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: "services", category: "Standard Rate (Services)", rate: "15%", desc: "Standard VAT rate for all services" },
              { id: "parts", category: "Standard Rate (Parts)", rate: "15%", desc: "Standard VAT rate for spare parts" },
              { id: "zero", category: "Zero Rate", rate: "0%", desc: "For exports and specific exemptions" },
            ].map((item) => (
              <div key={item.id} data-testid={`rate-${item.id}`} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                <div>
                  <p className="text-white font-medium">{item.category}</p>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
                <Badge data-testid={`badge-rate-${item.id}`} className="bg-sky-500/20 text-sky-400 text-lg px-4">{item.rate}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-invoice-settings">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><Settings className="w-5 h-5 text-sky-400" /> Invoice Settings</CardTitle>
            <CardDescription className="text-gray-400">Configure VAT display on invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: "breakdown", label: "Show VAT Breakdown", desc: "Display VAT amount separately on invoices" },
              { id: "trn", label: "Include TRN on Invoices", desc: "Print VAT registration number on all invoices" },
              { id: "auto", label: "Auto-calculate VAT", desc: "Automatically calculate VAT on all transactions" },
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
