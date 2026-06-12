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
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";

export default function Register() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const registerMutation = useMutation({
    mutationFn: async (userData: { email: string; password: string; fullName: string; phone: string }) => {
      const response = await apiRequest("POST", "/api/register", userData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: t('common.success', 'Success'),
        description: t('auth.accountCreated', 'Account created successfully'),
      });
      window.location.href = "/login-dashboard";
    },
    onError: (error: Error) => {
      toast({
        title: t('auth.registrationFailed', 'Registration Failed'),
        description: error.message || t('auth.failedToCreateAccount', 'Failed to create account'),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast({
        title: t('common.error', 'Error'),
        description: t('auth.fillRequiredFields', 'Please fill in all required fields'),
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate({ email, password, fullName, phone });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Brand Background - Dark/Light Theme */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#F8FAFC] dark:bg-[#0E1117]" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#0A5ED7]/10 to-transparent dark:from-[#0BB3FF]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#0BB3FF]/10 to-transparent dark:from-[#0A5ED7]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-[#F97316]/5 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md p-4">
        <Card className="bg-white/80 dark:bg-[#151A23]/90 backdrop-blur-xl border border-[#E2E8F0] dark:border-[#232A36] shadow-2xl">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
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
                {t('auth.createAccount', 'Create Account')}
              </CardTitle>
              <CardDescription className="font-poppins text-[#64748B] dark:text-[#9BA4B0]">
                {t('auth.registerToGetStarted', 'Register to get started with SALIS AUTO')}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="font-poppins text-[#0B1F3B] dark:text-[#E6EAF0] font-medium">
                  {t('auth.fullName', 'Full Name')} *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#64748B] dark:text-[#9BA4B0]" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder={t('auth.fullNamePlaceholder', 'John Doe')}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    data-testid="input-fullname"
                    className="pl-10 h-12 font-poppins bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-[#E6EAF0] placeholder:text-[#9BA4B0] focus:border-[#0A5ED7] dark:focus:border-[#0BB3FF] focus:ring-[#0A5ED7]/20 dark:focus:ring-[#0BB3FF]/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-poppins text-[#0B1F3B] dark:text-[#E6EAF0] font-medium">
                  {t('auth.email', 'Email')} *
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
                <Label htmlFor="phone" className="font-poppins text-[#0B1F3B] dark:text-[#E6EAF0] font-medium">
                  {t('auth.phone', 'Phone')}
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#64748B] dark:text-[#9BA4B0]" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    data-testid="input-phone"
                    className="pl-10 h-12 font-poppins bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-[#E6EAF0] placeholder:text-[#9BA4B0] focus:border-[#0A5ED7] dark:focus:border-[#0BB3FF] focus:ring-[#0A5ED7]/20 dark:focus:ring-[#0BB3FF]/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-poppins text-[#0B1F3B] dark:text-[#E6EAF0] font-medium">
                  {t('auth.password', 'Password')} *
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
                disabled={registerMutation.isPending}
                data-testid="button-register"
              >
                {registerMutation.isPending ? t('auth.creatingAccount', 'Creating account...') : t('auth.createAccount', 'Create Account')}
              </Button>
              <p className="text-center text-sm font-poppins text-[#64748B] dark:text-[#9BA4B0] pt-2">
                {t('auth.alreadyHaveAccount', 'Already have an account?')}{" "}
                <Link 
                  href="/login" 
                  className="text-[#0A5ED7] dark:text-[#0BB3FF] hover:underline font-semibold" 
                  data-testid="link-login"
                >
                  {t('auth.signIn', 'Sign In')}
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
