# SALIS AUTO - Accounting & Financial Modules

## 📋 Overview

SALIS AUTO includes a comprehensive **22-module financial system** covering the complete accounting cycle. This documentation covers the 10 core accounting modules that form the backbone of financial management.

**Last Updated**: December 2025  
**Module Count**: 10 Core Accounting Modules  
**Status**: ✅ Production Ready

---

## 🧮 Core Accounting Modules

### 1. General Ledger (دفتر الأستاذ العام)
**Route**: `/general-ledger`

The central repository for all financial transactions, organizing accounts by type with real-time balance tracking.

**Features**:
- Chart of Accounts management (Assets, Liabilities, Equity, Revenue, Expenses)
- Account hierarchy visualization
- Real-time debit/credit balance tracking
- Account type categorization with color coding
- Sub-account support
- Quick navigation to related modules

**Key Metrics**:
- Total Assets, Liabilities, Equity display
- Account type distribution
- Balance verification

---

### 2. Journal Entries (القيود اليومية)
**Route**: `/journal-entries`

Record and manage all financial transactions with double-entry bookkeeping compliance.

**Features**:
- Create new journal entries with debit/credit lines
- Multi-line entry support
- Entry status tracking (Draft, Posted, Approved)
- Reference number management
- Search and filter by status, date, description
- Entry templates for common transactions
- Bulk export functionality

**Entry Types**:
- Standard Entries
- Adjusting Entries
- Closing Entries
- Reversing Entries

---

### 3. Trial Balance (ميزان المراجعة)
**Route**: `/trial-balance`

Verify the equality of debits and credits across all accounts with adjusted/unadjusted views.

**Features**:
- Period-based trial balance generation
- Adjusted vs Unadjusted toggle
- Debit/Credit column comparison
- Balance verification with difference highlighting
- Print and export functionality
- Automatic total calculations
- Color-coded row highlighting by account type

**Related Reports**:
- Links to General Ledger
- Links to Journal Entries
- Links to Financial Statements

---

### 4. Income Statement (قائمة الدخل)
**Route**: `/income-statement`

Comprehensive profit and loss reporting with comparative period analysis.

**Features**:
- Multi-period selection (Monthly, Quarterly, Annual)
- Prior period comparison
- Revenue breakdown by category
- Expense categorization
- Gross profit calculation
- Operating income calculation
- Net income determination
- Variance analysis with percentage change
- Print and export options

**Sections**:
- Revenue (Service Revenue, Parts Sales, Other Income)
- Cost of Goods Sold
- Gross Profit
- Operating Expenses
- Operating Income
- Other Income/Expenses
- Net Income Before Tax
- Tax Expense
- Net Income

---

### 5. Balance Sheet (الميزانية العمومية)
**Route**: `/balance-sheet`

Complete financial position statement following IFRS/GAAP standards.

**Features**:
- Assets breakdown (Current & Non-Current)
- Liabilities breakdown (Current & Long-Term)
- Shareholders' Equity section
- Comparative period analysis
- Total verification (Assets = Liabilities + Equity)
- Print and export functionality

**Asset Categories**:
- Current Assets (Cash, Receivables, Inventory, Prepaid)
- Property, Plant & Equipment
- Intangible Assets
- Other Non-Current Assets

**Liability Categories**:
- Current Liabilities (Payables, Accrued Expenses, Current Debt)
- Long-Term Liabilities (Loans, Bonds)

**Equity Categories**:
- Common Stock
- Retained Earnings
- Additional Paid-in Capital

---

### 6. Cash Flow Statement (قائمة التدفقات النقدية)
**Route**: `/cash-flow-statement`

Track cash movements across operating, investing, and financing activities.

**Features**:
- Operating Activities Section (Indirect Method)
  - Net Income
  - Depreciation & Amortization
  - Working Capital Changes
- Investing Activities Section
  - Asset Purchases/Sales
  - Investment Activities
- Financing Activities Section
  - Debt Repayments
  - Dividend Payments
  - Capital Contributions
- Beginning/Ending Cash Reconciliation
- Cash Flow Analysis with visual indicators

**Analysis Tab**:
- Operating Cash Flow card
- Investing Cash Flow card
- Financing Cash Flow card
- Net Change in Cash card
- Cash Flow Ratio metrics

---

### 7. Accounts Receivable (حسابات المدينين)
**Route**: `/accounts-receivable`

Manage customer balances, aging analysis, and payment collection.

**Features**:
- Customer receivables listing
- Invoice tracking with due dates
- Payment recording dialog
- Aging buckets (Current, 30 Days, 60 Days, 90+ Days)
- Status badges (Current, Overdue, Past Due, Delinquent)
- Customer contact information
- Collection action buttons (Send Reminder, Record Payment)
- Search and filter by status
- Export functionality

**Aging Analysis Tab**:
- Aging bucket summary
- Collection efficiency metrics
- Days Sales Outstanding (DSO)
- Visual aging charts

**Summary Cards**:
- Total Receivables
- Current Receivables
- Overdue Receivables
- Average Days Overdue

---

### 8. Accounts Payable (حسابات الدائنين)
**Route**: `/accounts-payable`

Track vendor obligations, payment scheduling, and cash outflow management.

**Features**:
- Vendor payables listing
- Invoice tracking with due dates
- Payment recording dialog
- Status tracking (Current, Due Soon, Overdue, Paid)
- Payment terms display
- Vendor contact information
- Payment action buttons
- Search and filter by status
- Export functionality

**Aging Analysis Tab**:
- Payable aging buckets
- Payment efficiency metrics
- Days Payable Outstanding (DPO)

**Summary Cards**:
- Total Payables
- Current Payables
- Due Soon
- Overdue Amount

---

### 9. Cost Centers (مراكز التكلفة)
**Route**: `/cost-centers`

Departmental cost tracking and budget variance analysis.

**Features**:
- Cost center creation and management
- Department assignment
- Manager assignment
- Budget vs Actual tracking
- Variance calculation (amount and percentage)
- Status indicators (Under Budget, Over Budget, On Target)
- Arabic name support
- Department icons
- Search and filter by department
- Create new cost center dialog

**Cost Center Types**:
- Service Bays (SVC-BAY1, SVC-BAY2)
- Parts Warehouse (PARTS-WH)
- Administration (ADMIN)
- Diagnostic Lab (DIAG-LAB)
- Marketing & Sales (MARKETING)

**Analysis Tab**:
- Expense breakdown by category
- Budget utilization charts
- Variance trend analysis

**Summary Cards**:
- Total Budget
- Actual Spend
- Total Variance
- Center Status (Under/Over Budget counts)

---

### 10. Budget Management (الميزانية التقديرية)
**Route**: `/budget-management`

Annual and departmental budget planning, tracking, and forecasting.

**Features**:
- Budget creation dialog
- Fiscal year selection
- Category-based organization
- Budget vs Actual comparison
- Utilization rate tracking
- Status indicators (On Track, Near Limit, Over Budget)
- Period-based budgets
- Remaining budget calculation
- Copy budget to next year
- Edit existing budgets
- Export functionality

**Budget Categories**:
- Operating Expenses
- Marketing
- Maintenance
- HR/Training
- Technology/IT
- Inventory

**Analysis Tab**:
- Monthly budget vs actual trends
- Category distribution
- Forecast projections

**Summary Cards**:
- Total Budget
- Total Spent
- Remaining Budget
- Budget Health (On Track/Near Limit/Over Budget counts)

---

## 📊 Integration & Cross-Linking

All accounting modules are interconnected for seamless navigation:

| From Module | Links To |
|-------------|----------|
| General Ledger | Journal Entries, Trial Balance |
| Journal Entries | General Ledger, Trial Balance |
| Trial Balance | Income Statement, Balance Sheet |
| Income Statement | General Ledger, Cost Centers |
| Balance Sheet | General Ledger, Cash Flow |
| Cash Flow Statement | Balance Sheet, Income Statement |
| Accounts Receivable | Invoicing, General Ledger |
| Accounts Payable | Purchase Orders, General Ledger |
| Cost Centers | Budget Management, Reports |
| Budget Management | Cost Centers, Financial Reports |

---

## 🔒 Access Control

The accounting modules are accessible based on RBAC roles:

| Role | Access Level |
|------|--------------|
| Owner | Full Access (CRUD) |
| Accountant | Full Access (CRUD) |
| Finance Manager | Full Access (CRUD) |
| General Manager | View & Reports |
| Branch Manager | View (Own Branch) |
| Service Advisor | View (Limited) |

---

## 📱 UI/UX Features

All modules include:
- **TabsPageLayout**: Consistent multi-tab interface
- **Responsive Design**: Mobile-friendly layouts
- **Dark Theme Support**: Full dark mode compatibility
- **Data-testid Attributes**: Complete test coverage
- **Arabic Translations**: Bilingual labels
- **Print/Export**: PDF and Excel export options
- **Search & Filter**: Quick data discovery
- **Form Validation**: Zod schema validation

---

## 🔧 Technical Implementation

### Components Used
- `TabsPageLayout` - Standard multi-tab page wrapper
- `Card`, `CardHeader`, `CardContent` - Summary cards
- `Table`, `TableRow`, `TableCell` - Data tables
- `Dialog`, `DialogContent` - Modal forms
- `Form`, `FormField` - React Hook Form integration
- `Select`, `SelectItem` - Dropdown selections
- `Badge` - Status indicators
- `Button` - Actions and navigation

### Data Validation
All forms use Zod schemas with react-hook-form/zodResolver for validation.

### State Management
- React useState for local state
- TanStack Query for data fetching (future API integration)

---

## 📈 Future Enhancements

1. **API Integration**: Connect to backend database
2. **Real-time Updates**: WebSocket for live data
3. **Bank Reconciliation**: Automated matching
4. **Multi-Currency**: Currency conversion support
5. **Audit Trail**: Complete change logging
6. **Financial Ratios**: Automated ratio calculations
7. **Dashboard Widgets**: Accounting KPIs on dashboard
8. **Scheduled Reports**: Automated report generation

---

## 📚 Related Documentation

- [Financial Management Features](FEATURE-CATALOG.md#phase-3-financial-management)
- [RBAC Documentation](RBAC-DOCUMENTATION.md)
- [User Access Matrix](USER-UI-ACCESS-MATRIX.md)
- [Saudi Arabia Compliance](SAUDI_ARABIA_FEATURES.md)
