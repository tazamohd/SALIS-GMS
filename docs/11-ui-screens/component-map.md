# SALIS AUTO Component Map

## Layout Components

| Component | Location | Description |
|-----------|----------|-------------|
| Layout | `components/Layout.tsx` | Main app shell with sidebar and topbar |
| StandardPageLayout | `components/layouts/StandardPageLayout.tsx` | Simple page with header/description |
| StandardTablePage | `components/layouts/StandardTablePage.tsx` | Data table pages |
| DashboardPage | `components/layouts/DashboardPage.tsx` | Dashboard with metrics cards |
| FormPage | `components/layouts/FormPage.tsx` | Form-centric pages |
| AnalyticsPage | `components/layouts/AnalyticsPage.tsx` | Analytics/reporting pages |
| MobileCardPage | `components/layouts/MobileCardPage.tsx` | Mobile-optimized card layouts |
| TabsPageLayout | `components/layouts/TabsPageLayout.tsx` | Multi-tab interface pages |

## Core UI Components

| Component | Location | Description |
|-----------|----------|-------------|
| ThemeToggle | `components/ThemeToggle.tsx` | Dark/Light mode switcher |
| PageHeader | `components/PageHeader.tsx` | Standardized page headers |
| EmptyState | `components/EmptyState.tsx` | Empty data state display |
| DataTable | `components/DataTable.tsx` | Standardized data tables |
| FilterBar | `components/FilterBar.tsx` | Filter controls |
| SkipLink | `components/SkipLink.tsx` | Accessibility skip navigation |
| NotificationBell | `components/NotificationBell.tsx` | Notification dropdown |
| GlobalSearch | `components/GlobalSearch.tsx` | App-wide search |
| LanguageSwitcher | `components/LanguageSwitcher.tsx` | Language selection |
| ArabicLanguageToggle | `components/ArabicLanguageToggle.tsx` | Arabic/English toggle |

## Dialog Components

| Component | Location | Purpose |
|-----------|----------|---------|
| AddCustomerDialog | `components/AddCustomerDialog.tsx` | Create new customer |
| AddVehicleDialog | `components/AddVehicleDialog.tsx` | Register vehicle |
| AddSupplierDialog | `components/AddSupplierDialog.tsx` | Add supplier |
| CreateInvoiceDialog | `components/CreateInvoiceDialog.tsx` | Create invoice |
| CreateEstimateDialog | `components/CreateEstimateDialog.tsx` | Create estimate |
| JobCardDialog | `components/JobCardDialog.tsx` | Create/edit job cards |
| TaskDetailsDialog | `components/TaskDetailsDialog.tsx` | Task management |

## shadcn/ui Components

Located in `components/ui/`:
- Button, Card, Input, Select, Checkbox
- Dialog, Dropdown, Popover, Toast
- Table, Tabs, Accordion
- Badge, Avatar, Progress
- Form, Label, Textarea
- Tooltip, ScrollArea
- Separator, Skeleton

## Specialized Components

| Component | Location | Purpose |
|-----------|----------|---------|
| BarcodeScanner | `components/BarcodeScanner.tsx` | Scan barcodes |
| QRCodeGenerator | `components/QRCodeGenerator.tsx` | Generate QR codes |
| QRScanner | `components/QRScanner.tsx` | Scan QR codes |
| MediaUpload | `components/MediaUpload.tsx` | File uploads |
| MediaGallery | `components/MediaGallery.tsx` | Image gallery |
| SignaturePad | `components/SignaturePad.tsx` | Digital signatures |
| ESignature | `components/ESignature.tsx` | E-signature capture |
| DateRangePicker | `components/DateRangePicker.tsx` | Date range selection |

## Role-Specific Layouts

| Component | Location | Purpose |
|-----------|----------|---------|
| TechnicianLayout | `components/TechnicianLayout.tsx` | Technician portal |
| CustomerPortalLayout | `components/CustomerPortalLayout.tsx` | Customer portal |
| PurchaseAgentLayout | `components/PurchaseAgentLayout.tsx` | Purchase agent |
| ClientLayout | `components/ClientLayout.tsx` | Client-facing pages |
