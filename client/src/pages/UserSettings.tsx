import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Shield, Palette, Save } from "lucide-react";

export default function UserSettings() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050510] via-[#0a0a1a] to-[#050510] p-6" data-testid="user-settings-page">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white" data-testid="page-title">{t('userSettings.title', 'User Settings')}</h1>
          <p className="text-gray-400 mt-1" data-testid="page-description">{t('userSettings.description', 'Manage your account preferences and settings')}</p>
        </div>

        <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-profile">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><User className="w-5 h-5 text-sky-400" /> Profile Information</CardTitle>
            <CardDescription className="text-gray-400">Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">First Name</Label>
                <Input data-testid="input-first-name" defaultValue="Ahmed" className="bg-white/5 border-white/10 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Last Name</Label>
                <Input data-testid="input-last-name" defaultValue="Hassan" className="bg-white/5 border-white/10 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Email</Label>
              <Input data-testid="input-email" defaultValue="ahmed@salisauto.com" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Phone</Label>
              <Input data-testid="input-phone" defaultValue="+966 50 123 4567" className="bg-white/5 border-white/10 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-notifications">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><Bell className="w-5 h-5 text-sky-400" /> Notifications</CardTitle>
            <CardDescription className="text-gray-400">Configure your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: "email", label: "Email Notifications", desc: "Receive updates via email" },
              { id: "sms", label: "SMS Notifications", desc: "Receive updates via SMS" },
              { id: "push", label: "Push Notifications", desc: "Receive browser push notifications" },
              { id: "jobs", label: "Job Assignments", desc: "Notify when assigned new jobs" },
            ].map((item, idx) => (
              <div key={item.id} data-testid={`setting-${item.id}`} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div>
                  <p className="text-white font-medium">{item.label}</p>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
                <Switch data-testid={`switch-${item.id}`} defaultChecked={idx < 3} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-appearance">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><Palette className="w-5 h-5 text-sky-400" /> Appearance</CardTitle>
            <CardDescription className="text-gray-400">Customize your interface</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div data-testid="setting-dark-mode" className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div>
                <p className="text-white font-medium">Dark Mode</p>
                <p className="text-sm text-gray-400">Use dark theme</p>
              </div>
              <Switch data-testid="switch-dark-mode" defaultChecked />
            </div>
            <div data-testid="setting-compact-mode" className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div>
                <p className="text-white font-medium">Compact Mode</p>
                <p className="text-sm text-gray-400">Reduce spacing in UI</p>
              </div>
              <Switch data-testid="switch-compact-mode" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button data-testid="button-save" className="bg-sky-500 hover:bg-sky-600 text-white">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
