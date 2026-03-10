# SALIS AUTO - White-Label Customization System

**Version:** 1.0  
**Last Updated:** November 3, 2025  
**Status:** Planned

---

## Overview

The White-Label Customization System allows franchises and partners to customize SALIS AUTO with their own branding, domain, and theme while maintaining the core platform functionality.

---

## Features

### Brand Customization
- Custom logo upload
- Color scheme editor
- Typography settings
- Custom favicon
- Branded email templates
- Branded invoices/estimates
- Custom domain support

### Content Customization
- Custom homepage
- Custom about page
- Terms & conditions
- Privacy policy
- Contact information
- Social media links

### Functional Customization
- Feature toggles
- Module visibility
- Custom workflows
- Payment gateway selection
- Integration preferences

---

## Database Schema

```typescript
// shared/schema.ts

// Tenant/franchise branding
export const tenantBranding = pgTable('tenant_branding', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => franchises.id),
  
  // Logo & Images
  logoUrl: text('logo_url'),
  logoLightUrl: text('logo_light_url'),
  logoDarkUrl: text('logo_dark_url'),
  faviconUrl: text('favicon_url'),
  
  // Colors
  primaryColor: text('primary_color').default('#2980b9'),
  secondaryColor: text('secondary_color').default('#8e44ad'),
  accentColor: text('accent_color').default('#3498db'),
  
  // Typography
  fontFamily: text('font_family').default('Inter'),
  headingFont: text('heading_font'),
  
  // Company Info
  companyName: text('company_name').notNull(),
  companyAddress: text('company_address'),
  companyPhone: text('company_phone'),
  companyEmail: text('company_email'),
  companyWebsite: text('company_website'),
  
  // Social Media
  facebook: text('facebook_url'),
  twitter: text('twitter_url'),
  instagram: text('instagram_url'),
  linkedin: text('linkedin_url'),
  
  // Settings
  customDomain: text('custom_domain'),
  showPoweredBy: boolean('show_powered_by').default(true),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Feature flags per tenant
export const tenantFeatures = pgTable('tenant_features', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => franchises.id),
  featureKey: text('feature_key').notNull(),
  enabled: boolean('enabled').default(true),
  config: json('config'), // Feature-specific configuration
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Custom pages
export const customPages = pgTable('custom_pages', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => franchises.id),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  isPublished: boolean('is_published').default(false),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Email template customization
export const tenantEmailTemplates = pgTable('tenant_email_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => franchises.id),
  templateType: text('template_type').notNull(),
  subject: text('subject'),
  header: text('header'), // HTML
  footer: text('footer'), // HTML
  customCSS: text('custom_css'),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

---

## Branding Editor UI

### Logo Upload

```tsx
// client/src/pages/BrandingEditor.tsx
export function LogoUploader() {
  const [logo, setLogo] = useState(null);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await apiRequest('/api/branding/upload-logo', {
      method: 'POST',
      body: formData,
    });
    
    setLogo(response.url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Main Logo</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e.target.files[0])}
              data-testid="input-logo-upload"
            />
            {logo && (
              <div className="mt-2">
                <img src={logo} alt="Logo preview" className="h-16" />
              </div>
            )}
          </div>

          <div>
            <Label>Light Mode Logo (Optional)</Label>
            <Input type="file" accept="image/*" />
          </div>

          <div>
            <Label>Dark Mode Logo (Optional)</Label>
            <Input type="file" accept="image/*" />
          </div>

          <div>
            <Label>Favicon</Label>
            <Input type="file" accept="image/x-icon,image/png" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Color Scheme Editor

```tsx
export function ColorSchemeEditor() {
  const [colors, setColors] = useState({
    primary: '#2980b9',
    secondary: '#8e44ad',
    accent: '#3498db',
  });

  const updateColor = (key: string, value: string) => {
    setColors({ ...colors, [key]: value });
    
    // Update CSS variables
    document.documentElement.style.setProperty(
      `--color-${key}`,
      value
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Color Scheme</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Primary Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={colors.primary}
              onChange={(e) => updateColor('primary', e.target.value)}
              className="w-20"
            />
            <Input
              type="text"
              value={colors.primary}
              onChange={(e) => updateColor('primary', e.target.value)}
              placeholder="#2980b9"
            />
          </div>
        </div>

        <div>
          <Label>Secondary Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={colors.secondary}
              onChange={(e) => updateColor('secondary', e.target.value)}
              className="w-20"
            />
            <Input
              type="text"
              value={colors.secondary}
              onChange={(e) => updateColor('secondary', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Accent Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={colors.accent}
              onChange={(e) => updateColor('accent', e.target.value)}
              className="w-20"
            />
            <Input
              type="text"
              value={colors.accent}
              onChange={(e) => updateColor('accent', e.target.value)}
            />
          </div>
        </div>

        <Button onClick={saveColors}>Save Color Scheme</Button>
      </CardContent>
    </Card>
  );
}
```

### Typography Settings

```tsx
export function TypographySettings() {
  const fonts = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins',
    'Playfair Display',
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Typography</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Primary Font</Label>
          <Select defaultValue="Inter">
            {fonts.map((font) => (
              <SelectItem key={font} value={font}>
                {font}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div>
          <Label>Heading Font (Optional)</Label>
          <Select>
            <SelectItem value="same">Same as Primary</SelectItem>
            {fonts.map((font) => (
              <SelectItem key={font} value={font}>
                {font}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div className="pt-4 border-t">
          <p className="text-2xl font-bold">Heading Preview</p>
          <p className="text-base mt-2">
            This is how your body text will look across the application.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## Theme Application

### Dynamic CSS Variables

```typescript
// client/src/lib/themeLoader.ts
export async function loadTenantTheme(tenantId: string) {
  const branding = await fetch(`/api/branding/${tenantId}`).then(r => r.json());
  
  // Apply colors
  document.documentElement.style.setProperty('--color-primary', branding.primaryColor);
  document.documentElement.style.setProperty('--color-secondary', branding.secondaryColor);
  document.documentElement.style.setProperty('--color-accent', branding.accentColor);
  
  // Apply fonts
  document.documentElement.style.setProperty('--font-family', branding.fontFamily);
  
  // Apply logo
  const logoElements = document.querySelectorAll('.brand-logo');
  logoElements.forEach(el => {
    el.setAttribute('src', branding.logoUrl);
  });
  
  // Apply favicon
  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon) {
    favicon.setAttribute('href', branding.faviconUrl);
  }
  
  // Update title
  document.title = branding.companyName;
}
```

### CSS Variables

```css
/* index.css */
:root {
  /* Default colors */
  --color-primary: #2980b9;
  --color-secondary: #8e44ad;
  --color-accent: #3498db;
  
  /* Fonts */
  --font-family: 'Inter', sans-serif;
  --font-heading: var(--font-family);
}

/* Use variables throughout */
.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.text-primary {
  color: var(--color-primary);
}

.heading {
  font-family: var(--font-heading);
}
```

---

## Custom Domain Setup

### Domain Configuration

**DNS Settings:**
```
Type: CNAME
Name: garage (or your subdomain)
Value: your-salis-auto.replit.app
TTL: 3600
```

**Database Entry:**
```typescript
await db.update(tenantBranding)
  .set({ customDomain: 'garage.yourcompany.com' })
  .where(eq(tenantBranding.tenantId, tenantId));
```

**Server Configuration:**
```typescript
// server/index.ts
app.use((req, res, next) => {
  const hostname = req.hostname;
  
  // Find tenant by custom domain
  const tenant = await db
    .select()
    .from(tenantBranding)
    .where(eq(tenantBranding.customDomain, hostname))
    .get();
  
  if (tenant) {
    req.tenantId = tenant.tenantId;
  }
  
  next();
});
```

---

## Feature Toggles

### Feature Management

```tsx
// client/src/pages/FeatureToggles.tsx
export function FeatureToggles() {
  const features = [
    { key: 'ai_chatbot', name: 'AI Chatbot', description: 'AI-powered customer support' },
    { key: 'predictive_maintenance', name: 'Predictive Maintenance', description: 'ML-based maintenance predictions' },
    { key: 'parts_marketplace', name: 'Parts Marketplace', description: 'eBay/Amazon integration' },
    { key: 'video_estimates', name: 'Video Estimates', description: 'Video-based estimates' },
    { key: 'barcode_scanner', name: 'Barcode Scanner', description: 'Inventory scanning' },
    { key: 'customer_portal', name: 'Customer Portal', description: 'Self-service customer portal' },
  ];

  const toggleFeature = async (key: string, enabled: boolean) => {
    await apiRequest('/api/features', {
      method: 'POST',
      body: { featureKey: key, enabled },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Toggles</CardTitle>
        <CardDescription>
          Enable or disable features for your instance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {features.map((feature) => (
          <div key={feature.key} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{feature.name}</p>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
            <Switch
              data-testid={`toggle-${feature.key}`}
              onCheckedChange={(checked) => toggleFeature(feature.key, checked)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

---

## Branded Templates

### Invoice Template

```typescript
// server/pdfExport.ts (enhanced)
export async function generateBrandedInvoice(invoice: Invoice, tenantId: string) {
  const branding = await getTenantBranding(tenantId);
  
  const doc = new jsPDF();
  
  // Add logo
  if (branding.logoUrl) {
    doc.addImage(branding.logoUrl, 'PNG', 14, 10, 40, 20);
  }
  
  // Company info in brand colors
  doc.setTextColor(branding.primaryColor);
  doc.setFontSize(20);
  doc.text(branding.companyName, 14, 40);
  
  doc.setTextColor('#000000');
  doc.setFontSize(10);
  doc.text(branding.companyAddress, 14, 45);
  doc.text(branding.companyPhone, 14, 50);
  
  // Invoice content...
  
  return doc;
}
```

### Email Template

```html
<!-- Branded email template -->
<!DOCTYPE html>
<html>
<head>
  <style>
    .header {
      background-color: {{primaryColor}};
      padding: 20px;
      text-align: center;
    }
    .logo {
      max-height: 60px;
    }
    .footer {
      background-color: #f5f5f5;
      padding: 20px;
      text-align: center;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="{{logoUrl}}" alt="{{companyName}}" class="logo">
  </div>
  
  <div class="content">
    {{emailContent}}
  </div>
  
  <div class="footer">
    <p>{{companyName}}</p>
    <p>{{companyAddress}} | {{companyPhone}} | {{companyEmail}}</p>
    {{#if showPoweredBy}}
    <p style="margin-top: 20px; color: #999;">
      Powered by SALIS AUTO
    </p>
    {{/if}}
  </div>
</body>
</html>
```

---

## Multi-Tenant Data Isolation

### Tenant Context

```typescript
// server/middleware/tenantContext.ts
export function tenantContext(req, res, next) {
  // Get tenant from subdomain or custom domain
  const hostname = req.hostname;
  const subdomain = hostname.split('.')[0];
  
  // Or get from user session
  const tenantId = req.session?.tenantId;
  
  req.tenantId = tenantId;
  next();
}

// Apply to all routes
app.use(tenantContext);
```

### Data Scoping

```typescript
// All queries scoped to tenant
export async function getCustomers(tenantId: string) {
  return await db
    .select()
    .from(customers)
    .where(eq(customers.tenantId, tenantId));
}
```

---

## API Endpoints

```typescript
// Branding
// GET /api/branding - Get current branding
// POST /api/branding - Update branding
// POST /api/branding/upload-logo - Upload logo
// POST /api/branding/upload-favicon - Upload favicon

// Features
// GET /api/features - List feature toggles
// POST /api/features - Update feature toggle

// Custom Pages
// GET /api/custom-pages - List custom pages
// POST /api/custom-pages - Create custom page
// PATCH /api/custom-pages/:id - Update custom page
// DELETE /api/custom-pages/:id - Delete custom page

// Custom Domain
// POST /api/custom-domain - Configure custom domain
// DELETE /api/custom-domain - Remove custom domain
```

---

## Implementation Roadmap

### Phase 1: Basic Branding
- [ ] Logo upload
- [ ] Color scheme editor
- [ ] Company information
- [ ] Apply branding to invoices/emails

### Phase 2: Advanced Customization
- [ ] Typography settings
- [ ] Custom CSS editor
- [ ] Branded email templates
- [ ] Custom pages

### Phase 3: Feature Toggles
- [ ] Feature management UI
- [ ] Module visibility control
- [ ] Per-tenant feature flags

### Phase 4: Custom Domains
- [ ] Custom domain configuration
- [ ] SSL certificate automation
- [ ] Multi-domain support
- [ ] Domain verification

---

## Best Practices

### DO:
✅ Validate uploaded images (size, format)  
✅ Preview changes before saving  
✅ Provide default branding  
✅ Allow branding reset  
✅ Test with different screen sizes  
✅ Optimize uploaded images  
✅ Cache branding settings  

### DON'T:
❌ Allow unlimited file sizes  
❌ Skip image validation  
❌ Hardcode branding in code  
❌ Mix tenant data  
❌ Forget fallback branding  
❌ Allow XSS in custom CSS  

---

**Document Owner:** Platform Team  
**Next Review:** Quarterly
