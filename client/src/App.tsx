import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import { Estimates } from "@/pages/Estimates";
import { Reports } from "@/pages/Reports";
import { JobCards } from "@/pages/JobCards";
import { Profile } from "@/pages/Profile";
import ServiceTemplates from "@/pages/ServiceTemplates";
import Tools from "@/pages/Tools";
import SpareParts from "@/pages/SpareParts";
import Suppliers from "@/pages/Suppliers";
import InventoryManagement from "@/pages/InventoryManagement";
import { TechnicianPortal } from "@/pages/TechnicianPortal";
import TechnicianManagement from "@/pages/TechnicianManagement";
import Notifications from "@/pages/Notifications";
import Landing from "@/pages/Landing";
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
import Chat from "@/pages/Chat";
import FleetManagement from "@/pages/FleetManagement";
import WarrantyManagement from "@/pages/WarrantyManagement";
import VehicleInspections from "@/pages/VehicleInspections";
import TowingAssistance from "@/pages/TowingAssistance";
import LoanerVehicles from "@/pages/LoanerVehicles";
import VendorSupplierPortal from "@/pages/VendorSupplierPortal";
import MarketingAutomation from "@/pages/MarketingAutomation";
import CustomerLoyalty from "@/pages/CustomerLoyalty";
import DocumentManagement from "@/pages/DocumentManagement";
import FranchiseManagement from "@/pages/FranchiseManagement";
import GlobalizationLayer from "@/pages/GlobalizationLayer";
import PartsSupplyNetwork from "@/pages/PartsSupplyNetwork";
import DiagnosticsOBDHub from "@/pages/DiagnosticsOBDHub";
import OEMSoftwareSubscriptions from "@/pages/OEMSoftwareSubscriptions";
import AIChatbot from "@/pages/AIChatbot";
import PredictiveMaintenance from "@/pages/PredictiveMaintenance";
import SmartPartsRecommendations from "@/pages/SmartPartsRecommendations";
import VoiceCommands from "@/pages/VoiceCommands";
import DocumentOCR from "@/pages/DocumentOCR";
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
import NextGenTechnologies from "@/pages/NextGenTechnologies";
import IoTDashboard from "@/pages/IoTDashboard";
import ComputerVisionQC from "@/pages/ComputerVisionQC";
import SmartPartsRecommender from "@/pages/SmartPartsRecommender";
import DigitalTwinViewer from "@/pages/DigitalTwinViewer";
import DroneInspection from "@/pages/DroneInspection";
import ARRepairGuide from "@/pages/ARRepairGuide";
import MLFraudDetection from "@/pages/MLFraudDetection";
import EdgeComputingDiagnostics from "@/pages/EdgeComputingDiagnostics";
import TireManagement from "@/pages/TireManagement";
import KPIDashboard from "@/pages/KPIDashboard";
import AppointmentReminders from "@/pages/AppointmentReminders";
import { CustomerDashboard } from "@/pages/customer/CustomerDashboard";
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

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  
  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/customer-portal" component={CustomerPortal} />
        <Route component={Landing} />
      </Switch>
    );
  }

  // Check if user is a customer
  const isCustomer = user?.userType === 'customer';

  return (
    <Switch>
      {/* Root redirect based on user type */}
      <Route path="/" component={() => (
        <Redirect to={isCustomer ? "/portal/dashboard" : "/dashboard"} />
      )} />

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
      <Route path="/suppliers">
        <Layout>
          <Suppliers />
        </Layout>
      </Route>
      <Route path="/technician-portal">
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
      <Route path="/predictive-maintenance">
        <Layout>
          <PredictiveMaintenance />
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
      <Route path="/ar-repair-guide">
        <Layout>
          <ARRepairGuide />
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
      <UndoRedoProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </UndoRedoProvider>
    </QueryClientProvider>
  );
}

export default App;
