import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import type { User } from "@shared/schema";
import { LogOut, Shield, User as UserIcon, Home as HomeIcon } from "lucide-react";
import { StandardPageLayout } from "@/components/layouts";

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth() as { user: User | undefined };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || 'U';
  };

  return (
    <StandardPageLayout
      title={t('nav.dashboard', 'Dashboard')}
      description={t('home.manageAccountSettings', 'Manage your account and settings')}
      icon={HomeIcon}
      actions={[
        {
          label: t('auth.signOut', 'Sign Out'),
          onClick: () => window.location.href = '/api/logout',
          icon: LogOut,
          variant: "outline",
        },
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-[#E2E8F0] dark:border-[#232A36]">
                <AvatarImage src={user?.profileImageUrl || ''} />
                <AvatarFallback className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white font-semibold">
                  {getInitials(user?.firstName, user?.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl text-[#0B1F3B] dark:text-white">
                  {t('home.welcomeBack', 'Welcome back')}, {user?.firstName || user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || t('home.user', 'User')}!
                </CardTitle>
                <CardDescription className="text-[#64748B]">
                  {user?.email || t('home.manageAccountSettingsBelow', 'Manage your account and settings below')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <UserIcon className="h-5 w-5 text-[#0A5ED7]" />
                {t('home.profileInformation', 'Profile Information')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm font-medium text-[#64748B]">{t('home.name', 'Name')}:</span>
                <p className="text-[#0B1F3B] dark:text-white">
                  {user?.firstName || user?.lastName 
                    ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
                    : t('home.notProvided', 'Not provided')
                  }
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-[#64748B]">{t('auth.email', 'Email')}:</span>
                <p className="text-[#0B1F3B] dark:text-white">{user?.email || t('home.notProvided', 'Not provided')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-[#64748B]">{t('home.userId', 'User ID')}:</span>
                <p className="text-[#0B1F3B] dark:text-white font-mono text-sm">{user?.id}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <Shield className="h-5 w-5 text-[#0A5ED7]" />
                {t('home.accountSecurity', 'Account Security')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#0B1F3B] dark:text-white">{t('home.authentication', 'Authentication')}</span>
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                    {t('home.secured', 'Secured')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#0B1F3B] dark:text-white">{t('home.sessionActive', 'Session Active')}</span>
                  <span className="text-xs bg-[#0A5ED7]/10 dark:bg-[#0BB3FF]/20 text-[#0A5ED7] dark:text-[#0BB3FF] px-2 py-1 rounded">
                    {t('home.connected', 'Connected')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('common.quick_actions', 'Quick Actions')}</CardTitle>
            <CardDescription className="text-[#64748B]">
              {t('home.commonTasksSettings', 'Common tasks and settings for your account')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF]" 
                data-testid="button-edit-profile"
              >
                <UserIcon className="h-6 w-6 mb-2 text-[#0A5ED7]" />
                {t('home.editProfile', 'Edit Profile')}
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF]" 
                data-testid="button-security-settings"
              >
                <Shield className="h-6 w-6 mb-2 text-[#0A5ED7]" />
                {t('home.securitySettings', 'Security Settings')}
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF]" 
                data-testid="button-sign-out-quick"
              >
                <LogOut className="h-6 w-6 mb-2 text-[#64748B]" />
                {t('auth.signOut', 'Sign Out')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </StandardPageLayout>
  );
}
