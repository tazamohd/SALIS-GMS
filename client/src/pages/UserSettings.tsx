import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Shield, Palette, Save, Moon, Sun, Check } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { RoleBadge } from "@/components/RoleBadge";
import { useTheme, type Theme } from "@/hooks/useTheme";

export default function UserSettings() {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const { theme: currentTheme, setTheme: handleThemeChange } = useTheme();

  const THEMES: { id: Theme; labelKey: string; descKey: string; icon: typeof Sun; }[] = [
    { id: "kingdom-future", labelKey: "userSettings.themeNightSky", descKey: "userSettings.themeNightSkyDesc", icon: Moon },
    { id: "kingdom-future-light", labelKey: "userSettings.themeMorningSun", descKey: "userSettings.themeMorningSunDesc", icon: Sun },
  ];

  return (
    <div className="min-h-screen bg-background p-6" data-testid="user-settings-page">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground" data-testid="page-title">{t('userSettings.title', 'User Settings')}</h1>
            <p className="text-muted-foreground mt-1" data-testid="page-description">{t('userSettings.description', 'Manage your account preferences and settings')}</p>
          </div>
          <RoleBadge size="md" />
        </div>
        
        <div className="flex items-center gap-3 p-3 rounded-lg glass-card">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground">
            {hasPermission('settings', 'manage_settings') 
              ? t('userSettings.fullAccess', 'Full access to manage all settings')
              : t('userSettings.personalSettingsOnly', 'Personal settings only - system settings require admin access')
            }
          </span>
        </div>

        <Card className="glass-card" data-testid="card-profile">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2"><User className="w-5 h-5 text-primary" /> {t('userSettings.profileInformation', 'Profile Information')}</CardTitle>
            <CardDescription>{t('userSettings.updatePersonalDetails', 'Update your personal details')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('userSettings.firstName', 'First Name')}</Label>
                <Input data-testid="input-first-name" defaultValue="Ahmed" />
              </div>
              <div className="space-y-2">
                <Label>{t('userSettings.lastName', 'Last Name')}</Label>
                <Input data-testid="input-last-name" defaultValue="Hassan" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('userSettings.email', 'Email')}</Label>
              <Input data-testid="input-email" defaultValue="ahmed@salisauto.com" />
            </div>
            <div className="space-y-2">
              <Label>{t('userSettings.phone', 'Phone')}</Label>
              <Input data-testid="input-phone" defaultValue="+966 50 123 4567" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card" data-testid="card-notifications">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2"><Bell className="w-5 h-5 text-primary" /> {t('userSettings.notifications', 'Notifications')}</CardTitle>
            <CardDescription>{t('userSettings.configureNotificationPreferences', 'Configure your notification preferences')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: "email", labelKey: "userSettings.emailNotifications", descKey: "userSettings.receiveUpdatesViaEmail", labelFallback: "Email Notifications", descFallback: "Receive updates via email" },
              { id: "sms", labelKey: "userSettings.smsNotifications", descKey: "userSettings.receiveUpdatesViaSms", labelFallback: "SMS Notifications", descFallback: "Receive updates via SMS" },
              { id: "push", labelKey: "userSettings.pushNotifications", descKey: "userSettings.receiveBrowserPushNotifications", labelFallback: "Push Notifications", descFallback: "Receive browser push notifications" },
              { id: "jobs", labelKey: "userSettings.jobAssignments", descKey: "userSettings.notifyWhenAssignedNewJobs", labelFallback: "Job Assignments", descFallback: "Notify when assigned new jobs" },
            ].map((item, idx) => (
              <div key={item.id} data-testid={`setting-${item.id}`} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-foreground font-medium">{t(item.labelKey, item.labelFallback)}</p>
                  <p className="text-sm text-muted-foreground">{t(item.descKey, item.descFallback)}</p>
                </div>
                <Switch data-testid={`switch-${item.id}`} defaultChecked={idx < 3} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card" data-testid="card-appearance">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2"><Palette className="w-5 h-5 text-primary" /> {t('userSettings.appearance', 'Appearance')}</CardTitle>
            <CardDescription>{t('userSettings.customizeInterfaceTheme', 'Customize your interface appearance')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label className="font-medium">{t('userSettings.theme', 'Theme')}</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {THEMES.map((themeOption) => {
                  const Icon = themeOption.icon;
                  const isActive = currentTheme === themeOption.id;
                  return (
                    <button
                      key={themeOption.id}
                      onClick={() => handleThemeChange(themeOption.id)}
                      data-testid={`theme-option-${themeOption.id}`}
                      className={`relative p-4 rounded-xl border transition-all duration-200 text-left glow-on-hover ${
                        isActive 
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/50 active-glow' 
                          : 'border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-primary/20' : 'bg-muted'}`}>
                          <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm ${isActive ? 'neon-text' : 'text-foreground'}`}>
                            {t(themeOption.labelKey, themeOption.id === 'kingdom-future' ? 'The Night Sky' : 'The Morning Sun')}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {t(themeOption.descKey, themeOption.id === 'kingdom-future' ? 'Dark mode for dashboards' : 'Light mode for daylight')}
                          </p>
                        </div>
                        {isActive && (
                          <Check className="w-4 h-4 text-primary absolute top-2 right-2" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div data-testid="setting-compact-mode" className="flex items-center justify-between p-3 rounded-lg bg-muted/50 mt-4">
              <div>
                <p className="text-foreground font-medium">{t('userSettings.compactMode', 'Compact Mode')}</p>
                <p className="text-sm text-muted-foreground">{t('userSettings.reduceSpacingInUi', 'Reduce spacing in UI')}</p>
              </div>
              <Switch data-testid="switch-compact-mode" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button data-testid="button-save" className="bg-primary hover:bg-primary/90 text-primary-foreground glow-on-hover">
            <Save className="w-4 h-4 mr-2" />
            {t('userSettings.saveChanges', 'Save Changes')}
          </Button>
        </div>
      </div>
    </div>
  );
}
