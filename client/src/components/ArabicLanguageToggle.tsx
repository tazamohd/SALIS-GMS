import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ArabicLanguageToggle() {
  const { i18n, t } = useTranslation();
  
  const currentLang = i18n.language?.split('-')[0] || 'en';
  const isArabic = currentLang === 'ar';

  const toggleLanguage = () => {
    const newLang = isArabic ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
    localStorage.setItem('preferred-language', newLang);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className={cn(
        "h-9 px-3 gap-2 font-medium transition-all duration-200",
        "border-gray-300 dark:border-salis-gray",
        isArabic 
          ? "bg-salis-black dark:bg-white text-white dark:text-salis-black hover:bg-gray-800 dark:hover:bg-gray-100" 
          : "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-salis-gray-dark"
      )}
      data-testid="button-arabic-toggle"
      title={isArabic ? t('languageToggle.switchToEnglish', 'Switch to English') : t('languageToggle.switchToArabic', 'Switch to Arabic')}
    >
      <span className="text-sm font-semibold">
        {isArabic ? "EN" : t('languageToggle.ar', 'AR')}
      </span>
      <span className="hidden sm:inline text-xs opacity-70">
        {isArabic ? t('languages.english', 'English') : t('languages.arabic', 'Arabic')}
      </span>
    </Button>
  );
}
