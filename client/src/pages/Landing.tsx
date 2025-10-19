import { Button } from "@/components/ui/button";
import logoImage from "@assets/Logo_blue_orange_1760743036292.png";

export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-salis-black to-gray-900">
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
          <h1 className="text-3xl md:text-4xl font-montserrat font-bold text-white">
            Welcome to SALIS AUTO
          </h1>
          <p className="text-lg font-poppins text-gray-200">
            Comprehensive Garage Management System
          </p>
          <p className="text-sm font-poppins text-gray-400">
            Sign in to access your dashboard and manage your garage operations efficiently.
          </p>
        </div>
        
        <div className="space-y-4 pt-4">
          <Button 
            className="bg-salis-black hover:bg-gray-100 dark:hover:bg-salis-gray-dark text-white px-10 py-6 text-lg font-poppins font-semibold rounded-lg shadow-lg shadow-black/30 transition-all duration-200 w-full border border-white"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-sign-in"
          >
            Sign In with Replit
          </Button>
          <p className="text-xs font-poppins text-gray-500">
            Secure authentication powered by Replit
          </p>
        </div>
      </div>
    </div>
  );
}