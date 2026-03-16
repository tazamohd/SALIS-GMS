import { lazy, Suspense } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";

// Layout components (loaded eagerly as they're always needed)
import { Layout } from "@/components/Layout";
import { CustomerPortalLayout } from "@/components/CustomerPortalLayout";
import { SkipToContent } from "@/components/SkipToContent";
import { TechnicianLayout } from "@/components/TechnicianLayout";
import { PurchaseAgentLayout } from "@/components/PurchaseAgentLayout";
import { ClientLayout } from "@/components/ClientLayout";
import { CustomerMobileLayout } from "@/components/CustomerMobileLayout";
import { TechnicianMobileLayout } from "@/components/TechnicianMobileLayout";

// Core pages (loaded eagerly)
import { useAuth } from "@/hooks/useAuth";
import { UndoRedoProvider } from "@/contexts/UndoRedoContext";
import type { User } from "@shared/schema";

// Loading Fallback Component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0E1117]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A5ED7] mx-auto"></div>
      <p className="mt-4 text-sm text-[#64748B]">Loading...</p>
    </div>
  </div>
);

// ============================================
// Authentication Pages (Lazy Loaded)
// ============================================
const NotFound = lazy(() => import("@/pages/not-found"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const LoginDashboard = lazy(() => import("@/pages/LoginDashboard").then(m => ({ default: m.LoginDashboard })));
const PlatformAdmin = lazy(() => import("@/pages/PlatformAdmin"));
const Landing = lazy(() => import("@/pages/Landing"));
const WelcomePage = lazy(() => import("@/pages/WelcomePage"));
const PublicTracking = lazy(() => import("@/pages/PublicTracking"));
const CustomerPortal = lazy(() => import("@/pages/CustomerPortal"));

// ============================================
// Core Management Pages (Lazy Loaded)
// ============================================
const Dashboard = lazy(() => import("@/pages/Dashboard").then(m => ({ default: m.Dashboard })));
const TasksManagement = lazy(() => import("@/pages/TasksManagement").then(m => ({ default: m.TasksManagement })));
const Appointments = lazy(() => import("@/pages/Appointments").then(m => ({ default: m.Appointments })));
const Customers = lazy(() => import("@/pages/Customers").then(m => ({ default: m.Customers })));
const VehiclesEnhanced = lazy(() => import("@/pages/VehiclesEnhanced"));
const Vehicles = lazy(() => import("@/pages/Vehicles"));
const Profile = lazy(() => import("@/pages/Profile").then(m => ({ default: m.Profile })));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Calendar = lazy(() => import("@/pages/Calendar"));
const Chat = lazy(() => import("@/pages/Chat"));

// ============================================
// Financial & Billing Pages (Lazy Loaded)
// ============================================
const PurchaseOrders = lazy(() => import("@/pages/PurchaseOrders").then(m => ({ default: m.PurchaseOrders })));
const Invoices = lazy(() => import("@/pages/Invoices").then(m => ({ default: m.Invoices })));
const Payments = lazy(() => import("@/pages/Payments"));
const Estimates = lazy(() => import("@/pages/Estimates").then(m => ({ default: m.Estimates })));
const Reports = lazy(() => import("@/pages/Reports").then(m => ({ default: m.Reports })));
const RefundManagement = lazy(() => import("@/pages/RefundManagement"));
const FinancialSettings = lazy(() => import("@/pages/FinancialSettings"));
const PayrollManagement = lazy(() => import("@/pages/PayrollManagement"));
const TimeClockPayroll = lazy(() => import("@/pages/TimeClockPayroll"));
const StripePaymentProcessing = lazy(() => import("@/pages/StripePaymentProcessing"));

// Accounting Module
const BankAccountManagement = lazy(() => import("@/pages/BankAccountManagement"));
const InternalWarehouse = lazy(() => import("@/pages/InternalWarehouse"));
const LossAccount = lazy(() => import("@/pages/LossAccount"));
const SalesGuide = lazy(() => import("@/pages/SalesGuide"));
const AssetsManagement = lazy(() => import("@/pages/AssetsManagement"));
const LiabilitiesManagement = lazy(() => import("@/pages/LiabilitiesManagement"));
const SalesManagement = lazy(() => import("@/pages/SalesManagement"));
const ExpensesManagement = lazy(() => import("@/pages/ExpensesManagement"));
const EquityManagement = lazy(() => import("@/pages/EquityManagement"));
const CapitalManagement = lazy(() => import("@/pages/CapitalManagement"));
const PartnersCurrentAccount = lazy(() => import("@/pages/PartnersCurrentAccount"));
const RetainedEarnings = lazy(() => import("@/pages/RetainedEarnings"));
const ChartOfAccounts = lazy(() => import("@/pages/ChartOfAccounts"));
const GeneralLedger = lazy(() => import("@/pages/GeneralLedger"));
const JournalEntries = lazy(() => import("@/pages/JournalEntries"));
const TrialBalance = lazy(() => import("@/pages/TrialBalance"));
const IncomeStatement = lazy(() => import("@/pages/IncomeStatement"));
const BalanceSheet = lazy(() => import("@/pages/BalanceSheet"));
const CashFlowStatement = lazy(() => import("@/pages/CashFlowStatement"));
const AccountsReceivable = lazy(() => import("@/pages/AccountsReceivable"));
const AccountsPayable = lazy(() => import("@/pages/AccountsPayable"));
const CostCenters = lazy(() => import("@/pages/CostCenters"));
const BudgetManagement = lazy(() => import("@/pages/BudgetManagement"));
const AccountingIntegration = lazy(() => import("@/pages/AccountingIntegration"));

// ============================================
// Service & Job Management Pages (Lazy Loaded)
// ============================================
const JobCards = lazy(() => import("@/pages/JobCards").then(m => ({ default: m.JobCards })));
const ServiceTemplates = lazy(() => import("@/pages/ServiceTemplates"));
const CallCenter = lazy(() => import("@/pages/CallCenter"));
const SupportChatDashboard = lazy(() => import("@/pages/SupportChatDashboard"));
const TechnicianManagement = lazy(() => import("@/pages/TechnicianManagement"));
const TechnicianPortal = lazy(() => import("@/pages/TechnicianPortal").then(m => ({ default: m.TechnicianPortal })));
const TechnicianPerformance = lazy(() => import("@/pages/TechnicianPerformance"));
const TechnicianLeaderboards = lazy(() => import("@/pages/TechnicianLeaderboards"));
const ExpenseTracking = lazy(() => import("@/pages/ExpenseTracking"));
const TimesheetManagement = lazy(() => import("@/pages/TimesheetManagement"));

// ============================================
// Parts & Inventory Management (Lazy Loaded)
// ============================================
const SpareParts = lazy(() => import("@/pages/SpareParts"));
const Suppliers = lazy(() => import("@/pages/Suppliers"));
const InventoryManagement = lazy(() => import("@/pages/InventoryManagement"));
const PartsAvailability = lazy(() => import("@/pages/PartsAvailability").then(m => ({ default: m.PartsAvailability })));
const SmartAssignment = lazy(() => import("@/pages/SmartAssignment").then(m => ({ default: m.SmartAssignment })));
const Tools = lazy(() => import("@/pages/Tools"));
const PartsAutoReorder = lazy(() => import("@/pages/PartsAutoReorder"));
const AutomatedReordering = lazy(() => import("@/pages/AutomatedReordering"));
const SmartPartsRecommendations = lazy(() => import("@/pages/SmartPartsRecommendations"));
const SmartPartsRecommender = lazy(() => import("@/pages/SmartPartsRecommender"));
const PartsMarketplace = lazy(() => import("@/pages/PartsMarketplace"));
const PartsSupplyNetwork = lazy(() => import("@/pages/PartsSupplyNetwork"));

// ============================================
// Vehicle Management Pages (Lazy Loaded)
// ============================================
const FleetManagement = lazy(() => import("@/pages/FleetManagement"));
const FleetTracking = lazy(() => import("@/pages/FleetTracking"));
const VehicleInspections = lazy(() => import("@/pages/VehicleInspections"));
const VehicleChecklist = lazy(() => import("@/pages/VehicleChecklist"));
const TowingAssistance = lazy(() => import("@/pages/TowingAssistance"));
const LoanerVehicles = lazy(() => import("@/pages/LoanerVehicles"));
const TireManagement = lazy(() => import("@/pages/TireManagement"));
const VehicleTracking = lazy(() => import("@/pages/VehicleTracking"));
const VehicleHistory = lazy(() => import("@/pages/VehicleHistory"));
const ContractManagement = lazy(() => import("@/pages/ContractManagement"));
const WarrantyManagement = lazy(() => import("@/pages/WarrantyManagement"));
const TowingServices = lazy(() => import("@/pages/TowingServices"));
const VehicleStorage = lazy(() => import("@/pages/VehicleStorage"));

// ============================================
// AI & Advanced Features (Lazy Loaded)
// ============================================
const AIChatbot = lazy(() => import("@/pages/AIChatbot"));
const AIChatbotAssistant = lazy(() => import("@/pages/AIChatbotAssistant"));
const PredictiveMaintenance = lazy(() => import("@/pages/PredictiveMaintenance"));
const PredictiveDiagnostics = lazy(() => import("@/pages/PredictiveDiagnostics"));
const VoiceCommands = lazy(() => import("@/pages/VoiceCommands"));
const DocumentOCR = lazy(() => import("@/pages/DocumentOCR"));
const SmartDamageAssessment = lazy(() => import("@/pages/SmartDamageAssessment"));
const IntelligentPriceOptimizer = lazy(() => import("@/pages/IntelligentPriceOptimizer"));
const SmartInventoryForecasting = lazy(() => import("@/pages/SmartInventoryForecasting"));
const AIServiceAdvisor = lazy(() => import("@/pages/AIServiceAdvisor"));
const VehicleHealthMonitoring = lazy(() => import("@/pages/VehicleHealthMonitoring"));
const AIAutomation = lazy(() => import("@/pages/AIAutomation"));
const AIScheduling = lazy(() => import("@/pages/AIScheduling"));
const AIInsights = lazy(() => import("@/pages/AIInsights"));
const DiagnosticsOBDHub = lazy(() => import("@/pages/DiagnosticsOBDHub"));
const VoiceCommandInterface = lazy(() => import("@/pages/VoiceCommandInterface"));
const DocumentManagement = lazy(() => import("@/pages/DocumentManagement"));
const DataImportExport = lazy(() => import("@/pages/DataImportExport"));
const BusinessIntelligence = lazy(() => import("@/pages/BusinessIntelligence"));
const BusinessIntelligenceDashboard = lazy(() => import("@/pages/BusinessIntelligenceDashboard"));
const ProfitAnalysis = lazy(() => import("@/pages/ProfitAnalysis"));
const CustomerLTVAnalysis = lazy(() => import("@/pages/CustomerLTVAnalysis"));
const BusinessHeatMaps = lazy(() => import("@/pages/BusinessHeatMaps"));
const DynamicPricing = lazy(() => import("@/pages/DynamicPricing"));
const ComputerVisionQC = lazy(() => import("@/pages/ComputerVisionQC"));
const DigitalTwinViewer = lazy(() => import("@/pages/DigitalTwinViewer"));
const DroneInspection = lazy(() => import("@/pages/DroneInspection"));
const MLFraudDetection = lazy(() => import("@/pages/MLFraudDetection"));
const EdgeComputingDiagnostics = lazy(() => import("@/pages/EdgeComputingDiagnostics"));
const IoTDashboard = lazy(() => import("@/pages/IoTDashboard"));
const KPIDashboard = lazy(() => import("@/pages/KPIDashboard"));
const CommandCenter = lazy(() => import("@/pages/CommandCenter"));
const CustomReportBuilder = lazy(() => import("@/pages/CustomReportBuilder"));

// ============================================
// Marketing & Customer Engagement (Lazy Loaded)
// ============================================
const MarketingAutomation = lazy(() => import("@/pages/MarketingAutomation"));
const MarketingHub = lazy(() => import("@/pages/MarketingHub"));
const CustomerLoyalty = lazy(() => import("@/pages/CustomerLoyalty"));
const EmailMarketingCampaigns = lazy(() => import("@/pages/EmailMarketingCampaigns"));
const SocialMediaIntegration = lazy(() => import("@/pages/SocialMediaIntegration"));
const CustomerReviewsRatings = lazy(() => import("@/pages/CustomerReviewsRatings"));
const ReferralProgram = lazy(() => import("@/pages/ReferralProgram"));
const CustomerFeedback = lazy(() => import("@/pages/CustomerFeedback"));
const GoogleMyBusiness = lazy(() => import("@/pages/GoogleMyBusiness"));
const SocialMediaMonitoring = lazy(() => import("@/pages/SocialMediaMonitoring"));
const LoyaltyProgram = lazy(() => import("@/pages/LoyaltyProgram"));

// ============================================
// Technician Portal Pages (Lazy Loaded)
// ============================================
const TechnicianDashboard = lazy(() => import("@/pages/technician/Dashboard"));
const TechnicianMyJobs = lazy(() => import("@/pages/technician/MyJobs"));
const TechnicianTimeClock = lazy(() => import("@/pages/technician/TimeClock"));
const TechnicianPartsLookup = lazy(() => import("@/pages/technician/PartsLookup"));
const TechnicianJobDocumentation = lazy(() => import("@/pages/technician/JobDocumentation"));
const TechnicianProfile = lazy(() => import("@/pages/technician/Profile"));
const TechnicianAttendance = lazy(() => import("@/pages/technician/Attendance"));
const TechnicianServiceGuides = lazy(() => import("@/pages/technician/ServiceGuides"));
const TechnicianSoftware = lazy(() => import("@/pages/technician/TechnicalSoftware"));
const TechnicianMobilePortal = lazy(() => import("@/pages/mobile/TechnicianMobilePortal"));

// ============================================
// Purchase Agent Portal Pages (Lazy Loaded)
// ============================================
const PurchaseAgentDashboard = lazy(() => import("@/pages/purchase-agent/Dashboard"));
const PurchaseAgentOrders = lazy(() => import("@/pages/purchase-agent/Orders"));
const PurchaseAgentSuppliers = lazy(() => import("@/pages/purchase-agent/Suppliers"));
const PurchaseAgentInventory = lazy(() => import("@/pages/purchase-agent/Inventory"));
const PurchaseAgentPriceCompare = lazy(() => import("@/pages/purchase-agent/PriceCompare"));
const PurchaseAgentTracking = lazy(() => import("@/pages/purchase-agent/Tracking"));
const PurchaseAgentReports = lazy(() => import("@/pages/purchase-agent/Reports"));
const PurchaseAgentTaskInbox = lazy(() => import("@/pages/purchase-agent/TaskInbox"));
const PurchaseAgentQuotationManagement = lazy(() => import("@/pages/purchase-agent/QuotationManagement"));
const PurchaseAgentPaymentTracking = lazy(() => import("@/pages/purchase-agent/PaymentTracking"));
const PurchaseAgentDeliveryTracking = lazy(() => import("@/pages/purchase-agent/DeliveryTracking"));
const PurchaseAgentLiveDeliveryTracking = lazy(() => import("@/pages/purchase-agent/LiveDeliveryTracking"));

// ============================================
// Customer & Client Portal Pages (Lazy Loaded)
// ============================================
const CustomerDashboard = lazy(() => import("@/pages/customer/CustomerDashboard").then(m => ({ default: m.CustomerDashboard })));
const CustomerAppointments = lazy(() => import("@/pages/customer/CustomerAppointments").then(m => ({ default: m.CustomerAppointments })));
const CustomerInvoices = lazy(() => import("@/pages/customer/CustomerInvoices").then(m => ({ default: m.CustomerInvoices })));
const CustomerVehicles = lazy(() => import("@/pages/customer/CustomerVehicles").then(m => ({ default: m.CustomerVehicles })));
const CustomerCommunications = lazy(() => import("@/pages/customer/CustomerCommunications").then(m => ({ default: m.CustomerCommunications })));

const ClientDashboard = lazy(() => import("@/pages/client/Dashboard"));
const ClientVehicles = lazy(() => import("@/pages/client/Vehicles"));
const ClientAppointments = lazy(() => import("@/pages/client/Appointments"));
const ClientInvoices = lazy(() => import("@/pages/client/Invoices"));
const ClientProfile = lazy(() => import("@/pages/client/Profile"));
const ClientServiceHistory = lazy(() => import("@/pages/client/ServiceHistory"));
const ClientLiveTracking = lazy(() => import("@/pages/client/LiveTracking"));
const ClientReminders = lazy(() => import("@/pages/client/ServiceReminders"));
const ClientReviewChat = lazy(() => import("@/pages/client/ReviewChat"));

// ============================================
// Mobile App Pages (Lazy Loaded)
// ============================================
const CustomerMobileHome = lazy(() => import("@/pages/mobile/CustomerMobileHome"));
const CustomerMobileBooking = lazy(() => import("@/pages/mobile/CustomerMobileBooking"));
const CustomerMobileVehicles = lazy(() => import("@/pages/mobile/CustomerMobileVehicles"));
const CustomerMobilePayments = lazy(() => import("@/pages/mobile/CustomerMobilePayments"));
const CustomerMobileProfile = lazy(() => import("@/pages/mobile/CustomerMobileProfile"));

const TechnicianMobileHome = lazy(() => import("@/pages/mobile/TechnicianMobileHome"));
const TechnicianMobileJobs = lazy(() => import("@/pages/mobile/TechnicianMobileJobs"));
const TechnicianMobileClock = lazy(() => import("@/pages/mobile/TechnicianMobileClock"));
const TechnicianMobileLookup = lazy(() => import("@/pages/mobile/TechnicianMobileLookup"));
const TechnicianMobileProfile = lazy(() => import("@/pages/mobile/TechnicianMobileProfile"));

// ============================================
// Parts Network Pages (Lazy Loaded)
// ============================================
const PartsNetworkLayout = lazy(() => import("@/pages/parts-network/PartsNetworkLayout"));
const PartsNetworkDashboard = lazy(() => import("@/pages/parts-network/PartsNetworkDashboard"));
const SendQuotationRequest = lazy(() => import("@/pages/parts-network/SendQuotationRequest"));
const MyRequests = lazy(() => import("@/pages/parts-network/MyRequests"));
const IncomingRequests = lazy(() => import("@/pages/parts-network/IncomingRequests"));
const QuotationsList = lazy(() => import("@/pages/parts-network/QuotationsList"));
const NetworkMembers = lazy(() => import("@/pages/parts-network/NetworkMembers"));
const NetworkOrders = lazy(() => import("@/pages/parts-network/NetworkOrders"));

// ============================================
// Admin & Settings Pages (Lazy Loaded)
// ============================================
const Settings = lazy(() => import("@/pages/Settings"));
const RoleManagement = lazy(() => import("@/pages/RoleManagement"));
const Security = lazy(() => import("@/pages/Security"));
const Integrations = lazy(() => import("@/pages/Integrations"));
const HRManagement = lazy(() => import("@/pages/HRManagement"));

// ============================================
// Specialized Features (Lazy Loaded)
// ============================================
const FranchiseManagement = lazy(() => import("@/pages/FranchiseManagement"));
const GlobalizationLayer = lazy(() => import("@/pages/GlobalizationLayer"));
const OEMSoftwareSubscriptions = lazy(() => import("@/pages/OEMSoftwareSubscriptions"));
const VendorSupplierPortal = lazy(() => import("@/pages/VendorSupplierPortal"));
const VideoConsultations = lazy(() => import("@/pages/VideoConsultations"));
const LiveServiceTracking = lazy(() => import("@/pages/LiveServiceTracking"));
const VideoEstimates = lazy(() => import("@/pages/VideoEstimates"));
const DigitalVehicleWalkaround = lazy(() => import("@/pages/DigitalVehicleWalkaround"));
const EquipmentCalibration = lazy(() => import("@/pages/EquipmentCalibration"));
const RoutingOptimizer = lazy(() => import("@/pages/RoutingOptimizer"));
const SafetyIncidents = lazy(() => import("@/pages/SafetyIncidents"));
const EnvironmentalCompliance = lazy(() => import("@/pages/EnvironmentalCompliance"));
const ISOQualityManagement = lazy(() => import("@/pages/ISOQualityManagement"));
const InsuranceClaims = lazy(() => import("@/pages/InsuranceClaims"));
const BarcodeScanner = lazy(() => import("@/pages/BarcodeScanner"));
const DigitalSignage = lazy(() => import("@/pages/DigitalSignage"));
const KioskCheckIn = lazy(() => import("@/pages/KioskCheckIn"));
const SecurityCameras = lazy(() => import("@/pages/SecurityCameras"));
const LicensePlateRecognition = lazy(() => import("@/pages/LicensePlateRecognition"));
const EmergingTechnologies = lazy(() => import("@/pages/EmergingTechnologies"));
const Interactive3DParts = lazy(() => import("@/pages/Interactive3DParts"));
const NextGenTechnologies = lazy(() => import("@/pages/NextGenTechnologies"));
const ServiceBayDashboard = lazy(() => import("@/pages/ServiceBayDashboard"));
const WorkshopCalendar = lazy(() => import("@/pages/WorkshopCalendar"));
const VINDecoder = lazy(() => import("@/pages/VINDecoder"));
const TelematicsIntegration = lazy(() => import("@/pages/TelematicsIntegration"));
const KnowledgeBase = lazy(() => import("@/pages/KnowledgeBase"));
const TrainingLMS = lazy(() => import("@/pages/TrainingLMS"));
const ComplianceManagement = lazy(() => import("@/pages/ComplianceManagement"));
const StaffPerformanceReview = lazy(() => import("@/pages/StaffPerformanceReview"));
const SustainableEnergyMonitoring = lazy(() => import("@/pages/SustainableEnergyMonitoring"));
const TaskManagement = lazy(() => import("@/pages/TaskManagement"));
const DataBackup = lazy(() => import("@/pages/DataBackup"));
const DashboardWidgets = lazy(() => import("@/pages/DashboardWidgets"));
const WearableIntegration = lazy(() => import("@/pages/WearableIntegration"));
const SaudiComplianceDashboard = lazy(() => import("@/pages/SaudiComplianceDashboard"));
const AppointmentReminders = lazy(() => import("@/pages/AppointmentReminders"));

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0E1117]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A5ED7] mx-auto"></div>
          <p className="mt-4 text-sm text-[#64748B]">Loading SALIS AUTO...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/track/:token" component={PublicTracking} />
          <Route path="/customer-portal" component={CustomerPortal} />
          <Route component={Login} />
        </Switch>
      </Suspense>
    );
  }

  // Check if user is a customer
  const isCustomer = user?.userType === 'customer';

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
      {/* Root path - show dashboard directly */}
      <Route path="/">
        <Layout>
          <Dashboard />
        </Layout>
      </Route>

      {/* Customer Portal Routes */}
      <Route path="/portal/dashboard">
        <CustomerPortalLayout>
          <CustomerDashboard />
        </CustomerPortalLayout>
      </Route>
      <Route path="/portal/appointments">
        <CustomerPortalLayout>
          <CustomerAppointments />
        </CustomerPortalLayout>
      </Route>
      <Route path="/portal/invoices">
        <CustomerPortalLayout>
          <CustomerInvoices />
        </CustomerPortalLayout>
      </Route>
      <Route path="/portal/vehicles">
        <CustomerPortalLayout>
          <CustomerVehicles />
        </CustomerPortalLayout>
      </Route>
      <Route path="/portal/communications">
        <CustomerPortalLayout>
          <CustomerCommunications />
        </CustomerPortalLayout>
      </Route>

      {/* Welcome Page - Role-based routing */}
      <Route path="/welcome" component={WelcomePage} />

      {/* Garage Management Routes */}
      <Route path="/old-dashboard" component={LoginDashboard} />
      <Route path="/dashboard">
        <Layout>
          <Dashboard />
        </Layout>
      </Route>
      <Route path="/tasks">
        <Layout>
          <TasksManagement />
        </Layout>
      </Route>
      <Route path="/appointments">
        <Layout>
          <Appointments />
        </Layout>
      </Route>
      <Route path="/customers">
        <Layout>
          <Customers />
        </Layout>
      </Route>
      <Route path="/vehicles">
        <Layout>
          <VehiclesEnhanced />
        </Layout>
      </Route>
      <Route path="/fleet-management">
        <Layout>
          <FleetManagement />
        </Layout>
      </Route>
      <Route path="/fleet-tracking">
        <Layout>
          <FleetTracking />
        </Layout>
      </Route>
      <Route path="/contract-management">
        <Layout>
          <ContractManagement />
        </Layout>
      </Route>
      <Route path="/warranty-management">
        <Layout>
          <WarrantyManagement />
        </Layout>
      </Route>
      <Route path="/vehicle-inspections">
        <Layout>
          <VehicleInspections />
        </Layout>
      </Route>
      <Route path="/vehicle-checklist">
        <Layout>
          <VehicleChecklist />
        </Layout>
      </Route>
      <Route path="/towing-assistance">
        <Layout>
          <TowingAssistance />
        </Layout>
      </Route>
      <Route path="/loaner-vehicles">
        <Layout>
          <LoanerVehicles />
        </Layout>
      </Route>
      <Route path="/tire-management">
        <Layout>
          <TireManagement />
        </Layout>
      </Route>
      <Route path="/kpi-dashboard">
        <Layout>
          <KPIDashboard />
        </Layout>
      </Route>
      <Route path="/command-center">
        <Layout>
          <CommandCenter />
        </Layout>
      </Route>
      <Route path="/saudi-compliance">
        <Layout>
          <SaudiComplianceDashboard />
        </Layout>
      </Route>
      <Route path="/ai-insights">
        <Layout>
          <AIInsights />
        </Layout>
      </Route>
      <Route path="/appointment-reminders">
        <Layout>
          <AppointmentReminders />
        </Layout>
      </Route>
      <Route path="/custom-reports">
        <Layout>
          <CustomReportBuilder />
        </Layout>
      </Route>
      <Route path="/vin-decoder">
        <Layout>
          <VINDecoder />
        </Layout>
      </Route>
      <Route path="/technician-leaderboards">
        <Layout>
          <TechnicianLeaderboards />
        </Layout>
      </Route>
      <Route path="/vendor-supplier-portal">
        <Layout>
          <VendorSupplierPortal />
        </Layout>
      </Route>
      <Route path="/marketing-automation">
        <Layout>
          <MarketingAutomation />
        </Layout>
      </Route>
      <Route path="/marketing-hub">
        <Layout>
          <MarketingHub />
        </Layout>
      </Route>
      <Route path="/customer-loyalty">
        <Layout>
          <CustomerLoyalty />
        </Layout>
      </Route>
      <Route path="/document-management">
        <Layout>
          <DocumentManagement />
        </Layout>
      </Route>
      <Route path="/purchase-orders">
        <Layout>
          <PurchaseOrders />
        </Layout>
      </Route>
      <Route path="/invoices">
        <Layout>
          <Invoices />
        </Layout>
      </Route>
      <Route path="/payments">
        <Layout>
          <Payments />
        </Layout>
      </Route>
      <Route path="/estimates">
        <Layout>
          <Estimates />
        </Layout>
      </Route>
      <Route path="/reports">
        <Layout>
          <Reports />
        </Layout>
      </Route>
      <Route path="/job-cards">
        <Layout>
          <JobCards />
        </Layout>
      </Route>
      <Route path="/service-templates">
        <Layout>
          <ServiceTemplates />
        </Layout>
      </Route>
      <Route path="/tools">
        <Layout>
          <Tools />
        </Layout>
      </Route>
      <Route path="/spare-parts">
        <Layout>
          <SpareParts />
        </Layout>
      </Route>
      <Route path="/inventory-management">
        <Layout>
          <InventoryManagement />
        </Layout>
      </Route>
      <Route path="/parts-availability">
        <Layout>
          <PartsAvailability />
        </Layout>
      </Route>
      <Route path="/smart-assignment">
        <Layout>
          <SmartAssignment />
        </Layout>
      </Route>
      <Route path="/call-center">
        <Layout>
          <CallCenter />
        </Layout>
      </Route>
      <Route path="/support-chat-dashboard">
        <Layout>
          <SupportChatDashboard />
        </Layout>
      </Route>
      <Route path="/suppliers">
        <Layout>
          <Suppliers />
        </Layout>
      </Route>
      <Route path="/technician-portal">
        <TechnicianLayout>
          <TechnicianDashboard />
        </TechnicianLayout>
      </Route>
      <Route path="/technician-portal/my-jobs">
        <TechnicianLayout>
          <TechnicianMyJobs />
        </TechnicianLayout>
      </Route>
      <Route path="/technician-portal/time-clock">
        <TechnicianLayout>
          <TechnicianTimeClock />
        </TechnicianLayout>
      </Route>
      <Route path="/technician-portal/parts">
        <TechnicianLayout>
          <TechnicianPartsLookup />
        </TechnicianLayout>
      </Route>
      <Route path="/technician-portal/documentation">
        <TechnicianLayout>
          <TechnicianJobDocumentation />
        </TechnicianLayout>
      </Route>
      <Route path="/technician-portal/profile">
        <TechnicianLayout>
          <TechnicianProfile />
        </TechnicianLayout>
      </Route>
      <Route path="/technician-portal/attendance">
        <TechnicianLayout>
          <TechnicianAttendance />
        </TechnicianLayout>
      </Route>
      <Route path="/technician-portal/guides">
        <TechnicianLayout>
          <TechnicianServiceGuides />
        </TechnicianLayout>
      </Route>
      <Route path="/technician-portal/software">
        <TechnicianLayout>
          <TechnicianSoftware />
        </TechnicianLayout>
      </Route>
      <Route path="/technician-mobile">
        <TechnicianMobilePortal />
      </Route>

      {/* Purchase Agent Portal Routes */}
      <Route path="/purchase-agent">
        <PurchaseAgentLayout>
          <PurchaseAgentDashboard />
        </PurchaseAgentLayout>
      </Route>
      <Route path="/purchase-agent/tasks">
        <PurchaseAgentLayout>
          <PurchaseAgentTaskInbox />
        </PurchaseAgentLayout>
      </Route>
      <Route path="/purchase-agent/quotations">
        <PurchaseAgentLayout>
          <PurchaseAgentQuotationManagement />
        </PurchaseAgentLayout>
      </Route>
      <Route path="/purchase-agent/payments">
        <PurchaseAgentLayout>
          <PurchaseAgentPaymentTracking />
        </PurchaseAgentLayout>
      </Route>
      <Route path="/purchase-agent/delivery">
        <PurchaseAgentLayout>
          <PurchaseAgentDeliveryTracking />
        </PurchaseAgentLayout>
      </Route>
      <Route path="/purchase-agent/delivery-tracking/:id">
        <PurchaseAgentLayout>
          <PurchaseAgentLiveDeliveryTracking />
        </PurchaseAgentLayout>
      </Route>
      <Route path="/purchase-agent/orders">
        <PurchaseAgentLayout>
          <PurchaseAgentOrders />
        </PurchaseAgentLayout>
      </Route>
      <Route path="/purchase-agent/suppliers">
        <PurchaseAgentLayout>
          <PurchaseAgentSuppliers />
        </PurchaseAgentLayout>
      </Route>
      <Route path="/purchase-agent/inventory">
        <PurchaseAgentLayout>
          <PurchaseAgentInventory />
        </PurchaseAgentLayout>
      </Route>
      <Route path="/purchase-agent/price-compare">
        <PurchaseAgentLayout>
          <PurchaseAgentPriceCompare />
        </PurchaseAgentLayout>
      </Route>
      <Route path="/purchase-agent/tracking">
        <PurchaseAgentLayout>
          <PurchaseAgentTracking />
        </PurchaseAgentLayout>
      </Route>
      <Route path="/purchase-agent/reports">
        <PurchaseAgentLayout>
          <PurchaseAgentReports />
        </PurchaseAgentLayout>
      </Route>

      {/* B2B Parts Network Portal Routes */}
      <Route path="/parts-network">
        <PartsNetworkLayout title="Parts Network Dashboard">
          <PartsNetworkDashboard />
        </PartsNetworkLayout>
      </Route>
      <Route path="/parts-network/send-request">
        <PartsNetworkLayout title="Send Quotation Request">
          <SendQuotationRequest />
        </PartsNetworkLayout>
      </Route>
      <Route path="/parts-network/my-requests">
        <PartsNetworkLayout title="My Requests">
          <MyRequests />
        </PartsNetworkLayout>
      </Route>
      <Route path="/parts-network/incoming-requests">
        <PartsNetworkLayout title="Incoming Requests">
          <IncomingRequests />
        </PartsNetworkLayout>
      </Route>
      <Route path="/parts-network/quotations">
        <PartsNetworkLayout title="Quotations">
          <QuotationsList />
        </PartsNetworkLayout>
      </Route>
      <Route path="/parts-network/members">
        <PartsNetworkLayout title="Network Members">
          <NetworkMembers />
        </PartsNetworkLayout>
      </Route>
      <Route path="/parts-network/orders">
        <PartsNetworkLayout title="Orders">
          <NetworkOrders />
        </PartsNetworkLayout>
      </Route>

      <Route path="/technician-portal-old">
        <Layout>
          <TechnicianPortal />
        </Layout>
      </Route>
      <Route path="/technician-management">
        <Layout>
          <TechnicianManagement />
        </Layout>
      </Route>
      <Route path="/profile">
        <Layout>
          <Profile />
        </Layout>
      </Route>
      <Route path="/notifications">
        <Layout>
          <Notifications />
        </Layout>
      </Route>
      <Route path="/calendar">
        <Layout>
          <Calendar />
        </Layout>
      </Route>
      <Route path="/financial-settings">
        <Layout>
          <FinancialSettings />
        </Layout>
      </Route>
      <Route path="/refund-management">
        <Layout>
          <RefundManagement />
        </Layout>
      </Route>
      <Route path="/data-import-export">
        <Layout>
          <DataImportExport />
        </Layout>
      </Route>
      <Route path="/business-intelligence">
        <Layout>
          <BusinessIntelligence />
        </Layout>
      </Route>
      <Route path="/hr-management">
        <Layout>
          <HRManagement />
        </Layout>
      </Route>
      <Route path="/ai-automation">
        <Layout>
          <AIAutomation />
        </Layout>
      </Route>
      <Route path="/integrations">
        <Layout>
          <Integrations />
        </Layout>
      </Route>
      <Route path="/security">
        <Layout>
          <Security />
        </Layout>
      </Route>
      <Route path="/settings">
        <Layout>
          <Settings />
        </Layout>
      </Route>
      <Route path="/role-management">
        <Layout>
          <RoleManagement />
        </Layout>
      </Route>

      {/* Platform Administration Routes */}
      <Route path="/platform-admin/:tab?">
        <Layout>
          <PlatformAdmin />
        </Layout>
      </Route>

      <Route path="/data-backup">
        <Layout>
          <DataBackup />
        </Layout>
      </Route>
      <Route path="/bank-account-management">
        <Layout>
          <BankAccountManagement />
        </Layout>
      </Route>
      <Route path="/internal-warehouse">
        <Layout>
          <InternalWarehouse />
        </Layout>
      </Route>
      <Route path="/loss-account">
        <Layout>
          <LossAccount />
        </Layout>
      </Route>
      <Route path="/sales-guide">
        <Layout>
          <SalesGuide />
        </Layout>
      </Route>
      <Route path="/assets-management">
        <Layout>
          <AssetsManagement />
        </Layout>
      </Route>
      <Route path="/liabilities-management">
        <Layout>
          <LiabilitiesManagement />
        </Layout>
      </Route>
      <Route path="/sales-management">
        <Layout>
          <SalesManagement />
        </Layout>
      </Route>
      <Route path="/expenses-management">
        <Layout>
          <ExpensesManagement />
        </Layout>
      </Route>
      <Route path="/equity-management">
        <Layout>
          <EquityManagement />
        </Layout>
      </Route>
      <Route path="/capital-management">
        <Layout>
          <CapitalManagement />
        </Layout>
      </Route>
      <Route path="/partners-current-account">
        <Layout>
          <PartnersCurrentAccount />
        </Layout>
      </Route>
      <Route path="/retained-earnings">
        <Layout>
          <RetainedEarnings />
        </Layout>
      </Route>
      <Route path="/chart-of-accounts">
        <Layout>
          <ChartOfAccounts />
        </Layout>
      </Route>
      <Route path="/general-ledger">
        <Layout>
          <GeneralLedger />
        </Layout>
      </Route>
      <Route path="/journal-entries">
        <Layout>
          <JournalEntries />
        </Layout>
      </Route>
      <Route path="/trial-balance">
        <Layout>
          <TrialBalance />
        </Layout>
      </Route>
      <Route path="/income-statement">
        <Layout>
          <IncomeStatement />
        </Layout>
      </Route>
      <Route path="/balance-sheet">
        <Layout>
          <BalanceSheet />
        </Layout>
      </Route>
      <Route path="/cash-flow-statement">
        <Layout>
          <CashFlowStatement />
        </Layout>
      </Route>
      <Route path="/accounts-receivable">
        <Layout>
          <AccountsReceivable />
        </Layout>
      </Route>
      <Route path="/accounts-payable">
        <Layout>
          <AccountsPayable />
        </Layout>
      </Route>
      <Route path="/cost-centers">
        <Layout>
          <CostCenters />
        </Layout>
      </Route>
      <Route path="/budget-management">
        <Layout>
          <BudgetManagement />
        </Layout>
      </Route>
      <Route path="/dashboard-widgets">
        <Layout>
          <DashboardWidgets />
        </Layout>
      </Route>
      <Route path="/chat">
        <Layout>
          <Chat />
        </Layout>
      </Route>
      <Route path="/franchise-management">
        <Layout>
          <FranchiseManagement />
        </Layout>
      </Route>
      <Route path="/globalization">
        <Layout>
          <GlobalizationLayer />
        </Layout>
      </Route>
      <Route path="/parts-supply-network">
        <Layout>
          <PartsSupplyNetwork />
        </Layout>
      </Route>
      <Route path="/diagnostics-obd">
        <Layout>
          <DiagnosticsOBDHub />
        </Layout>
      </Route>
      <Route path="/oem-software">
        <Layout>
          <OEMSoftwareSubscriptions />
        </Layout>
      </Route>
      <Route path="/ai-chatbot">
        <Layout>
          <AIChatbot />
        </Layout>
      </Route>
      <Route path="/ai-chatbot-assistant">
        <Layout>
          <AIChatbotAssistant />
        </Layout>
      </Route>
      <Route path="/predictive-maintenance">
        <Layout>
          <PredictiveMaintenance />
        </Layout>
      </Route>
      <Route path="/predictive-diagnostics">
        <Layout>
          <PredictiveDiagnostics />
        </Layout>
      </Route>
      <Route path="/smart-parts-recommendations">
        <Layout>
          <SmartPartsRecommendations />
        </Layout>
      </Route>
      <Route path="/voice-commands">
        <Layout>
          <VoiceCommands />
        </Layout>
      </Route>
      <Route path="/document-ocr">
        <Layout>
          <DocumentOCR />
        </Layout>
      </Route>
      <Route path="/smart-damage-assessment">
        <Layout>
          <SmartDamageAssessment />
        </Layout>
      </Route>
      <Route path="/intelligent-price-optimizer">
        <Layout>
          <IntelligentPriceOptimizer />
        </Layout>
      </Route>
      <Route path="/smart-inventory-forecasting">
        <Layout>
          <SmartInventoryForecasting />
        </Layout>
      </Route>
      <Route path="/ai-service-advisor">
        <Layout>
          <AIServiceAdvisor />
        </Layout>
      </Route>
      <Route path="/vehicle-health-monitoring">
        <Layout>
          <VehicleHealthMonitoring />
        </Layout>
      </Route>
      <Route path="/business-intelligence-dashboard">
        <Layout>
          <BusinessIntelligenceDashboard />
        </Layout>
      </Route>
      <Route path="/profit-analysis">
        <Layout>
          <ProfitAnalysis />
        </Layout>
      </Route>
      <Route path="/customer-ltv-analysis">
        <Layout>
          <CustomerLTVAnalysis />
        </Layout>
      </Route>
      <Route path="/business-heatmaps">
        <Layout>
          <BusinessHeatMaps />
        </Layout>
      </Route>
      <Route path="/accounting-integration">
        <Layout>
          <AccountingIntegration />
        </Layout>
      </Route>
      <Route path="/email-marketing-campaigns">
        <Layout>
          <EmailMarketingCampaigns />
        </Layout>
      </Route>
      <Route path="/social-media-integration">
        <Layout>
          <SocialMediaIntegration />
        </Layout>
      </Route>
      <Route path="/video-consultations">
        <Layout>
          <VideoConsultations />
        </Layout>
      </Route>
      <Route path="/parts-marketplace">
        <Layout>
          <PartsMarketplace />
        </Layout>
      </Route>
      <Route path="/stripe-payment-processing">
        <Layout>
          <StripePaymentProcessing />
        </Layout>
      </Route>
      <Route path="/live-service-tracking">
        <Layout>
          <LiveServiceTracking />
        </Layout>
      </Route>
      <Route path="/video-estimates">
        <Layout>
          <VideoEstimates />
        </Layout>
      </Route>
      <Route path="/digital-vehicle-walkaround">
        <Layout>
          <DigitalVehicleWalkaround />
        </Layout>
      </Route>
      <Route path="/customer-reviews-ratings">
        <Layout>
          <CustomerReviewsRatings />
        </Layout>
      </Route>
      <Route path="/customer-feedback">
        <Layout>
          <CustomerFeedback />
        </Layout>
      </Route>
      <Route path="/referral-program">
        <Layout>
          <ReferralProgram />
        </Layout>
      </Route>
      <Route path="/ai-scheduling">
        <Layout>
          <AIScheduling />
        </Layout>
      </Route>
      <Route path="/parts-auto-reorder">
        <Layout>
          <PartsAutoReorder />
        </Layout>
      </Route>
      <Route path="/timeclock-payroll">
        <Layout>
          <TimeClockPayroll />
        </Layout>
      </Route>
      <Route path="/equipment-calibration">
        <Layout>
          <EquipmentCalibration />
        </Layout>
      </Route>
      <Route path="/routing-optimizer">
        <Layout>
          <RoutingOptimizer />
        </Layout>
      </Route>
      <Route path="/safety-incidents">
        <Layout>
          <SafetyIncidents />
        </Layout>
      </Route>
      <Route path="/environmental-compliance">
        <Layout>
          <EnvironmentalCompliance />
        </Layout>
      </Route>
      <Route path="/iso-quality">
        <Layout>
          <ISOQualityManagement />
        </Layout>
      </Route>
      <Route path="/insurance-claims">
        <Layout>
          <InsuranceClaims />
        </Layout>
      </Route>
      <Route path="/barcode-scanner">
        <Layout>
          <BarcodeScanner />
        </Layout>
      </Route>
      <Route path="/digital-signage">
        <Layout>
          <DigitalSignage />
        </Layout>
      </Route>
      <Route path="/kiosk-checkin">
        <Layout>
          <KioskCheckIn />
        </Layout>
      </Route>
      <Route path="/security-cameras">
        <Layout>
          <SecurityCameras />
        </Layout>
      </Route>
      <Route path="/license-plate">
        <Layout>
          <LicensePlateRecognition />
        </Layout>
      </Route>
      <Route path="/emerging-technologies">
        <Layout>
          <EmergingTechnologies />
        </Layout>
      </Route>
      <Route path="/interactive-3d-parts">
        <Layout>
          <Interactive3DParts />
        </Layout>
      </Route>
      <Route path="/nextgen-technologies">
        <Layout>
          <NextGenTechnologies />
        </Layout>
      </Route>
      <Route path="/iot-dashboard">
        <Layout>
          <IoTDashboard />
        </Layout>
      </Route>
      <Route path="/service-bay-dashboard">
        <Layout>
          <ServiceBayDashboard />
        </Layout>
      </Route>
      <Route path="/automated-reordering">
        <Layout>
          <AutomatedReordering />
        </Layout>
      </Route>
      <Route path="/loyalty-program">
        <Layout>
          <LoyaltyProgram />
        </Layout>
      </Route>
      <Route path="/workshop-calendar">
        <Layout>
          <WorkshopCalendar />
        </Layout>
      </Route>
      <Route path="/computer-vision-qc">
        <Layout>
          <ComputerVisionQC />
        </Layout>
      </Route>
      <Route path="/smart-parts-recommender">
        <Layout>
          <SmartPartsRecommender />
        </Layout>
      </Route>
      <Route path="/dynamic-pricing">
        <Layout>
          <DynamicPricing />
        </Layout>
      </Route>
      <Route path="/vehicle-tracking">
        <Layout>
          <VehicleTracking />
        </Layout>
      </Route>
      <Route path="/digital-twin-viewer">
        <Layout>
          <DigitalTwinViewer />
        </Layout>
      </Route>
      <Route path="/drone-inspection">
        <Layout>
          <DroneInspection />
        </Layout>
      </Route>
      <Route path="/ml-fraud-detection">
        <Layout>
          <MLFraudDetection />
        </Layout>
      </Route>
      <Route path="/edge-computing">
        <Layout>
          <EdgeComputingDiagnostics />
        </Layout>
      </Route>
      <Route path="/payroll-management">
        <Layout>
          <PayrollManagement />
        </Layout>
      </Route>
      <Route path="/expense-tracking">
        <Layout>
          <ExpenseTracking />
        </Layout>
      </Route>
      <Route path="/towing-services">
        <Layout>
          <TowingServices />
        </Layout>
      </Route>
      <Route path="/vehicle-storage">
        <Layout>
          <VehicleStorage />
        </Layout>
      </Route>
      <Route path="/telematics-integration">
        <Layout>
          <TelematicsIntegration />
        </Layout>
      </Route>
      <Route path="/knowledge-base">
        <Layout>
          <KnowledgeBase />
        </Layout>
      </Route>
      <Route path="/training-lms">
        <Layout>
          <TrainingLMS />
        </Layout>
      </Route>
      <Route path="/google-my-business">
        <Layout>
          <GoogleMyBusiness />
        </Layout>
      </Route>
      <Route path="/compliance-management">
        <Layout>
          <ComplianceManagement />
        </Layout>
      </Route>
      <Route path="/social-media-monitoring">
        <Layout>
          <SocialMediaMonitoring />
        </Layout>
      </Route>
      <Route path="/staff-performance-review">
        <Layout>
          <StaffPerformanceReview />
        </Layout>
      </Route>
      <Route path="/sustainable-energy-monitoring">
        <Layout>
          <SustainableEnergyMonitoring />
        </Layout>
      </Route>
      <Route path="/task-management">
        <Layout>
          <TaskManagement />
        </Layout>
      </Route>
      <Route path="/technician-performance">
        <Layout>
          <TechnicianPerformance />
        </Layout>
      </Route>
      <Route path="/timesheet-management">
        <Layout>
          <TimesheetManagement />
        </Layout>
      </Route>
      <Route path="/vehicle-history">
        <Layout>
          <VehicleHistory />
        </Layout>
      </Route>
      <Route path="/vehicles-list">
        <Layout>
          <Vehicles />
        </Layout>
      </Route>
      <Route path="/voice-command-interface">
        <Layout>
          <VoiceCommandInterface />
        </Layout>
      </Route>
      <Route path="/wearable-integration">
        <Layout>
          <WearableIntegration />
        </Layout>
      </Route>
      
      {/* Client Portal Routes */}
      <Route path="/client">
        <ClientLayout>
          <ClientDashboard />
        </ClientLayout>
      </Route>
      <Route path="/client/vehicles">
        <ClientLayout>
          <ClientVehicles />
        </ClientLayout>
      </Route>
      <Route path="/client/appointments">
        <ClientLayout>
          <ClientAppointments />
        </ClientLayout>
      </Route>
      <Route path="/client/invoices">
        <ClientLayout>
          <ClientInvoices />
        </ClientLayout>
      </Route>
      <Route path="/client/profile">
        <ClientLayout>
          <ClientProfile />
        </ClientLayout>
      </Route>
      <Route path="/client/service-history">
        <ClientLayout>
          <ClientServiceHistory />
        </ClientLayout>
      </Route>
      <Route path="/client/live-tracking">
        <ClientLayout>
          <ClientLiveTracking />
        </ClientLayout>
      </Route>
      <Route path="/client/reminders">
        <ClientLayout>
          <ClientReminders />
        </ClientLayout>
      </Route>
      <Route path="/client/review-chat">
        <ClientLayout>
          <ClientReviewChat />
        </ClientLayout>
      </Route>
      
      {/* Customer Mobile App Routes */}
      <Route path="/customer-app">
        <CustomerMobileLayout>
          <CustomerMobileHome />
        </CustomerMobileLayout>
      </Route>
      <Route path="/customer-app/booking">
        <CustomerMobileLayout>
          <CustomerMobileBooking />
        </CustomerMobileLayout>
      </Route>
      <Route path="/customer-app/vehicles">
        <CustomerMobileLayout>
          <CustomerMobileVehicles />
        </CustomerMobileLayout>
      </Route>
      <Route path="/customer-app/payments">
        <CustomerMobileLayout>
          <CustomerMobilePayments />
        </CustomerMobileLayout>
      </Route>
      <Route path="/customer-app/profile">
        <CustomerMobileLayout>
          <CustomerMobileProfile />
        </CustomerMobileLayout>
      </Route>
      
      {/* Technician Mobile App Routes */}
      <Route path="/technician-app">
        <TechnicianMobileLayout>
          <TechnicianMobileHome />
        </TechnicianMobileLayout>
      </Route>
      <Route path="/technician-app/jobs">
        <TechnicianMobileLayout>
          <TechnicianMobileJobs />
        </TechnicianMobileLayout>
      </Route>
      <Route path="/technician-app/clock">
        <TechnicianMobileLayout>
          <TechnicianMobileClock />
        </TechnicianMobileLayout>
      </Route>
      <Route path="/technician-app/lookup">
        <TechnicianMobileLayout>
          <TechnicianMobileLookup />
        </TechnicianMobileLayout>
      </Route>
      <Route path="/technician-app/profile">
        <TechnicianMobileLayout>
          <TechnicianMobileProfile />
        </TechnicianMobileLayout>
      </Route>
      
      <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UndoRedoProvider>
          <TooltipProvider>
            <SkipToContent />
            <Toaster />
            <Router />
          </TooltipProvider>
        </UndoRedoProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
