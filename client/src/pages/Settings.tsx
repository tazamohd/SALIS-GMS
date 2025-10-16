import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Settings as SettingsIcon, Globe, DollarSign, Palette, Printer, Keyboard, RotateCcw } from "lucide-react";
import type { UserSettings } from "@shared/schema";

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  const { data: settings, isLoading } = useQuery<UserSettings>({
    queryKey: ['/api/settings'],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: Partial<UserSettings>) => apiRequest('/api/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
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

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="page-settings">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Settings & Preferences</h1>
          <p className="text-muted-foreground">Customize your experience</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" data-testid="tab-general">
            <SettingsIcon className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="language" data-testid="tab-language">
            <Globe className="h-4 w-4 mr-2" />
            Language
          </TabsTrigger>
          <TabsTrigger value="currency" data-testid="tab-currency">
            <DollarSign className="h-4 w-4 mr-2" />
            Currency
          </TabsTrigger>
          <TabsTrigger value="appearance" data-testid="tab-appearance">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="print" data-testid="tab-print">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </TabsTrigger>
          <TabsTrigger value="shortcuts" data-testid="tab-shortcuts">
            <Keyboard className="h-4 w-4 mr-2" />
            Shortcuts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <GeneralSettingsTab settings={settings} onUpdate={handleUpdateSettings} />
        </TabsContent>

        <TabsContent value="language" className="space-y-4">
          <LanguageSettingsTab settings={settings} onUpdate={handleUpdateSettings} />
        </TabsContent>

        <TabsContent value="currency" className="space-y-4">
          <CurrencySettingsTab settings={settings} onUpdate={handleUpdateSettings} />
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <AppearanceSettingsTab settings={settings} onUpdate={handleUpdateSettings} />
        </TabsContent>

        <TabsContent value="print" className="space-y-4">
          <PrintSettingsTab settings={settings} onUpdate={handleUpdateSettings} />
        </TabsContent>

        <TabsContent value="shortcuts" className="space-y-4">
          <KeyboardShortcutsTab settings={settings} onUpdate={handleUpdateSettings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GeneralSettingsTab({ settings, onUpdate }: { settings: UserSettings; onUpdate: (data: Partial<UserSettings>) => void }) {
  return (
    <Card data-testid="card-general">
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>Configure your basic preferences</CardDescription>
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
              <p className="text-sm text-muted-foreground">Receive system notifications</p>
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
              <p className="text-sm text-muted-foreground">Play sounds for notifications</p>
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
        <CardTitle>Language & Region</CardTitle>
        <CardDescription>Choose your preferred language</CardDescription>
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
          <p className="text-sm text-muted-foreground">
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
        <CardTitle>Currency Settings</CardTitle>
        <CardDescription>Set your preferred currency</CardDescription>
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
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Customize the look and feel</CardDescription>
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
              <p className="text-sm text-muted-foreground">Reduce spacing and padding</p>
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
        <CardTitle>Print Settings</CardTitle>
        <CardDescription>Configure print layout and options</CardDescription>
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
              <p className="text-sm text-muted-foreground">Show header on printed pages</p>
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
              <p className="text-sm text-muted-foreground">Show footer on printed pages</p>
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
              <p className="text-sm text-muted-foreground">Display company logo on prints</p>
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
        <CardTitle>Keyboard Shortcuts</CardTitle>
        <CardDescription>Available keyboard shortcuts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Label>Enable Keyboard Shortcuts</Label>
            <p className="text-sm text-muted-foreground">Use keyboard shortcuts for quick actions</p>
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
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
