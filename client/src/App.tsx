import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";

import { LoginDashboard } from "@/pages/LoginDashboard";
import { Layout } from "@/components/Layout";
import { CustomerPortalLayout } from "@/components/CustomerPortalLayout";
import { Dashboard } from "@/pages/Dashboard";
import { TasksManagement } from "@/pages/TasksManagement";
import { Appointments } from "@/pages/Appointments";
import { Customers } from "@/pages/Customers";
import VehiclesEnhanced from "@/pages/VehiclesEnhanced";
import { PurchaseOrders } from "@/pages/PurchaseOrders";
import { Invoices } from "@/pages/Invoices";
import Payments from "@/pages/Payments";
import { Estimates } from "@/pages/Estimates";
import EstimatesQuotations from "@/pages/EstimatesQuotations";
import { Reports } from "@/pages/Reports";
import { JobCards } from "@/pages/JobCards";
import { Profile } from "@/pages/Profile";
import ServiceTemplates from "@/pages/ServiceTemplates";
import Tools from "@/pages/Tools";
import SpareParts from "@/pages/SpareParts";
import Suppliers from "@/pages/Suppliers";
import InventoryManagement from "@/pages/InventoryManagement";
import { PartsAvailability } from "@/pages/PartsAvailability";
import { SmartAssignment } from "@/pages/SmartAssignment";
import CallCenter from "@/pages/CallCenter";
import SupportChatDashboard from "@/pages/SupportChatDashboard";
import { TechnicianPortal } from "@/pages/TechnicianPortal";
import TechnicianManagement from "@/pages/TechnicianManagement";
import { TechnicianLayout } from "@/components/TechnicianLayout";
import TechnicianDashboard from "@/pages/technician/Dashboard";
import TechnicianMyJobs from "@/pages/technician/MyJobs";
import TechnicianTimeClock from "@/pages/technician/TimeClock";
import TechnicianPartsLookup from "@/pages/technician/PartsLookup";
import TechnicianJobDocumentation from "@/pages/technician/JobDocumentation";
import TechnicianProfile from "@/pages/technician/Profile";
import TechnicianAttendance from "@/pages/technician/Attendance";
import TechnicianServiceGuides from "@/pages/technician/ServiceGuides";
import TechnicianSoftware from "@/pages/technician/TechnicalSoftware";
import TechnicianMobilePortal from "@/pages/mobile/TechnicianMobilePortal";
import { PurchaseAgentLayout } from "@/components/PurchaseAgentLayout";
import Notifications from "@/pages/Notifications";
import Landing from "@/pages/Landing";
import WelcomePage from "@/pages/WelcomePage";
import PublicTracking from "@/pages/PublicTracking";
import Calendar from "@/pages/Calendar";
import FinancialSettings from "@/pages/FinancialSettings";
import CurrencySettings from "@/pages/CurrencySettings";
import RefundManagement from "@/pages/RefundManagement";
import DataImportExport from "@/pages/DataImportExport";
import BusinessIntelligence from "@/pages/BusinessIntelligence";
import HRManagement from "@/pages/HRManagement";
import AIAutomation from "@/pages/AIAutomation";
import Integrations from "@/pages/Integrations";
import Security from "@/pages/Security";
import Settings from "@/pages/Settings";
import RoleManagement from "@/pages/RoleManagement";
import Chat from "@/pages/Chat";
import FleetManagement from "@/pages/FleetManagement";
import FleetTracking from "@/pages/FleetTracking";
import ContractManagement from "@/pages/ContractManagement";
import WarrantyManagement from "@/pages/WarrantyManagement";
import WarrantyContracts from "@/pages/WarrantyContracts";
import VehicleInspections from "@/pages/VehicleInspections";
import VehicleChecklist from "@/pages/VehicleChecklist";
import TowingAssistance from "@/pages/TowingAssistance";
import LoanerVehicles from "@/pages/LoanerVehicles";
import VendorSupplierPortal from "@/pages/VendorSupplierPortal";
import MarketingAutomation from "@/pages/MarketingAutomation";
import MarketingHub from "@/pages/MarketingHub";
import WhatsAppIntegration from "@/pages/WhatsAppIntegration";
import SMSCampaigns from "@/pages/SMSCampaigns";
import CustomerLoyalty from "@/pages/CustomerLoyalty";
import CRMLoyalty from "@/pages/CRMLoyalty";
import DocumentManagement from "@/pages/DocumentManagement";
import FranchiseManagement from "@/pages/FranchiseManagement";
import GlobalizationLayer from "@/pages/GlobalizationLayer";
import PartsSupplyNetwork from "@/pages/PartsSupplyNetwork";
import DiagnosticsOBDHub from "@/pages/DiagnosticsOBDHub";
import OEMSoftwareSubscriptions from "@/pages/OEMSoftwareSubscriptions";
import AIChatbot from "@/pages/AIChatbot";
import AIChatbotAssistant from "@/pages/AIChatbotAssistant";
import PredictiveMaintenance from "@/pages/PredictiveMaintenance";
import PredictiveDiagnostics from "@/pages/PredictiveDiagnostics";
import SmartPartsRecommendations from "@/pages/SmartPartsRecommendations";
import VoiceCommands from "@/pages/VoiceCommands";
import DocumentOCR from "@/pages/DocumentOCR";
import SmartDamageAssessment from "@/pages/SmartDamageAssessment";
import IntelligentPriceOptimizer from "@/pages/IntelligentPriceOptimizer";
import SmartInventoryForecasting from "@/pages/SmartInventoryForecasting";
import AIServiceAdvisor from "@/pages/AIServiceAdvisor";
import VehicleHealthMonitoring from "@/pages/VehicleHealthMonitoring";
import BusinessIntelligenceDashboard from "@/pages/BusinessIntelligenceDashboard";
import ProfitAnalysis from "@/pages/ProfitAnalysis";
import CustomerLTVAnalysis from "@/pages/CustomerLTVAnalysis";
import BusinessHeatMaps from "@/pages/BusinessHeatMaps";
import AccountingIntegration from "@/pages/AccountingIntegration";
import EmailMarketingCampaigns from "@/pages/EmailMarketingCampaigns";
import SocialMediaIntegration from "@/pages/SocialMediaIntegration";
import VideoConsultations from "@/pages/VideoConsultations";
import PartsMarketplace from "@/pages/PartsMarketplace";
import StripePaymentProcessing from "@/pages/StripePaymentProcessing";
import LiveServiceTracking from "@/pages/LiveServiceTracking";
import VideoEstimates from "@/pages/VideoEstimates";
import DigitalVehicleWalkaround from "@/pages/DigitalVehicleWalkaround";
import CustomerReviewsRatings from "@/pages/CustomerReviewsRatings";
import ReferralProgram from "@/pages/ReferralProgram";
import AIScheduling from "@/pages/AIScheduling";
import PartsAutoReorder from "@/pages/PartsAutoReorder";
import TimeClockPayroll from "@/pages/TimeClockPayroll";
import EquipmentCalibration from "@/pages/EquipmentCalibration";
import RoutingOptimizer from "@/pages/RoutingOptimizer";
import SafetyIncidents from "@/pages/SafetyIncidents";
import EnvironmentalCompliance from "@/pages/EnvironmentalCompliance";
import ISOQualityManagement from "@/pages/ISOQualityManagement";
import InsuranceClaims from "@/pages/InsuranceClaims";
import BarcodeScanner from "@/pages/BarcodeScanner";
import DigitalSignage from "@/pages/DigitalSignage";
import KioskCheckIn from "@/pages/KioskCheckIn";
import SelfServiceKiosk from "@/pages/SelfServiceKiosk";
import SecurityCameras from "@/pages/SecurityCameras";
import LicensePlateRecognition from "@/pages/LicensePlateRecognition";
import KPIDashboard from "@/pages/KPIDashboard";
import AppointmentReminders from "@/pages/AppointmentReminders";
import CustomReportBuilder from "@/pages/CustomReportBuilder";
import VINDecoder from "@/pages/VINDecoder";
import TechnicianLeaderboards from "@/pages/TechnicianLeaderboards";
import PayrollManagement from "@/pages/PayrollManagement";
import ExpenseTracking from "@/pages/ExpenseTracking";
import TowingServices from "@/pages/TowingServices";
import VehicleStorage from "@/pages/VehicleStorage";
import TelematicsIntegration from "@/pages/TelematicsIntegration";
import KnowledgeBase from "@/pages/KnowledgeBase";
import TrainingLMS from "@/pages/TrainingLMS";
import GoogleMyBusiness from "@/pages/GoogleMyBusiness";
import ComplianceManagement from "@/pages/ComplianceManagement";
import SocialMediaMonitoring from "@/pages/SocialMediaMonitoring";
import StaffPerformanceReview from "@/pages/StaffPerformanceReview";
import SustainableEnergyMonitoring from "@/pages/SustainableEnergyMonitoring";
import TechnicianPerformance from "@/pages/TechnicianPerformance";
import TimesheetManagement from "@/pages/TimesheetManagement";
import VehicleHistory from "@/pages/VehicleHistory";
import CustomerFeedback from "@/pages/CustomerFeedback";
import DataBackup from "@/pages/DataBackup";
import DashboardWidgets from "@/pages/DashboardWidgets";
import Vehicles from "@/pages/Vehicles";
import WearableIntegration from "@/pages/WearableIntegration";
import BankAccountManagement from "@/pages/BankAccountManagement";
import InternalWarehouse from "@/pages/InternalWarehouse";
import LossAccount from "@/pages/LossAccount";
import SalesGuide from "@/pages/SalesGuide";
import AssetsManagement from "@/pages/AssetsManagement";
import LiabilitiesManagement from "@/pages/LiabilitiesManagement";
import SalesManagement from "@/pages/SalesManagement";
import ExpensesManagement from "@/pages/ExpensesManagement";
import EquityManagement from "@/pages/EquityManagement";
import CapitalManagement from "@/pages/CapitalManagement";
import PartnersCurrentAccount from "@/pages/PartnersCurrentAccount";
import RetainedEarnings from "@/pages/RetainedEarnings";
import ChartOfAccounts from "@/pages/ChartOfAccounts";
import GeneralLedger from "@/pages/GeneralLedger";
import JournalEntries from "@/pages/JournalEntries";
import TrialBalance from "@/pages/TrialBalance";
import IncomeStatement from "@/pages/IncomeStatement";
import BalanceSheet from "@/pages/BalanceSheet";
import CashFlowStatement from "@/pages/CashFlowStatement";
import AccountsReceivable from "@/pages/AccountsReceivable";
import AccountsPayable from "@/pages/AccountsPayable";
import CostCenters from "@/pages/CostCenters";
import BudgetManagement from "@/pages/BudgetManagement";
import { CustomerDashboard } from "@/pages/customer/CustomerDashboard";
import { ClientLayout } from "@/components/ClientLayout";
import ClientDashboard from "@/pages/client/Dashboard";
import ClientVehicles from "@/pages/client/Vehicles";
import ClientAppointments from "@/pages/client/Appointments";
import ClientInvoices from "@/pages/client/Invoices";
import ClientProfile from "@/pages/client/Profile";
import ClientServiceHistory from "@/pages/client/ServiceHistory";
import ClientLiveTracking from "@/pages/client/LiveTracking";
import ClientReminders from "@/pages/client/ServiceReminders";
import ClientReviewChat from "@/pages/client/ReviewChat";
import { CustomerMobileLayout } from "@/components/CustomerMobileLayout";
import { TechnicianMobileLayout } from "@/components/TechnicianMobileLayout";
import CustomerMobileHome from "@/pages/mobile/CustomerMobileHome";
import CustomerMobileBooking from "@/pages/mobile/CustomerMobileBooking";
import CustomerMobileVehicles from "@/pages/mobile/CustomerMobileVehicles";
import CustomerMobilePayments from "@/pages/mobile/CustomerMobilePayments";
import CustomerMobileProfile from "@/pages/mobile/CustomerMobileProfile";
import TechnicianMobileHome from "@/pages/mobile/TechnicianMobileHome";
import TechnicianMobileJobs from "@/pages/mobile/TechnicianMobileJobs";
import TechnicianMobileClock from "@/pages/mobile/TechnicianMobileClock";
import TechnicianMobileLookup from "@/pages/mobile/TechnicianMobileLookup";
import TechnicianMobileProfile from "@/pages/mobile/TechnicianMobileProfile";
import { CustomerAppointments } from "@/pages/customer/CustomerAppointments";
import { CustomerInvoices } from "@/pages/customer/CustomerInvoices";
import { CustomerVehicles } from "@/pages/customer/CustomerVehicles";
import { CustomerCommunications } from "@/pages/customer/CustomerCommunications";
import CustomerPortal from "@/pages/CustomerPortal";
import { useAuth } from "@/hooks/useAuth";
import { UndoRedoProvider } from "@/contexts/UndoRedoContext";
import { FeatureFlagProvider } from "@/contexts/FeatureFlagContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import type { User } from "@shared/schema";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import PlatformAdmin from "@/pages/PlatformAdmin";
import AdvancedReports from "@/pages/AdvancedReports";
import SupplierPortal from "@/pages/SupplierPortal";
import APIDocs from "@/pages/APIDocs";
import { lazy, Suspense } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageSkeleton } from "@/components/LoadingSkeleton";

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A5ED7] mx-auto" />
          <p className="mt-4 text-sm text-[#64748B]">Loading SALIS AUTO...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/track/:token" component={PublicTracking} />
        <Route path="/customer-portal" component={CustomerPortal} />
        <Route component={Login} />
      </Switch>
    );
  }

  // Check if user is a customer
  const isCustomer = user?.userType === 'customer';

  return (
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
