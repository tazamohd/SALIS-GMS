import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * A compact Arabic/English toggle button.
 * - Shows "عربي" when English is active (click to switch to Arabic)
 * - Shows "EN" when Arabic is active (click to switch to English)
 * - Sets document dir/lang attributes and persists choice to localStorage.
 *
 * Designed for the sidebar footer area. Uses the existing react-i18next
 * instance so the entire app stays in sync.
 */
export function LanguageToggle() {
  const { i18n } = useTranslation();

  const currentLang = i18n.language?.split('-')[0] || 'en';
  const isArabic = currentLang === 'ar';

  // Keep document attributes in sync
  useEffect(() => {
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [isArabic, currentLang]);

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
        'w-full justify-center gap-2 h-9 font-semibold text-sm transition-all duration-200',
        'border-[#E2E8F0] dark:border-[#232A36]',
        isArabic
          ? 'bg-[#0A5ED7] text-white hover:bg-[#0A5ED7]/90 dark:bg-[#0BB3FF] dark:hover:bg-[#0BB3FF]/90'
          : 'bg-transparent text-[#0F172A] dark:text-[#E6EAF0] hover:bg-[#0A5ED7]/10 dark:hover:bg-[#0BB3FF]/10',
      )}
      data-testid="button-language-toggle"
      title={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      <span className="font-bold">
        {isArabic ? 'EN' : 'عربي'}
      </span>
      <span className="text-xs opacity-80">
        {isArabic ? 'English' : 'العربية'}
      </span>
    </Button>
  );
}
