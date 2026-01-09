import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, LogIn, UserPlus, Shield, Wrench, BarChart3, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import logoImage from "@assets/Logo_blue_orange_1760743036292.png";
import { getPortalForRole } from "@shared/rbac";

export default function WelcomePage() {
  const { t } = useTranslation();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    
    if (isAuthenticated && user) {
      const userAny = user as any;
      const userRole = userAny.role || 'customer';
      const primaryPortal = getPortalForRole(userRole);
      
      setTimeout(() => {
        setLocation(primaryPortal);
      }, 1500);
    }
  }, [user, isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0E1117] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0A5ED7] dark:text-[#0BB3FF]" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    const userAny = user as any;
    const userName = userAny?.fullName || userAny?.firstName || "User";
    const userRole = userAny?.role || 'user';
    const primaryPortal = getPortalForRole(userRole);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[#F8FAFC] dark:bg-[#0E1117]"></div>
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#0A5ED7]/10 to-transparent dark:from-[#0BB3FF]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#0BB3FF]/10 to-transparent dark:from-[#0A5ED7]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="text-center space-y-6 max-w-md">
          <div className="flex justify-center mb-8">
            <img src={logoImage} alt="SALIS AUTO" className="w-40 h-auto drop-shadow-lg" />
          </div>

          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] rounded-full flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-white">{userName.charAt(0).toUpperCase()}</span>
          </div>
          
          <h1 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">
            {t('welcome.welcomeBack', 'Welcome back')}, {userName}!
          </h1>
          
          <p className="text-[#64748B]">
            {t('welcome.role', 'Role')}: <span className="font-medium text-[#0A5ED7] dark:text-[#0BB3FF] capitalize">{userRole.replace(/_/g, ' ')}</span>
          </p>
          
          <div className="flex items-center justify-center gap-2 text-[#64748B]">
            <Loader2 className="h-4 w-4 animate-spin text-[#0A5ED7]" />
            <span>{t('welcome.redirecting', 'Redirecting to your portal...')}</span>
          </div>
          
          <p className="text-sm text-[#64748B]">
            {t('welcome.takingYouTo', 'Taking you to')} <span className="text-[#0A5ED7] dark:text-[#0BB3FF]">{primaryPortal}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#F8FAFC] dark:bg-[#0E1117]"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#0A5ED7]/10 to-transparent dark:from-[#0BB3FF]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#0BB3FF]/10 to-transparent dark:from-[#0A5ED7]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-[#F97316]/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoImage} alt="SALIS AUTO" className="h-10 w-auto" />
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="outline" className="border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10">
              <LogIn className="h-4 w-4 mr-2" />
              {t('auth.login', 'Login')}
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90">
              <UserPlus className="h-4 w-4 mr-2" />
              {t('auth.register', 'Register')}
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center max-w-3xl mx-auto space-y-8">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <img src={logoImage} alt="SALIS AUTO" className="relative w-48 h-auto drop-shadow-lg" data-testid="logo-salis-auto" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-[#0B1F3B] dark:text-white leading-tight">
            {t('welcome.headline', 'World-Class Automotive ERP Platform')}
          </h1>
          
          <p className="text-xl text-[#64748B] max-w-2xl mx-auto">
            {t('welcome.subheadline', 'Enterprise-grade garage management with AI automation, real-time diagnostics, and complete workflow control.')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90 px-8">
                <LogIn className="h-5 w-5 mr-2" />
                {t('auth.signIn', 'Sign In to Dashboard')}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10 px-8">
                <UserPlus className="h-5 w-5 mr-2" />
                {t('auth.createAccount', 'Create Account')}
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
          <Card className="bg-white/80 dark:bg-[#151A23]/80 backdrop-blur border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="pt-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-[#0A5ED7]/10 rounded-xl flex items-center justify-center">
                <Wrench className="h-7 w-7 text-[#0A5ED7]" />
              </div>
              <h3 className="font-semibold text-[#0B1F3B] dark:text-white mb-2">
                {t('welcome.feature1Title', 'Complete Workshop Control')}
              </h3>
              <p className="text-sm text-[#64748B]">
                {t('welcome.feature1Desc', 'Job cards, scheduling, technician assignment, and real-time service tracking.')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-[#151A23]/80 backdrop-blur border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="pt-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-[#0BB3FF]/10 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-7 w-7 text-[#0BB3FF]" />
              </div>
              <h3 className="font-semibold text-[#0B1F3B] dark:text-white mb-2">
                {t('welcome.feature2Title', 'Business Intelligence')}
              </h3>
              <p className="text-sm text-[#64748B]">
                {t('welcome.feature2Desc', 'KPI dashboards, revenue analytics, and AI-powered predictive insights.')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-[#151A23]/80 backdrop-blur border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="pt-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-[#F97316]/10 rounded-xl flex items-center justify-center">
                <Users className="h-7 w-7 text-[#F97316]" />
              </div>
              <h3 className="font-semibold text-[#0B1F3B] dark:text-white mb-2">
                {t('welcome.feature3Title', 'Multi-Role Access')}
              </h3>
              <p className="text-sm text-[#64748B]">
                {t('welcome.feature3Desc', '24 professional roles with dedicated portals for technicians, managers, and customers.')}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="p-6 text-center text-sm text-[#64748B]">
        <p>&copy; {new Date().getFullYear()} SALIS AUTO. {t('welcome.allRightsReserved', 'All rights reserved.')}</p>
      </footer>
    </div>
  );
}
