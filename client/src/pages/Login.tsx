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
import { getPortalForRole } from "@shared/rbac";

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
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: t('common.success', 'Success'),
        description: t('auth.loggedInSuccessfully', 'Logged in successfully'),
      });
      const targetPortal = getPortalForRole(user.role);
      window.location.href = targetPortal;
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
      {/* Abstract Tech Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#080B12] via-[#0C1018] to-[#080B12]"></div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#0A5ED7]/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[700px] h-[700px] bg-[#0BB3FF]/8 rounded-full blur-[100px]"></div>
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-[#F97316]/5 rounded-full blur-[80px]"></div>
      </div>

      {/* Left Side - AI & Neural Network Visualization */}
      <div className="fixed left-0 top-0 bottom-0 w-[40%] pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="relative w-full h-full">
          {/* Floating Tech Labels */}
          <div className="absolute top-[8%] left-[12%] text-[#0BB3FF]/25 text-[10px] tracking-[0.4em] uppercase font-bold">AI Engine</div>
          <div className="absolute top-[22%] left-[6%] text-[#0A5ED7]/20 text-[10px] tracking-[0.4em] uppercase font-bold">Neural Network</div>
          <div className="absolute top-[38%] left-[18%] text-[#F97316]/18 text-[10px] tracking-[0.4em] uppercase font-bold">Automation</div>
          <div className="absolute top-[52%] left-[8%] text-[#0BB3FF]/22 text-[10px] tracking-[0.4em] uppercase font-bold">Predictive</div>
          <div className="absolute top-[68%] left-[15%] text-[#0A5ED7]/18 text-[10px] tracking-[0.4em] uppercase font-bold">Machine Learning</div>
          <div className="absolute top-[82%] left-[10%] text-[#F97316]/15 text-[10px] tracking-[0.4em] uppercase font-bold">Analytics</div>
          
          <svg viewBox="0 0 500 900" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Neural Network Layer 1 - Input */}
            <g opacity="0.3" filter="url(#glow)">
              <circle cx="60" cy="120" r="8" fill="#0BB3FF"/>
              <circle cx="60" cy="180" r="8" fill="#0BB3FF"/>
              <circle cx="60" cy="240" r="8" fill="#0BB3FF"/>
              <circle cx="60" cy="300" r="8" fill="#0BB3FF"/>
              
              {/* Connections to hidden layer */}
              <g stroke="#0BB3FF" strokeWidth="0.5" opacity="0.4">
                <line x1="68" y1="120" x2="142" y2="150"/>
                <line x1="68" y1="120" x2="142" y2="210"/>
                <line x1="68" y1="180" x2="142" y2="150"/>
                <line x1="68" y1="180" x2="142" y2="210"/>
                <line x1="68" y1="180" x2="142" y2="270"/>
                <line x1="68" y1="240" x2="142" y2="210"/>
                <line x1="68" y1="240" x2="142" y2="270"/>
                <line x1="68" y1="300" x2="142" y2="270"/>
              </g>
            </g>
            
            {/* Neural Network Layer 2 - Hidden */}
            <g opacity="0.35" filter="url(#glow)">
              <circle cx="150" cy="150" r="10" fill="#0A5ED7"/>
              <circle cx="150" cy="210" r="10" fill="#0A5ED7"/>
              <circle cx="150" cy="270" r="10" fill="#0A5ED7"/>
              
              {/* Connections to output */}
              <g stroke="#0A5ED7" strokeWidth="0.6" opacity="0.5">
                <line x1="160" y1="150" x2="232" y2="180"/>
                <line x1="160" y1="150" x2="232" y2="240"/>
                <line x1="160" y1="210" x2="232" y2="180"/>
                <line x1="160" y1="210" x2="232" y2="240"/>
                <line x1="160" y1="270" x2="232" y2="240"/>
              </g>
            </g>
            
            {/* Neural Network Layer 3 - Output */}
            <g opacity="0.4" filter="url(#glow)">
              <circle cx="240" cy="180" r="12" fill="#F97316"/>
              <circle cx="240" cy="240" r="12" fill="#F97316"/>
            </g>
            
            {/* AI Brain Circuit Pattern */}
            <g opacity="0.2" stroke="#0BB3FF" strokeWidth="1" fill="none">
              <ellipse cx="320" cy="420" rx="100" ry="80"/>
              <ellipse cx="320" cy="420" rx="70" ry="55"/>
              <ellipse cx="320" cy="420" rx="40" ry="30"/>
              {/* Brain pathways */}
              <path d="M250,420 Q280,380 320,380 Q360,380 390,420" strokeWidth="1.5"/>
              <path d="M250,420 Q280,460 320,460 Q360,460 390,420" strokeWidth="1.5"/>
              <path d="M270,390 Q320,350 370,390" strokeWidth="0.8"/>
              <path d="M270,450 Q320,490 370,450" strokeWidth="0.8"/>
              {/* Neural pulses */}
              <circle cx="280" cy="400" r="5" fill="#0BB3FF" opacity="0.6"/>
              <circle cx="320" cy="380" r="4" fill="#0A5ED7" opacity="0.5"/>
              <circle cx="360" cy="400" r="5" fill="#0BB3FF" opacity="0.6"/>
              <circle cx="320" cy="420" r="8" fill="#F97316" opacity="0.4"/>
              <circle cx="300" cy="440" r="4" fill="#0A5ED7" opacity="0.5"/>
              <circle cx="340" cy="440" r="4" fill="#0A5ED7" opacity="0.5"/>
            </g>
            
            {/* Automation Workflow */}
            <g opacity="0.25">
              {/* Workflow boxes */}
              <rect x="80" y="550" width="50" height="35" rx="5" stroke="#0A5ED7" strokeWidth="1.5" fill="none"/>
              <rect x="160" y="550" width="50" height="35" rx="5" stroke="#0BB3FF" strokeWidth="1.5" fill="none"/>
              <rect x="240" y="550" width="50" height="35" rx="5" stroke="#F97316" strokeWidth="1.5" fill="none"/>
              {/* Arrows */}
              <path d="M130,567 L155,567" stroke="#0A5ED7" strokeWidth="1.5" markerEnd="url(#arrow)"/>
              <path d="M210,567 L235,567" stroke="#0BB3FF" strokeWidth="1.5"/>
              {/* Arrow heads */}
              <polygon points="155,567 148,563 148,571" fill="#0A5ED7"/>
              <polygon points="235,567 228,563 228,571" fill="#0BB3FF"/>
              {/* Labels */}
              <circle cx="105" cy="567" r="3" fill="#0A5ED7"/>
              <circle cx="185" cy="567" r="3" fill="#0BB3FF"/>
              <circle cx="265" cy="567" r="3" fill="#F97316"/>
            </g>
            
            {/* Data Processing Visualization */}
            <g opacity="0.2">
              {/* Binary/data stream */}
              <text x="60" y="680" fill="#0BB3FF" fontSize="8" fontFamily="monospace" opacity="0.6">01101001</text>
              <text x="60" y="695" fill="#0A5ED7" fontSize="8" fontFamily="monospace" opacity="0.5">10110010</text>
              <text x="60" y="710" fill="#0BB3FF" fontSize="8" fontFamily="monospace" opacity="0.4">01001101</text>
              <text x="60" y="725" fill="#F97316" fontSize="8" fontFamily="monospace" opacity="0.5">11010011</text>
              
              {/* Processing arrow */}
              <path d="M130,700 L180,700" stroke="#0BB3FF" strokeWidth="1.5"/>
              <polygon points="180,700 172,696 172,704" fill="#0BB3FF"/>
              
              {/* Output indicators */}
              <circle cx="210" cy="680" r="6" fill="#0BB3FF" opacity="0.6"/>
              <circle cx="210" cy="700" r="6" fill="#0A5ED7" opacity="0.6"/>
              <circle cx="210" cy="720" r="6" fill="#F97316" opacity="0.6"/>
            </g>
            
            {/* Circuit Board Pattern */}
            <g opacity="0.1" stroke="#0BB3FF" strokeWidth="0.5">
              <path d="M300,100 L350,100 L350,150 L400,150"/>
              <path d="M350,100 L350,50 L420,50"/>
              <path d="M280,200 L280,250 L350,250 L350,300"/>
              <circle cx="350" cy="100" r="3" fill="#0BB3FF"/>
              <circle cx="350" cy="150" r="3" fill="#0A5ED7"/>
              <circle cx="350" cy="250" r="3" fill="#F97316"/>
            </g>
            
            {/* Flowing Data Lines */}
            <g opacity="0.15">
              <path d="M-50,800 Q100,780 200,820 T400,800" stroke="#0BB3FF" strokeWidth="2" fill="none"/>
              <path d="M-50,830 Q120,810 220,850 T420,830" stroke="#0A5ED7" strokeWidth="1.5" fill="none"/>
              <path d="M-50,860 Q80,840 180,880 T380,860" stroke="#F97316" strokeWidth="1" fill="none"/>
            </g>
          </svg>
        </div>
      </div>

      {/* Right Side - Advanced Technology Visualization */}
      <div className="fixed right-0 top-0 bottom-0 w-[40%] pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="relative w-full h-full">
          {/* Floating Tech Labels */}
          <div className="absolute top-[10%] right-[12%] text-[#0A5ED7]/25 text-[10px] tracking-[0.4em] uppercase font-bold">Smart Diagnostics</div>
          <div className="absolute top-[24%] right-[8%] text-[#0BB3FF]/22 text-[10px] tracking-[0.4em] uppercase font-bold">IoT Integration</div>
          <div className="absolute top-[40%] right-[16%] text-[#F97316]/18 text-[10px] tracking-[0.4em] uppercase font-bold">Real-Time</div>
          <div className="absolute top-[55%] right-[10%] text-[#0A5ED7]/20 text-[10px] tracking-[0.4em] uppercase font-bold">Cloud Platform</div>
          <div className="absolute top-[70%] right-[18%] text-[#0BB3FF]/18 text-[10px] tracking-[0.4em] uppercase font-bold">Data Insights</div>
          <div className="absolute top-[85%] right-[12%] text-[#F97316]/15 text-[10px] tracking-[0.4em] uppercase font-bold">Intelligent</div>
          
          <svg viewBox="0 0 500 900" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
            {/* Hexagonal Tech Grid */}
            <g opacity="0.15" stroke="#0A5ED7" strokeWidth="1" fill="none">
              <polygon points="350,100 380,115 380,145 350,160 320,145 320,115"/>
              <polygon points="400,130 430,145 430,175 400,190 370,175 370,145"/>
              <polygon points="350,160 380,175 380,205 350,220 320,205 320,175"/>
              <circle cx="350" cy="130" r="4" fill="#0A5ED7" opacity="0.5"/>
              <circle cx="400" cy="160" r="4" fill="#0BB3FF" opacity="0.5"/>
              <circle cx="350" cy="190" r="4" fill="#F97316" opacity="0.5"/>
            </g>
            
            {/* Radar/Scanning Effect */}
            <g opacity="0.2">
              <circle cx="180" cy="280" r="80" stroke="#0BB3FF" strokeWidth="1" fill="none"/>
              <circle cx="180" cy="280" r="60" stroke="#0BB3FF" strokeWidth="0.8" fill="none" strokeDasharray="8 4"/>
              <circle cx="180" cy="280" r="40" stroke="#0A5ED7" strokeWidth="0.6" fill="none"/>
              <circle cx="180" cy="280" r="20" stroke="#0A5ED7" strokeWidth="0.5" fill="none" strokeDasharray="4 2"/>
              <circle cx="180" cy="280" r="6" fill="#F97316"/>
              {/* Radar sweep line */}
              <line x1="180" y1="280" x2="260" y2="280" stroke="#0BB3FF" strokeWidth="2" opacity="0.6"/>
              {/* Detected points */}
              <circle cx="220" cy="260" r="4" fill="#0BB3FF" opacity="0.8"/>
              <circle cx="200" cy="310" r="3" fill="#0A5ED7" opacity="0.7"/>
              <circle cx="150" cy="250" r="3" fill="#F97316" opacity="0.6"/>
            </g>
            
            {/* Cloud/Server Architecture */}
            <g opacity="0.2">
              {/* Cloud shape */}
              <path d="M320,420 Q280,400 300,370 Q310,340 350,340 Q390,340 400,370 Q420,360 440,380 Q470,390 460,420 Q480,450 450,470 L310,470 Q280,460 280,440 Q270,420 320,420" 
                    stroke="#0BB3FF" strokeWidth="1.5" fill="none"/>
              {/* Server boxes inside */}
              <rect x="320" y="390" width="30" height="20" rx="2" stroke="#0A5ED7" strokeWidth="1" fill="none"/>
              <rect x="360" y="390" width="30" height="20" rx="2" stroke="#0A5ED7" strokeWidth="1" fill="none"/>
              <rect x="400" y="390" width="30" height="20" rx="2" stroke="#0A5ED7" strokeWidth="1" fill="none"/>
              {/* Connection lines */}
              <line x1="335" y1="410" x2="335" y2="450" stroke="#0A5ED7" strokeWidth="0.8"/>
              <line x1="375" y1="410" x2="375" y2="450" stroke="#0BB3FF" strokeWidth="0.8"/>
              <line x1="415" y1="410" x2="415" y2="450" stroke="#F97316" strokeWidth="0.8"/>
              <circle cx="335" cy="450" r="4" fill="#0A5ED7"/>
              <circle cx="375" cy="450" r="4" fill="#0BB3FF"/>
              <circle cx="415" cy="450" r="4" fill="#F97316"/>
            </g>
            
            {/* Real-time Data Stream */}
            <g opacity="0.25">
              {/* Streaming lines */}
              <path d="M100,550 C130,540 160,560 190,550 S250,540 280,555" stroke="#0BB3FF" strokeWidth="2" fill="none">
                <animate attributeName="stroke-dashoffset" from="0" to="20" dur="1s" repeatCount="indefinite"/>
              </path>
              <path d="M100,580 C140,570 170,590 200,580 S260,570 290,585" stroke="#0A5ED7" strokeWidth="1.5" fill="none"/>
              <path d="M100,610 C120,600 150,620 180,610 S240,600 270,615" stroke="#F97316" strokeWidth="1" fill="none"/>
              
              {/* Data points */}
              <circle cx="130" cy="545" r="4" fill="#0BB3FF"/>
              <circle cx="190" cy="555" r="4" fill="#0BB3FF"/>
              <circle cx="250" cy="548" r="4" fill="#0A5ED7"/>
            </g>
            
            {/* Gear/Automation Symbol */}
            <g opacity="0.2" transform="translate(380, 650)">
              <circle cx="0" cy="0" r="35" stroke="#F97316" strokeWidth="1.5" fill="none"/>
              <circle cx="0" cy="0" r="25" stroke="#F97316" strokeWidth="1" fill="none"/>
              <circle cx="0" cy="0" r="10" fill="#F97316" opacity="0.5"/>
              {/* Gear teeth */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                const rad = angle * Math.PI / 180;
                return (
                  <line key={i} x1={35 * Math.cos(rad)} y1={35 * Math.sin(rad)} 
                        x2={45 * Math.cos(rad)} y2={45 * Math.sin(rad)} 
                        stroke="#F97316" strokeWidth="4" strokeLinecap="round"/>
                );
              })}
            </g>
            
            {/* Connected smaller gear */}
            <g opacity="0.2" transform="translate(320, 720)">
              <circle cx="0" cy="0" r="22" stroke="#0A5ED7" strokeWidth="1.5" fill="none"/>
              <circle cx="0" cy="0" r="14" stroke="#0A5ED7" strokeWidth="1" fill="none"/>
              <circle cx="0" cy="0" r="6" fill="#0A5ED7" opacity="0.5"/>
              {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                const rad = angle * Math.PI / 180;
                return (
                  <line key={i} x1={22 * Math.cos(rad)} y1={22 * Math.sin(rad)} 
                        x2={30 * Math.cos(rad)} y2={30 * Math.sin(rad)} 
                        stroke="#0A5ED7" strokeWidth="3" strokeLinecap="round"/>
                );
              })}
            </g>
            
            {/* Analytics Dashboard Mini */}
            <g opacity="0.18">
              <rect x="80" y="720" width="160" height="100" rx="8" stroke="#0BB3FF" strokeWidth="1" fill="none"/>
              {/* Mini bar chart */}
              <rect x="100" y="780" width="15" height="30" rx="2" fill="#0BB3FF"/>
              <rect x="125" y="765" width="15" height="45" rx="2" fill="#0A5ED7"/>
              <rect x="150" y="775" width="15" height="35" rx="2" fill="#F97316"/>
              <rect x="175" y="760" width="15" height="50" rx="2" fill="#0BB3FF"/>
              <rect x="200" y="770" width="15" height="40" rx="2" fill="#0A5ED7"/>
            </g>
            
            {/* Circuit traces */}
            <g opacity="0.1" stroke="#0BB3FF" strokeWidth="0.5">
              <path d="M50,150 L100,150 L100,200 L150,200"/>
              <path d="M100,150 L100,100 L180,100"/>
              <path d="M50,350 L80,350 L80,400 L130,400"/>
              <circle cx="100" cy="150" r="3" fill="#0BB3FF"/>
              <circle cx="100" cy="200" r="3" fill="#0A5ED7"/>
              <circle cx="80" cy="350" r="3" fill="#F97316"/>
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
