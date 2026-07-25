import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { Link } from "wouter";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Brand Background - Dark/Light Theme */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#F8FAFC] dark:bg-[#0E1117]"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#0A5ED7]/5 to-transparent dark:from-[#0BB3FF]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#0BB3FF]/5 to-transparent dark:from-[#0A5ED7]/5 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md mx-4 bg-white/80 dark:bg-[#151A23]/90 backdrop-blur-xl border border-[#E2E8F0] dark:border-[#232A36] shadow-2xl">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-[#F97316] rounded-full blur-xl opacity-30"></div>
              <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#F97316] to-[#FB923C] flex items-center justify-center shadow-lg">
                <AlertCircle className="h-10 w-10 text-white" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-6xl font-montserrat font-black bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] bg-clip-text text-transparent">
                404
              </h1>
              <h2 className="text-xl font-semibold text-[#0B1F3B] dark:text-white">
                {t('errors.pageNotFound', 'Page Not Found')}
              </h2>
              <p className="text-sm text-[#64748B] dark:text-[#9BA4B0] max-w-xs mx-auto">
                {t('errors.pageNotFoundMessage', 'The page you are looking for does not exist or has been moved.')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button 
                asChild
                className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952C0] hover:to-[#0AA3EE] text-white shadow-lg shadow-[#0A5ED7]/25"
              >
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  {t('common.home', 'Go Home')}
                </Link>
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.history.back()}
                className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-[#E6EAF0] hover:bg-gray-50 dark:hover:bg-[#1a2030]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('common.goBack', 'Go Back')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
