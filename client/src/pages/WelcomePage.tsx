import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import logoImage from "@assets/Logo_blue_orange_1760743036292.png";

export default function WelcomePage() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      setLocation("/login");
      return;
    }

    const userAny = user as any;
    const primaryPortal = userAny.primaryPortal || "/dashboard";
    
    setTimeout(() => {
      setLocation(primaryPortal);
    }, 1500);
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0E1117] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0A5ED7] dark:text-[#0BB3FF]" />
      </div>
    );
  }

  const userAny = user as any;
  const userName = userAny?.firstName || "User";
  const primaryPortal = userAny?.primaryPortal || "/dashboard";
  const roles = userAny?.roles || [];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#F8FAFC] dark:bg-[#0E1117]" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#0A5ED7]/10 to-transparent dark:from-[#0BB3FF]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#0BB3FF]/10 to-transparent dark:from-[#0A5ED7]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-[#F97316]/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center mb-8">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
            <img 
              src={logoImage} 
              alt={t('app.name', 'SALIS AUTO')} 
              className="relative w-40 h-auto drop-shadow-lg"
              data-testid="logo-salis-auto"
            />
          </div>
        </div>

        <div className="w-20 h-20 mx-auto bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] rounded-full flex items-center justify-center shadow-lg shadow-[#0A5ED7]/25">
          <span className="text-3xl font-bold text-white">
            {userName.charAt(0).toUpperCase()}
          </span>
        </div>
        
        <h1 className="text-2xl font-montserrat font-bold text-[#0B1F3B] dark:text-white">
          {t('welcome.welcomeBack', 'Welcome back')}, {userName}!
        </h1>
        
        {roles.length > 0 && (
          <p className="text-[#64748B] font-poppins">
            {t('welcome.loggedInAs', 'Logged in as')}: <span className="font-medium text-[#0A5ED7] dark:text-[#0BB3FF]">{roles.join(", ")}</span>
          </p>
        )}
        
        <div className="flex items-center justify-center gap-2 text-[#64748B] font-poppins">
          <Loader2 className="h-4 w-4 animate-spin text-[#0A5ED7] dark:text-[#0BB3FF]" />
          <span>{t('welcome.redirecting', 'Redirecting to your portal...')}</span>
        </div>
        
        <p className="text-sm text-[#64748B] font-poppins">
          {t('welcome.takingYouTo', 'Taking you to')} <span className="text-[#0A5ED7] dark:text-[#0BB3FF]">{primaryPortal}</span>
        </p>
      </div>
    </div>
  );
}
