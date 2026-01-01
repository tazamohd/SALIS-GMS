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
import { ThemeToggle } from "@/components/ThemeToggle";
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Brand Background - Dark/Light Theme */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#F8FAFC] dark:bg-[#0E1117]"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#0A5ED7]/10 to-transparent dark:from-[#0BB3FF]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#0BB3FF]/10 to-transparent dark:from-[#0A5ED7]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-[#F97316]/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md p-4">
        <Card className="bg-white/80 dark:bg-[#151A23]/90 backdrop-blur-xl border border-[#E2E8F0] dark:border-[#232A36] shadow-2xl">
          <CardHeader className="space-y-4 pb-6">
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <img 
                  src={logoImage} 
                  alt={t('app.name', 'SALIS AUTO')} 
                  className="relative w-44 h-auto drop-shadow-lg"
                  data-testid="logo-salis-auto"
                />
              </div>
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-2xl font-montserrat font-bold text-[#0B1F3B] dark:text-white">
                {t('auth.signIn', 'Sign In')}
              </CardTitle>
              <CardDescription className="font-poppins text-[#64748B] dark:text-[#9BA4B0]">
                {t('auth.enterCredentials', 'Enter your credentials to access your account')}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-poppins text-[#0B1F3B] dark:text-[#E6EAF0] font-medium">
                  {t('auth.email', 'Email')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#64748B] dark:text-[#9BA4B0]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.emailPlaceholder', 'your@email.com')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="input-email"
                    className="pl-10 h-12 font-poppins bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-[#E6EAF0] placeholder:text-[#9BA4B0] focus:border-[#0A5ED7] dark:focus:border-[#0BB3FF] focus:ring-[#0A5ED7]/20 dark:focus:ring-[#0BB3FF]/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-poppins text-[#0B1F3B] dark:text-[#E6EAF0] font-medium">
                  {t('auth.password', 'Password')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#64748B] dark:text-[#9BA4B0]" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="input-password"
                    className="pl-10 pr-10 h-12 font-poppins bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-[#E6EAF0] placeholder:text-[#9BA4B0] focus:border-[#0A5ED7] dark:focus:border-[#0BB3FF] focus:ring-[#0A5ED7]/20 dark:focus:ring-[#0BB3FF]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#9BA4B0] hover:text-[#0A5ED7] dark:hover:text-[#0BB3FF] transition-colors"
                    data-testid="toggle-password-visibility"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952C0] hover:to-[#0AA3EE] text-white font-poppins font-semibold shadow-lg shadow-[#0A5ED7]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[#0A5ED7]/30"
                disabled={loginMutation.isPending}
                data-testid="login-submit"
              >
                {loginMutation.isPending ? t('auth.signingIn', 'Signing in...') : t('auth.signIn', 'Sign In')}
              </Button>
              <p className="text-center text-sm font-poppins text-[#64748B] dark:text-[#9BA4B0] pt-2">
                {t('auth.dontHaveAccount', "Don't have an account?")}{" "}
                <Link 
                  href="/register" 
                  className="text-[#0A5ED7] dark:text-[#0BB3FF] hover:underline font-semibold" 
                  data-testid="link-register"
                >
                  {t('auth.register', 'Register')}
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
        
        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-white/60 dark:bg-[#151A23]/60 backdrop-blur-sm rounded-xl border border-[#E2E8F0] dark:border-[#232A36]">
          <p className="text-xs font-poppins text-[#64748B] dark:text-[#9BA4B0] text-center mb-2 uppercase tracking-wider">
            {t('auth.demoCredentials', 'Demo Credentials')}
          </p>
          <div className="space-y-1 text-xs font-mono text-center text-[#0B1F3B] dark:text-[#E6EAF0]">
            <p>admin@salisauto.com / admin123</p>
            <p>tech@salisauto.com / tech123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
