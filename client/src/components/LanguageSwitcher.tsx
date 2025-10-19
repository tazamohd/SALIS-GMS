import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect } from 'react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    
    // Set document direction for RTL support
    if (lng === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
  };

  // Set initial direction on component mount
  useEffect(() => {
    const currentLang = i18n.language;
    if (currentLang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
  }, [i18n.language]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-gray-700 dark:text-gray-300 hover:text-salis-black dark:hover:text-white"
          data-testid="button-language-switcher"
        >
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
        <DropdownMenuItem
          onClick={() => changeLanguage('en')}
          className={`cursor-pointer ${
            i18n.language === 'en'
              ? 'bg-gray-100 dark:bg-salis-gray-dark text-salis-black dark:text-white'
              : 'text-gray-700 dark:text-gray-300'
          }`}
          data-testid="language-en"
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage('ar')}
          className={`cursor-pointer ${
            i18n.language === 'ar'
              ? 'bg-gray-100 dark:bg-salis-gray-dark text-salis-black dark:text-white'
              : 'text-gray-700 dark:text-gray-300'
          }`}
          data-testid="language-ar"
        >
          العربية
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
