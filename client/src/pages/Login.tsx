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

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-salis-black to-gray-900 p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img 
              src={logoImage} 
              alt={t('app.name', 'SALIS AUTO')} 
              className="w-40 h-auto"
              data-testid="logo-salis-auto"
            />
          </div>
          <CardTitle className="text-2xl text-center font-montserrat">{t('auth.signIn', 'Sign In')}</CardTitle>
          <CardDescription className="text-center font-poppins">
            {t('auth.enterCredentials', 'Enter your credentials to access your account')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-poppins">{t('auth.email', 'Email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.emailPlaceholder', 'your@email.com')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-email"
                className="font-poppins"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-poppins">{t('auth.password', 'Password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-password"
                className="font-poppins"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-salis-orange hover:bg-salis-orange-dark text-white font-poppins"
              disabled={loginMutation.isPending}
              data-testid="login-submit"
            >
              {loginMutation.isPending ? t('auth.signingIn', 'Signing in...') : t('auth.signIn', 'Sign In')}
            </Button>
            <p className="text-center text-sm font-poppins text-gray-600 dark:text-gray-400">
              {t('auth.dontHaveAccount', "Don't have an account?")}{" "}
              <Link href="/register" className="text-salis-orange hover:underline" data-testid="link-register">
                {t('auth.register', 'Register')}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
