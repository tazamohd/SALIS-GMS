import { Button } from "@/components/ui/button";
import logoImage from "@assets/Logo_blue_orange_1760743036292.png";

export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
      <div className="text-center space-y-8 px-4 max-w-md">
        {/* SALIS AUTO Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src={logoImage} 
            alt="SALIS AUTO" 
            className="w-48 h-auto"
            data-testid="logo-salis-auto-login"
          />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-montserrat font-bold text-soft-white">
            Welcome to SALIS AUTO
          </h1>
          <p className="text-lg font-poppins text-soft-white/80">
            Comprehensive Garage Management System
          </p>
          <p className="text-sm font-poppins text-soft-white/60">
            Sign in to access your dashboard and manage your garage operations efficiently.
          </p>
        </div>
        
        <div className="space-y-4 pt-4">
          <Button 
            className="bg-brand-orange hover:bg-brand-orange/90 text-white px-10 py-6 text-lg font-poppins font-semibold rounded-lg shadow-lg shadow-brand-orange/30 transition-all duration-200 w-full"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-sign-in"
          >
            Sign In with Replit
          </Button>
          <p className="text-xs font-poppins text-soft-white/50">
            Secure authentication powered by Replit
          </p>
        </div>
      </div>
    </div>
  );
}