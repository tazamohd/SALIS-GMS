import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { FileCheck, QrCode, Save, CheckCircle, Shield, Settings } from "lucide-react";

export default function ZATCASettings() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050510] via-[#0a0a1a] to-[#050510] p-6" data-testid="zatca-settings-page">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white" data-testid="page-title">{t('zatcaSettings.title', 'ZATCA E-Invoicing Settings')}</h1>
            <p className="text-gray-400 mt-1" data-testid="page-description">{t('zatcaSettings.description', 'Configure ZATCA Phase 2 E-Invoicing compliance')}</p>
          </div>
          <Badge data-testid="status-compliant-zatca-0" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <CheckCircle className="w-3 h-3 mr-1" /> Phase 2 Compliant
          </Badge>
        </div>

        <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-registration">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><Shield className="w-5 h-5 text-sky-400" /> ZATCA Registration</CardTitle>
            <CardDescription className="text-gray-400">Your ZATCA e-invoicing credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">ZATCA Device ID</Label>
                <Input data-testid="input-device-id" defaultValue="ZATCA-DEV-001" className="bg-white/5 border-white/10 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Solution Name</Label>
                <Input data-testid="input-solution-name" defaultValue="SALIS AUTO ERP" className="bg-white/5 border-white/10 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Certificate Serial Number</Label>
              <Input data-testid="input-cert-serial" defaultValue="CERT-2024-XXXX-XXXX" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div data-testid="cert-status" className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Certificate Valid</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">Expires: December 31, 2026</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-qr">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><QrCode className="w-5 h-5 text-sky-400" /> QR Code Settings</CardTitle>
            <CardDescription className="text-gray-400">Configure QR code generation for invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: "generate", label: "Generate QR Code", desc: "Auto-generate ZATCA-compliant QR codes" },
              { id: "hash", label: "Include Hash", desc: "Include cryptographic hash in QR code" },
              { id: "signature", label: "Include Digital Signature", desc: "Embed digital signature in QR code" },
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

        <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-invoice-types">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><FileCheck className="w-5 h-5 text-sky-400" /> Invoice Types</CardTitle>
            <CardDescription className="text-gray-400">Configure invoice type settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: "standard", type: "Standard Tax Invoice", code: "388", enabled: true },
              { id: "simplified", type: "Simplified Tax Invoice", code: "381", enabled: true },
              { id: "credit", type: "Credit Note", code: "381", enabled: true },
              { id: "debit", type: "Debit Note", code: "383", enabled: true },
            ].map((item) => (
              <div key={item.id} data-testid={`invoice-type-${item.id}`} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <Badge data-testid={`badge-code-${item.id}`} className="bg-sky-500/20 text-sky-400">{item.code}</Badge>
                  <span className="text-white">{item.type}</span>
                </div>
                <Switch data-testid={`switch-${item.id}`} defaultChecked={item.enabled} />
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
