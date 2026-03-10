# SALIS AUTO - Multi-Language & Localization System

**Version:** 1.0  
**Last Updated:** November 3, 2025  
**Current Languages:** English, Arabic

---

## Overview

SALIS AUTO supports full internationalization (i18n) with multi-language content, RTL layouts, and localized formats.

---

## Current Implementation

### i18next Configuration

**Installed Packages:**
```json
{
  "dependencies": {
    "i18next": "^23.0.0",
    "i18next-browser-languagedetector": "^7.0.0",
    "react-i18next": "^13.0.0"
  }
}
```

**Configuration:** `client/src/i18n.ts`
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ar from './locales/ar.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

---

## Translation Files

### English (en.json)

```json
{
  "common": {
    "login": "Login",
    "logout": "Logout",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "add": "Add",
    "search": "Search",
    "filter": "Filter",
    "export": "Export"
  },
  "dashboard": {
    "title": "Dashboard",
    "revenue": "Revenue",
    "activeJobs": "Active Jobs",
    "customers": "Customers",
    "appointments": "Appointments"
  },
  "customers": {
    "title": "Customers",
    "addCustomer": "Add Customer",
    "customerName": "Customer Name",
    "email": "Email",
    "phone": "Phone",
    "address": "Address"
  },
  "vehicles": {
    "title": "Vehicles",
    "make": "Make",
    "model": "Model",
    "year": "Year",
    "vin": "VIN",
    "licensePlate": "License Plate"
  },
  "invoices": {
    "title": "Invoices",
    "invoiceNumber": "Invoice Number",
    "subtotal": "Subtotal",
    "vat": "VAT (15%)",
    "total": "Total",
    "dueDate": "Due Date"
  }
}
```

### Arabic (ar.json)

```json
{
  "common": {
    "login": "تسجيل الدخول",
    "logout": "تسجيل الخروج",
    "save": "حفظ",
    "cancel": "إلغاء",
    "delete": "حذف",
    "edit": "تعديل",
    "add": "إضافة",
    "search": "بحث",
    "filter": "تصفية",
    "export": "تصدير"
  },
  "dashboard": {
    "title": "لوحة التحكم",
    "revenue": "الإيرادات",
    "activeJobs": "الوظائف النشطة",
    "customers": "العملاء",
    "appointments": "المواعيد"
  },
  "customers": {
    "title": "العملاء",
    "addCustomer": "إضافة عميل",
    "customerName": "اسم العميل",
    "email": "البريد الإلكتروني",
    "phone": "الهاتف",
    "address": "العنوان"
  },
  "vehicles": {
    "title": "المركبات",
    "make": "الصانع",
    "model": "الموديل",
    "year": "السنة",
    "vin": "رقم الهيكل",
    "licensePlate": "رقم اللوحة"
  },
  "invoices": {
    "title": "الفواتير",
    "invoiceNumber": "رقم الفاتورة",
    "subtotal": "المجموع الفرعي",
    "vat": "ضريبة القيمة المضافة (15%)",
    "total": "الإجمالي",
    "dueDate": "تاريخ الاستحقاق"
  }
}
```

---

## Usage in Components

### Basic Translation

```tsx
import { useTranslation } from 'react-i18next';

export function CustomerPage() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('customers.title')}</h1>
      <Button>{t('customers.addCustomer')}</Button>
    </div>
  );
}
```

### Translation with Variables

```tsx
const { t } = useTranslation();

// en.json: "welcome": "Welcome, {{name}}!"
// ar.json: "welcome": "مرحباً، {{name}}!"

<p>{t('welcome', { name: user.name })}</p>
```

### Pluralization

```json
{
  "en": {
    "items": "{{count}} item",
    "items_plural": "{{count}} items"
  },
  "ar": {
    "items": "{{count}} عنصر",
    "items_plural": "{{count}} عناصر"
  }
}
```

```tsx
<p>{t('items', { count: itemCount })}</p>
```

---

## Language Switcher

### UI Component

```tsx
// client/src/components/LanguageSwitcher.tsx
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger data-testid="button-language">
        <Globe className="h-5 w-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            data-testid={`lang-${lang.code}`}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## RTL (Right-to-Left) Support

### CSS Configuration

**Tailwind Config:**
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      // RTL-specific utilities
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.rtl': {
          direction: 'rtl',
        },
        '.ltr': {
          direction: 'ltr',
        },
      });
    },
  ],
};
```

**Global CSS:**
```css
/* index.css */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

[dir="rtl"] .sidebar {
  left: auto;
  right: 0;
}

[dir="rtl"] .ml-4 {
  margin-left: 0;
  margin-right: 1rem;
}
```

### Component RTL Support

```tsx
import { useTranslation } from 'react-i18next';

export function Header() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className={isRTL ? 'flex-row-reverse' : 'flex-row'}>
      {/* Content */}
    </div>
  );
}
```

---

## Localized Formats

### Date Formatting

```typescript
// shared/dateUtils.ts
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

export function formatDate(date: Date, locale: string) {
  const locales = { ar, en: enUS };
  return format(date, 'PPP', { locale: locales[locale] });
}
```

**Usage:**
```tsx
const { i18n } = useTranslation();
const formattedDate = formatDate(new Date(), i18n.language);
```

### Number Formatting

```typescript
export function formatNumber(num: number, locale: string) {
  return new Intl.NumberFormat(locale).format(num);
}

export function formatCurrency(amount: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}
```

**Usage:**
```tsx
// English: $1,234.56
// Arabic: ١٬٢٣٤٫٥٦ ر.س

formatCurrency(1234.56, 'SAR', 'ar'); // "١٬٢٣٤٫٥٦ ر.س"
formatCurrency(1234.56, 'USD', 'en'); // "$1,234.56"
```

---

## Translation Management

### Database Schema

```typescript
// shared/schema.ts
export const translations = pgTable('translations', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: text('key').notNull().unique(),
  languageCode: text('language_code').notNull(),
  value: text('value').notNull(),
  namespace: text('namespace').default('common'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### Translation Editor UI

```tsx
// client/src/pages/TranslationEditor.tsx
export function TranslationEditor() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [translations, setTranslations] = useState({});

  const handleSave = async (key: string, value: string) => {
    await apiRequest('/api/translations', {
      method: 'POST',
      body: { key, language: selectedLanguage, value },
    });
  };

  return (
    <div>
      <h1>Translation Editor</h1>
      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="ar">Arabic</SelectItem>
        <SelectItem value="fr">French</SelectItem>
      </Select>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Key</TableHead>
            <TableHead>Translation</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(translations).map(([key, value]) => (
            <TableRow key={key}>
              <TableCell>{key}</TableCell>
              <TableCell>
                <Input
                  value={value}
                  onChange={(e) => handleSave(key, e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Button size="sm">Save</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

---

## Additional Languages

### French (fr.json)

```json
{
  "common": {
    "login": "Connexion",
    "logout": "Déconnexion",
    "save": "Enregistrer",
    "cancel": "Annuler"
  },
  "dashboard": {
    "title": "Tableau de bord",
    "revenue": "Revenu",
    "activeJobs": "Travaux actifs"
  }
}
```

### Spanish (es.json)

```json
{
  "common": {
    "login": "Iniciar sesión",
    "logout": "Cerrar sesión",
    "save": "Guardar",
    "cancel": "Cancelar"
  },
  "dashboard": {
    "title": "Panel de control",
    "revenue": "Ingresos",
    "activeJobs": "Trabajos activos"
  }
}
```

### German (de.json), Italian (it.json), etc.

Similar structure for additional languages.

---

## Best Practices

### DO:
✅ Use translation keys instead of hardcoded text  
✅ Provide context in translation keys (`customers.title` not just `title`)  
✅ Support RTL layouts for Arabic/Hebrew  
✅ Format dates/numbers according to locale  
✅ Test with different languages  
✅ Use variables for dynamic content  
✅ Provide fallback language (English)  

### DON'T:
❌ Concatenate translated strings  
❌ Hardcode text in components  
❌ Assume left-to-right layout  
❌ Forget to translate error messages  
❌ Ignore pluralization rules  
❌ Mix languages in UI  

---

## Implementation Checklist

### Phase 1: Infrastructure
- [x] i18next setup
- [x] English translations
- [x] Arabic translations
- [x] Language switcher
- [x] RTL support

### Phase 2: Content
- [ ] Translate all pages
- [ ] Translate error messages
- [ ] Translate email templates
- [ ] Translate SMS templates
- [ ] Translate PDF/exports

### Phase 3: Additional Languages
- [ ] French translation
- [ ] Spanish translation
- [ ] German translation
- [ ] Urdu translation (Pakistan market)
- [ ] Hindi translation (India market)

### Phase 4: Management
- [ ] Translation editor UI
- [ ] Database-backed translations
- [ ] Export/import translations
- [ ] Translation version control
- [ ] Crowdsourced translations

---

## API Endpoints

```typescript
// GET /api/translations/:languageCode - Get all translations
// POST /api/translations - Create/update translation
// DELETE /api/translations/:key - Delete translation
// GET /api/translations/export/:languageCode - Export as JSON
// POST /api/translations/import - Import translations
```

---

**Document Owner:** Localization Team  
**Supported Languages:** English, Arabic (more coming)  
**Next Review:** Quarterly
