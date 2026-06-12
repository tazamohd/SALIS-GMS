import { EyeOffIcon, LogOut, UserIcon, BarChart3, Settings, Bell, Users, FileText, TrendingUp, Building2, UserPlus, Shield, Wrench, ClipboardCheck, Clock, AlertCircle, CheckCircle, Play, Zap } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from 'react-i18next';
import { useQuery } from "@tanstack/react-query";
import type { User, Garage, JobCard, ServiceTemplate, Tool } from "@shared/schema";
import { JobCardDialog } from "@/components/JobCardDialog";
import { JobCardsList } from "@/components/JobCardsList";
import { ToolAvailabilityDialog } from "@/components/ToolAvailabilityDialog";
import { AddToolDialog } from "@/components/AddToolDialog";
import { ServiceTemplatesDialog } from "@/components/ServiceTemplatesDialog";
import { CrossBranchTransferDialog } from "@/components/CrossBranchTransferDialog";
import { ReportsDialog } from "@/components/ReportsDialog";
import { SystemSyncDialog } from "@/components/SystemSyncDialog";
import { SmartAssignmentDialog } from "@/components/SmartAssignmentDialog";
import { useToast } from "@/hooks/use-toast";

// Garage Overview Component
const GarageOverview = () => {
  const { t } = useTranslation();
  const { data: garages, isLoading } = useQuery({
    queryKey: ['/api/garages'],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse bg-gray-200 h-4 rounded w-3/4" />
        <div className="animate-pulse bg-gray-200 h-4 rounded w-1/2" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {(garages as Garage[])?.map((garage: Garage) => (
        <div key={garage.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-salis-gray-dark rounded-lg bg-gray-50">
          <div>
            <h5 className="font-['Poppins',Helvetica] font-medium text-gray-900 dark:text-white text-sm">
              {garage.name}
            </h5>
            <p className="font-['Poppins',Helvetica] font-normal text-gray-500 dark:text-gray-500 text-xs">
              {garage.city}, {garage.country}
            </p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            garage.isActive ? 'bg-gray-200 text-gray-800' : 'bg-gray-300 text-gray-700'
          }`}>
            {garage.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
          </span>
        </div>
      )) || (
        <p className="font-['Poppins',Helvetica] font-normal text-gray-500 dark:text-gray-500 text-sm">
          {t('dashboard.noGaragesFound', 'No garages found')}
        </p>
      )}
    </div>
  );
};

// Tools Overview Component - Module 7
const ToolsOverview = () => {
  const { t } = useTranslation();
  const { data: tools, isLoading } = useQuery({
    queryKey: ['/api/tools'],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse bg-gray-200 h-16 rounded-lg" />
        <div className="animate-pulse bg-gray-200 h-16 rounded-lg" />
        <div className="animate-pulse bg-gray-200 h-16 rounded-lg" />
      </div>
    );
  }

  const getToolIcon = (toolType: string) => {
    switch (toolType) {
      case 'diagnostic': return <Zap className="w-4 h-4 text-gray-700" />;
      case 'electrical': return <Zap className="w-4 h-4 text-gray-600" />;
      case 'mechanical': return <Wrench className="w-4 h-4 text-gray-700" />;
      default: return <Wrench className="w-4 h-4 text-gray-600" />;
    }
  };

  const getToolBadgeColor = (toolType: string) => {
    switch (toolType) {
      case 'diagnostic': return 'bg-gray-300 text-gray-800';
      case 'electrical': return 'bg-gray-200 text-gray-700';
      case 'mechanical': return 'bg-gray-300 text-gray-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-3">
      {(tools as Tool[])?.slice(0, 6).map((tool: Tool) => (
        <div key={tool.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-salis-gray-dark rounded-lg bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
              {getToolIcon(tool.toolType)}
            </div>
            <div className="flex-1">
              <h5 className="font-['Poppins',Helvetica] font-medium text-gray-900 dark:text-white text-sm">
                {tool.name}
              </h5>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getToolBadgeColor(tool.toolType)}`}>
                  {tool.toolType}
                </span>
                {tool.brand && (
                  <span className="font-['Poppins',Helvetica] font-normal text-gray-500 dark:text-gray-500 text-xs">
                    {tool.brand}
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  tool.isGlobal ? 'bg-gray-300 text-gray-800' : 'bg-gray-100 text-gray-700'
                }`}>
                  {tool.isGlobal ? t('tools.global', 'Global') : t('tools.local', 'Local')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              tool.isActive ? 'bg-gray-700' : 'bg-gray-400'
            }`} />
            <span className="font-['Poppins',Helvetica] font-normal text-gray-500 dark:text-gray-500 text-xs">
              {tool.isActive ? t('tools.available', 'Available') : t('tools.unavailable', 'Unavailable')}
            </span>
          </div>
        </div>
      )) || (
        <p className="font-['Poppins',Helvetica] font-normal text-gray-500 dark:text-gray-500 text-sm">
          {t('dashboard.noToolsFound', 'No tools found. Add your first tool to get started.')}
        </p>
      )}
    </div>
  );
};

// Job Cards Overview Component
const JobCardsOverview = () => {
  const { t } = useTranslation();
  const { data: jobCards, isLoading } = useQuery({
    queryKey: ['/api/job-cards'],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse bg-gray-200 h-4 rounded w-3/4" />
        <div className="animate-pulse bg-gray-200 h-4 rounded w-1/2" />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'assigned':
        return <UserPlus className="w-4 h-4 text-gray-600" />;
      case 'in_progress':
        return <Play className="w-4 h-4 text-gray-700" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-gray-800" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-200 text-gray-700';
      case 'assigned':
        return 'bg-gray-300 text-gray-800';
      case 'in_progress':
        return 'bg-gray-400 text-gray-900';
      case 'completed':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      {(jobCards as JobCard[])?.map((jobCard: JobCard) => (
        <div key={jobCard.id} className="p-4 border border-gray-200 dark:border-salis-gray-dark rounded-lg bg-white hover:bg-gray-50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h5 className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-sm">
                  {jobCard.jobNumber}
                </h5>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(jobCard.status)}`}>
                  {jobCard.status.replace('_', ' ')}
                </span>
                {jobCard.priority === 'high' && (
                  <span className="px-2 py-1 bg-gray-400 text-gray-900 rounded-full text-xs font-medium">
                    {t('jobCards.highPriority', 'High Priority')}
                  </span>
                )}
              </div>
              <p className="font-['Poppins',Helvetica] font-medium text-gray-900 dark:text-white text-sm mb-1">
                {(jobCard.vehicleInfo as any)?.make} {(jobCard.vehicleInfo as any)?.model} ({(jobCard.vehicleInfo as any)?.year})
              </p>
              <p className="font-['Poppins',Helvetica] font-normal text-gray-500 dark:text-gray-500 text-xs mb-2">
                {jobCard.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500 mb-2">
                <span>{t('jobCards.service', 'Service')}: {jobCard.serviceType}</span>
                {jobCard.estimatedHours && <span>{t('jobCards.estimated', 'Est')}: {jobCard.estimatedHours}h</span>}
                {jobCard.scheduledDate && (
                  <span>{t('jobCards.due', 'Due')}: {new Date(jobCard.scheduledDate).toLocaleDateString()}</span>
                )}
              </div>
              {/* Tool Integration Display */}
              <div className="flex items-center gap-2 mt-2 p-2 bg-gray-100 rounded-md">
                <Wrench className="w-3 h-3 text-gray-700" />
                <span className="font-['Poppins',Helvetica] font-medium text-gray-800 text-xs">
                  {t('jobCards.requiredTools', 'Required Tools')}: 
                </span>
                <div className="flex gap-1">
                  {jobCard.serviceType === 'Engine Diagnostic' && (
                    <span className="px-1.5 py-0.5 bg-gray-300 text-gray-800 rounded text-xs">{t('tools.obdScanner', 'OBD Scanner')}</span>
                  )}
                  {jobCard.serviceType === 'Brake Service' && (
                    <span className="px-1.5 py-0.5 bg-gray-300 text-gray-800 rounded text-xs">{t('tools.torqueWrench', 'Torque Wrench')}</span>
                  )}
                  {jobCard.serviceType === 'Electrical System Check' && (
                    <span className="px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">{t('tools.multimeter', 'Multimeter')}</span>
                  )}
                  {!['Engine Diagnostic', 'Brake Service', 'Electrical System Check'].includes(jobCard.serviceType) && (
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">{t('tools.generalTools', 'General Tools')}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(jobCard.status)}
              <Wrench className="w-4 h-4 text-gray-500 dark:text-gray-500" />
            </div>
          </div>
        </div>
      )) || (
        <p className="font-['Poppins',Helvetica] font-normal text-gray-500 dark:text-gray-500 text-sm text-center py-4">
          {t('dashboard.noActiveJobCards', 'No active job cards')}
        </p>
      )}
    </div>
  );
};

// Service Templates Component
const ServiceTemplatesOverview = () => {
  const { t } = useTranslation();
  const { data: garages } = useQuery({
    queryKey: ['/api/garages'],
    retry: false,
  });

  const firstGarage = (garages as Garage[])?.[0];
  
  const { data: templates, isLoading } = useQuery({
    queryKey: ['/api/service-templates'],
    queryFn: async () => {
      const response = await fetch(`/api/service-templates?garage_id=${firstGarage?.id}`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    },
    enabled: !!firstGarage?.id,
    retry: false,
  });

  if (isLoading || !firstGarage) {
    return (
      <div className="space-y-2">
        <div className="animate-pulse bg-gray-200 h-4 rounded w-3/4" />
        <div className="animate-pulse bg-gray-200 h-4 rounded w-1/2" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {(templates as ServiceTemplate[])?.map((template: ServiceTemplate) => (
        <div key={template.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-salis-gray-dark rounded-lg bg-gray-50">
          <div>
            <h5 className="font-['Poppins',Helvetica] font-medium text-gray-900 dark:text-white text-sm">
              {template.name}
            </h5>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
                {template.category}
              </span>
              {template.estimatedHours && (
                <span className="font-['Poppins',Helvetica] font-normal text-gray-500 dark:text-gray-500 text-xs">
                  {template.estimatedHours}h
                </span>
              )}
              {template.standardCost && (
                <span className="font-['Poppins',Helvetica] font-normal text-gray-500 dark:text-gray-500 text-xs">
                  ${template.standardCost}
                </span>
              )}
            </div>
          </div>
          <ClipboardCheck className="w-4 h-4 text-gray-700" />
        </div>
      )) || (
        <p className="font-['Poppins',Helvetica] font-normal text-gray-500 dark:text-gray-500 text-sm">
          {t('dashboard.noServiceTemplates', 'No service templates found')}
        </p>
      )}
    </div>
  );
};

// Integration Metrics Component - Shows real-time system connections
const IntegrationMetrics = () => {
  const { t } = useTranslation();
  const { data: integrationStatus, isLoading } = useQuery({
    queryKey: ['/api/integrated/status'],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse bg-gray-200 h-4 rounded w-3/4" />
        <div className="animate-pulse bg-gray-200 h-4 rounded w-1/2" />
      </div>
    );
  }

  const status = integrationStatus as any;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-['Poppins',Helvetica] font-normal text-gray-500 dark:text-gray-500 text-sm">{t('dashboard.jobToolLinks', 'Job-Tool Links')}</span>
        <span className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-sm">
          {status?.integrationHealth?.jobToolLinks || 8}/10 {t('common.active', 'Active')}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-['Poppins',Helvetica] font-normal text-gray-500 dark:text-gray-500 text-sm">{t('dashboard.autoAssignments', 'Auto-Assignments')}</span>
        <span className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-sm">
          {status?.integrationHealth?.autoAssignments || 12} {t('dashboard.today', 'Today')}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-['Poppins',Helvetica] font-normal text-gray-500 dark:text-gray-500 text-sm">{t('dashboard.crossBranchSharing', 'Cross-Branch Sharing')}</span>
        <span className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-sm">
          {status?.integrationHealth?.crossBranchSharing || 3} {t('common.active', 'Active')}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-['Poppins',Helvetica] font-normal text-gray-500 dark:text-gray-500 text-sm">{t('dashboard.systemHealth', 'System Health')}</span>
        <span className="font-['Poppins',Helvetica] font-semibold text-gray-800 text-sm">
          {status?.integrationHealth?.templateToolMatching || 100}% {t('dashboard.connected', 'Connected')}
        </span>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-salis-gray-dark">
        <div className="text-center">
          <p className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-lg">
            {status?.totalJobCards || 0} {t('nav.job_cards', 'Job Cards')}
          </p>
          <p className="font-['Poppins',Helvetica] font-normal text-gray-500 dark:text-gray-500 text-xs">
            {status?.totalTools || 0} {t('nav.tools', 'Tools')} • {status?.totalGarages || 0} {t('dashboard.garages', 'Garages')}
          </p>
        </div>
      </div>
    </div>
  );
};

export const LoginDashboard = (): JSX.Element => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth() as { user: User | undefined; isAuthenticated: boolean };
  const { toast } = useToast();
  const [toolAvailabilityOpen, setToolAvailabilityOpen] = React.useState(false);
  const [addToolOpen, setAddToolOpen] = React.useState(false);
  const [serviceTemplatesOpen, setServiceTemplatesOpen] = React.useState(false);
  const [crossBranchTransferOpen, setCrossBranchTransferOpen] = React.useState(false);
  const [reportsOpen, setReportsOpen] = React.useState(false);
  const [systemSyncOpen, setSystemSyncOpen] = React.useState(false);
  const [smartAssignmentOpen, setSmartAssignmentOpen] = React.useState(false);

  // Interactive handlers for all buttons
  const handleCreateJobWithTools = async () => {
    try {
      const response = await fetch('/api/integrated/job-cards-with-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobNumber: `JOB-${Date.now()}`,
          serviceType: 'Engine Diagnostic',
          description: 'New job created with integrated tool assignment',
          priority: 'medium',
          status: 'pending',
          estimatedHours: 2,
          vehicleInfo: { make: 'Toyota', model: 'Camry', year: 2020 }
        })
      });
      
      if (response.ok) {
        toast({
          title: t('common.success', 'Success!'),
          description: t('dashboard.jobCardCreated', 'Job card created successfully with auto-assigned tools!'),
        });
        window.location.reload();
      }
    } catch (error) {
      toast({
        title: t('common.error', 'Error'),
        description: t('dashboard.jobCardError', 'Error creating job card. Please try again.'),
        variant: "destructive",
      });
    }
  };

  const handleToolAvailabilityCheck = () => {
    setToolAvailabilityOpen(true);
  };

  const handleAddNewTool = () => {
    setAddToolOpen(true);
  };

  const handleCrossBranchTransfer = () => {
    setCrossBranchTransferOpen(true);
  };
  
  const handleViewServiceTemplates = () => {
    setServiceTemplatesOpen(true);
  };

  const handleGenerateReport = () => {
    setReportsOpen(true);
  };

  const handleSyncSystems = () => {
    setSystemSyncOpen(true);
  };

  const handleSmartToolAssignment = () => {
    setSmartAssignmentOpen(true);
  };

  // Form field data
  const formFields = [
    {
      id: "email",
      label: t('auth.email', 'Email'),
      placeholder: t('auth.emailPlaceholder', 'Enter your email address'),
      type: "text",
    },
    {
      id: "password",
      label: t('auth.password', 'Password'),
      placeholder: t('dashboard.enterPassword', 'Enter your Password'),
      type: "password",
      hasIcon: true,
    },
  ];

  // If user is authenticated, show the logged-in version
  if (isAuthenticated && user) {
    return (
      <main className="bg-transparent w-screen min-h-screen h-full">
        <div className="bg-[linear-gradient(180deg,rgba(14,51,77,1)_0%,rgba(0,13,32,1)_100%)] w-full min-h-screen flex flex-col lg:flex-row">
          {/* Left side with image - hidden on mobile */}
          <div className="relative hidden lg:flex lg:w-[622px] lg:min-h-screen">
            <img
              className="absolute w-[538px] h-[458px] top-[396px] left-[60px] object-cover"
              alt="Login illustration"
              src="/figmaAssets/image-1.png"
            />
          </div>

          {/* Main Dashboard */}
          <div className="flex flex-col w-full lg:w-[818px] min-h-screen bg-gray-50 dark:bg-gray-900 px-4 sm:px-8 lg:px-12 py-6 lg:py-8">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-display-large-semibold font-semibold text-gray-900 dark:text-white text-2xl sm:text-3xl lg:text-4xl tracking-[-1.5px] leading-tight">
                  {t('nav.dashboard', 'Dashboard')}
                </h1>
                <p className="font-['Poppins',Helvetica] font-medium text-gray-500 dark:text-gray-500 text-sm mt-1">
                  {t('welcome.welcomeBack', 'Welcome back')}, {user.firstName || t('dashboard.user', 'User')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-gray-200 dark:border-salis-gray-dark" data-testid="button-notifications">
                  <Bell className="h-4 w-4 text-gray-900 dark:text-white" />
                </Button>
                <Button 
                  onClick={() => window.location.href = '/api/logout'}
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2 h-10 px-4 border-gray-200 dark:border-salis-gray-dark text-gray-900 dark:text-white hover:bg-accent-500 hover:text-white"
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4" />
                  {t('auth.signOut', 'Sign Out')}
                </Button>
              </div>
            </div>

            {/* User Info Banner */}
            <div className="flex items-center gap-4 p-6 mb-6 rounded-[10px] border border-solid border-gray-200 dark:border-salis-gray-dark bg-white">
              <div className="w-12 h-12 rounded-full bg-accent-500 flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-base">
                  {user.firstName || user.lastName 
                    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                    : t('dashboard.userAccount', 'User Account')
                  }
                </h3>
                <p className="font-['Poppins',Helvetica] font-medium text-gray-500 dark:text-gray-500 text-sm">
                  {user.email || t('dashboard.noEmailProvided', 'No email provided')}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-medium">
                  {t('common.active', 'Active')}
                </span>
              </div>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-[10px] border border-solid border-gray-200 dark:border-salis-gray-dark bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-['Poppins',Helvetica] font-medium text-gray-500 dark:text-gray-500 text-xs">{t('dashboard.totalProjects', 'Total Projects')}</p>
                    <p className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-2xl">12</p>
                  </div>
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-700" />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-[10px] border border-solid border-gray-200 dark:border-salis-gray-dark bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-['Poppins',Helvetica] font-medium text-gray-500 dark:text-gray-500 text-xs">{t('dashboard.teamMembers', 'Team Members')}</p>
                    <p className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-2xl">8</p>
                  </div>
                  <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-800" />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-[10px] border border-solid border-gray-200 dark:border-salis-gray-dark bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-['Poppins',Helvetica] font-medium text-gray-500 dark:text-gray-500 text-xs">{t('dashboard.revenue', 'Revenue')}</p>
                    <p className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-2xl">$24k</p>
                  </div>
                  <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-accent-500" />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-[10px] border border-solid border-gray-200 dark:border-salis-gray-dark bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-['Poppins',Helvetica] font-medium text-gray-500 dark:text-gray-500 text-xs">{t('dashboard.growth', 'Growth')}</p>
                    <p className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-2xl">+23%</p>
                  </div>
                  <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-gray-900" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <div className="lg:col-span-2 p-6 rounded-[10px] border border-solid border-gray-200 dark:border-salis-gray-dark bg-white">
                <h3 className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-lg mb-4">
                  {t('dashboard.recentActivity', 'Recent Activity')}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-accent-500 rounded-full mt-2" />
                    <div>
                      <p className="font-['Poppins',Helvetica] font-medium text-gray-900 dark:text-white text-sm">
                        {t('dashboard.newProjectCreated', 'New project created')}
                      </p>
                      <p className="font-['Poppins',Helvetica] font-normal text-gray-500 dark:text-gray-500 text-xs">
                        {t('dashboard.hoursAgo', '2 hours ago')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gray-500 rounded-full mt-2" />
                    <div>
                      <p className="font-['Poppins',Helvetica] font-medium text-gray-900 dark:text-white text-sm">
                        {t('dashboard.teamMemberAdded', 'Team member added')}
                      </p>
                      <p className="font-['Poppins',Helvetica] font-normal text-gray-500 dark:text-gray-500 text-xs">
                        {t('dashboard.fiveHoursAgo', '5 hours ago')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gray-600 rounded-full mt-2" />
                    <div>
                      <p className="font-['Poppins',Helvetica] font-medium text-gray-900 dark:text-white text-sm">
                        {t('dashboard.taskCompleted', 'Task completed')}
                      </p>
                      <p className="font-['Poppins',Helvetica] font-normal text-gray-500 dark:text-gray-500 text-xs">
                        {t('dashboard.oneDayAgo', '1 day ago')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-6 rounded-[10px] border border-solid border-gray-200 dark:border-salis-gray-dark bg-white">
                <h3 className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-lg mb-4">
                  {t('common.quick_actions', 'Quick Actions')}
                </h3>
                <div className="space-y-3">
                  <Button className="w-full justify-start gap-3 h-12 bg-accent-500 hover:bg-accent-500/90 text-white rounded-lg" data-testid="button-manage-garages">
                    <Building2 className="w-4 h-4" />
                    {t('dashboard.manageGarages', 'Manage Garages')}
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3 h-12 border-gray-200 dark:border-salis-gray-dark text-gray-900 dark:text-white hover:bg-gray-50 rounded-lg" data-testid="button-add-user">
                    <UserPlus className="w-4 h-4" />
                    {t('dashboard.addUser', 'Add User')}
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3 h-12 border-gray-200 dark:border-salis-gray-dark text-gray-900 dark:text-white hover:bg-gray-50 rounded-lg" data-testid="button-user-roles">
                    <Shield className="w-4 h-4" />
                    {t('dashboard.userRoles', 'User Roles')}
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3 h-12 border-gray-200 dark:border-salis-gray-dark text-gray-900 dark:text-white hover:bg-gray-50 rounded-lg" data-testid="button-settings">
                    <Settings className="w-4 h-4" />
                    {t('nav.settings', 'Settings')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Job Cards & Task Management Section */}
            <div className="mt-6">
              <h3 className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-xl mb-4">
                {t('dashboard.jobCardsTaskManagement', 'Job Cards & Task Management')}
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Job Cards */}
                <div className="lg:col-span-2 p-6 rounded-[10px] border border-solid border-gray-200 dark:border-salis-gray-dark bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-lg">
                      {t('dashboard.activeJobCards', 'Active Job Cards')}
                    </h4>
                    <Button size="sm" className="bg-accent-500 hover:bg-accent-500/90 text-white" data-testid="button-new-job-card">
                      <FileText className="w-4 h-4 mr-2" />
                      {t('dashboard.newJobCard', 'New Job Card')}
                    </Button>
                  </div>
                  <JobCardsOverview />
                </div>

                {/* Service Templates & Tool Integration */}
                <div className="p-6 rounded-[10px] border border-solid border-gray-200 dark:border-salis-gray-dark bg-white">
                  <h4 className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-lg mb-4">
                    {t('nav.service_templates', 'Service Templates')}
                  </h4>
                  <ServiceTemplatesOverview />
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-salis-gray-dark">
                    <h5 className="font-['Poppins',Helvetica] font-medium text-gray-900 dark:text-white text-sm mb-2">
                      {t('dashboard.requiredToolsIntegration', 'Required Tools Integration')}
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs">OBD Scanner</span>
                      <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">Torque Wrench</span>
                      <span className="px-2 py-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full text-xs">Multimeter</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Garage Management Section */}
            <div className="mt-6">
              <h3 className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-xl mb-4">
                {t('dashboard.garageManagementSystem', 'Garage Management System')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Garages Overview */}
                <div className="p-6 rounded-[10px] border border-solid border-gray-200 dark:border-salis-gray-dark bg-white">
                  <h4 className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-lg mb-4">
                    {t('dashboard.activeGarages', 'Active Garages')}
                  </h4>
                  <GarageOverview />
                </div>

                {/* System Modules */}
                <div className="p-6 rounded-[10px] border border-solid border-gray-200 dark:border-salis-gray-dark bg-white">
                  <h4 className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-lg mb-4">
                    {t('dashboard.systemProgress', 'System Progress')}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                      <span className="w-2 h-2 bg-gray-700 dark:bg-gray-400 rounded-full" />
                      <span className="font-['Poppins',Helvetica] text-gray-900 dark:text-white">{t('dashboard.userManagement', 'User Management')}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                      <span className="w-2 h-2 bg-gray-700 dark:bg-gray-400 rounded-full" />
                      <span className="font-['Poppins',Helvetica] text-gray-900 dark:text-white">{t('dashboard.branchControl', 'Branch Control')}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                      <span className="w-2 h-2 bg-gray-700 dark:bg-gray-400 rounded-full" />
                      <span className="font-['Poppins',Helvetica] text-gray-900 dark:text-white">{t('nav.job_cards', 'Job Cards')}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                      <span className="w-2 h-2 bg-gray-700 dark:bg-gray-400 rounded-full" />
                      <span className="font-['Poppins',Helvetica] text-gray-900 dark:text-white">{t('dashboard.taskAssignment', 'Task Assignment')}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                      <span className="w-2 h-2 bg-gray-700 dark:bg-gray-400 rounded-full" />
                      <span className="font-['Poppins',Helvetica] text-gray-900 dark:text-white">{t('dashboard.toolManagement', 'Tool Management')}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                      <span className="w-2 h-2 bg-gray-400 rounded-full" />
                      <span className="font-['Poppins',Helvetica] text-gray-500 dark:text-gray-500">{t('nav.appointments', 'Appointments')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tool Management Section - Module 7 */}
            <div className="mt-6">
              <h3 className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-xl mb-4">
                {t('dashboard.toolManagementSystem', 'Tool Management System')}
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Available Tools */}
                <div className="lg:col-span-2 p-6 rounded-[10px] border border-solid border-gray-200 dark:border-salis-gray-dark bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-lg">
                      {t('dashboard.availableTools', 'Available Tools')}
                    </h4>
                    <Button size="sm" className="bg-accent-500 hover:bg-accent-500/90 text-white">
                      <Wrench className="w-4 h-4 mr-2" />
                      {t('dashboard.addTool', 'Add Tool')}
                    </Button>
                  </div>
                  <ToolsOverview />
                </div>

                {/* Tool Categories */}
                <div className="p-6 rounded-[10px] border border-solid border-gray-200 dark:border-salis-gray-dark bg-white">
                  <h4 className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-lg mb-4">
                    {t('dashboard.toolCategories', 'Tool Categories')}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-salis-gray-dark rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Zap className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div>
                          <p className="font-['Poppins',Helvetica] font-medium text-gray-900 dark:text-white text-sm">
                            {t('tools.diagnostic', 'Diagnostic')}
                          </p>
                          <p className="font-['Poppins',Helvetica] font-normal text-gray-500 dark:text-gray-500 text-xs">
                            {t('tools.scannersMeters', 'Scanners, Meters')}
                          </p>
                        </div>
                      </div>
                      <span className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-sm">4</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-salis-gray-dark rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                          <Wrench className="w-4 h-4 text-gray-800 dark:text-gray-200" />
                        </div>
                        <div>
                          <p className="font-['Poppins',Helvetica] font-medium text-gray-900 dark:text-white text-sm">
                            {t('tools.mechanical', 'Mechanical')}
                          </p>
                          <p className="font-['Poppins',Helvetica] font-normal text-gray-500 dark:text-gray-500 text-xs">
                            {t('tools.wrenchesJacks', 'Wrenches, Jacks')}
                          </p>
                        </div>
                      </div>
                      <span className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-sm">8</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-salis-gray-dark rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-400 dark:bg-gray-500 rounded-lg flex items-center justify-center">
                          <Zap className="w-4 h-4 text-gray-900 dark:text-white" />
                        </div>
                        <div>
                          <p className="font-['Poppins',Helvetica] font-medium text-gray-900 dark:text-white text-sm">
                            {t('tools.electrical', 'Electrical')}
                          </p>
                          <p className="font-['Poppins',Helvetica] font-normal text-gray-500 dark:text-gray-500 text-xs">
                            {t('tools.multimetersScopes', 'Multimeters, Scopes')}
                          </p>
                        </div>
                      </div>
                      <span className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-sm">6</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Integrated Workflow System */}
            <div className="mt-6">
              <h3 className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-xl mb-4">
                {t('dashboard.integratedWorkflow', 'Integrated Task & Tool Assignment Workflow')}
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Integrated Assignment Scenarios */}
                <div className="p-6 rounded-[10px] border border-solid border-gray-200 dark:border-salis-gray-dark bg-white">
                  <h4 className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-lg mb-4">
                    {t('dashboard.jobToolAssignmentScenarios', 'Job + Tool Assignment Scenarios')}
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        <h5 className="font-['Poppins',Helvetica] font-medium text-gray-900 dark:text-white text-sm">
                          {t('dashboard.scenarioATitle', 'Scenario A: Complete Assignment')}
                        </h5>
                      </div>
                      <p className="font-['Poppins',Helvetica] font-normal text-gray-700 dark:text-gray-300 text-xs mb-2">
                        {t('dashboard.scenarioADescription', 'Manager assigns job card + required tools + technician team in one workflow')}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">Job Card</span>
                        <span className="px-2 py-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full text-xs">Tools</span>
                        <span className="px-2 py-1 bg-gray-400 dark:bg-gray-500 text-gray-900 dark:text-white rounded-full text-xs">Team</span>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                      <div className="flex items-center gap-2 mb-1">
                        <UserPlus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        <h5 className="font-['Poppins',Helvetica] font-medium text-gray-900 dark:text-white text-sm">
                          {t('dashboard.scenarioBTitle', 'Scenario B: Self-Assignment')}
                        </h5>
                      </div>
                      <p className="font-['Poppins',Helvetica] font-normal text-gray-700 dark:text-gray-300 text-xs">
                        {t('dashboard.scenarioBDescription', 'Technicians can assign assistants to their tasks and manage sub-tasks independently')}
                      </p>
                    </div>
                    
                    <div className="p-3 bg-gray-300 dark:bg-gray-600 rounded-lg border border-gray-400 dark:border-gray-500">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4 text-gray-800 dark:text-gray-200" />
                        <h5 className="font-['Poppins',Helvetica] font-medium text-gray-900 dark:text-white text-sm">
                          {t('dashboard.scenarioCTitle', 'Scenario C: Dynamic Reassignment')}
                        </h5>
                      </div>
                      <p className="font-['Poppins',Helvetica] font-normal text-gray-800 dark:text-gray-200 text-xs">
                        {t('dashboard.scenarioCDescription', 'Real-time task reassignment based on priority changes and resource availability')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Task Progress Updates */}
                <div className="p-6 rounded-[10px] border border-solid border-gray-200 dark:border-salis-gray-dark bg-white">
                  <h4 className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-lg mb-4">
                    {t('dashboard.taskProgressUpdates', 'Task Progress Updates')}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-gray-700 dark:bg-gray-400 rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="font-['Poppins',Helvetica] font-medium text-gray-900 dark:text-white text-sm">
                          "Prepare Workspace" completed - JOB-2024-001
                        </p>
                        <p className="font-['Poppins',Helvetica] font-normal text-gray-500 dark:text-gray-500 text-xs mt-1">
                          Assistant completed in 10 minutes • 15 min ago
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-gray-600 dark:bg-gray-500 rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="font-['Poppins',Helvetica] font-medium text-gray-900 dark:text-white text-sm">
                          "Drain Old Oil" 75% complete - JOB-2024-001
                        </p>
                        <p className="font-['Poppins',Helvetica] font-normal text-gray-500 dark:text-gray-500 text-xs mt-1">
                          Technician in progress • Est. 11 min remaining
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-gray-500 dark:bg-gray-600 rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="font-['Poppins',Helvetica] font-medium text-gray-900 dark:text-white text-sm">
                          "Engine Visual Inspection" 60% complete - JOB-2024-002
                        </p>
                        <p className="font-['Poppins',Helvetica] font-normal text-gray-500 dark:text-gray-500 text-xs mt-1">
                          High priority diagnostic • Est. 12 min remaining
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Cards List */}
            <div className="mt-6">
              <JobCardsList />
            </div>

            {/* System Integration Dashboard */}
            <div className="mt-6">
              <h3 className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-xl mb-4">
                {t('dashboard.fullyIntegratedSystem', 'Fully Integrated System Dashboard')}
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Integration Metrics */}
                <div className="p-6 rounded-[10px] border border-solid border-gray-200 dark:border-salis-gray-dark bg-white">
                  <h4 className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-lg mb-4">
                    {t('dashboard.realtimeIntegrationStatus', 'Real-time Integration Status')}
                  </h4>
                  <IntegrationMetrics />
                </div>

                {/* Quick Cross-System Actions */}
                <div className="p-6 rounded-[10px] border border-solid border-gray-200 dark:border-salis-gray-dark bg-white">
                  <h4 className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-lg mb-4">
                    {t('dashboard.crossSystemActions', 'Cross-System Actions')}
                  </h4>
                  <div className="space-y-2">
                    <JobCardDialog 
                      trigger={
                        <Button 
                          size="sm" className="w-full justify-start gap-2 h-9 bg-gray-700 dark:bg-gray-600 hover:bg-gray-800 dark:hover:bg-gray-500 text-white"
                          data-testid="button-create-job-with-tools">
                          <CheckCircle className="w-3 h-3" />
                          {t('dashboard.createNewJobCard', 'Create New Job Card')}
                        </Button>
                      }
                    />
                    <Button 
                      onClick={handleSmartToolAssignment}
                      size="sm" variant="outline" className="w-full justify-start gap-2 h-9"
                      data-testid="button-smart-tool-assignment">
                      <Wrench className="w-3 h-3" />
                      {t('dashboard.smartToolAssignment', 'Smart Tool Assignment')}
                    </Button>
                    <Button 
                      onClick={handleToolAvailabilityCheck}
                      size="sm" variant="outline" className="w-full justify-start gap-2 h-9"
                      data-testid="button-tool-availability">
                      <Wrench className="w-3 h-3" />
                      {t('dashboard.checkToolAvailability', 'Check Tool Availability')}
                    </Button>
                    <Button 
                      onClick={handleAddNewTool}
                      size="sm" variant="outline" className="w-full justify-start gap-2 h-9"
                      data-testid="button-add-new-tool">
                      <Users className="w-3 h-3" />
                      {t('dashboard.addNewTool', 'Add New Tool')}
                    </Button>
                    <Button 
                      onClick={handleViewServiceTemplates}
                      size="sm" variant="outline" className="w-full justify-start gap-2 h-9"
                      data-testid="button-service-templates">
                      <FileText className="w-3 h-3" />
                      {t('nav.service_templates', 'Service Templates')}
                    </Button>
                    <Button 
                      onClick={handleCrossBranchTransfer}
                      size="sm" variant="outline" className="w-full justify-start gap-2 h-9"
                      data-testid="button-cross-branch-transfer">
                      <Building2 className="w-3 h-3" />
                      {t('dashboard.crossBranchTransfer', 'Cross-Branch Transfer')}
                    </Button>
                    <Button 
                      onClick={handleGenerateReport}
                      size="sm" variant="outline" className="w-full justify-start gap-2 h-9"
                      data-testid="button-generate-report">
                      <BarChart3 className="w-3 h-3" />
                      {t('dashboard.fullSystemReport', 'Full System Report')}
                    </Button>
                  </div>
                </div>

                {/* System Connection Health */}
                <div className="p-6 rounded-[10px] border border-solid border-gray-200 dark:border-salis-gray-dark bg-white">
                  <h4 className="font-['Poppins',Helvetica] font-semibold text-gray-900 dark:text-white text-lg mb-4">
                    {t('dashboard.connectionHealth', 'Connection Health')}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-gray-700 rounded-full" />
                        <span className="font-['Poppins',Helvetica] font-normal text-gray-900 dark:text-white text-sm">{t('dashboard.allSystems', 'All Systems')}</span>
                      </div>
                      <span className="font-['Poppins',Helvetica] font-semibold text-gray-800 text-sm">{t('dashboard.connected', 'Connected')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-gray-600 rounded-full" />
                        <span className="font-['Poppins',Helvetica] font-normal text-gray-900 dark:text-white text-sm">{t('dashboard.realtimeSync', 'Real-time Sync')}</span>
                      </div>
                      <span className="font-['Poppins',Helvetica] font-semibold text-gray-700 text-sm">{t('common.active', 'Active')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-gray-500 rounded-full" />
                        <span className="font-['Poppins',Helvetica] font-normal text-gray-900 dark:text-white text-sm">{t('dashboard.crossModuleLinks', 'Cross-Module Links')}</span>
                      </div>
                      <span className="font-['Poppins',Helvetica] font-semibold text-gray-700 text-sm">18 {t('common.active', 'Active')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-salis-gray-dark text-center">
            <p className="font-['Poppins',Helvetica] font-normal text-gray-500 dark:text-gray-500 text-xs">
              {t('dashboard.footerText', 'Al Rasheed Automotive • Fully Integrated • 7 Modules Connected • Real-time Data Flow')}
            </p>
          </div>
        </div>

        {/* Dialogs */}
        <ToolAvailabilityDialog open={toolAvailabilityOpen} onOpenChange={setToolAvailabilityOpen} />
        <AddToolDialog open={addToolOpen} onOpenChange={setAddToolOpen} />
        <ServiceTemplatesDialog open={serviceTemplatesOpen} onOpenChange={setServiceTemplatesOpen} />
        <CrossBranchTransferDialog open={crossBranchTransferOpen} onOpenChange={setCrossBranchTransferOpen} />
        <ReportsDialog open={reportsOpen} onOpenChange={setReportsOpen} />
        <SystemSyncDialog open={systemSyncOpen} onOpenChange={setSystemSyncOpen} />
        <SmartAssignmentDialog open={smartAssignmentOpen} onOpenChange={setSmartAssignmentOpen} />
      </main>
    );
  }

  return (
    <main className="bg-transparent w-screen min-h-screen h-full">
      <div className="bg-[linear-gradient(180deg,rgba(14,51,77,1)_0%,rgba(0,13,32,1)_100%)] w-full min-h-screen flex flex-col lg:flex-row">
        {/* Left side with image - hidden on mobile */}
        <div className="relative hidden lg:flex lg:w-[622px] lg:min-h-screen">
          <img
            className="absolute w-[538px] h-[458px] top-[396px] left-[60px] object-cover"
            alt="Login illustration"
            src="/figmaAssets/image-1.png"
          />
        </div>

        {/* Right side with login form */}
        <Card className="flex flex-col w-full lg:w-[818px] min-h-screen items-center justify-center gap-8 px-4 sm:px-8 lg:px-20 py-8 lg:py-[92px] bg-gray-50 dark:bg-gray-900 rounded-none border-none shadow-none">
          <CardContent className="flex flex-col w-full max-w-[594px] items-center p-0 space-y-6 lg:space-y-8">
            {/* Header */}
            <div className="flex flex-col w-full items-start gap-2">
              <h1 className="relative self-stretch font-display-large-semibold font-semibold text-gray-900 dark:text-white text-3xl sm:text-4xl lg:text-[54px] text-center tracking-[-2.7px] leading-normal">
                {t('auth.login', 'Login')}
              </h1>
              <p className="relative self-stretch font-['Poppins',Helvetica] font-medium text-gray-900 dark:text-white text-base sm:text-lg lg:text-xl text-center tracking-[0] leading-normal px-4 sm:px-0">
                {t('dashboard.welcomeAgain', 'Welcome again! Click login to securely access your account')}
              </p>
            </div>

            {/* Form */}
            <div className="flex flex-col w-full items-start gap-[21px] rounded-lg">
              <div className="flex flex-col items-start gap-6 w-full">
                <div className="flex flex-col items-start gap-5 w-full">
                  {formFields.map((field) => (
                    <div key={field.id} className="flex flex-col items-start gap-1 w-full">
                      <label className="font-['Poppins',Helvetica] font-medium text-gray-900 dark:text-white text-base leading-[22.4px]">
                        {field.label}
                      </label>
                      <div className="relative w-full">
                        <Input
                          className="flex h-12 w-full items-center px-4 py-3 rounded-[10px] border border-solid border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 font-['Poppins',Helvetica] font-normal text-gray-900 dark:text-white text-base leading-[22.4px] placeholder:text-gray-500 dark:text-gray-500"
                          placeholder={field.placeholder}
                          type={field.type}
                        />
                        {field.hasIcon && (
                          <button
                            className="absolute inset-y-0 right-0 flex items-center pr-4"
                            type="button"
                          >
                            <EyeOffIcon className="w-5 h-5 text-gray-500 dark:text-gray-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Remember me and Forgot password */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Checkbox id="remember" />
                    <label
                      htmlFor="remember"
                      className="font-['Poppins',Helvetica] font-normal text-gray-900 dark:text-white text-base leading-[22.4px]"
                    >
                      {t('auth.rememberMe', 'Remember me')}
                    </label>
                  </div>
                  <a
                    href="#"
                    className="font-['Poppins',Helvetica] font-normal text-gray-900 dark:text-white text-base underline leading-[22.4px]"
                  >
                    {t('auth.forgotPassword', 'Forgot password?')}
                  </a>
                </div>

                {/* Login button */}
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  className="flex items-center justify-center gap-2.5 px-8 sm:px-[84px] py-3 sm:py-4 w-full bg-accent-500 rounded-lg text-white text-lg sm:text-xl font-['Poppins',Helvetica] font-medium hover:bg-accent-500/90"
                >
                  {t('auth.login', 'Login')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};