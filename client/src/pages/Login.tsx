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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#080B12]">
      {/* Abstract ERP Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#080B12] via-[#0C1018] to-[#080B12]"></div>
        
        {/* Gradient Orbs - Brand Colors */}
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#0A5ED7]/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[700px] h-[700px] bg-[#0BB3FF]/8 rounded-full blur-[100px]"></div>
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-[#F97316]/5 rounded-full blur-[80px]"></div>
      </div>

      {/* Left Side - Abstract Data Visualization */}
      <div className="fixed left-0 top-0 bottom-0 w-[45%] pointer-events-none overflow-hidden">
        <svg viewBox="0 0 500 900" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0A5ED7" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#0BB3FF" stopOpacity="0.1"/>
            </linearGradient>
            <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F97316" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#F97316" stopOpacity="0.05"/>
            </linearGradient>
          </defs>
          
          {/* Network/Workflow Connection Lines */}
          <g opacity="0.15">
            {/* Horizontal flow lines */}
            <path d="M-50,150 Q100,150 150,200 T300,180 T450,220" stroke="#0BB3FF" strokeWidth="1" fill="none"/>
            <path d="M-50,350 Q80,350 140,400 T320,380 T500,420" stroke="#0A5ED7" strokeWidth="1" fill="none"/>
            <path d="M-50,550 Q120,550 180,500 T350,520 T500,480" stroke="#0BB3FF" strokeWidth="1" fill="none"/>
            <path d="M-50,750 Q90,750 160,700 T340,720 T500,680" stroke="#F97316" strokeWidth="0.8" fill="none"/>
            
            {/* Vertical connection paths */}
            <path d="M80,0 Q80,150 120,250 T100,450 T130,650 T110,900" stroke="#0A5ED7" strokeWidth="0.6" fill="none"/>
            <path d="M200,0 Q200,100 240,200 T220,400 T260,600 T230,900" stroke="#0BB3FF" strokeWidth="0.6" fill="none"/>
            <path d="M350,0 Q350,120 310,220 T340,420 T300,620 T330,900" stroke="#F97316" strokeWidth="0.5" fill="none"/>
          </g>
          
          {/* Data Nodes - Representing ERP Modules */}
          <g opacity="0.2">
            {/* Node cluster 1 - Top */}
            <circle cx="100" cy="150" r="8" fill="#0BB3FF"/>
            <circle cx="100" cy="150" r="16" stroke="#0BB3FF" strokeWidth="1" fill="none"/>
            <circle cx="180" cy="180" r="6" fill="#0A5ED7"/>
            <circle cx="180" cy="180" r="12" stroke="#0A5ED7" strokeWidth="0.8" fill="none"/>
            <circle cx="140" cy="220" r="5" fill="#0BB3FF"/>
            <line x1="100" y1="150" x2="180" y2="180" stroke="#0BB3FF" strokeWidth="0.5"/>
            <line x1="180" y1="180" x2="140" y2="220" stroke="#0A5ED7" strokeWidth="0.5"/>
            
            {/* Node cluster 2 - Middle */}
            <circle cx="80" cy="380" r="10" fill="#F97316"/>
            <circle cx="80" cy="380" r="20" stroke="#F97316" strokeWidth="1" fill="none"/>
            <circle cx="160" cy="350" r="6" fill="#0BB3FF"/>
            <circle cx="200" cy="420" r="8" fill="#0A5ED7"/>
            <circle cx="200" cy="420" r="14" stroke="#0A5ED7" strokeWidth="0.8" fill="none"/>
            <line x1="80" y1="380" x2="160" y2="350" stroke="#F97316" strokeWidth="0.5"/>
            <line x1="160" y1="350" x2="200" y2="420" stroke="#0BB3FF" strokeWidth="0.5"/>
            <line x1="80" y1="380" x2="200" y2="420" stroke="#0A5ED7" strokeWidth="0.4"/>
            
            {/* Node cluster 3 - Bottom */}
            <circle cx="120" cy="600" r="7" fill="#0BB3FF"/>
            <circle cx="120" cy="600" r="14" stroke="#0BB3FF" strokeWidth="0.8" fill="none"/>
            <circle cx="200" cy="580" r="5" fill="#F97316"/>
            <circle cx="160" cy="660" r="9" fill="#0A5ED7"/>
            <circle cx="160" cy="660" r="18" stroke="#0A5ED7" strokeWidth="1" fill="none"/>
            <line x1="120" y1="600" x2="200" y2="580" stroke="#0BB3FF" strokeWidth="0.5"/>
            <line x1="200" y1="580" x2="160" y2="660" stroke="#F97316" strokeWidth="0.5"/>
          </g>
          
          {/* Abstract Dashboard Elements */}
          <g opacity="0.12">
            {/* Mini chart bars */}
            <rect x="280" y="120" width="12" height="40" rx="2" fill="#0BB3FF"/>
            <rect x="298" y="100" width="12" height="60" rx="2" fill="#0A5ED7"/>
            <rect x="316" y="130" width="12" height="30" rx="2" fill="#F97316"/>
            <rect x="334" y="110" width="12" height="50" rx="2" fill="#0BB3FF"/>
            
            {/* Circular gauge */}
            <circle cx="320" cy="320" r="45" stroke="#0A5ED7" strokeWidth="3" fill="none" strokeDasharray="200 83"/>
            <circle cx="320" cy="320" r="35" stroke="#0BB3FF" strokeWidth="2" fill="none" opacity="0.5"/>
            
            {/* Progress arc */}
            <path d="M250,520 A60,60 0 0,1 370,520" stroke="#F97316" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <path d="M260,520 A50,50 0 0,1 360,520" stroke="#0BB3FF" strokeWidth="2" fill="none" opacity="0.5"/>
            
            {/* Data flow indicators */}
            <circle cx="280" cy="700" r="3" fill="#0BB3FF"/>
            <circle cx="300" cy="695" r="3" fill="#0BB3FF"/>
            <circle cx="320" cy="690" r="3" fill="#0BB3FF"/>
            <circle cx="340" cy="685" r="3" fill="#0A5ED7"/>
            <circle cx="360" cy="680" r="3" fill="#0A5ED7"/>
          </g>
          
          {/* Geometric accent lines */}
          <g stroke="#0BB3FF" strokeWidth="0.5" opacity="0.1">
            <line x1="0" y1="100" x2="400" y2="50"/>
            <line x1="0" y1="300" x2="450" y2="280"/>
            <line x1="0" y1="500" x2="400" y2="550"/>
            <line x1="0" y1="700" x2="350" y2="750"/>
            <line x1="0" y1="850" x2="300" y2="800"/>
          </g>
        </svg>
      </div>

      {/* Right Side - Complementary Abstract Elements */}
      <div className="fixed right-0 top-0 bottom-0 w-[45%] pointer-events-none overflow-hidden">
        <svg viewBox="0 0 500 900" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
          {/* Flowing connection curves */}
          <g opacity="0.15">
            <path d="M550,100 Q400,100 350,150 T200,130 T50,180" stroke="#0A5ED7" strokeWidth="1" fill="none"/>
            <path d="M550,300 Q420,300 360,350 T180,330 T0,380" stroke="#0BB3FF" strokeWidth="1" fill="none"/>
            <path d="M550,500 Q380,500 320,450 T150,470 T0,430" stroke="#F97316" strokeWidth="0.8" fill="none"/>
            <path d="M550,700 Q410,700 340,650 T160,680 T0,640" stroke="#0BB3FF" strokeWidth="1" fill="none"/>
            
            {/* Vertical flows */}
            <path d="M420,0 Q420,100 380,200 T400,400 T370,600 T390,900" stroke="#0BB3FF" strokeWidth="0.6" fill="none"/>
            <path d="M300,0 Q300,150 340,250 T320,450 T360,650 T340,900" stroke="#0A5ED7" strokeWidth="0.6" fill="none"/>
            <path d="M150,0 Q150,80 190,180 T170,380 T210,580 T180,900" stroke="#F97316" strokeWidth="0.5" fill="none"/>
          </g>
          
          {/* Module nodes */}
          <g opacity="0.2">
            {/* Cluster top-right */}
            <circle cx="380" cy="180" r="10" fill="#0A5ED7"/>
            <circle cx="380" cy="180" r="20" stroke="#0A5ED7" strokeWidth="1" fill="none"/>
            <circle cx="320" cy="140" r="6" fill="#0BB3FF"/>
            <circle cx="420" cy="220" r="7" fill="#F97316"/>
            <line x1="380" y1="180" x2="320" y2="140" stroke="#0A5ED7" strokeWidth="0.5"/>
            <line x1="380" y1="180" x2="420" y2="220" stroke="#F97316" strokeWidth="0.5"/>
            
            {/* Cluster middle-right */}
            <circle cx="400" cy="420" r="8" fill="#0BB3FF"/>
            <circle cx="400" cy="420" r="16" stroke="#0BB3FF" strokeWidth="0.8" fill="none"/>
            <circle cx="340" cy="380" r="5" fill="#0A5ED7"/>
            <circle cx="450" cy="400" r="6" fill="#F97316"/>
            <line x1="400" y1="420" x2="340" y2="380" stroke="#0BB3FF" strokeWidth="0.5"/>
            <line x1="400" y1="420" x2="450" y2="400" stroke="#F97316" strokeWidth="0.4"/>
            
            {/* Cluster bottom-right */}
            <circle cx="360" cy="650" r="9" fill="#F97316"/>
            <circle cx="360" cy="650" r="18" stroke="#F97316" strokeWidth="1" fill="none"/>
            <circle cx="420" cy="620" r="5" fill="#0BB3FF"/>
            <circle cx="300" cy="680" r="7" fill="#0A5ED7"/>
            <line x1="360" y1="650" x2="420" y2="620" stroke="#F97316" strokeWidth="0.5"/>
            <line x1="360" y1="650" x2="300" y2="680" stroke="#0A5ED7" strokeWidth="0.5"/>
          </g>
          
          {/* Dashboard visualization elements */}
          <g opacity="0.12">
            {/* Pie/donut segment */}
            <path d="M180,200 A50,50 0 0,1 230,250" stroke="#0BB3FF" strokeWidth="8" fill="none" strokeLinecap="round"/>
            <path d="M230,250 A50,50 0 0,1 180,300" stroke="#0A5ED7" strokeWidth="8" fill="none" strokeLinecap="round"/>
            <path d="M180,300 A50,50 0 0,1 130,250" stroke="#F97316" strokeWidth="8" fill="none" strokeLinecap="round"/>
            
            {/* Line chart */}
            <polyline points="100,450 130,420 160,440 190,400 220,430 250,380" stroke="#0BB3FF" strokeWidth="2" fill="none"/>
            <circle cx="100" cy="450" r="3" fill="#0BB3FF"/>
            <circle cx="160" cy="440" r="3" fill="#0BB3FF"/>
            <circle cx="220" cy="430" r="3" fill="#0BB3FF"/>
            
            {/* Horizontal bars */}
            <rect x="100" y="550" width="80" height="8" rx="4" fill="#0A5ED7"/>
            <rect x="100" y="570" width="120" height="8" rx="4" fill="#0BB3FF"/>
            <rect x="100" y="590" width="60" height="8" rx="4" fill="#F97316"/>
            <rect x="100" y="610" width="100" height="8" rx="4" fill="#0A5ED7"/>
            
            {/* KPI indicator */}
            <circle cx="180" cy="780" r="40" stroke="#0A5ED7" strokeWidth="2" fill="none"/>
            <circle cx="180" cy="780" r="30" stroke="#0BB3FF" strokeWidth="4" fill="none" strokeDasharray="140 48"/>
          </g>
          
          {/* Accent lines */}
          <g stroke="#F97316" strokeWidth="0.5" opacity="0.08">
            <line x1="500" y1="150" x2="100" y2="100"/>
            <line x1="500" y1="350" x2="50" y2="320"/>
            <line x1="500" y1="550" x2="100" y2="600"/>
            <line x1="500" y1="750" x2="150" y2="800"/>
          </g>
        </svg>
      </div>

      {/* Subtle grid overlay */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #0BB3FF 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>

      <div className="w-full max-w-md p-4 relative z-10">
        {/* Main Login Card */}
        <Card className="bg-[#0F1319]/95 backdrop-blur-2xl border border-[#1A2030] shadow-2xl shadow-black/60 rounded-2xl overflow-hidden">
          {/* Top accent line */}
          <div className="h-1 bg-gradient-to-r from-[#0A5ED7] via-[#0BB3FF] to-[#F97316]"></div>
          
          <CardHeader className="space-y-4 pb-6 pt-8">
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-6 bg-gradient-to-r from-[#0A5ED7]/25 to-[#0BB3FF]/25 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
                <div className="relative p-4 bg-[#0C1018]/90 rounded-2xl border border-[#1A2030]">
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
                    className="pl-12 h-13 font-poppins bg-[#080B12] border-[#1A2030] text-white placeholder:text-[#4A5568] focus:border-[#0BB3FF] focus:ring-2 focus:ring-[#0BB3FF]/20 rounded-xl transition-all duration-200"
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
                    className="pl-12 pr-12 h-13 font-poppins bg-[#080B12] border-[#1A2030] text-white placeholder:text-[#4A5568] focus:border-[#0BB3FF] focus:ring-2 focus:ring-[#0BB3FF]/20 rounded-xl transition-all duration-200"
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
        <div className="mt-6 p-5 bg-[#0F1319]/80 backdrop-blur-xl rounded-xl border border-[#1A2030] shadow-xl">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#1A2030] to-transparent"></div>
            <p className="text-xs font-poppins text-[#6B7A90] uppercase tracking-widest">
              {t('auth.demoCredentials', 'Demo Credentials')}
            </p>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#1A2030] to-transparent"></div>
          </div>
          <p className="text-center text-xs text-[#4A5568] mb-4 font-mono">Password: Password123!</p>
          <div className="grid grid-cols-3 gap-2">
            <button 
              type="button" 
              onClick={() => { setEmail('admin@salisauto.com'); setPassword('Password123!'); }} 
              className="p-3 rounded-lg bg-[#080B12] border border-[#1A2030] hover:border-[#0A5ED7] hover:bg-[#0A5ED7]/10 transition-all duration-200 group"
            >
              <span className="text-xs font-semibold text-[#0A5ED7] group-hover:text-[#0BB3FF]">Admin</span>
            </button>
            <button 
              type="button" 
              onClick={() => { setEmail('owner@salisauto.com'); setPassword('Password123!'); }} 
              className="p-3 rounded-lg bg-[#080B12] border border-[#1A2030] hover:border-[#0A5ED7] hover:bg-[#0A5ED7]/10 transition-all duration-200 group"
            >
              <span className="text-xs font-semibold text-[#0A5ED7] group-hover:text-[#0BB3FF]">Owner</span>
            </button>
            <button 
              type="button" 
              onClick={() => { setEmail('service.manager@salisauto.com'); setPassword('Password123!'); }} 
              className="p-3 rounded-lg bg-[#080B12] border border-[#1A2030] hover:border-[#0BB3FF] hover:bg-[#0BB3FF]/10 transition-all duration-200 group"
            >
              <span className="text-xs font-semibold text-[#0BB3FF] group-hover:text-white">Manager</span>
            </button>
            <button 
              type="button" 
              onClick={() => { setEmail('tech@salisauto.com'); setPassword('Password123!'); }} 
              className="p-3 rounded-lg bg-[#080B12] border border-[#1A2030] hover:border-[#0BB3FF] hover:bg-[#0BB3FF]/10 transition-all duration-200 group"
            >
              <span className="text-xs font-semibold text-[#0BB3FF] group-hover:text-white">Technician</span>
            </button>
            <button 
              type="button" 
              onClick={() => { setEmail('finance@salisauto.com'); setPassword('Password123!'); }} 
              className="p-3 rounded-lg bg-[#080B12] border border-[#1A2030] hover:border-[#F97316] hover:bg-[#F97316]/10 transition-all duration-200 group"
            >
              <span className="text-xs font-semibold text-[#F97316] group-hover:text-white">Finance</span>
            </button>
            <button 
              type="button" 
              onClick={() => { setEmail('client@salisauto.com'); setPassword('Password123!'); }} 
              className="p-3 rounded-lg bg-[#080B12] border border-[#1A2030] hover:border-[#F97316] hover:bg-[#F97316]/10 transition-all duration-200 group"
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
