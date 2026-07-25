import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useEffect } from 'react';
import { supportedLanguages } from '@/i18n/config';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    const langConfig = supportedLanguages.find(l => l.code === lng);
    i18n.changeLanguage(lng);
    
    // Set document direction for RTL/LTR support
    document.documentElement.dir = langConfig?.dir || 'ltr';
    document.documentElement.lang = lng;
    
    // Store preference
    localStorage.setItem('preferred-language', lng);
  };

  // Set initial direction on component mount
  useEffect(() => {
    const currentLang = i18n.language?.split('-')[0] || 'en';
    const langConfig = supportedLanguages.find(l => l.code === currentLang);
    document.documentElement.dir = langConfig?.dir || 'ltr';
    document.documentElement.lang = currentLang;
  }, [i18n.language]);

  const currentLang = i18n.language?.split('-')[0] || 'en';
  const currentLangConfig = supportedLanguages.find(l => l.code === currentLang);

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
      <DropdownMenuContent 
        align="end" 
        className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark min-w-[180px]"
      >
        <DropdownMenuLabel className="text-xs text-gray-500 dark:text-gray-400 font-normal">
          Select Language
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-salis-gray-dark" />
        {supportedLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`cursor-pointer flex items-center justify-between ${
              currentLang === lang.code
                ? 'bg-gray-100 dark:bg-salis-gray-dark text-salis-black dark:text-white'
                : 'text-gray-700 dark:text-gray-300'
            }`}
            data-testid={`language-${lang.code}`}
          >
            <span className="flex items-center gap-2">
              <span>{lang.nativeName}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">({lang.name})</span>
            </span>
            {currentLang === lang.code && (
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
