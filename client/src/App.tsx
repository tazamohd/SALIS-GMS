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
import { SkipToContent } from "@/components/SkipToContent";
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
import PurchaseAgentDashboard from "@/pages/purchase-agent/Dashboard";
import PurchaseAgentOrders from "@/pages/purchase-agent/Orders";
import PurchaseAgentSuppliers from "@/pages/purchase-agent/Suppliers";
import PurchaseAgentInventory from "@/pages/purchase-agent/Inventory";
import PurchaseAgentPriceCompare from "@/pages/purchase-agent/PriceCompare";
import PurchaseAgentTracking from "@/pages/purchase-agent/Tracking";
import PurchaseAgentReports from "@/pages/purchase-agent/Reports";
import PurchaseAgentTaskInbox from "@/pages/purchase-agent/TaskInbox";
import PurchaseAgentQuotationManagement from "@/pages/purchase-agent/QuotationManagement";
import PurchaseAgentPaymentTracking from "@/pages/purchase-agent/PaymentTracking";
import PurchaseAgentDeliveryTracking from "@/pages/purchase-agent/DeliveryTracking";
import PurchaseAgentLiveDeliveryTracking from "@/pages/purchase-agent/LiveDeliveryTracking";
import Notifications from "@/pages/Notifications";
import Landing from "@/pages/Landing";
import WelcomePage from "@/pages/WelcomePage";
import PublicTracking from "@/pages/PublicTracking";
import Calendar from "@/pages/Calendar";
import FinancialSettings from "@/pages/FinancialSettings";
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
import VehicleInspections from "@/pages/VehicleInspections";
import VehicleChecklist from "@/pages/VehicleChecklist";
import TowingAssistance from "@/pages/TowingAssistance";
import LoanerVehicles from "@/pages/LoanerVehicles";
import VendorSupplierPortal from "@/pages/VendorSupplierPortal";
import MarketingAutomation from "@/pages/MarketingAutomation";
import MarketingHub from "@/pages/MarketingHub";
import CustomerLoyalty from "@/pages/CustomerLoyalty";
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
import SecurityCameras from "@/pages/SecurityCameras";
import LicensePlateRecognition from "@/pages/LicensePlateRecognition";
import EmergingTechnologies from "@/pages/EmergingTechnologies";
import Interactive3DParts from "@/pages/Interactive3DParts";
import NextGenTechnologies from "@/pages/NextGenTechnologies";
import IoTDashboard from "@/pages/IoTDashboard";
import ServiceBayDashboard from "@/pages/ServiceBayDashboard";
import AutomatedReordering from "@/pages/AutomatedReordering";
import LoyaltyProgram from "@/pages/LoyaltyProgram";
import WorkshopCalendar from "@/pages/WorkshopCalendar";
import ComputerVisionQC from "@/pages/ComputerVisionQC";
import SmartPartsRecommender from "@/pages/SmartPartsRecommender";
import DynamicPricing from "@/pages/DynamicPricing";
import VehicleTracking from "@/pages/VehicleTracking";
import DigitalTwinViewer from "@/pages/DigitalTwinViewer";
import DroneInspection from "@/pages/DroneInspection";
import MLFraudDetection from "@/pages/MLFraudDetection";
import EdgeComputingDiagnostics from "@/pages/EdgeComputingDiagnostics";
import TireManagement from "@/pages/TireManagement";
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
import TaskManagement from "@/pages/TaskManagement";
import TechnicianPerformance from "@/pages/TechnicianPerformance";
import TimesheetManagement from "@/pages/TimesheetManagement";
import VehicleHistory from "@/pages/VehicleHistory";
import CustomerFeedback from "@/pages/CustomerFeedback";
import DataBackup from "@/pages/DataBackup";
import DashboardWidgets from "@/pages/DashboardWidgets";
import Vehicles from "@/pages/Vehicles";
import VoiceCommandInterface from "@/pages/VoiceCommandInterface";
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
import PartsNetworkLayout from "@/pages/parts-network/PartsNetworkLayout";
import PartsNetworkDashboard from "@/pages/parts-network/PartsNetworkDashboard";
import SendQuotationRequest from "@/pages/parts-network/SendQuotationRequest";
import MyRequests from "@/pages/parts-network/MyRequests";
import IncomingRequests from "@/pages/parts-network/IncomingRequests";
import QuotationsList from "@/pages/parts-network/QuotationsList";
import NetworkMembers from "@/pages/parts-network/NetworkMembers";
import NetworkOrders from "@/pages/parts-network/NetworkOrders";
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
import type { User } from "@shared/schema";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import PlatformAdmin from "@/pages/PlatformAdmin";

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
