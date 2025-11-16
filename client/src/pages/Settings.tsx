import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Settings as SettingsIcon, Globe, DollarSign, Palette, Printer, Keyboard, RotateCcw } from "lucide-react";
import type { UserSettings } from "@shared/schema";
import { TabsPageLayout } from "@/components/layouts";

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  const { data: settings, isLoading, isError, error } = useQuery<UserSettings>({
    queryKey: ['/api/settings'],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: Partial<UserSettings>) => apiRequest('PATCH', '/api/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({ title: "Settings Updated", description: "Your preferences have been saved" });
    },
    onError: (error: any) => {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    },
  });

  const handleUpdateSettings = (updates: Partial<UserSettings>) => {
    updateSettingsMutation.mutate(updates);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
          <p className="mt-4 text-gray-900 dark:text-white/60">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-700 dark:text-gray-300 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Failed to Load Settings</h2>
          <p className="text-gray-900 dark:text-white/60 mb-4">
            {error instanceof Error ? error.message : 'Unable to connect to server'}
          </p>
          <Button onClick={() => window.location.reload()} data-testid="button-retry">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  const tabs = [
    {
      id: "general",
      label: "General",
      icon: SettingsIcon,
      content: <GeneralSettingsTab settings={settings} onUpdate={handleUpdateSettings} />,
    },
    {
      id: "language",
      label: "Language",
      icon: Globe,
      content: <LanguageSettingsTab settings={settings} onUpdate={handleUpdateSettings} />,
    },
    {
      id: "currency",
      label: "Currency",
      icon: DollarSign,
      content: <CurrencySettingsTab settings={settings} onUpdate={handleUpdateSettings} />,
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: Palette,
      content: <AppearanceSettingsTab settings={settings} onUpdate={handleUpdateSettings} />,
    },
    {
      id: "print",
      label: "Print",
      icon: Printer,
      content: <PrintSettingsTab settings={settings} onUpdate={handleUpdateSettings} />,
    },
    {
      id: "shortcuts",
      label: "Shortcuts",
      icon: Keyboard,
      content: <KeyboardShortcutsTab settings={settings} onUpdate={handleUpdateSettings} />,
    },
  ];

  return (
    <TabsPageLayout
      title="Settings & Preferences"
      description="Customize your experience"
      icon={SettingsIcon}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}

function GeneralSettingsTab({ settings, onUpdate }: { settings: UserSettings; onUpdate: (data: Partial<UserSettings>) => void }) {
  return (
    <Card data-testid="card-general">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">General Settings</CardTitle>
        <CardDescription className="text-gray-900 dark:text-white/60">Configure your basic preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select 
              value={settings.timezone || "UTC"} 
              onValueChange={(value) => onUpdate({ timezone: value })}
            >
              <SelectTrigger data-testid="select-timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                <SelectItem value="Europe/London">London</SelectItem>
                <SelectItem value="Europe/Paris">Paris</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date Format</Label>
            <Select 
              value={settings.dateFormat || "MM/DD/YYYY"} 
              onValueChange={(value) => onUpdate({ dateFormat: value })}
            >
              <SelectTrigger data-testid="select-date-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Time Format</Label>
            <Select 
              value={settings.timeFormat || "12h"} 
              onValueChange={(value) => onUpdate({ timeFormat: value })}
            >
              <SelectTrigger data-testid="select-time-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">12-hour</SelectItem>
                <SelectItem value="24h">24-hour</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Notifications</Label>
              <p className="text-sm text-gray-900 dark:text-white/60">Receive system notifications</p>
            </div>
            <Switch 
              checked={settings.enableNotifications ?? true}
              onCheckedChange={(checked) => onUpdate({ enableNotifications: checked })}
              data-testid="switch-notifications"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Sound Effects</Label>
              <p className="text-sm text-gray-900 dark:text-white/60">Play sounds for notifications</p>
            </div>
            <Switch 
              checked={settings.enableSounds ?? true}
              onCheckedChange={(checked) => onUpdate({ enableSounds: checked })}
              data-testid="switch-sounds"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LanguageSettingsTab({ settings, onUpdate }: { settings: UserSettings; onUpdate: (data: Partial<UserSettings>) => void }) {
  return (
    <Card data-testid="card-language">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Language & Region</CardTitle>
        <CardDescription className="text-gray-900 dark:text-white/60">Choose your preferred language</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Language</Label>
          <Select 
            value={settings.language || "en"} 
            onValueChange={(value) => onUpdate({ language: value })}
          >
            <SelectTrigger data-testid="select-language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
              <SelectItem value="it">Italiano</SelectItem>
              <SelectItem value="pt">Português</SelectItem>
              <SelectItem value="zh">中文</SelectItem>
              <SelectItem value="ja">日本語</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-900 dark:text-white/60">
            Language support is coming soon. Currently only English is available.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function CurrencySettingsTab({ settings, onUpdate }: { settings: UserSettings; onUpdate: (data: Partial<UserSettings>) => void }) {
  return (
    <Card data-testid="card-currency">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Currency Settings</CardTitle>
        <CardDescription className="text-gray-900 dark:text-white/60">Set your preferred currency</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Currency</Label>
          <Select 
            value={settings.currency || "USD"} 
            onValueChange={(value) => onUpdate({ currency: value })}
          >
            <SelectTrigger data-testid="select-currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD - US Dollar ($)</SelectItem>
              <SelectItem value="EUR">EUR - Euro (€)</SelectItem>
              <SelectItem value="GBP">GBP - British Pound (£)</SelectItem>
              <SelectItem value="JPY">JPY - Japanese Yen (¥)</SelectItem>
              <SelectItem value="CAD">CAD - Canadian Dollar (C$)</SelectItem>
              <SelectItem value="AUD">AUD - Australian Dollar (A$)</SelectItem>
              <SelectItem value="CHF">CHF - Swiss Franc (CHF)</SelectItem>
              <SelectItem value="CNY">CNY - Chinese Yuan (¥)</SelectItem>
              <SelectItem value="INR">INR - Indian Rupee (₹)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

function AppearanceSettingsTab({ settings, onUpdate }: { settings: UserSettings; onUpdate: (data: Partial<UserSettings>) => void }) {
  return (
    <Card data-testid="card-appearance">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Appearance</CardTitle>
        <CardDescription className="text-gray-900 dark:text-white/60">Customize the look and feel</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select 
              value={settings.theme || "light"} 
              onValueChange={(value) => {
                onUpdate({ theme: value });
                // Apply theme immediately
                if (value === "dark") {
                  document.documentElement.classList.add("dark");
                } else {
                  document.documentElement.classList.remove("dark");
                }
              }}
            >
              <SelectTrigger data-testid="select-theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="auto">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Font Size</Label>
            <Select 
              value={settings.fontSize || "medium"} 
              onValueChange={(value) => onUpdate({ fontSize: value })}
            >
              <SelectTrigger data-testid="select-font-size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Compact Mode</Label>
              <p className="text-sm text-gray-900 dark:text-white/60">Reduce spacing and padding</p>
            </div>
            <Switch 
              checked={settings.compactMode ?? false}
              onCheckedChange={(checked) => onUpdate({ compactMode: checked })}
              data-testid="switch-compact-mode"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PrintSettingsTab({ settings, onUpdate }: { settings: UserSettings; onUpdate: (data: Partial<UserSettings>) => void }) {
  const printSettings = settings.printSettings as any || {
    paperSize: "A4",
    includeHeader: true,
    includeFooter: true,
    showLogo: true,
  };

  const updatePrintSettings = (updates: any) => {
    onUpdate({
      printSettings: { ...printSettings, ...updates }
    });
  };

  return (
    <Card data-testid="card-print">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Print Settings</CardTitle>
        <CardDescription className="text-gray-900 dark:text-white/60">Configure print layout and options</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Paper Size</Label>
            <Select 
              value={printSettings.paperSize} 
              onValueChange={(value) => updatePrintSettings({ paperSize: value })}
            >
              <SelectTrigger data-testid="select-paper-size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4</SelectItem>
                <SelectItem value="Letter">Letter</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Include Header</Label>
              <p className="text-sm text-gray-900 dark:text-white/60">Show header on printed pages</p>
            </div>
            <Switch 
              checked={printSettings.includeHeader}
              onCheckedChange={(checked) => updatePrintSettings({ includeHeader: checked })}
              data-testid="switch-include-header"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Include Footer</Label>
              <p className="text-sm text-gray-900 dark:text-white/60">Show footer on printed pages</p>
            </div>
            <Switch 
              checked={printSettings.includeFooter}
              onCheckedChange={(checked) => updatePrintSettings({ includeFooter: checked })}
              data-testid="switch-include-footer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Show Logo</Label>
              <p className="text-sm text-gray-900 dark:text-white/60">Display company logo on prints</p>
            </div>
            <Switch 
              checked={printSettings.showLogo}
              onCheckedChange={(checked) => updatePrintSettings({ showLogo: checked })}
              data-testid="switch-show-logo"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function KeyboardShortcutsTab({ settings, onUpdate }: { settings: UserSettings; onUpdate: (data: Partial<UserSettings>) => void }) {
  const shortcuts = [
    { key: "Cmd/Ctrl + K", description: "Open quick actions" },
    { key: "Cmd/Ctrl + Z", description: "Undo last action" },
    { key: "Cmd/Ctrl + Shift + Z", description: "Redo action" },
    { key: "Cmd/Ctrl + S", description: "Save current form" },
    { key: "Cmd/Ctrl + P", description: "Print current page" },
    { key: "Cmd/Ctrl + F", description: "Search" },
    { key: "Esc", description: "Close dialog/modal" },
  ];

  return (
    <Card data-testid="card-shortcuts">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Keyboard Shortcuts</CardTitle>
        <CardDescription className="text-gray-900 dark:text-white/60">Available keyboard shortcuts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Label>Enable Keyboard Shortcuts</Label>
            <p className="text-sm text-gray-900 dark:text-white/60">Use keyboard shortcuts for quick actions</p>
          </div>
          <Switch 
            checked={settings.enableKeyboardShortcuts ?? true}
            onCheckedChange={(checked) => onUpdate({ enableKeyboardShortcuts: checked })}
            data-testid="switch-enable-shortcuts"
          />
        </div>

        <div className="space-y-2">
          {shortcuts.map((shortcut, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
              data-testid={`shortcut-${index}`}
            >
              <span className="text-sm text-gray-900 dark:text-white/60">{shortcut.description}</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg dark:text-gray-100">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
