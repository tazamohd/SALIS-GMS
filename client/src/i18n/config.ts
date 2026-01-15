import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import arTranslations from './locales/ar.json';
import frTranslations from './locales/fr.json';
import esTranslations from './locales/es.json';
import deTranslations from './locales/de.json';
import zhTranslations from './locales/zh.json';
import hiTranslations from './locales/hi.json';

export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
];

const getInitialLanguage = (): string => {
  const saved = localStorage.getItem('preferred-language');
  if (saved && supportedLanguages.some(lang => lang.code === saved)) {
    return saved;
  }
  return 'ar'; // Arabic as default language
};

const initialLanguage = getInitialLanguage();
const initialDir = supportedLanguages.find(l => l.code === initialLanguage)?.dir || 'ltr';
document.documentElement.dir = initialDir;
document.documentElement.lang = initialLanguage;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      ar: { translation: arTranslations },
      fr: { translation: frTranslations },
      es: { translation: esTranslations },
      de: { translation: deTranslations },
      zh: { translation: zhTranslations },
      hi: { translation: hiTranslations },
    },
    lng: initialLanguage,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'preferred-language',
      caches: ['localStorage']
    }
  });

i18n.on('languageChanged', (lng) => {
  const lang = supportedLanguages.find(l => l.code === lng);
  document.documentElement.dir = lang?.dir || 'ltr';
  document.documentElement.lang = lng;
  localStorage.setItem('preferred-language', lng);
});

export default i18n;
