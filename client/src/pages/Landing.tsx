import { Button } from "@/components/ui/button";
import logoImage from "@assets/Logo_blue_orange_1760743036292.png";
import { Link } from "wouter";
import { useTranslation } from 'react-i18next';

export default function Landing() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B1F3B] via-[#0E1117] to-[#0B1F3B]">
      <div className="text-center space-y-8 px-4 max-w-md">
        <div className="flex justify-center mb-8">
          <img 
            src={logoImage} 
            alt={t('app.name', 'SALIS AUTO')}
            className="w-48 h-auto"
            data-testid="logo-salis-auto-login"
          />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-montserrat font-bold text-white">
            {t('landing.welcomeTitle', 'Welcome to SALIS AUTO')}
          </h1>
          <p className="text-lg font-poppins text-white/90">
            {t('app.tagline', 'Comprehensive Garage Management System')}
          </p>
          <p className="text-sm font-poppins text-[#64748B]">
            {t('landing.signInPrompt', 'Sign in to access your dashboard and manage your garage operations efficiently.')}
          </p>
        </div>
        
        <div className="space-y-4 pt-4">
          <Link href="/login">
            <Button 
              className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white px-10 py-6 text-lg font-poppins font-semibold rounded-lg shadow-lg shadow-black/30 transition-all duration-200 w-full border-0"
              data-testid="button-sign-in"
            >
              {t('auth.signIn', 'Sign In')}
            </Button>
          </Link>
          <Link href="/register">
            <Button 
              className="bg-transparent hover:bg-white/10 text-white px-10 py-6 text-lg font-poppins font-semibold rounded-lg shadow-lg shadow-black/30 transition-all duration-200 w-full border border-[#232A36]"
              data-testid="button-register"
            >
              {t('auth.createAccount', 'Create Account')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
