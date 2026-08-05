import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";

import { Layout } from "@/components/Layout";
import { CustomerPortalLayout } from "@/components/CustomerPortalLayout";
import { Dashboard } from "@/pages/Dashboard";
import { TechnicianLayout } from "@/components/TechnicianLayout";
import TechnicianDashboard from "@/pages/technician/Dashboard";
import { PurchaseAgentLayout } from "@/components/PurchaseAgentLayout";
import LanguageSelection from "@/pages/LanguageSelection";
import RegionSelection from "@/pages/RegionSelection";
import { ClientLayout } from "@/components/ClientLayout";
import ClientDashboard from "@/pages/client/Dashboard";
import { CustomerMobileLayout } from "@/components/CustomerMobileLayout";
import { TechnicianMobileLayout } from "@/components/TechnicianMobileLayout";
import { useAuth } from "@/hooks/useAuth";
import { UndoRedoProvider } from "@/contexts/UndoRedoContext";
import { FeatureFlagProvider } from "@/contexts/FeatureFlagContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import type { User } from "@shared/schema";
import Login from "@/pages/Login";
import { lazy, Suspense } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageSkeleton } from "@/components/LoadingSkeleton";

// Route-level code splitting: every non-critical page loads on demand.
const TasksManagement = lazy(() => import("@/pages/TasksManagement").then(m => ({ default: m.TasksManagement })));
const Appointments = lazy(() => import("@/pages/Appointments").then(m => ({ default: m.Appointments })));
const Customers = lazy(() => import("@/pages/Customers").then(m => ({ default: m.Customers })));
const VehiclesEnhanced = lazy(() => import("@/pages/VehiclesEnhanced"));
const PurchaseOrders = lazy(() => import("@/pages/PurchaseOrders").then(m => ({ default: m.PurchaseOrders })));
const Invoices = lazy(() => import("@/pages/Invoices").then(m => ({ default: m.Invoices })));
const Payments = lazy(() => import("@/pages/Payments"));
const Estimates = lazy(() => import("@/pages/Estimates").then(m => ({ default: m.Estimates })));
const EstimatesQuotations = lazy(() => import("@/pages/EstimatesQuotations"));
const Reports = lazy(() => import("@/pages/Reports").then(m => ({ default: m.Reports })));
const JobCards = lazy(() => import("@/pages/JobCards").then(m => ({ default: m.JobCards })));
const Profile = lazy(() => import("@/pages/Profile").then(m => ({ default: m.Profile })));
const ServiceTemplates = lazy(() => import("@/pages/ServiceTemplates"));
const Tools = lazy(() => import("@/pages/Tools"));
const SpareParts = lazy(() => import("@/pages/SpareParts"));
const Suppliers = lazy(() => import("@/pages/Suppliers"));
const InventoryManagement = lazy(() => import("@/pages/InventoryManagement"));
const PartsAvailability = lazy(() => import("@/pages/PartsAvailability").then(m => ({ default: m.PartsAvailability })));
const SmartAssignment = lazy(() => import("@/pages/SmartAssignment").then(m => ({ default: m.SmartAssignment })));
const CallCenter = lazy(() => import("@/pages/CallCenter"));
const SupportChatDashboard = lazy(() => import("@/pages/SupportChatDashboard"));
const TechnicianPortal = lazy(() => import("@/pages/TechnicianPortal").then(m => ({ default: m.TechnicianPortal })));
const TechnicianManagement = lazy(() => import("@/pages/TechnicianManagement"));
const TechnicianMyJobs = lazy(() => import("@/pages/technician/MyJobs"));
const TechnicianTimeClock = lazy(() => import("@/pages/technician/TimeClock"));
const TechnicianPartsLookup = lazy(() => import("@/pages/technician/PartsLookup"));
const TechnicianJobDocumentation = lazy(() => import("@/pages/technician/JobDocumentation"));
const TechnicianProfile = lazy(() => import("@/pages/technician/Profile"));
const TechnicianAttendance = lazy(() => import("@/pages/technician/Attendance"));
const TechnicianServiceGuides = lazy(() => import("@/pages/technician/ServiceGuides"));
const TechnicianSoftware = lazy(() => import("@/pages/technician/TechnicalSoftware"));
const TechnicianMobilePortal = lazy(() => import("@/pages/mobile/TechnicianMobilePortal"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Landing = lazy(() => import("@/pages/Landing"));
const WelcomePage = lazy(() => import("@/pages/WelcomePage"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const OTPVerification = lazy(() => import("@/pages/OTPVerification"));
const PublicTracking = lazy(() => import("@/pages/PublicTracking"));
const Calendar = lazy(() => import("@/pages/Calendar"));
const FinancialSettings = lazy(() => import("@/pages/FinancialSettings"));
const CurrencySettings = lazy(() => import("@/pages/CurrencySettings"));
const RefundManagement = lazy(() => import("@/pages/RefundManagement"));
const DataImportExport = lazy(() => import("@/pages/DataImportExport"));
const BusinessIntelligence = lazy(() => import("@/pages/BusinessIntelligence"));
const HRManagement = lazy(() => import("@/pages/HRManagement"));
const AIAutomation = lazy(() => import("@/pages/AIAutomation"));
const Integrations = lazy(() => import("@/pages/Integrations"));
const Security = lazy(() => import("@/pages/Security"));
const Settings = lazy(() => import("@/pages/Settings"));
const RoleManagement = lazy(() => import("@/pages/RoleManagement"));
const Chat = lazy(() => import("@/pages/Chat"));
const FleetManagement = lazy(() => import("@/pages/FleetManagement"));
const FleetTracking = lazy(() => import("@/pages/FleetTracking"));
const ContractManagement = lazy(() => import("@/pages/ContractManagement"));
const WarrantyManagement = lazy(() => import("@/pages/WarrantyManagement"));
const WarrantyContracts = lazy(() => import("@/pages/WarrantyContracts"));
const VehicleInspections = lazy(() => import("@/pages/VehicleInspections"));
const VehicleChecklist = lazy(() => import("@/pages/VehicleChecklist"));
const TowingAssistance = lazy(() => import("@/pages/TowingAssistance"));
const LoanerVehicles = lazy(() => import("@/pages/LoanerVehicles"));
const VendorSupplierPortal = lazy(() => import("@/pages/VendorSupplierPortal"));
const MarketingAutomation = lazy(() => import("@/pages/MarketingAutomation"));
const MarketingHub = lazy(() => import("@/pages/MarketingHub"));
const WhatsAppIntegration = lazy(() => import("@/pages/WhatsAppIntegration"));
const SMSCampaigns = lazy(() => import("@/pages/SMSCampaigns"));
const CustomerLoyalty = lazy(() => import("@/pages/CustomerLoyalty"));
const CRMLoyalty = lazy(() => import("@/pages/CRMLoyalty"));
const DocumentManagement = lazy(() => import("@/pages/DocumentManagement"));
const FranchiseManagement = lazy(() => import("@/pages/FranchiseManagement"));
const GlobalizationLayer = lazy(() => import("@/pages/GlobalizationLayer"));
const PartsSupplyNetwork = lazy(() => import("@/pages/PartsSupplyNetwork"));
const DiagnosticsOBDHub = lazy(() => import("@/pages/DiagnosticsOBDHub"));
const OEMSoftwareSubscriptions = lazy(() => import("@/pages/OEMSoftwareSubscriptions"));
const AIChatbot = lazy(() => import("@/pages/AIChatbot"));
const AIChatbotAssistant = lazy(() => import("@/pages/AIChatbotAssistant"));
const PredictiveMaintenance = lazy(() => import("@/pages/PredictiveMaintenance"));
const PredictiveDiagnostics = lazy(() => import("@/pages/PredictiveDiagnostics"));
const SmartPartsRecommendations = lazy(() => import("@/pages/SmartPartsRecommendations"));
const VoiceCommands = lazy(() => import("@/pages/VoiceCommands"));
const DocumentOCR = lazy(() => import("@/pages/DocumentOCR"));
const SmartDamageAssessment = lazy(() => import("@/pages/SmartDamageAssessment"));
const IntelligentPriceOptimizer = lazy(() => import("@/pages/IntelligentPriceOptimizer"));
const SmartInventoryForecasting = lazy(() => import("@/pages/SmartInventoryForecasting"));
const AIServiceAdvisor = lazy(() => import("@/pages/AIServiceAdvisor"));
const VehicleHealthMonitoring = lazy(() => import("@/pages/VehicleHealthMonitoring"));
const BusinessIntelligenceDashboard = lazy(() => import("@/pages/BusinessIntelligenceDashboard"));
const ProfitAnalysis = lazy(() => import("@/pages/ProfitAnalysis"));
const CustomerLTVAnalysis = lazy(() => import("@/pages/CustomerLTVAnalysis"));
const BusinessHeatMaps = lazy(() => import("@/pages/BusinessHeatMaps"));
const AccountingIntegration = lazy(() => import("@/pages/AccountingIntegration"));
const EmailMarketingCampaigns = lazy(() => import("@/pages/EmailMarketingCampaigns"));
const SocialMediaIntegration = lazy(() => import("@/pages/SocialMediaIntegration"));
const VideoConsultations = lazy(() => import("@/pages/VideoConsultations"));
const PartsMarketplace = lazy(() => import("@/pages/PartsMarketplace"));
const StripePaymentProcessing = lazy(() => import("@/pages/StripePaymentProcessing"));
const LiveServiceTracking = lazy(() => import("@/pages/LiveServiceTracking"));
const VideoEstimates = lazy(() => import("@/pages/VideoEstimates"));
const DigitalVehicleWalkaround = lazy(() => import("@/pages/DigitalVehicleWalkaround"));
const CustomerReviewsRatings = lazy(() => import("@/pages/CustomerReviewsRatings"));
const ReferralProgram = lazy(() => import("@/pages/ReferralProgram"));
const AIScheduling = lazy(() => import("@/pages/AIScheduling"));
const PartsAutoReorder = lazy(() => import("@/pages/PartsAutoReorder"));
const TimeClockPayroll = lazy(() => import("@/pages/TimeClockPayroll"));
const EquipmentCalibration = lazy(() => import("@/pages/EquipmentCalibration"));
const RoutingOptimizer = lazy(() => import("@/pages/RoutingOptimizer"));
const SafetyIncidents = lazy(() => import("@/pages/SafetyIncidents"));
const EnvironmentalCompliance = lazy(() => import("@/pages/EnvironmentalCompliance"));
const ISOQualityManagement = lazy(() => import("@/pages/ISOQualityManagement"));
const InsuranceClaims = lazy(() => import("@/pages/InsuranceClaims"));
const BarcodeScanner = lazy(() => import("@/pages/BarcodeScanner"));
const DigitalSignage = lazy(() => import("@/pages/DigitalSignage"));
const KioskCheckIn = lazy(() => import("@/pages/KioskCheckIn"));
const SelfServiceKiosk = lazy(() => import("@/pages/SelfServiceKiosk"));
const SecurityCameras = lazy(() => import("@/pages/SecurityCameras"));
const LicensePlateRecognition = lazy(() => import("@/pages/LicensePlateRecognition"));
const KPIDashboard = lazy(() => import("@/pages/KPIDashboard"));
const AppointmentReminders = lazy(() => import("@/pages/AppointmentReminders"));
const CustomReportBuilder = lazy(() => import("@/pages/CustomReportBuilder"));
const VINDecoder = lazy(() => import("@/pages/VINDecoder"));
const TechnicianLeaderboards = lazy(() => import("@/pages/TechnicianLeaderboards"));
const PayrollManagement = lazy(() => import("@/pages/PayrollManagement"));
const ExpenseTracking = lazy(() => import("@/pages/ExpenseTracking"));
const TowingServices = lazy(() => import("@/pages/TowingServices"));
const VehicleStorage = lazy(() => import("@/pages/VehicleStorage"));
const TelematicsIntegration = lazy(() => import("@/pages/TelematicsIntegration"));
const KnowledgeBase = lazy(() => import("@/pages/KnowledgeBase"));
const TrainingLMS = lazy(() => import("@/pages/TrainingLMS"));
const GoogleMyBusiness = lazy(() => import("@/pages/GoogleMyBusiness"));
const ComplianceManagement = lazy(() => import("@/pages/ComplianceManagement"));
const SocialMediaMonitoring = lazy(() => import("@/pages/SocialMediaMonitoring"));
const StaffPerformanceReview = lazy(() => import("@/pages/StaffPerformanceReview"));
const SustainableEnergyMonitoring = lazy(() => import("@/pages/SustainableEnergyMonitoring"));
const TechnicianPerformance = lazy(() => import("@/pages/TechnicianPerformance"));
const TimesheetManagement = lazy(() => import("@/pages/TimesheetManagement"));
const VehicleHistory = lazy(() => import("@/pages/VehicleHistory"));
const CustomerFeedback = lazy(() => import("@/pages/CustomerFeedback"));
const DataBackup = lazy(() => import("@/pages/DataBackup"));
const DashboardWidgets = lazy(() => import("@/pages/DashboardWidgets"));
const Vehicles = lazy(() => import("@/pages/Vehicles"));
const WearableIntegration = lazy(() => import("@/pages/WearableIntegration"));
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
const CustomerDashboard = lazy(() => import("@/pages/customer/CustomerDashboard").then(m => ({ default: m.CustomerDashboard })));
const ClientVehicles = lazy(() => import("@/pages/client/Vehicles"));
const ClientAppointments = lazy(() => import("@/pages/client/Appointments"));
const ClientInvoices = lazy(() => import("@/pages/client/Invoices"));
const ClientProfile = lazy(() => import("@/pages/client/Profile"));
const ClientServiceHistory = lazy(() => import("@/pages/client/ServiceHistory"));
const ClientLiveTracking = lazy(() => import("@/pages/client/LiveTracking"));
const ClientReminders = lazy(() => import("@/pages/client/ServiceReminders"));
const ClientReviewChat = lazy(() => import("@/pages/client/ReviewChat"));
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
const CustomerAppointments = lazy(() => import("@/pages/customer/CustomerAppointments").then(m => ({ default: m.CustomerAppointments })));
const CustomerInvoices = lazy(() => import("@/pages/customer/CustomerInvoices").then(m => ({ default: m.CustomerInvoices })));
const CustomerVehicles = lazy(() => import("@/pages/customer/CustomerVehicles").then(m => ({ default: m.CustomerVehicles })));
const CustomerCommunications = lazy(() => import("@/pages/customer/CustomerCommunications").then(m => ({ default: m.CustomerCommunications })));
const CustomerPortal = lazy(() => import("@/pages/CustomerPortal"));
const Register = lazy(() => import("@/pages/Register"));
const ProviderSignup = lazy(() => import("@/pages/ProviderSignup"));
const CustomerSignup = lazy(() => import("@/pages/CustomerSignup"));
const Marketplace = lazy(() => import("@/pages/Marketplace"));
const MyVehicles = lazy(() => import("@/pages/MyVehicles"));
const MyBookings = lazy(() => import("@/pages/MyBookings"));
const ProviderBookings = lazy(() => import("@/pages/ProviderBookings"));
const MyOfferings = lazy(() => import("@/pages/MyOfferings"));
const PlatformAdmin = lazy(() => import("@/pages/PlatformAdmin"));
const AdvancedReports = lazy(() => import("@/pages/AdvancedReports"));
const SupplierPortal = lazy(() => import("@/pages/SupplierPortal"));
const APIDocs = lazy(() => import("@/pages/APIDocs"));

const NotificationCenter = lazy(() => import("@/pages/NotificationCenter"));
const AuditTrail = lazy(() => import("@/pages/AuditTrail"));
const HRPayroll = lazy(() => import("@/pages/HRPayroll"));
const QualityControl = lazy(() => import("@/pages/QualityControl"));

// Lazy-loaded Purchase Agent Portal pages
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

// Lazy-loaded B2B Parts Network pages
const PartsNetworkLayout = lazy(() => import("@/pages/parts-network/PartsNetworkLayout"));
const PartsNetworkDashboard = lazy(() => import("@/pages/parts-network/PartsNetworkDashboard"));
const SendQuotationRequest = lazy(() => import("@/pages/parts-network/SendQuotationRequest"));
const MyRequests = lazy(() => import("@/pages/parts-network/MyRequests"));
const IncomingRequests = lazy(() => import("@/pages/parts-network/IncomingRequests"));
const QuotationsList = lazy(() => import("@/pages/parts-network/QuotationsList"));
const NetworkMembers = lazy(() => import("@/pages/parts-network/NetworkMembers"));
const NetworkOrders = lazy(() => import("@/pages/parts-network/NetworkOrders"));

// Lazy-loaded Exotic & Heavy Pages
const EmergingTechnologies = lazy(() => import("@/pages/EmergingTechnologies"));
const Interactive3DParts = lazy(() => import("@/pages/Interactive3DParts"));
const NextGenTechnologies = lazy(() => import("@/pages/NextGenTechnologies"));
const IoTDashboard = lazy(() => import("@/pages/IoTDashboard"));
const ServiceBayDashboard = lazy(() => import("@/pages/ServiceBayDashboard"));
const AutomatedReordering = lazy(() => import("@/pages/AutomatedReordering"));
const LoyaltyProgram = lazy(() => import("@/pages/LoyaltyProgram"));
const WorkshopCalendar = lazy(() => import("@/pages/WorkshopCalendar"));
const ComputerVisionQC = lazy(() => import("@/pages/ComputerVisionQC"));
const DynamicPricing = lazy(() => import("@/pages/DynamicPricing"));
const VehicleTracking = lazy(() => import("@/pages/VehicleTracking"));
const DigitalTwinViewer = lazy(() => import("@/pages/DigitalTwinViewer"));
const DroneInspection = lazy(() => import("@/pages/DroneInspection"));
const MLFraudDetection = lazy(() => import("@/pages/MLFraudDetection"));
const EdgeComputingDiagnostics = lazy(() => import("@/pages/EdgeComputingDiagnostics"));
const TireManagement = lazy(() => import("@/pages/TireManagement"));
const AIInsights = lazy(() => import("@/pages/AIInsights"));
const BlockchainServiceHistory = lazy(() => import("@/pages/BlockchainServiceHistory"));
const CommandCenter = lazy(() => import("@/pages/CommandCenter"));
const SaudiComplianceDashboard = lazy(() => import("@/pages/SaudiComplianceDashboard"));
const DirectMessages = lazy(() => import("@/pages/DirectMessages"));

// Completed "half-real" pages (page + new server endpoint + flag)
const ARRepairGuide = lazy(() => import("@/pages/ARRepairGuide"));
const SmartContracts = lazy(() => import("@/pages/SmartContracts"));
const MobileDeviceManagement = lazy(() => import("@/pages/MobileDeviceManagement"));
const NeuralNetworkPrediction = lazy(() => import("@/pages/NeuralNetworkPrediction"));
const PerformanceAnalytics = lazy(() => import("@/pages/PerformanceAnalytics"));
const PredictiveDemandForecasting = lazy(() => import("@/pages/PredictiveDemandForecasting"));
const ProductivityTracker = lazy(() => import("@/pages/ProductivityTracker"));
const OBDDiagnosticViewer = lazy(() => import("@/pages/OBDDiagnosticViewer"));
const Subscriptions = lazy(() => import("@/pages/Subscriptions"));

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
      <Suspense fallback={<PageSkeleton />}>
      <Switch>
        <Route path="/language" component={LanguageSelection} />
        <Route path="/region" component={RegionSelection} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/otp" component={OTPVerification} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/provider-signup" component={ProviderSignup} />
        <Route path="/join" component={ProviderSignup} />
        <Route path="/customer-signup" component={CustomerSignup} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/track/:token" component={PublicTracking} />
        <Route path="/customer-portal" component={CustomerPortal} />
        {/* First-run: unrecognized paths show language selection until the
            visitor has been through it once, then default to Login. */}
        <Route>
          {() =>
            localStorage.getItem("salis-onboarding-done") ? (
              <Login />
            ) : (
              <Redirect to="/language" />
            )
          }
        </Route>
      </Switch>
      </Suspense>
    );
  }

  // Check if user is a customer
  const isCustomer = user?.userType === 'customer';

  return (
    <Suspense fallback={<PageSkeleton />}>
    <Switch>
      {/* Root path - show dashboard directly */}
      <Route path="/">
        <Layout>
          <Dashboard />
        </Layout>
      </Route>

      {/* Marketplace is browsable while signed in too (customers + providers) */}
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/my-vehicles" component={MyVehicles} />
      <Route path="/my-bookings" component={MyBookings} />
      {/* Phone verification is reachable while signed in (post-signup). */}
      <Route path="/otp" component={OTPVerification} />
      <Route path="/provider-bookings">
        <Layout>
          <ProviderBookings />
        </Layout>
      </Route>
      <Route path="/my-offerings">
        <Layout>
          <MyOfferings />
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
      <Route path="/warranty-contracts">
        <Layout>
          <WarrantyContracts />
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
          <Suspense fallback={<PageSkeleton />}>
            <TireManagement />
          </Suspense>
        </Layout>
      </Route>
      <Route path="/kpi-dashboard">
        <Layout>
          <KPIDashboard />
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
      <Route path="/supplier-portal">
        <Layout>
          <SupplierPortal />
        </Layout>
      </Route>
      <Route path="/marketing-automation">
        <Layout>
          <ProtectedRoute flag="marketing">
            <MarketingAutomation />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/marketing-hub">
        <Layout>
          <ProtectedRoute flag="marketing">
            <MarketingHub />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/customer-loyalty">
        <Layout>
          <ProtectedRoute flag="marketing">
            <CustomerLoyalty />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/crm-loyalty">
        <Layout>
          <ProtectedRoute flag="marketing">
            <CRMLoyalty />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/document-management">
        <Layout>
          <DocumentManagement />
        </Layout>
      </Route>
      <Route path="/documents">
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
      <Route path="/estimates-quotations">
        <Layout>
          <EstimatesQuotations />
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
          <ProtectedRoute flag="ai_features">
            <SmartAssignment />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/call-center">
        <Layout>
          <ProtectedRoute flag="call_center">
            <CallCenter />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/support-chat-dashboard">
        <Layout>
          <ProtectedRoute flag="call_center">
            <SupportChatDashboard />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/whatsapp">
        <Layout>
          <ProtectedRoute flag="marketing">
            <WhatsAppIntegration />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/sms-campaigns">
        <Layout>
          <ProtectedRoute flag="marketing">
            <SMSCampaigns />
          </ProtectedRoute>
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
          <Suspense fallback={<PageSkeleton />}>
            <PurchaseAgentDashboard />
          </Suspense>
        </PurchaseAgentLayout>
      </Route>
      <Route path="/purchase-agent/tasks">
        <PurchaseAgentLayout>
          <Suspense fallback={<PageSkeleton />}>
            <PurchaseAgentTaskInbox />
          </Suspense>
        </PurchaseAgentLayout>
      </Route>
      <Route path="/purchase-agent/quotations">
        <PurchaseAgentLayout>
          <Suspense fallback={<PageSkeleton />}>
            <PurchaseAgentQuotationManagement />
          </Suspense>
        </PurchaseAgentLayout>
      </Route>
      <Route path="/purchase-agent/payments">
        <PurchaseAgentLayout>
          <Suspense fallback={<PageSkeleton />}>
            <PurchaseAgentPaymentTracking />
          </Suspense>
        </PurchaseAgentLayout>
      </Route>
      <Route path="/purchase-agent/delivery">
        <PurchaseAgentLayout>
          <Suspense fallback={<PageSkeleton />}>
            <PurchaseAgentDeliveryTracking />
          </Suspense>
        </PurchaseAgentLayout>
      </Route>
      <Route path="/purchase-agent/delivery-tracking/:id">
        <PurchaseAgentLayout>
          <Suspense fallback={<PageSkeleton />}>
            <PurchaseAgentLiveDeliveryTracking />
          </Suspense>
        </PurchaseAgentLayout>
      </Route>
      <Route path="/purchase-agent/orders">
        <PurchaseAgentLayout>
          <Suspense fallback={<PageSkeleton />}>
            <PurchaseAgentOrders />
          </Suspense>
        </PurchaseAgentLayout>
      </Route>
      <Route path="/purchase-agent/suppliers">
        <PurchaseAgentLayout>
          <Suspense fallback={<PageSkeleton />}>
            <PurchaseAgentSuppliers />
          </Suspense>
        </PurchaseAgentLayout>
      </Route>
      <Route path="/purchase-agent/inventory">
        <PurchaseAgentLayout>
          <Suspense fallback={<PageSkeleton />}>
            <PurchaseAgentInventory />
          </Suspense>
        </PurchaseAgentLayout>
      </Route>
      <Route path="/purchase-agent/price-compare">
        <PurchaseAgentLayout>
          <Suspense fallback={<PageSkeleton />}>
            <PurchaseAgentPriceCompare />
          </Suspense>
        </PurchaseAgentLayout>
      </Route>
      <Route path="/purchase-agent/tracking">
        <PurchaseAgentLayout>
          <Suspense fallback={<PageSkeleton />}>
            <PurchaseAgentTracking />
          </Suspense>
        </PurchaseAgentLayout>
      </Route>
      <Route path="/purchase-agent/reports">
        <PurchaseAgentLayout>
          <Suspense fallback={<PageSkeleton />}>
            <PurchaseAgentReports />
          </Suspense>
        </PurchaseAgentLayout>
      </Route>

      {/* B2B Parts Network Portal Routes */}
      <Route path="/parts-network">
        <Suspense fallback={<PageSkeleton />}>
          <PartsNetworkLayout title="Parts Network Dashboard">
            <PartsNetworkDashboard />
          </PartsNetworkLayout>
        </Suspense>
      </Route>
      <Route path="/parts-network/send-request">
        <Suspense fallback={<PageSkeleton />}>
          <PartsNetworkLayout title="Send Quotation Request">
            <SendQuotationRequest />
          </PartsNetworkLayout>
        </Suspense>
      </Route>
      <Route path="/parts-network/my-requests">
        <Suspense fallback={<PageSkeleton />}>
          <PartsNetworkLayout title="My Requests">
            <MyRequests />
          </PartsNetworkLayout>
        </Suspense>
      </Route>
      <Route path="/parts-network/incoming-requests">
        <Suspense fallback={<PageSkeleton />}>
          <PartsNetworkLayout title="Incoming Requests">
            <IncomingRequests />
          </PartsNetworkLayout>
        </Suspense>
      </Route>
      <Route path="/parts-network/quotations">
        <Suspense fallback={<PageSkeleton />}>
          <PartsNetworkLayout title="Quotations">
            <QuotationsList />
          </PartsNetworkLayout>
        </Suspense>
      </Route>
      <Route path="/parts-network/members">
        <Suspense fallback={<PageSkeleton />}>
          <PartsNetworkLayout title="Network Members">
            <NetworkMembers />
          </PartsNetworkLayout>
        </Suspense>
      </Route>
      <Route path="/parts-network/orders">
        <Suspense fallback={<PageSkeleton />}>
          <PartsNetworkLayout title="Orders">
            <NetworkOrders />
          </PartsNetworkLayout>
        </Suspense>
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
      <Route path="/notification-center">
        <Layout>
          <Suspense fallback={<PageSkeleton />}>
            <NotificationCenter />
          </Suspense>
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
      <Route path="/currency-settings">
        <Layout>
          <CurrencySettings />
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
          <ProtectedRoute flag="hr_module">
            <HRManagement />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/hr-payroll">
        <Layout>
          <ProtectedRoute flag="hr_module">
            <Suspense fallback={<PageSkeleton />}>
              <HRPayroll />
            </Suspense>
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/ai-automation">
        <Layout>
          <ProtectedRoute flag="ai_features">
            <AIAutomation />
          </ProtectedRoute>
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
          <ProtectedRoute flag="advanced_finance">
            <ChartOfAccounts />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/general-ledger">
        <Layout>
          <ProtectedRoute flag="advanced_finance">
            <GeneralLedger />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/journal-entries">
        <Layout>
          <ProtectedRoute flag="advanced_finance">
            <JournalEntries />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/trial-balance">
        <Layout>
          <ProtectedRoute flag="advanced_finance">
            <TrialBalance />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/income-statement">
        <Layout>
          <ProtectedRoute flag="advanced_finance">
            <IncomeStatement />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/balance-sheet">
        <Layout>
          <ProtectedRoute flag="advanced_finance">
            <BalanceSheet />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/cash-flow-statement">
        <Layout>
          <ProtectedRoute flag="advanced_finance">
            <CashFlowStatement />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/accounts-receivable">
        <Layout>
          <ProtectedRoute flag="advanced_finance">
            <AccountsReceivable />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/accounts-payable">
        <Layout>
          <ProtectedRoute flag="advanced_finance">
            <AccountsPayable />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/cost-centers">
        <Layout>
          <ProtectedRoute flag="advanced_finance">
            <CostCenters />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/budget-management">
        <Layout>
          <ProtectedRoute flag="advanced_finance">
            <BudgetManagement />
          </ProtectedRoute>
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
          <ProtectedRoute flag="blockchain">
            <PartsSupplyNetwork />
          </ProtectedRoute>
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
          <ProtectedRoute flag="ai_features">
            <AIChatbot />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/ai-chatbot-assistant">
        <Layout>
          <ProtectedRoute flag="ai_features">
            <AIChatbotAssistant />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/predictive-maintenance">
        <Layout>
          <ProtectedRoute flag="ai_features">
            <PredictiveMaintenance />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/predictive-diagnostics">
        <Layout>
          <ProtectedRoute flag="ai_features">
            <PredictiveDiagnostics />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/smart-parts-recommendations">
        <Layout>
          <ProtectedRoute flag="ai_features">
            <SmartPartsRecommendations />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/voice-commands">
        <Layout>
          <ProtectedRoute flag="ai_features">
            <VoiceCommands />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/document-ocr">
        <Layout>
          <ProtectedRoute flag="ai_features">
            <DocumentOCR />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/smart-damage-assessment">
        <Layout>
          <ProtectedRoute flag="ai_features">
            <SmartDamageAssessment />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/intelligent-price-optimizer">
        <Layout>
          <ProtectedRoute flag="ai_features">
            <IntelligentPriceOptimizer />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/smart-inventory-forecasting">
        <Layout>
          <ProtectedRoute flag="ai_features">
            <SmartInventoryForecasting />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/ai-service-advisor">
        <Layout>
          <ProtectedRoute flag="ai_features">
            <AIServiceAdvisor />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/vehicle-health-monitoring">
        <Layout>
          <ProtectedRoute flag="iot_dashboard">
            <VehicleHealthMonitoring />
          </ProtectedRoute>
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
          <ProtectedRoute flag="marketing">
            <EmailMarketingCampaigns />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/social-media-integration">
        <Layout>
          <ProtectedRoute flag="marketing">
            <SocialMediaIntegration />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/video-consultations">
        <Layout>
          <ProtectedRoute flag="ar_vr">
            <VideoConsultations />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/parts-marketplace">
        <Layout>
          <ProtectedRoute flag="blockchain">
            <PartsMarketplace />
          </ProtectedRoute>
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
          <ProtectedRoute flag="ar_vr">
            <VideoEstimates />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/digital-vehicle-walkaround">
        <Layout>
          <ProtectedRoute flag="ar_vr">
            <DigitalVehicleWalkaround />
          </ProtectedRoute>
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
          <ProtectedRoute flag="marketing">
            <ReferralProgram />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/ai-scheduling">
        <Layout>
          <ProtectedRoute flag="ai_features">
            <AIScheduling />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/parts-auto-reorder">
        <Layout>
          <PartsAutoReorder />
        </Layout>
      </Route>
      <Route path="/timeclock-payroll">
        <Layout>
          <ProtectedRoute flag="hr_module">
            <TimeClockPayroll />
          </ProtectedRoute>
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
      <Route path="/quality-control">
        <Layout>
          <Suspense fallback={<PageSkeleton />}>
            <QualityControl />
          </Suspense>
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
          <ProtectedRoute flag="emerging_tech">
            <DigitalSignage />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/api-docs">
        <Layout>
          <APIDocs />
        </Layout>
      </Route>
      <Route path="/kiosk-checkin">
        <Layout>
          <KioskCheckIn />
        </Layout>
      </Route>
      <Route path="/kiosk">
        <SelfServiceKiosk />
      </Route>
      <Route path="/security-cameras">
        <Layout>
          <ProtectedRoute flag="emerging_tech">
            <SecurityCameras />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/license-plate">
        <Layout>
          <ProtectedRoute flag="emerging_tech">
            <Suspense fallback={<PageSkeleton />}>
              <LicensePlateRecognition />
            </Suspense>
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/emerging-technologies">
        <Layout>
          <ProtectedRoute flag="emerging_tech">
            <Suspense fallback={<PageSkeleton />}>
              <EmergingTechnologies />
            </Suspense>
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/interactive-3d-parts">
        <Layout>
          <ProtectedRoute flag="ar_vr">
            <Suspense fallback={<PageSkeleton />}>
              <Interactive3DParts />
            </Suspense>
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/nextgen-technologies">
        <Layout>
          <ProtectedRoute flag="emerging_tech">
            <Suspense fallback={<PageSkeleton />}>
              <NextGenTechnologies />
            </Suspense>
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/iot-dashboard">
        <Layout>
          <ProtectedRoute flag="iot_dashboard">
            <Suspense fallback={<PageSkeleton />}>
              <IoTDashboard />
            </Suspense>
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/service-bay-dashboard">
        <Layout>
          <ProtectedRoute flag="iot_dashboard">
            <Suspense fallback={<PageSkeleton />}>
              <ServiceBayDashboard />
            </Suspense>
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/automated-reordering">
        <Layout>
          <Suspense fallback={<PageSkeleton />}>
            <AutomatedReordering />
          </Suspense>
        </Layout>
      </Route>
      <Route path="/loyalty-program">
        <Layout>
          <ProtectedRoute flag="marketing">
            <Suspense fallback={<PageSkeleton />}>
              <LoyaltyProgram />
            </Suspense>
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/workshop-calendar">
        <Layout>
          <Suspense fallback={<PageSkeleton />}>
            <WorkshopCalendar />
          </Suspense>
        </Layout>
      </Route>
      <Route path="/computer-vision-qc">
        <Layout>
          <ProtectedRoute flag="emerging_tech">
            <Suspense fallback={<PageSkeleton />}>
              <ComputerVisionQC />
            </Suspense>
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/smart-parts-recommender">
        <Layout>
          <ProtectedRoute flag="ai_features">
            <Suspense fallback={<PageSkeleton />}>
              <SmartPartsRecommendations />
            </Suspense>
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/dynamic-pricing">
        <Layout>
          <ProtectedRoute flag="ai_features">
            <Suspense fallback={<PageSkeleton />}>
              <DynamicPricing />
            </Suspense>
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/vehicle-tracking">
        <Layout>
          <Suspense fallback={<PageSkeleton />}>
            <VehicleTracking />
          </Suspense>
        </Layout>
      </Route>
      <Route path="/digital-twin-viewer">
        <Layout>
          <ProtectedRoute flag="emerging_tech">
            <Suspense fallback={<PageSkeleton />}>
              <DigitalTwinViewer />
            </Suspense>
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/drone-inspection">
        <Layout>
          <ProtectedRoute flag="emerging_tech">
            <Suspense fallback={<PageSkeleton />}>
              <DroneInspection />
            </Suspense>
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/ml-fraud-detection">
        <Layout>
          <ProtectedRoute flag="ai_features">
            <Suspense fallback={<PageSkeleton />}>
              <MLFraudDetection />
            </Suspense>
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/edge-computing">
        <Layout>
          <ProtectedRoute flag="emerging_tech">
            <Suspense fallback={<PageSkeleton />}>
              <EdgeComputingDiagnostics />
            </Suspense>
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/payroll-management">
        <Layout>
          <ProtectedRoute flag="hr_module">
            <PayrollManagement />
          </ProtectedRoute>
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
          <ProtectedRoute flag="iot_dashboard">
            <TelematicsIntegration />
          </ProtectedRoute>
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
          <ProtectedRoute flag="marketing">
            <GoogleMyBusiness />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/compliance-management">
        <Layout>
          <ComplianceManagement />
        </Layout>
      </Route>
      <Route path="/audit-trail">
        <Layout>
          <Suspense fallback={<PageSkeleton />}>
            <AuditTrail />
          </Suspense>
        </Layout>
      </Route>
      <Route path="/social-media-monitoring">
        <Layout>
          <ProtectedRoute flag="marketing">
            <SocialMediaMonitoring />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/staff-performance-review">
        <Layout>
          <StaffPerformanceReview />
        </Layout>
      </Route>
      <Route path="/sustainable-energy-monitoring">
        <Layout>
          <ProtectedRoute flag="emerging_tech">
            <SustainableEnergyMonitoring />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/task-management">
        <Layout>
          <TasksManagement />
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
          <ProtectedRoute flag="ai_features">
            <VoiceCommands />
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/wearable-integration">
        <Layout>
          <ProtectedRoute flag="emerging_tech">
            <WearableIntegration />
          </ProtectedRoute>
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
      
      <Route path="/advanced-reports">
        <Layout>
          <AdvancedReports />
        </Layout>
      </Route>

      <Route path="/ai-insights">
        <Layout>
          <ProtectedRoute flag="ai_features">
            <Suspense fallback={<PageSkeleton />}>
              <AIInsights />
            </Suspense>
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/blockchain-service-history">
        <Layout>
          <ProtectedRoute flag="blockchain">
            <Suspense fallback={<PageSkeleton />}>
              <BlockchainServiceHistory />
            </Suspense>
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/command-center">
        <Layout>
          <Suspense fallback={<PageSkeleton />}>
            <CommandCenter />
          </Suspense>
        </Layout>
      </Route>
      <Route path="/saudi-compliance">
        <Layout>
          <Suspense fallback={<PageSkeleton />}>
            <SaudiComplianceDashboard />
          </Suspense>
        </Layout>
      </Route>
      <Route path="/direct-messages">
        <Layout>
          <ProtectedRoute flag="call_center">
            <Suspense fallback={<PageSkeleton />}>
              <DirectMessages />
            </Suspense>
          </ProtectedRoute>
        </Layout>
      </Route>

      <Route path="/ar-repair-guide">
        <Layout>
          <ProtectedRoute flag="ar_vr">
            <Suspense fallback={<PageSkeleton />}>
              <ARRepairGuide />
            </Suspense>
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/smart-contracts">
        <Layout>
          <ProtectedRoute flag="blockchain">
            <Suspense fallback={<PageSkeleton />}>
              <SmartContracts />
            </Suspense>
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/mobile-device-management">
        <Layout>
          <ProtectedRoute flag="emerging_tech">
            <Suspense fallback={<PageSkeleton />}>
              <MobileDeviceManagement />
            </Suspense>
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/neural-network-prediction">
        <Layout>
          <ProtectedRoute flag="ai_features">
            <Suspense fallback={<PageSkeleton />}>
              <NeuralNetworkPrediction />
            </Suspense>
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/performance-analytics">
        <Layout>
          <Suspense fallback={<PageSkeleton />}>
            <PerformanceAnalytics />
          </Suspense>
        </Layout>
      </Route>
      <Route path="/predictive-demand-forecasting">
        <Layout>
          <ProtectedRoute flag="ai_features">
            <Suspense fallback={<PageSkeleton />}>
              <PredictiveDemandForecasting />
            </Suspense>
          </ProtectedRoute>
        </Layout>
      </Route>
      <Route path="/productivity-tracker">
        <Layout>
          <Suspense fallback={<PageSkeleton />}>
            <ProductivityTracker />
          </Suspense>
        </Layout>
      </Route>
      <Route path="/obd-diagnostic-viewer">
        <Layout>
          <ProtectedRoute flag="iot_dashboard">
            <Suspense fallback={<PageSkeleton />}>
              <OBDDiagnosticViewer />
            </Suspense>
          </ProtectedRoute>
        </Layout>
      </Route>

      <Route path="/subscriptions">
        <Layout>
          <Suspense fallback={<PageSkeleton />}>
            <Subscriptions />
          </Suspense>
        </Layout>
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
        <FeatureFlagProvider>
          <UndoRedoProvider>
            <TooltipProvider>
              <Toaster />
              <ErrorBoundary>
                <Router />
              </ErrorBoundary>
            </TooltipProvider>
          </UndoRedoProvider>
        </FeatureFlagProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
