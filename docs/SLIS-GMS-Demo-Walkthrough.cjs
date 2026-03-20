const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, LevelFormat, TabStopType, TabStopPosition } = require('docx');
const fs = require('fs');

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

function makeRow(cells, isHeader = false) {
  return new TableRow({
    children: cells.map((text, i) => new TableCell({
      borders,
      width: { size: cells.length === 2 ? (i === 0 ? 3120 : 6240) : Math.floor(9360 / cells.length), type: WidthType.DXA },
      shading: isHeader ? { fill: "1B4F72", type: ShadingType.CLEAR } : undefined,
      margins: cellMargins,
      children: [new Paragraph({ children: [new TextRun({ text, bold: isHeader, color: isHeader ? "FFFFFF" : "333333", font: "Arial", size: isHeader ? 22 : 20 })] })]
    }))
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: "1B4F72" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: "2E75B6" },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: "5B9BD5" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [
    // COVER PAGE
    {
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
      },
      children: [
        new Paragraph({ spacing: { before: 3000 }, children: [] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [
          new TextRun({ text: "SLIS-GMS", size: 72, bold: true, font: "Arial", color: "1B4F72" })
        ] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [
          new TextRun({ text: "Garage Management System", size: 40, font: "Arial", color: "2E75B6" })
        ] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [
          new TextRun({ text: "Complete Enterprise Platform Demo Walkthrough", size: 28, font: "Arial", color: "666666" })
        ] }),
        new Paragraph({ alignment: AlignmentType.CENTER, border: { top: { style: BorderStyle.SINGLE, size: 2, color: "2E75B6", space: 20 } }, spacing: { before: 400, after: 200 }, children: [
          new TextRun({ text: "Saudi Arabia First | Built for Global Scale", size: 24, font: "Arial", color: "888888", italics: true })
        ] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [
          new TextRun({ text: "250+ API Endpoints | 30+ Modules | Full ZATCA Compliance", size: 22, font: "Arial", color: "888888" })
        ] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 800 }, children: [
          new TextRun({ text: "Version 1.0 | March 2026", size: 22, font: "Arial", color: "AAAAAA" })
        ] }),
      ]
    },
    // TABLE OF CONTENTS & MAIN CONTENT
    {
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
      },
      headers: {
        default: new Header({ children: [new Paragraph({
          children: [
            new TextRun({ text: "SLIS-GMS Demo Walkthrough", font: "Arial", size: 18, color: "999999" }),
            new TextRun({ text: "\tSALIS AUTO", font: "Arial", size: 18, color: "999999" })
          ],
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC", space: 4 } }
        })] })
      },
      footers: {
        default: new Footer({ children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Page ", size: 18, color: "999999" }), new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "999999" })]
        })] })
      },
      children: [
        // SECTION 1: PLATFORM OVERVIEW
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. Platform Overview")] }),
        new Paragraph({ spacing: { after: 200 }, children: [
          new TextRun("SLIS-GMS is a comprehensive, enterprise-grade Garage Management System built specifically for the Saudi Arabian automotive service market. It manages every aspect of garage operations from customer check-in through service delivery, invoicing, and follow-up.")
        ] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Technical Stack")] }),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3120, 6240],
          rows: [
            makeRow(["Component", "Technology"], true),
            makeRow(["Frontend", "React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui"]),
            makeRow(["Backend", "Express.js + TypeScript + Drizzle ORM"]),
            makeRow(["Database", "PostgreSQL (Neon serverless)"]),
            makeRow(["Auth", "Passport.js sessions with role-based access"]),
            makeRow(["AI", "OpenAI GPT integration for scheduling, predictions, chatbot"]),
            makeRow(["Real-time", "WebSocket for live updates and IoT monitoring"]),
            makeRow(["Deployment", "Docker + Render/Railway ready"]),
          ]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Platform Scale")] }),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3120, 3120, 3120],
          rows: [
            makeRow(["Metric", "Count", "Status"], true),
            makeRow(["Frontend Pages", "240+", "All routable"]),
            makeRow(["API Endpoints", "250+", "All functional"]),
            makeRow(["Database Tables", "390+", "Schema defined"]),
            makeRow(["Modules", "30+", "Production ready"]),
            makeRow(["Test Files", "15+", "97+ test cases"]),
          ]
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // SECTION 2: CORE MODULES WALKTHROUGH
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("2. Core Modules Walkthrough")] }),

        // Dashboard
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.1 Dashboard & Command Center")] }),
        new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Dashboard (/dashboard)", bold: true })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Real-time KPI cards: Revenue, Active Jobs, Appointments, Pending Invoices")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Trend indicators with sparkline charts showing week-over-week changes")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Quick Actions: New Job Card, New Appointment, New Invoice, Check Inventory")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Recent Activity feed with color-coded event types")] }),
        new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Command Center (/command-center)", bold: true })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Unified operations view across all departments (15s auto-refresh)")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("System health monitoring: API response time, WebSocket connections, DB status")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Alert center with severity-based color coding (critical = red pulse animation)")] }),

        // Service Operations
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.2 Service Operations")] }),
        new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Job Cards", bold: true })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Full lifecycle: Draft > Pending > Assigned > In Progress > QC Review > Completed > Invoiced")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Workflow engine validates all state transitions with role-based permissions")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Auto-generates invoice on completion via event bus")] }),
        new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Appointments & Scheduling", bold: true })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Calendar view with drag-and-drop scheduling")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("AI Scheduling Optimizer: Scores technicians across 4 dimensions (skill match, availability, load balance, efficiency)")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Appointment check-in auto-creates draft job card")] }),
        new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Quality Control (/quality-control)", bold: true })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Inspection checklists for 6 service types (Oil Change, Brake, AC, Tire, Engine, Full)")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Pass/Fail/Conditional results with defect tracking")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("QC analytics: pass rate, rework rate, trend charts")] }),

        new Paragraph({ children: [new PageBreak()] }),

        // Financial
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.3 Financial Module")] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun("All financial endpoints query real database data via Drizzle ORM - no hardcoded mock data.")] }),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3120, 3120, 3120],
          rows: [
            makeRow(["Page", "Endpoint", "Data Source"], true),
            makeRow(["General Ledger", "/api/financial/general-ledger", "Invoices + Payments"]),
            makeRow(["Balance Sheet", "/api/financial/balance-sheet", "Cash + AR + Inventory + AP"]),
            makeRow(["Income Statement", "/api/financial/income-statement", "Revenue - COGS"]),
            makeRow(["Trial Balance", "/api/financial/trial-balance", "Total Debits vs Credits"]),
            makeRow(["Cash Flow", "/api/financial/cash-flow", "Monthly Inflows/Outflows"]),
            makeRow(["Accounts Receivable", "/api/financial/accounts-receivable", "Outstanding Invoices"]),
            makeRow(["Accounts Payable", "/api/financial/accounts-payable", "Outstanding POs"]),
            makeRow(["Multi-Currency", "/api/currency/rates", "SAR + 8 currencies"]),
            makeRow(["Estimates", "/api/estimates", "Quote to Job conversion"]),
          ]
        }),

        // Inventory
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.4 Inventory & Supply Chain")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Stock level monitoring with auto-reorder when below threshold")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Smart Parts Recommendations: AI suggests parts based on job type + vehicle model")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Predictive Maintenance: Predicts 8 service types with urgency/confidence scoring")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Supplier Portal: Performance comparison, spend analytics, PO management")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Inventory valuation with cost/selling value and margin analysis")] }),

        new Paragraph({ children: [new PageBreak()] }),

        // SECTION 3: SAUDI ARABIA COMPLIANCE
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("3. Saudi Arabia Compliance")] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun("The platform is built Saudi-first with full regulatory compliance.")] }),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3120, 6240],
          rows: [
            makeRow(["Feature", "Implementation"], true),
            makeRow(["ZATCA Phase 2", "E-Invoice clearance model with TLV QR code generation"]),
            makeRow(["VAT (15%)", "Auto-calculated on all invoices and estimates"]),
            makeRow(["Hijri Calendar", "Hijri-first date display across all pages"]),
            makeRow(["Ramadan Detection", "Auto-detects Ramadan period for scheduling"]),
            makeRow(["GOSI", "Employer 12% / Saudi Employee 10% / Non-Saudi 2%"]),
            makeRow(["End of Service", "Per Saudi Labor Law Article 84-85"]),
            makeRow(["Vacation Balance", "21 days (first 5 years) / 30 days (after)"]),
            makeRow(["Saudization", "Nitaqat compliance percentage tracking"]),
            makeRow(["Arabic RTL", "Full Arabic UI with RTL layout toggle"]),
          ]
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // SECTION 4: CUSTOMER EXPERIENCE
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("4. Customer Experience")] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.1 Customer Portal")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Self-service booking: Vehicle selection, service type, date/time picker")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Live job tracking with progress indicators and status badges")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Invoice viewing and payment (with VAT breakdown)")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Per-vehicle service history timeline")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.2 Self-Service Kiosk (/kiosk)")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Touch-optimized full-screen interface (h-16+ touch targets)")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Check-in by phone number or license plate")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Walk-in registration with service selection (10 service types with Arabic names)")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Live queue display with wait time estimates")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Auto-resets to welcome screen after 2 minutes of inactivity")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.3 CRM & Loyalty Program")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Customer segments: New, Regular, VIP, At-Risk, Churned (auto-computed)")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Loyalty tiers: Bronze/Silver/Gold/Platinum based on spend thresholds")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Retention metrics: Repeat rate, churn rate, avg lifetime value")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Points system with award/redeem functionality")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.4 Communication Channels")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("WhatsApp Business: Template messaging, conversation history, webhook receiver")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("SMS Campaigns: Audience targeting, delivery analytics, template management")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Notification Center: Multi-channel (in-app/SMS/email) with DB persistence")] }),

        new Paragraph({ children: [new PageBreak()] }),

        // SECTION 5: HR & ADMINISTRATION
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("5. HR & Administration")] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.1 HR & Payroll")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Employee management with department/position tracking")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Attendance: Clock in/out with daily summary")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Leave management: Submit/approve/reject workflow")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Payroll: GOSI-compliant payslips with housing (25%) and transport (10%) allowances")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.2 System Administration")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Audit Trail: DB-persisted with security views, action/resource filtering, statistics")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Document Management: Upload metadata, categories, search/filter")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Data Backup: Real DB export (CSV/JSON), printer-friendly HTML reports")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("API Documentation: 250+ endpoints cataloged, filterable by module/method")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Role-Based Access: Admin/Manager/Technician/Accountant/Advisor filtered navigation")] }),

        new Paragraph({ children: [new PageBreak()] }),

        // SECTION 6: ENTERPRISE FEATURES
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("6. Enterprise Features")] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.1 Franchise Management")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Multi-location analytics: Revenue, jobs, customers per location")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Cross-location inventory sharing and performance comparison")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.2 Fleet Management")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Corporate fleet accounts with vehicle tracking")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Maintenance scheduling with cost analytics per fleet")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.3 Warranty & Service Contracts")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Basic/Standard/Premium plans with claims workflow")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Approve/reject/complete claim lifecycle")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.4 AI & Intelligence")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("AI Business Intelligence: Revenue forecasting, demand prediction")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("AI Scheduling: Multi-dimensional technician-job matching")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Predictive Maintenance: 8 service types with urgency scoring")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Smart Parts: Inventory-aware recommendations with alternatives")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Digital Twin: Vehicle visualization with WebSocket live sensor data")] }),

        new Paragraph({ children: [new PageBreak()] }),

        // SECTION 7: DEPLOYMENT
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("7. Deployment & Production")] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.1 Deployment Options")] }),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3120, 6240],
          rows: [
            makeRow(["Platform", "Configuration"], true),
            makeRow(["Docker", "Multi-stage Dockerfile (node:20-alpine, ~50MB image)"]),
            makeRow(["Render", "render.yaml with free-tier PostgreSQL"]),
            makeRow(["Railway", "railway.json with NIXPACKS builder"]),
            makeRow(["Manual", "npm run build && node dist/index.js"]),
          ]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.2 Health Checks")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("GET /api/health - Status, uptime, version")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("GET /api/health/ready - Database connectivity check")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("GET /api/health/live - Kubernetes liveness probe")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.3 Security")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Rate limiting: 200 req/15min API, 10 req/15min auth")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Zod validation on all POST routes")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Passport.js session authentication")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Role-based access control (6 roles)")] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("CORS and helmet security headers")] }),

        new Paragraph({ children: [new PageBreak()] }),

        // SECTION 8: QUICK START
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("8. Quick Start Guide")] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("8.1 Local Development")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: [new TextRun("Clone: git clone https://github.com/MotazMohd/sls--claud.git")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: [new TextRun("Install: npm install")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: [new TextRun("Configure: cp .env.example .env (set DATABASE_URL and SESSION_SECRET)")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: [new TextRun("Push schema: npx drizzle-kit push")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: [new TextRun("Start: npm run dev")] }),
        new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: [new TextRun("Open: http://localhost:5000")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("8.2 Default Login")] }),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3120, 3120, 3120],
          rows: [
            makeRow(["Role", "Username", "Password"], true),
            makeRow(["Admin", "admin", "admin123"]),
            makeRow(["Manager", "manager", "manager123"]),
            makeRow(["Technician", "technician", "tech123"]),
          ]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("8.3 Key URLs")] }),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [4680, 4680],
          rows: [
            makeRow(["Page", "URL"], true),
            makeRow(["Dashboard", "/dashboard"]),
            makeRow(["Command Center", "/command-center"]),
            makeRow(["Job Cards", "/job-cards"]),
            makeRow(["Invoices", "/invoices"]),
            makeRow(["Self-Service Kiosk", "/kiosk"]),
            makeRow(["Saudi Compliance", "/saudi-compliance"]),
            makeRow(["API Documentation", "/api-docs"]),
            makeRow(["Health Check", "/api/health"]),
          ]
        }),

        new Paragraph({ spacing: { before: 600 }, alignment: AlignmentType.CENTER, border: { top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC", space: 20 } }, children: [
          new TextRun({ text: "SLIS-GMS - Built with passion for the Saudi automotive market", size: 20, color: "999999", italics: true })
        ] }),
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("docs/SLIS-GMS-Demo-Walkthrough.docx", buffer);
  console.log("Document created: docs/SLIS-GMS-Demo-Walkthrough.docx");
});
