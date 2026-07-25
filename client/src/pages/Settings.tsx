import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  const { data: settings, isLoading, isError, error } = useQuery<UserSettings>({
    queryKey: ['/api/settings'],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: Partial<UserSettings>) => apiRequest('PATCH', '/api/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({ title: t('settings.settingsUpdated', 'Settings Updated'), description: t('settings.preferencesSaved', 'Your preferences have been saved') });
    },
    onError: (error: any) => {
      toast({ title: t('settings.updateFailed', 'Update Failed'), description: error.message, variant: "destructive" });
    },
  });

  const handleUpdateSettings = (updates: Partial<UserSettings>) => {
    updateSettingsMutation.mutate(updates);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC] dark:bg-[#0E1117]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A5ED7] mx-auto"></div>
          <p className="mt-4 text-[#64748B]">{t('settings.loadingSettings', 'Loading settings...')}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC] dark:bg-[#0E1117]">
        <div className="text-center">
          <div className="text-[#F97316] text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-[#0B1F3B] dark:text-white mb-2">{t('settings.failedToLoad', 'Failed to Load Settings')}</h2>
          <p className="text-[#64748B] mb-4">
            {error instanceof Error ? error.message : t('settings.unableToConnect', 'Unable to connect to server')}
          </p>
          <Button onClick={() => window.location.reload()} data-testid="button-retry" className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white">
            {t('common.retry', 'Retry')}
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
      label: t('settings.general', 'General'),
      icon: SettingsIcon,
      content: <GeneralSettingsTab settings={settings} onUpdate={handleUpdateSettings} />,
    },
    {
      id: "language",
      label: t('settings.language', 'Language'),
      icon: Globe,
      content: <LanguageSettingsTab settings={settings} onUpdate={handleUpdateSettings} />,
    },
    {
      id: "currency",
      label: t('settings.currency', 'Currency'),
      icon: DollarSign,
      content: <CurrencySettingsTab settings={settings} onUpdate={handleUpdateSettings} />,
    },
    {
      id: "appearance",
      label: t('settings.appearance', 'Appearance'),
      icon: Palette,
      content: <AppearanceSettingsTab settings={settings} onUpdate={handleUpdateSettings} />,
    },
    {
      id: "print",
      label: t('settings.print', 'Print'),
      icon: Printer,
      content: <PrintSettingsTab settings={settings} onUpdate={handleUpdateSettings} />,
    },
    {
      id: "shortcuts",
      label: t('settings.shortcuts', 'Shortcuts'),
      icon: Keyboard,
      content: <KeyboardShortcutsTab settings={settings} onUpdate={handleUpdateSettings} />,
    },
  ];

  return (
    <TabsPageLayout
      title={t('settings.title', 'Settings & Preferences')}
      description={t('settings.description', 'Customize your experience')}
      icon={SettingsIcon}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}

function GeneralSettingsTab({ settings, onUpdate }: { settings: UserSettings; onUpdate: (data: Partial<UserSettings>) => void }) {
  const { t } = useTranslation();
  return (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-general">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('settings.generalSettings', 'General Settings')}</CardTitle>
        <CardDescription className="text-[#64748B]">{t('settings.configureBasicPreferences', 'Configure your basic preferences')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[#0B1F3B] dark:text-white">{t('settings.timezone', 'Timezone')}</Label>
            <Select 
              value={settings.timezone || "UTC"} 
              onValueChange={(value) => onUpdate({ timezone: value })}
            >
              <SelectTrigger data-testid="select-timezone" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">{t('settings.easternTime', 'Eastern Time')}</SelectItem>
                <SelectItem value="America/Chicago">{t('settings.centralTime', 'Central Time')}</SelectItem>
                <SelectItem value="America/Denver">{t('settings.mountainTime', 'Mountain Time')}</SelectItem>
                <SelectItem value="America/Los_Angeles">{t('settings.pacificTime', 'Pacific Time')}</SelectItem>
                <SelectItem value="Europe/London">{t('settings.london', 'London')}</SelectItem>
                <SelectItem value="Europe/Paris">{t('settings.paris', 'Paris')}</SelectItem>
                <SelectItem value="Asia/Tokyo">{t('settings.tokyo', 'Tokyo')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[#0B1F3B] dark:text-white">{t('settings.dateFormat', 'Date Format')}</Label>
            <Select 
              value={settings.dateFormat || "MM/DD/YYYY"} 
              onValueChange={(value) => onUpdate({ dateFormat: value })}
            >
              <SelectTrigger data-testid="select-date-format" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[#0B1F3B] dark:text-white">{t('settings.timeFormat', 'Time Format')}</Label>
            <Select 
              value={settings.timeFormat || "12h"} 
              onValueChange={(value) => onUpdate({ timeFormat: value })}
            >
              <SelectTrigger data-testid="select-time-format" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <SelectItem value="12h">{t('settings.12hour', '12-hour')}</SelectItem>
                <SelectItem value="24h">{t('settings.24hour', '24-hour')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-[#0B1F3B] dark:text-white">{t('settings.notifications', 'Notifications')}</Label>
              <p className="text-sm text-[#64748B]">{t('settings.receiveSystemNotifications', 'Receive system notifications')}</p>
            </div>
            <Switch 
              checked={settings.enableNotifications ?? true}
              onCheckedChange={(checked) => onUpdate({ enableNotifications: checked })}
              data-testid="switch-notifications"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-[#0B1F3B] dark:text-white">{t('settings.soundEffects', 'Sound Effects')}</Label>
              <p className="text-sm text-[#64748B]">{t('settings.playSoundsForNotifications', 'Play sounds for notifications')}</p>
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
  const { t } = useTranslation();
  return (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-language">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('settings.languageRegion', 'Language & Region')}</CardTitle>
        <CardDescription className="text-[#64748B]">{t('settings.choosePreferredLanguage', 'Choose your preferred language')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[#0B1F3B] dark:text-white">{t('settings.language', 'Language')}</Label>
          <Select 
            value={settings.language || "en"} 
            onValueChange={(value) => onUpdate({ language: value })}
          >
            <SelectTrigger data-testid="select-language" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ar">العربية</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
              <SelectItem value="it">Italiano</SelectItem>
              <SelectItem value="pt">Português</SelectItem>
              <SelectItem value="zh">中文</SelectItem>
              <SelectItem value="ja">日本語</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-[#64748B]">
            {t('settings.languageSupportNote', 'Language support is coming soon. Currently only English is available.')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function CurrencySettingsTab({ settings, onUpdate }: { settings: UserSettings; onUpdate: (data: Partial<UserSettings>) => void }) {
  const { t } = useTranslation();
  return (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-currency">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('settings.currencySettings', 'Currency Settings')}</CardTitle>
        <CardDescription className="text-[#64748B]">{t('settings.setPreferredCurrency', 'Set your preferred currency')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[#0B1F3B] dark:text-white">{t('settings.currency', 'Currency')}</Label>
          <Select 
            value={settings.currency || "USD"} 
            onValueChange={(value) => onUpdate({ currency: value })}
          >
            <SelectTrigger data-testid="select-currency" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <SelectItem value="USD">USD - {t('settings.usDollar', 'US Dollar')} ($)</SelectItem>
              <SelectItem value="EUR">EUR - {t('settings.euro', 'Euro')} (€)</SelectItem>
              <SelectItem value="GBP">GBP - {t('settings.britishPound', 'British Pound')} (£)</SelectItem>
              <SelectItem value="JPY">JPY - {t('settings.japaneseYen', 'Japanese Yen')} (¥)</SelectItem>
              <SelectItem value="CAD">CAD - {t('settings.canadianDollar', 'Canadian Dollar')} (C$)</SelectItem>
              <SelectItem value="AUD">AUD - {t('settings.australianDollar', 'Australian Dollar')} (A$)</SelectItem>
              <SelectItem value="CHF">CHF - {t('settings.swissFranc', 'Swiss Franc')} (CHF)</SelectItem>
              <SelectItem value="CNY">CNY - {t('settings.chineseYuan', 'Chinese Yuan')} (¥)</SelectItem>
              <SelectItem value="INR">INR - {t('settings.indianRupee', 'Indian Rupee')} (₹)</SelectItem>
              <SelectItem value="SAR">SAR - {t('settings.saudiRiyal', 'Saudi Riyal')} (﷼)</SelectItem>
              <SelectItem value="AED">AED - {t('settings.emiratiDirham', 'Emirati Dirham')} (د.إ)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

function AppearanceSettingsTab({ settings, onUpdate }: { settings: UserSettings; onUpdate: (data: Partial<UserSettings>) => void }) {
  const { t } = useTranslation();
  return (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-appearance">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('settings.appearance', 'Appearance')}</CardTitle>
        <CardDescription className="text-[#64748B]">{t('settings.customizeLookAndFeel', 'Customize the look and feel')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[#0B1F3B] dark:text-white">{t('settings.theme', 'Theme')}</Label>
            <Select 
              value={settings.theme || "light"} 
              onValueChange={(value) => {
                onUpdate({ theme: value });
                if (value === "dark") {
                  document.documentElement.classList.add("dark");
                } else {
                  document.documentElement.classList.remove("dark");
                }
              }}
            >
              <SelectTrigger data-testid="select-theme" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <SelectItem value="light">{t('settings.light', 'Light')}</SelectItem>
                <SelectItem value="dark">{t('settings.dark', 'Dark')}</SelectItem>
                <SelectItem value="auto">{t('settings.system', 'System')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[#0B1F3B] dark:text-white">{t('settings.fontSize', 'Font Size')}</Label>
            <Select 
              value={settings.fontSize || "medium"} 
              onValueChange={(value) => onUpdate({ fontSize: value })}
            >
              <SelectTrigger data-testid="select-font-size" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <SelectItem value="small">{t('settings.small', 'Small')}</SelectItem>
                <SelectItem value="medium">{t('settings.medium', 'Medium')}</SelectItem>
                <SelectItem value="large">{t('settings.large', 'Large')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-[#0B1F3B] dark:text-white">{t('settings.compactMode', 'Compact Mode')}</Label>
              <p className="text-sm text-[#64748B]">{t('settings.reduceSpacingAndPadding', 'Reduce spacing and padding')}</p>
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
  const { t } = useTranslation();
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
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-print">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('settings.printSettings', 'Print Settings')}</CardTitle>
        <CardDescription className="text-[#64748B]">{t('settings.configurePrintLayout', 'Configure print layout and options')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[#0B1F3B] dark:text-white">{t('settings.paperSize', 'Paper Size')}</Label>
            <Select 
              value={printSettings.paperSize} 
              onValueChange={(value) => updatePrintSettings({ paperSize: value })}
            >
              <SelectTrigger data-testid="select-paper-size" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <SelectItem value="A4">A4</SelectItem>
                <SelectItem value="Letter">{t('settings.letter', 'Letter')}</SelectItem>
                <SelectItem value="Legal">{t('settings.legal', 'Legal')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-[#0B1F3B] dark:text-white">{t('settings.includeHeader', 'Include Header')}</Label>
              <p className="text-sm text-[#64748B]">{t('settings.showHeaderOnPrintedPages', 'Show header on printed pages')}</p>
            </div>
            <Switch 
              checked={printSettings.includeHeader}
              onCheckedChange={(checked) => updatePrintSettings({ includeHeader: checked })}
              data-testid="switch-include-header"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-[#0B1F3B] dark:text-white">{t('settings.includeFooter', 'Include Footer')}</Label>
              <p className="text-sm text-[#64748B]">{t('settings.showFooterOnPrintedPages', 'Show footer on printed pages')}</p>
            </div>
            <Switch 
              checked={printSettings.includeFooter}
              onCheckedChange={(checked) => updatePrintSettings({ includeFooter: checked })}
              data-testid="switch-include-footer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-[#0B1F3B] dark:text-white">{t('settings.showLogo', 'Show Logo')}</Label>
              <p className="text-sm text-[#64748B]">{t('settings.displayCompanyLogoOnPrints', 'Display company logo on prints')}</p>
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
  const { t } = useTranslation();
  const shortcuts = [
    { key: "Cmd/Ctrl + K", description: t('settings.openQuickActions', 'Open quick actions') },
    { key: "Cmd/Ctrl + Z", description: t('settings.undoLastAction', 'Undo last action') },
    { key: "Cmd/Ctrl + Shift + Z", description: t('settings.redoAction', 'Redo action') },
    { key: "Cmd/Ctrl + S", description: t('settings.saveCurrentForm', 'Save current form') },
    { key: "Cmd/Ctrl + P", description: t('settings.printCurrentPage', 'Print current page') },
    { key: "Cmd/Ctrl + F", description: t('common.search', 'Search') },
    { key: "Esc", description: t('settings.closeDialogModal', 'Close dialog/modal') },
  ];

  return (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-shortcuts">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('settings.keyboardShortcuts', 'Keyboard Shortcuts')}</CardTitle>
        <CardDescription className="text-[#64748B]">{t('settings.availableKeyboardShortcuts', 'Available keyboard shortcuts')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Label className="text-[#0B1F3B] dark:text-white">{t('settings.enableKeyboardShortcuts', 'Enable Keyboard Shortcuts')}</Label>
            <p className="text-sm text-[#64748B]">{t('settings.useKeyboardShortcutsForQuickActions', 'Use keyboard shortcuts for quick actions')}</p>
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
              className="flex items-center justify-between p-3 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]"
              data-testid={`shortcut-${index}`}
            >
              <span className="text-sm text-[#64748B]">{shortcut.description}</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-[#0B1F3B] bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36] rounded-lg dark:text-white">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
