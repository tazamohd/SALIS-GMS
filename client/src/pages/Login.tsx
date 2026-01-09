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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0A0D14]">
      {/* Deep Space Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0D14] via-[#0E1420] to-[#0A0D14]"></div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-gradient-to-bl from-[#0A5ED7]/15 via-[#0BB3FF]/8 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-[#0BB3FF]/12 via-[#0A5ED7]/6 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-[#F97316]/8 to-transparent rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Automotive Sketch Art - Left Side */}
      <div className="fixed left-0 top-0 bottom-0 w-1/3 pointer-events-none overflow-hidden">
        <svg viewBox="0 0 400 800" className="absolute inset-0 w-full h-full opacity-[0.08]" preserveAspectRatio="xMidYMid slice">
          {/* Sports Car Sketch - Top */}
          <g stroke="#0BB3FF" strokeWidth="1" fill="none" transform="translate(20, 80)">
            <path d="M50,120 Q80,100 120,100 L200,100 Q240,100 260,90 L300,70 Q320,60 340,60 L360,60" strokeWidth="1.5"/>
            <path d="M50,120 L30,140 L30,160 Q30,170 40,170 L80,170" strokeWidth="1.5"/>
            <path d="M80,170 Q90,170 100,160 L120,160 Q130,170 140,170 L220,170 Q230,170 240,160 L260,160 Q270,170 280,170 L340,170" strokeWidth="1.5"/>
            <path d="M340,170 L360,160 L370,140 L370,100 Q370,80 360,60" strokeWidth="1.5"/>
            <ellipse cx="100" cy="165" rx="25" ry="25" strokeWidth="1.2"/>
            <ellipse cx="100" cy="165" rx="15" ry="15" strokeWidth="0.8"/>
            <ellipse cx="260" cy="165" rx="25" ry="25" strokeWidth="1.2"/>
            <ellipse cx="260" cy="165" rx="15" ry="15" strokeWidth="0.8"/>
            <path d="M140,100 L140,70 Q140,60 150,55 L200,45 Q220,40 240,45 L280,55 Q290,60 290,70 L290,90" strokeWidth="0.8"/>
            <line x1="180" y1="100" x2="180" y2="55" strokeWidth="0.5"/>
            <line x1="220" y1="100" x2="220" y2="50" strokeWidth="0.5"/>
          </g>

          {/* Engine Block Sketch - Middle */}
          <g stroke="#F97316" strokeWidth="0.8" fill="none" transform="translate(30, 300)">
            <rect x="40" y="40" width="180" height="120" rx="5" strokeWidth="1"/>
            <rect x="60" y="20" width="140" height="25" rx="3"/>
            <circle cx="90" cy="100" r="30" strokeWidth="1"/>
            <circle cx="90" cy="100" r="20"/>
            <circle cx="90" cy="100" r="10"/>
            <circle cx="170" cy="100" r="30" strokeWidth="1"/>
            <circle cx="170" cy="100" r="20"/>
            <circle cx="170" cy="100" r="10"/>
            <path d="M40,80 L20,80 L20,120 L40,120"/>
            <path d="M220,60 L250,50 L260,60 L260,140 L250,150 L220,140"/>
            <line x1="80" y1="20" x2="80" y2="0"/>
            <line x1="130" y1="20" x2="130" y2="0"/>
            <line x1="180" y1="20" x2="180" y2="0"/>
            {/* Pistons */}
            <rect x="75" y="-20" width="10" height="25" rx="2"/>
            <rect x="125" y="-30" width="10" height="35" rx="2"/>
            <rect x="175" y="-15" width="10" height="20" rx="2"/>
          </g>

          {/* Gear System - Bottom */}
          <g stroke="#0A5ED7" strokeWidth="0.8" fill="none" transform="translate(50, 550)">
            <circle cx="80" cy="80" r="50" strokeWidth="1.2"/>
            <circle cx="80" cy="80" r="40"/>
            <circle cx="80" cy="80" r="15"/>
            {/* Gear teeth */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
              <line key={i} x1={80 + 50 * Math.cos(angle * Math.PI / 180)} y1={80 + 50 * Math.sin(angle * Math.PI / 180)} 
                    x2={80 + 60 * Math.cos(angle * Math.PI / 180)} y2={80 + 60 * Math.sin(angle * Math.PI / 180)} strokeWidth="3"/>
            ))}
            <circle cx="180" cy="120" r="35" strokeWidth="1"/>
            <circle cx="180" cy="120" r="25"/>
            <circle cx="180" cy="120" r="10"/>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <line key={`small-${i}`} x1={180 + 35 * Math.cos(angle * Math.PI / 180)} y1={120 + 35 * Math.sin(angle * Math.PI / 180)} 
                    x2={180 + 42 * Math.cos(angle * Math.PI / 180)} y2={120 + 42 * Math.sin(angle * Math.PI / 180)} strokeWidth="2"/>
            ))}
          </g>

          {/* Technical Lines */}
          <g stroke="#0BB3FF" strokeWidth="0.3" opacity="0.5">
            <line x1="0" y1="250" x2="400" y2="280"/>
            <line x1="0" y1="500" x2="300" y2="520"/>
            <line x1="50" y1="0" x2="100" y2="800"/>
            <line x1="200" y1="0" x2="150" y2="400"/>
          </g>
        </svg>
      </div>

      {/* Automotive Sketch Art - Right Side */}
      <div className="fixed right-0 top-0 bottom-0 w-1/3 pointer-events-none overflow-hidden">
        <svg viewBox="0 0 400 800" className="absolute inset-0 w-full h-full opacity-[0.08]" preserveAspectRatio="xMidYMid slice">
          {/* Speedometer Sketch - Top */}
          <g stroke="#0BB3FF" strokeWidth="0.8" fill="none" transform="translate(100, 60)">
            <circle cx="100" cy="100" r="80" strokeWidth="1.5"/>
            <circle cx="100" cy="100" r="70" strokeWidth="0.8"/>
            <circle cx="100" cy="100" r="10"/>
            {/* Speed marks */}
            {[...Array(11)].map((_, i) => {
              const angle = -225 + i * 27;
              const rad = angle * Math.PI / 180;
              return (
                <g key={i}>
                  <line x1={100 + 55 * Math.cos(rad)} y1={100 + 55 * Math.sin(rad)} 
                        x2={100 + 68 * Math.cos(rad)} y2={100 + 68 * Math.sin(rad)} strokeWidth={i % 2 === 0 ? "2" : "1"}/>
                </g>
              );
            })}
            {/* Needle */}
            <path d="M100,100 L60,50" strokeWidth="2" stroke="#F97316"/>
            <text x="100" y="145" fontSize="8" fill="#0BB3FF" textAnchor="middle" fontFamily="monospace">km/h</text>
          </g>

          {/* Wheel/Rim Sketch - Middle */}
          <g stroke="#F97316" strokeWidth="0.8" fill="none" transform="translate(80, 280)">
            <circle cx="100" cy="100" r="80" strokeWidth="1.5"/>
            <circle cx="100" cy="100" r="70" strokeWidth="1"/>
            <circle cx="100" cy="100" r="30" strokeWidth="1.2"/>
            <circle cx="100" cy="100" r="20"/>
            {/* Spokes */}
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <g key={i}>
                <path d={`M${100 + 30 * Math.cos(angle * Math.PI / 180)},${100 + 30 * Math.sin(angle * Math.PI / 180)} 
                          Q${100 + 50 * Math.cos((angle + 20) * Math.PI / 180)},${100 + 50 * Math.sin((angle + 20) * Math.PI / 180)} 
                          ${100 + 65 * Math.cos(angle * Math.PI / 180)},${100 + 65 * Math.sin(angle * Math.PI / 180)}`} strokeWidth="1.2"/>
                <path d={`M${100 + 30 * Math.cos(angle * Math.PI / 180)},${100 + 30 * Math.sin(angle * Math.PI / 180)} 
                          Q${100 + 50 * Math.cos((angle - 20) * Math.PI / 180)},${100 + 50 * Math.sin((angle - 20) * Math.PI / 180)} 
                          ${100 + 65 * Math.cos(angle * Math.PI / 180)},${100 + 65 * Math.sin(angle * Math.PI / 180)}`} strokeWidth="1.2"/>
              </g>
            ))}
            {/* Lug nuts */}
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <circle key={`nut-${i}`} cx={100 + 22 * Math.cos(angle * Math.PI / 180)} cy={100 + 22 * Math.sin(angle * Math.PI / 180)} r="4"/>
            ))}
          </g>

          {/* Wrench & Tool Sketch - Bottom */}
          <g stroke="#0A5ED7" strokeWidth="1" fill="none" transform="translate(60, 520)">
            {/* Wrench */}
            <path d="M40,40 L80,80 L90,80 L100,90 L180,170" strokeWidth="1.5"/>
            <path d="M30,30 Q20,40 25,55 L40,40 L55,25 Q40,20 30,30" strokeWidth="1.2"/>
            <path d="M180,170 Q200,190 220,180 L200,160 L180,180 Q170,200 180,170" strokeWidth="1.2"/>
            
            {/* Screwdriver */}
            <path d="M140,20 L160,40 L180,180" strokeWidth="1"/>
            <rect x="130" y="10" width="20" height="15" rx="2" transform="rotate(45, 140, 17)"/>
            <line x1="175" y1="175" x2="185" y2="185" strokeWidth="2"/>
            
            {/* Socket */}
            <rect x="220" y="80" width="40" height="60" rx="5" strokeWidth="1"/>
            <ellipse cx="240" cy="80" rx="20" ry="8"/>
            <ellipse cx="240" cy="140" rx="20" ry="8"/>
            <rect x="230" y="60" width="20" height="25" rx="3"/>
          </g>

          {/* Technical Lines */}
          <g stroke="#F97316" strokeWidth="0.3" opacity="0.4">
            <line x1="400" y1="200" x2="0" y2="230"/>
            <line x1="400" y1="450" x2="100" y2="480"/>
            <line x1="350" y1="0" x2="300" y2="800"/>
            <line x1="250" y1="0" x2="320" y2="600"/>
          </g>
        </svg>
      </div>

      {/* Decorative Corner Lines */}
      <svg className="fixed top-0 left-0 w-48 h-48 opacity-20 pointer-events-none" viewBox="0 0 200 200">
        <path d="M0,80 L80,0" stroke="#0BB3FF" strokeWidth="1" fill="none"/>
        <path d="M0,120 L120,0" stroke="#0A5ED7" strokeWidth="0.5" fill="none"/>
        <path d="M0,160 L160,0" stroke="#F97316" strokeWidth="0.5" fill="none"/>
        <circle cx="40" cy="40" r="3" fill="#0BB3FF"/>
        <circle cx="60" cy="60" r="2" fill="#0A5ED7"/>
      </svg>
      
      <svg className="fixed top-0 right-0 w-48 h-48 opacity-20 pointer-events-none" viewBox="0 0 200 200">
        <path d="M200,80 L120,0" stroke="#0BB3FF" strokeWidth="1" fill="none"/>
        <path d="M200,120 L80,0" stroke="#0A5ED7" strokeWidth="0.5" fill="none"/>
        <path d="M200,160 L40,0" stroke="#F97316" strokeWidth="0.5" fill="none"/>
        <circle cx="160" cy="40" r="3" fill="#0BB3FF"/>
        <circle cx="140" cy="60" r="2" fill="#F97316"/>
      </svg>
      
      <svg className="fixed bottom-0 left-0 w-48 h-48 opacity-20 pointer-events-none" viewBox="0 0 200 200">
        <path d="M0,120 L80,200" stroke="#0BB3FF" strokeWidth="1" fill="none"/>
        <path d="M0,80 L120,200" stroke="#0A5ED7" strokeWidth="0.5" fill="none"/>
        <path d="M0,40 L160,200" stroke="#F97316" strokeWidth="0.5" fill="none"/>
        <circle cx="40" cy="160" r="3" fill="#F97316"/>
        <circle cx="60" cy="140" r="2" fill="#0A5ED7"/>
      </svg>
      
      <svg className="fixed bottom-0 right-0 w-48 h-48 opacity-20 pointer-events-none" viewBox="0 0 200 200">
        <path d="M200,120 L120,200" stroke="#0BB3FF" strokeWidth="1" fill="none"/>
        <path d="M200,80 L80,200" stroke="#0A5ED7" strokeWidth="0.5" fill="none"/>
        <path d="M200,40 L40,200" stroke="#F97316" strokeWidth="0.5" fill="none"/>
        <circle cx="160" cy="160" r="3" fill="#0BB3FF"/>
        <circle cx="140" cy="140" r="2" fill="#0A5ED7"/>
      </svg>

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
