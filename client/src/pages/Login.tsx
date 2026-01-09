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
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#080B12] font-sans">
      {/* Abstract ERP Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#080B12] via-[#0C1018] to-[#080B12]"></div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#0A5ED7]/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[700px] h-[700px] bg-[#0BB3FF]/8 rounded-full blur-[100px]"></div>
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-[#F97316]/5 rounded-full blur-[80px]"></div>
      </div>

      {/* Left Side - ERP Dashboard Visualization */}
      <div className="fixed left-0 top-0 bottom-0 w-[40%] pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="relative w-full h-full">
          {/* Floating Text Labels */}
          <div className="absolute top-[12%] left-[15%] text-[#0BB3FF]/20 text-xs tracking-[0.3em] uppercase font-semibold">Analytics</div>
          <div className="absolute top-[28%] left-[8%] text-[#0A5ED7]/20 text-xs tracking-[0.3em] uppercase font-semibold">Inventory</div>
          <div className="absolute top-[45%] left-[20%] text-[#F97316]/15 text-xs tracking-[0.3em] uppercase font-semibold">Scheduling</div>
          <div className="absolute top-[62%] left-[10%] text-[#0BB3FF]/20 text-xs tracking-[0.3em] uppercase font-semibold">Invoicing</div>
          <div className="absolute top-[78%] left-[18%] text-[#0A5ED7]/15 text-xs tracking-[0.3em] uppercase font-semibold">Workflow</div>
          
          <svg viewBox="0 0 500 900" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
            {/* Connection Lines */}
            <g opacity="0.12">
              <path d="M-50,150 Q100,150 150,200 T300,180 T450,220" stroke="#0BB3FF" strokeWidth="1.5" fill="none"/>
              <path d="M-50,350 Q80,350 140,400 T320,380 T500,420" stroke="#0A5ED7" strokeWidth="1.5" fill="none"/>
              <path d="M-50,550 Q120,550 180,500 T350,520 T500,480" stroke="#0BB3FF" strokeWidth="1.5" fill="none"/>
              <path d="M-50,750 Q90,750 160,700 T340,720 T500,680" stroke="#F97316" strokeWidth="1" fill="none"/>
              <path d="M80,0 Q80,150 120,250 T100,450 T130,650 T110,900" stroke="#0A5ED7" strokeWidth="0.8" fill="none"/>
              <path d="M200,0 Q200,100 240,200 T220,400 T260,600 T230,900" stroke="#0BB3FF" strokeWidth="0.8" fill="none"/>
              <path d="M350,0 Q350,120 310,220 T340,420 T300,620 T330,900" stroke="#F97316" strokeWidth="0.6" fill="none"/>
            </g>
            
            {/* Data Nodes */}
            <g opacity="0.25">
              <circle cx="100" cy="150" r="10" fill="#0BB3FF"/>
              <circle cx="100" cy="150" r="20" stroke="#0BB3FF" strokeWidth="1.5" fill="none"/>
              <circle cx="100" cy="150" r="30" stroke="#0BB3FF" strokeWidth="0.5" fill="none" strokeDasharray="4 4"/>
              <circle cx="180" cy="180" r="7" fill="#0A5ED7"/>
              <circle cx="180" cy="180" r="14" stroke="#0A5ED7" strokeWidth="1" fill="none"/>
              <circle cx="140" cy="240" r="6" fill="#0BB3FF"/>
              <line x1="100" y1="150" x2="180" y2="180" stroke="#0BB3FF" strokeWidth="1"/>
              <line x1="180" y1="180" x2="140" y2="240" stroke="#0A5ED7" strokeWidth="0.8"/>
              
              <circle cx="80" cy="380" r="12" fill="#F97316"/>
              <circle cx="80" cy="380" r="24" stroke="#F97316" strokeWidth="1.5" fill="none"/>
              <circle cx="80" cy="380" r="36" stroke="#F97316" strokeWidth="0.5" fill="none" strokeDasharray="4 4"/>
              <circle cx="170" cy="350" r="8" fill="#0BB3FF"/>
              <circle cx="220" cy="420" r="10" fill="#0A5ED7"/>
              <circle cx="220" cy="420" r="18" stroke="#0A5ED7" strokeWidth="1" fill="none"/>
              <line x1="80" y1="380" x2="170" y2="350" stroke="#F97316" strokeWidth="1"/>
              <line x1="170" y1="350" x2="220" y2="420" stroke="#0BB3FF" strokeWidth="0.8"/>
              <line x1="80" y1="380" x2="220" y2="420" stroke="#0A5ED7" strokeWidth="0.6"/>
              
              <circle cx="130" cy="600" r="9" fill="#0BB3FF"/>
              <circle cx="130" cy="600" r="18" stroke="#0BB3FF" strokeWidth="1" fill="none"/>
              <circle cx="210" cy="580" r="6" fill="#F97316"/>
              <circle cx="170" cy="670" r="11" fill="#0A5ED7"/>
              <circle cx="170" cy="670" r="22" stroke="#0A5ED7" strokeWidth="1.5" fill="none"/>
              <line x1="130" y1="600" x2="210" y2="580" stroke="#0BB3FF" strokeWidth="0.8"/>
              <line x1="210" y1="580" x2="170" y2="670" stroke="#F97316" strokeWidth="0.8"/>
            </g>
            
            {/* Dashboard Elements */}
            <g opacity="0.15">
              <rect x="300" y="100" width="14" height="50" rx="3" fill="#0BB3FF"/>
              <rect x="320" y="80" width="14" height="70" rx="3" fill="#0A5ED7"/>
              <rect x="340" y="110" width="14" height="40" rx="3" fill="#F97316"/>
              <rect x="360" y="90" width="14" height="60" rx="3" fill="#0BB3FF"/>
              <rect x="380" y="105" width="14" height="45" rx="3" fill="#0A5ED7"/>
              
              <circle cx="340" cy="300" r="55" stroke="#0A5ED7" strokeWidth="4" fill="none" strokeDasharray="250 95"/>
              <circle cx="340" cy="300" r="42" stroke="#0BB3FF" strokeWidth="2" fill="none" opacity="0.6"/>
              <circle cx="340" cy="300" r="10" fill="#0A5ED7"/>
              
              <path d="M280,500 A70,70 0 0,1 420,500" stroke="#F97316" strokeWidth="5" fill="none" strokeLinecap="round"/>
              <path d="M295,500 A55,55 0 0,1 405,500" stroke="#0BB3FF" strokeWidth="3" fill="none" opacity="0.5"/>
              
              <circle cx="300" cy="700" r="4" fill="#0BB3FF"/>
              <circle cx="325" cy="690" r="4" fill="#0BB3FF"/>
              <circle cx="350" cy="680" r="4" fill="#0A5ED7"/>
              <circle cx="375" cy="685" r="4" fill="#0A5ED7"/>
              <circle cx="400" cy="675" r="4" fill="#F97316"/>
              <polyline points="300,700 325,690 350,680 375,685 400,675" stroke="#0BB3FF" strokeWidth="1.5" fill="none"/>
            </g>
          </svg>
        </div>
      </div>

      {/* Right Side - Complementary Visualization */}
      <div className="fixed right-0 top-0 bottom-0 w-[40%] pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="relative w-full h-full">
          {/* Floating Text Labels */}
          <div className="absolute top-[15%] right-[15%] text-[#0A5ED7]/20 text-xs tracking-[0.3em] uppercase font-semibold">Reports</div>
          <div className="absolute top-[32%] right-[10%] text-[#0BB3FF]/20 text-xs tracking-[0.3em] uppercase font-semibold">Customers</div>
          <div className="absolute top-[48%] right-[22%] text-[#F97316]/15 text-xs tracking-[0.3em] uppercase font-semibold">Services</div>
          <div className="absolute top-[65%] right-[12%] text-[#0A5ED7]/20 text-xs tracking-[0.3em] uppercase font-semibold">Vehicles</div>
          <div className="absolute top-[82%] right-[20%] text-[#0BB3FF]/15 text-xs tracking-[0.3em] uppercase font-semibold">Diagnostics</div>
          
          <svg viewBox="0 0 500 900" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
            {/* Connection Lines */}
            <g opacity="0.12">
              <path d="M550,100 Q400,100 350,150 T200,130 T50,180" stroke="#0A5ED7" strokeWidth="1.5" fill="none"/>
              <path d="M550,300 Q420,300 360,350 T180,330 T0,380" stroke="#0BB3FF" strokeWidth="1.5" fill="none"/>
              <path d="M550,500 Q380,500 320,450 T150,470 T0,430" stroke="#F97316" strokeWidth="1" fill="none"/>
              <path d="M550,700 Q410,700 340,650 T160,680 T0,640" stroke="#0BB3FF" strokeWidth="1.5" fill="none"/>
              <path d="M420,0 Q420,100 380,200 T400,400 T370,600 T390,900" stroke="#0BB3FF" strokeWidth="0.8" fill="none"/>
              <path d="M300,0 Q300,150 340,250 T320,450 T360,650 T340,900" stroke="#0A5ED7" strokeWidth="0.8" fill="none"/>
              <path d="M150,0 Q150,80 190,180 T170,380 T210,580 T180,900" stroke="#F97316" strokeWidth="0.6" fill="none"/>
            </g>
            
            {/* Data Nodes */}
            <g opacity="0.25">
              <circle cx="400" cy="180" r="12" fill="#0A5ED7"/>
              <circle cx="400" cy="180" r="24" stroke="#0A5ED7" strokeWidth="1.5" fill="none"/>
              <circle cx="400" cy="180" r="36" stroke="#0A5ED7" strokeWidth="0.5" fill="none" strokeDasharray="4 4"/>
              <circle cx="330" cy="140" r="8" fill="#0BB3FF"/>
              <circle cx="330" cy="140" r="16" stroke="#0BB3FF" strokeWidth="1" fill="none"/>
              <circle cx="440" cy="240" r="9" fill="#F97316"/>
              <line x1="400" y1="180" x2="330" y2="140" stroke="#0A5ED7" strokeWidth="1"/>
              <line x1="400" y1="180" x2="440" y2="240" stroke="#F97316" strokeWidth="0.8"/>
              
              <circle cx="420" cy="420" r="10" fill="#0BB3FF"/>
              <circle cx="420" cy="420" r="20" stroke="#0BB3FF" strokeWidth="1" fill="none"/>
              <circle cx="350" cy="380" r="7" fill="#0A5ED7"/>
              <circle cx="350" cy="380" r="14" stroke="#0A5ED7" strokeWidth="0.8" fill="none"/>
              <circle cx="460" cy="400" r="8" fill="#F97316"/>
              <line x1="420" y1="420" x2="350" y2="380" stroke="#0BB3FF" strokeWidth="0.8"/>
              <line x1="420" y1="420" x2="460" y2="400" stroke="#F97316" strokeWidth="0.6"/>
              
              <circle cx="380" cy="660" r="11" fill="#F97316"/>
              <circle cx="380" cy="660" r="22" stroke="#F97316" strokeWidth="1.5" fill="none"/>
              <circle cx="380" cy="660" r="34" stroke="#F97316" strokeWidth="0.5" fill="none" strokeDasharray="4 4"/>
              <circle cx="440" cy="620" r="7" fill="#0BB3FF"/>
              <circle cx="320" cy="700" r="9" fill="#0A5ED7"/>
              <circle cx="320" cy="700" r="18" stroke="#0A5ED7" strokeWidth="1" fill="none"/>
              <line x1="380" y1="660" x2="440" y2="620" stroke="#F97316" strokeWidth="0.8"/>
              <line x1="380" y1="660" x2="320" y2="700" stroke="#0A5ED7" strokeWidth="0.8"/>
            </g>
            
            {/* Dashboard Elements */}
            <g opacity="0.15">
              <path d="M180,200 A60,60 0 0,1 240,260" stroke="#0BB3FF" strokeWidth="10" fill="none" strokeLinecap="round"/>
              <path d="M240,260 A60,60 0 0,1 180,320" stroke="#0A5ED7" strokeWidth="10" fill="none" strokeLinecap="round"/>
              <path d="M180,320 A60,60 0 0,1 120,260" stroke="#F97316" strokeWidth="10" fill="none" strokeLinecap="round"/>
              
              <polyline points="80,450 115,420 150,440 185,390 220,420 255,370" stroke="#0BB3FF" strokeWidth="2.5" fill="none"/>
              <circle cx="80" cy="450" r="5" fill="#0BB3FF"/>
              <circle cx="150" cy="440" r="5" fill="#0BB3FF"/>
              <circle cx="220" cy="420" r="5" fill="#0BB3FF"/>
              <circle cx="255" cy="370" r="5" fill="#0A5ED7"/>
              
              <rect x="80" y="550" width="100" height="12" rx="6" fill="#0A5ED7"/>
              <rect x="80" y="575" width="140" height="12" rx="6" fill="#0BB3FF"/>
              <rect x="80" y="600" width="80" height="12" rx="6" fill="#F97316"/>
              <rect x="80" y="625" width="120" height="12" rx="6" fill="#0A5ED7"/>
              
              <circle cx="180" cy="800" r="50" stroke="#0A5ED7" strokeWidth="3" fill="none"/>
              <circle cx="180" cy="800" r="38" stroke="#0BB3FF" strokeWidth="5" fill="none" strokeDasharray="180 60"/>
              <circle cx="180" cy="800" r="12" fill="#0A5ED7"/>
            </g>
          </svg>
        </div>
      </div>

      {/* Dot Grid Overlay */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #0BB3FF 1px, transparent 0)`,
        backgroundSize: '50px 50px'
      }}></div>

      <div className="w-full max-w-xl p-4 relative z-10">
        {/* Main Login Card */}
        <Card className="bg-[#0F1319]/95 backdrop-blur-2xl border border-[#1A2030] shadow-2xl shadow-black/60 rounded-2xl overflow-hidden">
          {/* Top accent line */}
          <div className="h-1.5 bg-gradient-to-r from-[#0A5ED7] via-[#0BB3FF] to-[#F97316]"></div>
          
          <CardHeader className="space-y-6 pb-8 pt-10">
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-8 bg-gradient-to-r from-[#0A5ED7]/25 to-[#0BB3FF]/25 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
                <div className="relative p-5 bg-[#0C1018]/90 rounded-2xl border border-[#1A2030]">
                  <img 
                    src={logoImage} 
                    alt={t('app.name', 'SALIS AUTO')} 
                    className="w-56 h-auto drop-shadow-2xl"
                    data-testid="logo-salis-auto"
                  />
                </div>
              </div>
            </div>
            <div className="text-center space-y-3">
              <CardTitle className="text-3xl font-bold text-white tracking-tight">
                {t('auth.signIn', 'Sign In')}
              </CardTitle>
              <CardDescription className="text-[#6B7A90] text-base">
                {t('auth.enterCredentials', 'Enter your credentials to access your account')}
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="pb-10 px-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-[#C4D0E4] font-medium text-base">
                  {t('auth.email', 'Email')}
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-[#4A5568] group-focus-within:text-[#0BB3FF] transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.emailPlaceholder', 'your@email.com')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="input-email"
                    className="pl-14 h-14 text-base bg-[#080B12] border-[#1A2030] text-white placeholder:text-[#4A5568] focus:border-[#0BB3FF] focus:ring-2 focus:ring-[#0BB3FF]/20 rounded-xl transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="password" className="text-[#C4D0E4] font-medium text-base">
                  {t('auth.password', 'Password')}
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-[#4A5568] group-focus-within:text-[#0BB3FF] transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="input-password"
                    className="pl-14 pr-14 h-14 text-base bg-[#080B12] border-[#1A2030] text-white placeholder:text-[#4A5568] focus:border-[#0BB3FF] focus:ring-2 focus:ring-[#0BB3FF]/20 rounded-xl transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[#4A5568] hover:text-[#0BB3FF] transition-colors"
                    data-testid="toggle-password-visibility"
                  >
                    {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-14 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952C0] hover:to-[#0AA3EE] text-white font-semibold text-lg shadow-lg shadow-[#0A5ED7]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#0BB3FF]/40 hover:scale-[1.02] rounded-xl mt-8"
                disabled={loginMutation.isPending}
                data-testid="login-submit"
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {t('auth.signingIn', 'Signing in...')}
                  </span>
                ) : t('auth.signIn', 'Sign In')}
              </Button>
              
              <p className="text-center text-base text-[#6B7A90] pt-4">
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
        <div className="mt-6 p-6 bg-[#0F1319]/80 backdrop-blur-xl rounded-xl border border-[#1A2030] shadow-xl">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#1A2030] to-transparent"></div>
            <p className="text-xs text-[#6B7A90] uppercase tracking-[0.2em] font-semibold">
              {t('auth.demoCredentials', 'Demo Credentials')}
            </p>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#1A2030] to-transparent"></div>
          </div>
          <p className="text-center text-sm text-[#4A5568] mb-5 font-mono tracking-wide">Password: Password123!</p>
          <div className="grid grid-cols-3 gap-3">
            <button 
              type="button" 
              onClick={() => { setEmail('admin@salisauto.com'); setPassword('Password123!'); }} 
              className="p-4 rounded-xl bg-[#080B12] border border-[#1A2030] hover:border-[#0A5ED7] hover:bg-[#0A5ED7]/10 transition-all duration-200 group"
            >
              <span className="text-sm font-semibold text-[#0A5ED7] group-hover:text-[#0BB3FF]">Admin</span>
            </button>
            <button 
              type="button" 
              onClick={() => { setEmail('owner@salisauto.com'); setPassword('Password123!'); }} 
              className="p-4 rounded-xl bg-[#080B12] border border-[#1A2030] hover:border-[#0A5ED7] hover:bg-[#0A5ED7]/10 transition-all duration-200 group"
            >
              <span className="text-sm font-semibold text-[#0A5ED7] group-hover:text-[#0BB3FF]">Owner</span>
            </button>
            <button 
              type="button" 
              onClick={() => { setEmail('service.manager@salisauto.com'); setPassword('Password123!'); }} 
              className="p-4 rounded-xl bg-[#080B12] border border-[#1A2030] hover:border-[#0BB3FF] hover:bg-[#0BB3FF]/10 transition-all duration-200 group"
            >
              <span className="text-sm font-semibold text-[#0BB3FF] group-hover:text-white">Manager</span>
            </button>
            <button 
              type="button" 
              onClick={() => { setEmail('tech@salisauto.com'); setPassword('Password123!'); }} 
              className="p-4 rounded-xl bg-[#080B12] border border-[#1A2030] hover:border-[#0BB3FF] hover:bg-[#0BB3FF]/10 transition-all duration-200 group"
            >
              <span className="text-sm font-semibold text-[#0BB3FF] group-hover:text-white">Technician</span>
            </button>
            <button 
              type="button" 
              onClick={() => { setEmail('finance@salisauto.com'); setPassword('Password123!'); }} 
              className="p-4 rounded-xl bg-[#080B12] border border-[#1A2030] hover:border-[#F97316] hover:bg-[#F97316]/10 transition-all duration-200 group"
            >
              <span className="text-sm font-semibold text-[#F97316] group-hover:text-white">Finance</span>
            </button>
            <button 
              type="button" 
              onClick={() => { setEmail('client@salisauto.com'); setPassword('Password123!'); }} 
              className="p-4 rounded-xl bg-[#080B12] border border-[#1A2030] hover:border-[#F97316] hover:bg-[#F97316]/10 transition-all duration-200 group"
            >
              <span className="text-sm font-semibold text-[#F97316] group-hover:text-white">Customer</span>
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <p className="text-center text-sm text-[#4A5568] mt-6 tracking-wide">
          © 2026 SALIS AUTO. All rights reserved.
        </p>
      </div>
    </div>
  );
}
