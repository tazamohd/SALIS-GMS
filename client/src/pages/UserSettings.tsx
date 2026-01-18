import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Shield, Palette, Save } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { RoleBadge } from "@/components/RoleBadge";

export default function UserSettings() {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();

  return (
    <div className="min-h-screen bg-background p-6" data-testid="user-settings-page">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="page-title">{t('userSettings.title', 'User Settings')}</h1>
            <p className="text-muted-foreground mt-1" data-testid="page-description">{t('userSettings.description', 'Manage your account preferences and settings')}</p>
          </div>
          <RoleBadge size="md" />
        </div>
        
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground">
            {hasPermission('settings', 'manage_settings') 
              ? t('userSettings.fullAccess', 'Full access to manage all settings')
              : t('userSettings.personalSettingsOnly', 'Personal settings only - system settings require admin access')
            }
          </span>
        </div>

        <Card className="border-border bg-card" data-testid="card-profile">
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

        <Card className="border-border bg-card" data-testid="card-notifications">
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
              <div key={item.id} data-testid={`setting-${item.id}`} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div>
                  <p className="text-foreground font-medium">{t(item.labelKey, item.labelFallback)}</p>
                  <p className="text-sm text-muted-foreground">{t(item.descKey, item.descFallback)}</p>
                </div>
                <Switch data-testid={`switch-${item.id}`} defaultChecked={idx < 3} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border bg-card" data-testid="card-appearance">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2"><Palette className="w-5 h-5 text-primary" /> {t('userSettings.appearance', 'Appearance')}</CardTitle>
            <CardDescription>{t('userSettings.customizeInterfaceTheme', 'Customize your interface appearance')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div data-testid="setting-compact-mode" className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div>
                <p className="text-foreground font-medium">{t('userSettings.compactMode', 'Compact Mode')}</p>
                <p className="text-sm text-muted-foreground">{t('userSettings.reduceSpacingInUi', 'Reduce spacing in UI')}</p>
              </div>
              <Switch data-testid="switch-compact-mode" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button data-testid="button-save" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Save className="w-4 h-4 mr-2" />
            {t('userSettings.saveChanges', 'Save Changes')}
          </Button>
        </div>
      </div>
    </div>
  );
}
