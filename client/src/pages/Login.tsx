import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import logoImage from "@assets/Logo_blue_orange_1760743036292.png";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Mail, Lock, Wrench, Settings, Car, Gauge } from "lucide-react";

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/login", credentials);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: t('common.success', 'Success'),
        description: t('auth.loggedInSuccessfully', 'Logged in successfully'),
      });
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: t('auth.loginFailed', 'Login Failed'),
        description: error.message || t('auth.invalidCredentials', 'Invalid email or password'),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: t('common.error', 'Error'),
        description: t('auth.fillAllFields', 'Please fill in all fields'),
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0A0D14]">
      {/* Deep Space Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0D14] via-[#0E1420] to-[#0A0D14]"></div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-gradient-to-bl from-[#0A5ED7]/15 via-[#0BB3FF]/8 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-[#0BB3FF]/12 via-[#0A5ED7]/6 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-[#F97316]/8 to-transparent rounded-full blur-3xl animate-pulse"></div>
        
        {/* Automotive Watermark Icons - Scattered */}
        <div className="absolute inset-0 overflow-hidden opacity-[0.04]">
          {/* Large Gear/Settings - Top Left */}
          <Settings className="absolute top-[10%] left-[5%] w-48 h-48 text-[#0BB3FF] transform rotate-12" />
          
          {/* Wrench - Top Right */}
          <Wrench className="absolute top-[15%] right-[10%] w-40 h-40 text-[#0A5ED7] transform -rotate-45" />
          
          {/* Car Silhouette - Center Left */}
          <Car className="absolute top-[40%] left-[8%] w-56 h-56 text-[#F97316] transform -rotate-6" />
          
          {/* Gauge/Speedometer - Center Right */}
          <Gauge className="absolute top-[35%] right-[5%] w-44 h-44 text-[#0BB3FF] transform rotate-15" />
          
          {/* Settings - Bottom Left */}
          <Settings className="absolute bottom-[20%] left-[12%] w-36 h-36 text-[#0A5ED7] transform -rotate-30 animate-spin-slow" style={{ animationDuration: '60s' }} />
          
          {/* Wrench - Bottom Right */}
          <Wrench className="absolute bottom-[15%] right-[15%] w-52 h-52 text-[#F97316] transform rotate-30" />
          
          {/* Additional scattered elements */}
          <Car className="absolute top-[60%] left-[25%] w-32 h-32 text-[#0BB3FF] transform rotate-12" />
          <Gauge className="absolute bottom-[35%] right-[25%] w-28 h-28 text-[#0A5ED7] transform -rotate-20" />
          <Settings className="absolute top-[75%] right-[40%] w-24 h-24 text-[#F97316] transform rotate-45" />
        </div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(11, 179, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(11, 179, 255, 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}></div>
        
        {/* Diagonal Lines Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 100px, rgba(249, 115, 22, 0.1) 100px, rgba(249, 115, 22, 0.1) 101px)`
        }}></div>
      </div>

      <div className="w-full max-w-md p-4 relative z-10">
        {/* Main Login Card */}
        <Card className="bg-[#12171F]/95 backdrop-blur-2xl border border-[#1E2736] shadow-2xl shadow-black/50 rounded-2xl overflow-hidden">
          {/* Top accent line */}
          <div className="h-1 bg-gradient-to-r from-[#0A5ED7] via-[#0BB3FF] to-[#F97316]"></div>
          
          <CardHeader className="space-y-4 pb-6 pt-8">
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-6 bg-gradient-to-r from-[#0A5ED7]/30 to-[#0BB3FF]/30 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                <div className="relative p-4 bg-[#0E1420]/80 rounded-2xl border border-[#1E2736]">
                  <img 
                    src={logoImage} 
                    alt={t('app.name', 'SALIS AUTO')} 
                    className="w-44 h-auto drop-shadow-2xl"
                    data-testid="logo-salis-auto"
                  />
                </div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-2xl font-montserrat font-bold text-white tracking-tight">
                {t('auth.signIn', 'Sign In')}
              </CardTitle>
              <CardDescription className="font-poppins text-[#6B7A90]">
                {t('auth.enterCredentials', 'Enter your credentials to access your account')}
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-poppins text-[#C4D0E4] font-medium text-sm">
                  {t('auth.email', 'Email')}
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#4A5568] group-focus-within:text-[#0BB3FF] transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.emailPlaceholder', 'your@email.com')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="input-email"
                    className="pl-12 h-13 font-poppins bg-[#0A0D14] border-[#1E2736] text-white placeholder:text-[#4A5568] focus:border-[#0BB3FF] focus:ring-2 focus:ring-[#0BB3FF]/20 rounded-xl transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="font-poppins text-[#C4D0E4] font-medium text-sm">
                  {t('auth.password', 'Password')}
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#4A5568] group-focus-within:text-[#0BB3FF] transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="input-password"
                    className="pl-12 pr-12 h-13 font-poppins bg-[#0A0D14] border-[#1E2736] text-white placeholder:text-[#4A5568] focus:border-[#0BB3FF] focus:ring-2 focus:ring-[#0BB3FF]/20 rounded-xl transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A5568] hover:text-[#0BB3FF] transition-colors"
                    data-testid="toggle-password-visibility"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-13 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952C0] hover:to-[#0AA3EE] text-white font-poppins font-semibold text-base shadow-lg shadow-[#0A5ED7]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#0BB3FF]/40 hover:scale-[1.02] rounded-xl"
                disabled={loginMutation.isPending}
                data-testid="login-submit"
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {t('auth.signingIn', 'Signing in...')}
                  </span>
                ) : t('auth.signIn', 'Sign In')}
              </Button>
              
              <p className="text-center text-sm font-poppins text-[#6B7A90] pt-2">
                {t('auth.dontHaveAccount', "Don't have an account?")}{" "}
                <Link 
                  href="/register" 
                  className="text-[#0BB3FF] hover:text-[#0A5ED7] hover:underline font-semibold transition-colors" 
                  data-testid="link-register"
                >
                  {t('auth.register', 'Register')}
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
        
        {/* Demo Credentials Panel */}
        <div className="mt-6 p-5 bg-[#12171F]/80 backdrop-blur-xl rounded-xl border border-[#1E2736] shadow-xl">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#1E2736] to-transparent"></div>
            <p className="text-xs font-poppins text-[#6B7A90] uppercase tracking-widest">
              {t('auth.demoCredentials', 'Demo Credentials')}
            </p>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#1E2736] to-transparent"></div>
          </div>
          <p className="text-center text-xs text-[#4A5568] mb-4 font-mono">Password: Password123!</p>
          <div className="grid grid-cols-3 gap-2">
            <button 
              type="button" 
              onClick={() => { setEmail('admin@salisauto.com'); setPassword('Password123!'); }} 
              className="p-3 rounded-lg bg-[#0A0D14] border border-[#1E2736] hover:border-[#0A5ED7] hover:bg-[#0A5ED7]/10 transition-all duration-200 group"
            >
              <span className="text-xs font-semibold text-[#0A5ED7] group-hover:text-[#0BB3FF]">Admin</span>
            </button>
            <button 
              type="button" 
              onClick={() => { setEmail('owner@salisauto.com'); setPassword('Password123!'); }} 
              className="p-3 rounded-lg bg-[#0A0D14] border border-[#1E2736] hover:border-[#0A5ED7] hover:bg-[#0A5ED7]/10 transition-all duration-200 group"
            >
              <span className="text-xs font-semibold text-[#0A5ED7] group-hover:text-[#0BB3FF]">Owner</span>
            </button>
            <button 
              type="button" 
              onClick={() => { setEmail('service.manager@salisauto.com'); setPassword('Password123!'); }} 
              className="p-3 rounded-lg bg-[#0A0D14] border border-[#1E2736] hover:border-[#0BB3FF] hover:bg-[#0BB3FF]/10 transition-all duration-200 group"
            >
              <span className="text-xs font-semibold text-[#0BB3FF] group-hover:text-white">Manager</span>
            </button>
            <button 
              type="button" 
              onClick={() => { setEmail('tech@salisauto.com'); setPassword('Password123!'); }} 
              className="p-3 rounded-lg bg-[#0A0D14] border border-[#1E2736] hover:border-[#0BB3FF] hover:bg-[#0BB3FF]/10 transition-all duration-200 group"
            >
              <span className="text-xs font-semibold text-[#0BB3FF] group-hover:text-white">Technician</span>
            </button>
            <button 
              type="button" 
              onClick={() => { setEmail('finance@salisauto.com'); setPassword('Password123!'); }} 
              className="p-3 rounded-lg bg-[#0A0D14] border border-[#1E2736] hover:border-[#F97316] hover:bg-[#F97316]/10 transition-all duration-200 group"
            >
              <span className="text-xs font-semibold text-[#F97316] group-hover:text-white">Finance</span>
            </button>
            <button 
              type="button" 
              onClick={() => { setEmail('client@salisauto.com'); setPassword('Password123!'); }} 
              className="p-3 rounded-lg bg-[#0A0D14] border border-[#1E2736] hover:border-[#F97316] hover:bg-[#F97316]/10 transition-all duration-200 group"
            >
              <span className="text-xs font-semibold text-[#F97316] group-hover:text-white">Customer</span>
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <p className="text-center text-xs text-[#4A5568] mt-6 font-poppins">
          © 2026 SALIS AUTO. All rights reserved.
        </p>
      </div>
    </div>
  );
}
