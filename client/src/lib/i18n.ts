/**
 * Lightweight i18n system using React context.
 *
 * This wraps the existing react-i18next setup and provides a simpler API
 * via useTranslation() hook and I18nProvider context.
 *
 * Translations are defined inline here for quick reference, but the canonical
 * translation files remain in client/src/i18n/locales/*.json (loaded by react-i18next).
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type Locale = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

// Common UI translations - these serve as a lightweight fallback / reference.
// The full translation files are in client/src/i18n/locales/en.json and ar.json.
export const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.job_cards': 'Job Cards',
    'nav.invoices': 'Invoices',
    'nav.appointments': 'Appointments',
    'nav.vehicles': 'Vehicles',
    'nav.spare_parts': 'Spare Parts',
    'nav.customers': 'Customers',
    'nav.settings': 'Settings',
    'nav.calendar': 'Calendar',
    'nav.reports': 'Reports',
    'nav.inventory': 'Inventory & Parts',
    'nav.suppliers': 'Suppliers',
    'nav.purchase_orders': 'Purchase Orders',
    'nav.estimates': 'Estimates & Quotes',
    'nav.technician_management': 'Technician Management',
    'nav.hr_management': 'HR & Payroll',
    'nav.financial_settings': 'Financial Settings',
    'nav.business_intelligence': 'Business Intelligence',
    'nav.ai_automation': 'AI Automation',
    'nav.integrations': 'Integrations',
    'nav.security': 'Security',
    'nav.profile': 'Profile',
    'nav.data_backup': 'Data Backup',

    // Navigation groups
    'nav.group.operations': 'Operations',
    'nav.group.customers_fleet': 'Customers & Fleet',
    'nav.group.inventory_orders': 'Inventory & Orders',
    'nav.group.team_staff': 'Team & Staff',
    'nav.group.finance': 'Finance',
    'nav.group.analytics': 'Analytics',
    'nav.group.automation_tools': 'Automation & Tools',
    'nav.group.settings': 'Settings',

    // Common actions
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.delete': 'Delete',
    'action.edit': 'Edit',
    'action.add': 'Add',
    'action.search': 'Search',
    'action.filter': 'Filter',
    'action.export': 'Export',
    'action.submit': 'Submit',
    'action.create': 'Create',
    'action.update': 'Update',
    'action.close': 'Close',
    'action.confirm': 'Confirm',
    'action.reset': 'Reset',
    'action.print': 'Print',
    'action.download': 'Download',
    'action.upload': 'Upload',
    'action.import': 'Import',
    'action.logout': 'Logout',

    // Status words
    'status.active': 'Active',
    'status.inactive': 'Inactive',
    'status.pending': 'Pending',
    'status.completed': 'Completed',
    'status.in_progress': 'In Progress',
    'status.overdue': 'Overdue',
    'status.paid': 'Paid',
    'status.draft': 'Draft',
    'status.cancelled': 'Cancelled',
    'status.approved': 'Approved',
    'status.rejected': 'Rejected',

    // Financial
    'financial.revenue': 'Revenue',
    'financial.expenses': 'Expenses',
    'financial.profit': 'Profit',
    'financial.total': 'Total',
    'financial.subtotal': 'Subtotal',
    'financial.vat': 'VAT',
    'financial.discount': 'Discount',
    'financial.balance': 'Balance',
    'financial.amount': 'Amount',
    'financial.price': 'Price',
    'financial.tax': 'Tax',

    // General
    'general.loading': 'Loading...',
    'general.no_data': 'No data available',
    'general.no_results': 'No results found',
    'general.welcome': 'Welcome to SALIS AUTO Management System',
  },
  ar: {
    // Navigation
    'nav.dashboard': '\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645',
    'nav.job_cards': '\u0628\u0637\u0627\u0642\u0627\u062A \u0627\u0644\u0639\u0645\u0644',
    'nav.invoices': '\u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631',
    'nav.appointments': '\u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F',
    'nav.vehicles': '\u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062A',
    'nav.spare_parts': '\u0642\u0637\u0639 \u0627\u0644\u063A\u064A\u0627\u0631',
    'nav.customers': '\u0627\u0644\u0639\u0645\u0644\u0627\u0621',
    'nav.settings': '\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A',
    'nav.calendar': '\u0627\u0644\u062A\u0642\u0648\u064A\u0645',
    'nav.reports': '\u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631',
    'nav.inventory': '\u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u0648\u0627\u0644\u0642\u0637\u0639',
    'nav.suppliers': '\u0627\u0644\u0645\u0648\u0631\u062F\u0648\u0646',
    'nav.purchase_orders': '\u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0634\u0631\u0627\u0621',
    'nav.estimates': '\u0627\u0644\u062A\u0642\u062F\u064A\u0631\u0627\u062A \u0648\u0627\u0644\u0639\u0631\u0648\u0636',
    'nav.technician_management': '\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0641\u0646\u064A\u064A\u0646',
    'nav.hr_management': '\u0627\u0644\u0645\u0648\u0627\u0631\u062F \u0627\u0644\u0628\u0634\u0631\u064A\u0629 \u0648\u0627\u0644\u0631\u0648\u0627\u062A\u0628',
    'nav.financial_settings': '\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u0627\u0644\u064A\u0629',
    'nav.business_intelligence': '\u0630\u0643\u0627\u0621 \u0627\u0644\u0623\u0639\u0645\u0627\u0644',
    'nav.ai_automation': '\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0648\u0627\u0644\u0623\u062A\u0645\u062A\u0629',
    'nav.integrations': '\u0627\u0644\u062A\u0643\u0627\u0645\u0644\u0627\u062A',
    'nav.security': '\u0627\u0644\u0623\u0645\u0627\u0646',
    'nav.profile': '\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A',
    'nav.data_backup': '\u0627\u0644\u0646\u0633\u062E \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A',

    // Navigation groups
    'nav.group.operations': '\u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A',
    'nav.group.customers_fleet': '\u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0648\u0627\u0644\u0623\u0633\u0637\u0648\u0644',
    'nav.group.inventory_orders': '\u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u0648\u0627\u0644\u0637\u0644\u0628\u0627\u062A',
    'nav.group.team_staff': '\u0627\u0644\u0641\u0631\u064A\u0642 \u0648\u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646',
    'nav.group.finance': '\u0627\u0644\u0645\u0627\u0644\u064A\u0629',
    'nav.group.analytics': '\u0627\u0644\u062A\u062D\u0644\u064A\u0644\u0627\u062A',
    'nav.group.automation_tools': '\u0627\u0644\u0623\u062A\u0645\u062A\u0629 \u0648\u0627\u0644\u0623\u062F\u0648\u0627\u062A',
    'nav.group.settings': '\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A',

    // Common actions
    'action.save': '\u062D\u0641\u0638',
    'action.cancel': '\u0625\u0644\u063A\u0627\u0621',
    'action.delete': '\u062D\u0630\u0641',
    'action.edit': '\u062A\u0639\u062F\u064A\u0644',
    'action.add': '\u0625\u0636\u0627\u0641\u0629',
    'action.search': '\u0628\u062D\u062B',
    'action.filter': '\u062A\u0635\u0641\u064A\u0629',
    'action.export': '\u062A\u0635\u062F\u064A\u0631',
    'action.submit': '\u0625\u0631\u0633\u0627\u0644',
    'action.create': '\u0625\u0646\u0634\u0627\u0621',
    'action.update': '\u062A\u062D\u062F\u064A\u062B',
    'action.close': '\u0625\u063A\u0644\u0627\u0642',
    'action.confirm': '\u062A\u0623\u0643\u064A\u062F',
    'action.reset': '\u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646',
    'action.print': '\u0637\u0628\u0627\u0639\u0629',
    'action.download': '\u062A\u062D\u0645\u064A\u0644',
    'action.upload': '\u0631\u0641\u0639',
    'action.import': '\u0627\u0633\u062A\u064A\u0631\u0627\u062F',
    'action.logout': '\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C',

    // Status words
    'status.active': '\u0646\u0634\u0637',
    'status.inactive': '\u063A\u064A\u0631 \u0646\u0634\u0637',
    'status.pending': '\u0642\u064A\u062F \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631',
    'status.completed': '\u0645\u0643\u062A\u0645\u0644',
    'status.in_progress': '\u0642\u064A\u062F \u0627\u0644\u062A\u0646\u0641\u064A\u0630',
    'status.overdue': '\u0645\u062A\u0623\u062E\u0631',
    'status.paid': '\u0645\u062F\u0641\u0648\u0639',
    'status.draft': '\u0645\u0633\u0648\u062F\u0629',
    'status.cancelled': '\u0645\u0644\u063A\u064A',
    'status.approved': '\u0645\u0648\u0627\u0641\u0642 \u0639\u0644\u064A\u0647',
    'status.rejected': '\u0645\u0631\u0641\u0648\u0636',

    // Financial
    'financial.revenue': '\u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A',
    'financial.expenses': '\u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A',
    'financial.profit': '\u0627\u0644\u0631\u0628\u062D',
    'financial.total': '\u0627\u0644\u0645\u062C\u0645\u0648\u0639',
    'financial.subtotal': '\u0627\u0644\u0645\u062C\u0645\u0648\u0639 \u0627\u0644\u0641\u0631\u0639\u064A',
    'financial.vat': '\u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u0645\u0636\u0627\u0641\u0629',
    'financial.discount': '\u0627\u0644\u062E\u0635\u0645',
    'financial.balance': '\u0627\u0644\u0631\u0635\u064A\u062F',
    'financial.amount': '\u0627\u0644\u0645\u0628\u0644\u063A',
    'financial.price': '\u0627\u0644\u0633\u0639\u0631',
    'financial.tax': '\u0627\u0644\u0636\u0631\u064A\u0628\u0629',

    // General
    'general.loading': '\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0645\u064A\u0644...',
    'general.no_data': '\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A',
    'general.no_results': '\u0644\u0627 \u062A\u0648\u062C\u062F \u0646\u062A\u0627\u0626\u062C',
    'general.welcome': '\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A \u0646\u0638\u0627\u0645 \u0625\u062F\u0627\u0631\u0629 \u0633\u0627\u0644\u064A\u0633 \u0623\u0648\u062A\u0648',
  },
};

interface I18nContextValue {
  locale: Locale;
  dir: Direction;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Lightweight i18n provider using React context.
 * Works alongside the existing react-i18next setup.
 * Manages locale state, document direction, and localStorage persistence.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('preferred-language') as Locale | null;
    return saved === 'ar' ? 'ar' : 'en';
  });

  const dir: Direction = locale === 'ar' ? 'rtl' : 'ltr';

  // Sync document attributes when locale changes
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [locale, dir]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('preferred-language', newLocale);
  }, []);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      return translations[locale]?.[key] ?? translations.en?.[key] ?? fallback ?? key;
    },
    [locale],
  );

  const value: I18nContextValue = { locale, dir, setLocale, t };

  return React.createElement(I18nContext.Provider, { value }, children);
}

/**
 * Hook to access the lightweight i18n context.
 * Returns { t, locale, setLocale, dir }.
 */
export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}
