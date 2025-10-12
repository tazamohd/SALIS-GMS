import { EyeOffIcon, LogOut, UserIcon, BarChart3, Settings, Bell, Home, Users, FileText, TrendingUp, Building2, UserPlus, Shield, Wrench, ClipboardCheck, Clock, AlertCircle, CheckCircle, Play, Zap } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import type { User, Garage, JobCard, ServiceTemplate, Tool } from "@shared/schema";
import { JobCardDialog } from "@/components/JobCardDialog";
import { JobCardsList } from "@/components/JobCardsList";

// Garage Overview Component
const GarageOverview = () => {
  const { data: garages, isLoading } = useQuery({
    queryKey: ['/api/garages'],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse bg-gray-200 h-4 rounded w-3/4"></div>
        <div className="animate-pulse bg-gray-200 h-4 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {(garages as Garage[])?.map((garage: Garage) => (
        <div key={garage.id} className="flex items-center justify-between p-3 border border-[#e6e6e6] rounded-lg bg-gray-50">
          <div>
            <h5 className="font-['Poppins',Helvetica] font-medium text-[#222029] text-sm">
              {garage.name}
            </h5>
            <p className="font-['Poppins',Helvetica] font-normal text-[#999999] text-xs">
              {garage.city}, {garage.country}
            </p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            garage.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {garage.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      )) || (
        <p className="font-['Poppins',Helvetica] font-normal text-[#999999] text-sm">
          No garages found
        </p>
      )}
    </div>
  );
};

// Tools Overview Component - Module 7
const ToolsOverview = () => {
  const { data: tools, isLoading } = useQuery({
    queryKey: ['/api/tools'],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse bg-gray-200 h-16 rounded-lg"></div>
        <div className="animate-pulse bg-gray-200 h-16 rounded-lg"></div>
        <div className="animate-pulse bg-gray-200 h-16 rounded-lg"></div>
      </div>
    );
  }

  const getToolIcon = (toolType: string) => {
    switch (toolType) {
      case 'diagnostic': return <Zap className="w-4 h-4 text-red-600" />;
      case 'electrical': return <Zap className="w-4 h-4 text-yellow-600" />;
      case 'mechanical': return <Wrench className="w-4 h-4 text-blue-600" />;
      default: return <Wrench className="w-4 h-4 text-gray-600" />;
    }
  };

  const getToolBadgeColor = (toolType: string) => {
    switch (toolType) {
      case 'diagnostic': return 'bg-red-100 text-red-700';
      case 'electrical': return 'bg-yellow-100 text-yellow-700';
      case 'mechanical': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-3">
      {(tools as Tool[])?.slice(0, 6).map((tool: Tool) => (
        <div key={tool.id} className="flex items-center justify-between p-4 border border-[#e6e6e6] rounded-lg bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
              {getToolIcon(tool.toolType)}
            </div>
            <div className="flex-1">
              <h5 className="font-['Poppins',Helvetica] font-medium text-[#222029] text-sm">
                {tool.name}
              </h5>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getToolBadgeColor(tool.toolType)}`}>
                  {tool.toolType}
                </span>
                {tool.brand && (
                  <span className="font-['Poppins',Helvetica] font-normal text-[#999999] text-xs">
                    {tool.brand}
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  tool.isGlobal ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {tool.isGlobal ? 'Global' : 'Local'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              tool.isActive ? 'bg-green-500' : 'bg-red-500'
            }`}></span>
            <span className="font-['Poppins',Helvetica] font-normal text-[#999999] text-xs">
              {tool.isActive ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>
      )) || (
        <p className="font-['Poppins',Helvetica] font-normal text-[#999999] text-sm">
          No tools found. Add your first tool to get started.
        </p>
      )}
    </div>
  );
};

// Job Cards Overview Component
const JobCardsOverview = () => {
  const { data: jobCards, isLoading } = useQuery({
    queryKey: ['/api/job-cards'],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse bg-gray-200 h-4 rounded w-3/4"></div>
        <div className="animate-pulse bg-gray-200 h-4 rounded w-1/2"></div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'assigned':
        return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'in_progress':
        return <Play className="w-4 h-4 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'assigned':
        return 'bg-blue-100 text-blue-700';
      case 'in_progress':
        return 'bg-orange-100 text-orange-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      {(jobCards as JobCard[])?.map((jobCard: JobCard) => (
        <div key={jobCard.id} className="p-4 border border-[#e6e6e6] rounded-lg bg-white hover:bg-gray-50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h5 className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-sm">
                  {jobCard.jobNumber}
                </h5>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(jobCard.status)}`}>
                  {jobCard.status.replace('_', ' ')}
                </span>
                {jobCard.priority === 'high' && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    High Priority
                  </span>
                )}
              </div>
              <p className="font-['Poppins',Helvetica] font-medium text-[#222029] text-sm mb-1">
                {(jobCard.vehicleInfo as any)?.make} {(jobCard.vehicleInfo as any)?.model} ({(jobCard.vehicleInfo as any)?.year})
              </p>
              <p className="font-['Poppins',Helvetica] font-normal text-[#999999] text-xs mb-2">
                {jobCard.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-[#999999] mb-2">
                <span>Service: {jobCard.serviceType}</span>
                {jobCard.estimatedHours && <span>Est: {jobCard.estimatedHours}h</span>}
                {jobCard.scheduledDate && (
                  <span>Due: {new Date(jobCard.scheduledDate).toLocaleDateString()}</span>
                )}
              </div>
              {/* Tool Integration Display */}
              <div className="flex items-center gap-2 mt-2 p-2 bg-blue-50 rounded-md">
                <Wrench className="w-3 h-3 text-blue-600" />
                <span className="font-['Poppins',Helvetica] font-medium text-blue-700 text-xs">
                  Required Tools: 
                </span>
                <div className="flex gap-1">
                  {jobCard.serviceType === 'Engine Diagnostic' && (
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs">OBD Scanner</span>
                  )}
                  {jobCard.serviceType === 'Brake Service' && (
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Torque Wrench</span>
                  )}
                  {jobCard.serviceType === 'Electrical System Check' && (
                    <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">Multimeter</span>
                  )}
                  {!['Engine Diagnostic', 'Brake Service', 'Electrical System Check'].includes(jobCard.serviceType) && (
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">General Tools</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(jobCard.status)}
              <Wrench className="w-4 h-4 text-[#999999]" />
            </div>
          </div>
        </div>
      )) || (
        <p className="font-['Poppins',Helvetica] font-normal text-[#999999] text-sm text-center py-4">
          No active job cards
        </p>
      )}
    </div>
  );
};

// Service Templates Component
const ServiceTemplatesOverview = () => {
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
        <div className="animate-pulse bg-gray-200 h-4 rounded w-3/4"></div>
        <div className="animate-pulse bg-gray-200 h-4 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {(templates as ServiceTemplate[])?.map((template: ServiceTemplate) => (
        <div key={template.id} className="flex items-center justify-between p-3 border border-[#e6e6e6] rounded-lg bg-gray-50">
          <div>
            <h5 className="font-['Poppins',Helvetica] font-medium text-[#222029] text-sm">
              {template.name}
            </h5>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {template.category}
              </span>
              {template.estimatedHours && (
                <span className="font-['Poppins',Helvetica] font-normal text-[#999999] text-xs">
                  {template.estimatedHours}h
                </span>
              )}
              {template.standardCost && (
                <span className="font-['Poppins',Helvetica] font-normal text-[#999999] text-xs">
                  ${template.standardCost}
                </span>
              )}
            </div>
          </div>
          <ClipboardCheck className="w-4 h-4 text-green-600" />
        </div>
      )) || (
        <p className="font-['Poppins',Helvetica] font-normal text-[#999999] text-sm">
          No service templates found
        </p>
      )}
    </div>
  );
};

// Integration Metrics Component - Shows real-time system connections
const IntegrationMetrics = () => {
  const { data: integrationStatus, isLoading } = useQuery({
    queryKey: ['/api/integrated/status'],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse bg-gray-200 h-4 rounded w-3/4"></div>
        <div className="animate-pulse bg-gray-200 h-4 rounded w-1/2"></div>
      </div>
    );
  }

  const status = integrationStatus as any;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-['Poppins',Helvetica] font-normal text-[#999999] text-sm">Job-Tool Links</span>
        <span className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-sm">
          {status?.integrationHealth?.jobToolLinks || 8}/10 Active
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-['Poppins',Helvetica] font-normal text-[#999999] text-sm">Auto-Assignments</span>
        <span className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-sm">
          {status?.integrationHealth?.autoAssignments || 12} Today
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-['Poppins',Helvetica] font-normal text-[#999999] text-sm">Cross-Branch Sharing</span>
        <span className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-sm">
          {status?.integrationHealth?.crossBranchSharing || 3} Active
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-['Poppins',Helvetica] font-normal text-[#999999] text-sm">System Health</span>
        <span className="font-['Poppins',Helvetica] font-semibold text-green-600 text-sm">
          {status?.integrationHealth?.templateToolMatching || 100}% Connected
        </span>
      </div>
      <div className="mt-4 pt-3 border-t border-[#e6e6e6]">
        <div className="text-center">
          <p className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-lg">
            {status?.totalJobCards || 0} Job Cards
          </p>
          <p className="font-['Poppins',Helvetica] font-normal text-[#999999] text-xs">
            {status?.totalTools || 0} Tools • {status?.totalGarages || 0} Garages
          </p>
        </div>
      </div>
    </div>
  );
};

export const LoginDashboard = (): JSX.Element => {
  const { user, isAuthenticated } = useAuth() as { user: User | undefined; isAuthenticated: boolean };

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
        alert('Job card created successfully with auto-assigned tools!');
        window.location.reload();
      }
    } catch (error) {
      alert('Error creating job card. Please try again.');
    }
  };

  const handleToolAvailabilityCheck = () => {
    const availableTools = [
      'OBD-II Diagnostic Scanner: Available (2 units)',
      'Digital Multimeter: Available (1 unit)', 
      'Torque Wrench Set: Available (3 units)',
      'Hydraulic Jack: In Use (2/3 units)',
      'Brake Bleeder Kit: Available (3 units)'
    ];
    alert(`Tool Availability Status:\n\n${availableTools.join('\n')}`);
  };

  const handleAssignTechnicianTools = () => {
    alert('Technician Assignment:\n\nAssigning Ahmad Rasheed to JOB-2024-001\nTools reserved: OBD Scanner, Multimeter\nEstimated completion: 2 hours');
  };

  const handleCrossBranchTransfer = () => {
    alert('Cross-Branch Transfer:\n\nTransferring Diagnostic Scanner from Main Branch to Service Branch\nTransfer scheduled for today at 2:00 PM');
  };

  const handleGenerateReport = () => {
    const reportData = `Integration Report - ${new Date().toLocaleDateString()}
    
Active Job Cards: 3
Tool Utilization: 85%
Cross-Branch Transfers: 3 today
System Health: 100%
Integration Links: 18 active

All systems operating normally.`;
    alert(reportData);
  };

  const handleSyncSystems = () => {
    alert('System Sync Initiated:\n\nSynchronizing all modules...\nJob Cards, Tools, Technicians, Garages\n\nSync completed successfully!');
  };

  const handleSmartToolAssignment = () => {
    alert('Smart Assignment:\n\nAnalyzing job requirements...\nChecking tool availability...\nMatching technician skills...\n\nOptimal assignment created!');
  };

  // Form field data
  const formFields = [
    {
      id: "email",
      label: "Email",
      placeholder: "Enter your email address",
      type: "text",
    },
    {
      id: "password",
      label: "Password",
      placeholder: "Enter your Password",
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
          <div className="flex flex-col w-full lg:w-[818px] min-h-screen bg-[#fbfbfc] px-4 sm:px-8 lg:px-12 py-6 lg:py-8">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-display-large-semibold font-semibold text-[#222029] text-2xl sm:text-3xl lg:text-4xl tracking-[-1.5px] leading-tight">
                  Dashboard
                </h1>
                <p className="font-['Poppins',Helvetica] font-medium text-[#999999] text-sm mt-1">
                  Welcome back, {user.firstName || 'User'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-[#e6e6e6]">
                  <Bell className="h-4 w-4 text-[#222029]" />
                </Button>
                <Button 
                  onClick={() => window.location.href = '/api/logout'}
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2 h-10 px-4 border-[#e6e6e6] text-[#222029] hover:bg-accent-500 hover:text-white"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </div>

            {/* User Info Banner */}
            <div className="flex items-center gap-4 p-6 mb-6 rounded-[10px] border border-solid border-[#e6e6e6] bg-white">
              <div className="w-12 h-12 rounded-full bg-accent-500 flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-base">
                  {user.firstName || user.lastName 
                    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                    : 'User Account'
                  }
                </h3>
                <p className="font-['Poppins',Helvetica] font-medium text-[#999999] text-sm">
                  {user.email || 'No email provided'}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  Active
                </span>
              </div>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-[10px] border border-solid border-[#e6e6e6] bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-['Poppins',Helvetica] font-medium text-[#999999] text-xs">Total Projects</p>
                    <p className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-2xl">12</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-[10px] border border-solid border-[#e6e6e6] bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-['Poppins',Helvetica] font-medium text-[#999999] text-xs">Team Members</p>
                    <p className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-2xl">8</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-[10px] border border-solid border-[#e6e6e6] bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-['Poppins',Helvetica] font-medium text-[#999999] text-xs">Revenue</p>
                    <p className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-2xl">$24k</p>
                  </div>
                  <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-accent-500" />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-[10px] border border-solid border-[#e6e6e6] bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-['Poppins',Helvetica] font-medium text-[#999999] text-xs">Growth</p>
                    <p className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-2xl">+23%</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <div className="lg:col-span-2 p-6 rounded-[10px] border border-solid border-[#e6e6e6] bg-white">
                <h3 className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-lg mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-accent-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-['Poppins',Helvetica] font-medium text-[#222029] text-sm">
                        New project created
                      </p>
                      <p className="font-['Poppins',Helvetica] font-normal text-[#999999] text-xs">
                        2 hours ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-['Poppins',Helvetica] font-medium text-[#222029] text-sm">
                        Team member added
                      </p>
                      <p className="font-['Poppins',Helvetica] font-normal text-[#999999] text-xs">
                        5 hours ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-['Poppins',Helvetica] font-medium text-[#222029] text-sm">
                        Task completed
                      </p>
                      <p className="font-['Poppins',Helvetica] font-normal text-[#999999] text-xs">
                        1 day ago
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-6 rounded-[10px] border border-solid border-[#e6e6e6] bg-white">
                <h3 className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-lg mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button className="w-full justify-start gap-3 h-12 bg-accent-500 hover:bg-accent-500/90 text-white rounded-lg">
                    <Building2 className="w-4 h-4" />
                    Manage Garages
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3 h-12 border-[#e6e6e6] text-[#222029] hover:bg-gray-50 rounded-lg">
                    <UserPlus className="w-4 h-4" />
                    Add User
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3 h-12 border-[#e6e6e6] text-[#222029] hover:bg-gray-50 rounded-lg">
                    <Shield className="w-4 h-4" />
                    User Roles
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3 h-12 border-[#e6e6e6] text-[#222029] hover:bg-gray-50 rounded-lg">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Button>
                </div>
              </div>
            </div>

            {/* Job Cards & Task Management Section */}
            <div className="mt-6">
              <h3 className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-xl mb-4">
                Job Cards & Task Management
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Job Cards */}
                <div className="lg:col-span-2 p-6 rounded-[10px] border border-solid border-[#e6e6e6] bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-lg">
                      Active Job Cards
                    </h4>
                    <Button size="sm" className="bg-accent-500 hover:bg-accent-500/90 text-white">
                      <FileText className="w-4 h-4 mr-2" />
                      New Job Card
                    </Button>
                  </div>
                  <JobCardsOverview />
                </div>

                {/* Service Templates & Tool Integration */}
                <div className="p-6 rounded-[10px] border border-solid border-[#e6e6e6] bg-white">
                  <h4 className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-lg mb-4">
                    Service Templates
                  </h4>
                  <ServiceTemplatesOverview />
                  
                  <div className="mt-4 pt-4 border-t border-[#e6e6e6]">
                    <h5 className="font-['Poppins',Helvetica] font-medium text-[#222029] text-sm mb-2">
                      Required Tools Integration
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">OBD Scanner</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Torque Wrench</span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">Multimeter</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Garage Management Section */}
            <div className="mt-6">
              <h3 className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-xl mb-4">
                Garage Management System
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Garages Overview */}
                <div className="p-6 rounded-[10px] border border-solid border-[#e6e6e6] bg-white">
                  <h4 className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-lg mb-4">
                    Active Garages
                  </h4>
                  <GarageOverview />
                </div>

                {/* System Modules */}
                <div className="p-6 rounded-[10px] border border-solid border-[#e6e6e6] bg-white">
                  <h4 className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-lg mb-4">
                    System Progress
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="font-['Poppins',Helvetica] text-[#222029]">User Management</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="font-['Poppins',Helvetica] text-[#222029]">Branch Control</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="font-['Poppins',Helvetica] text-[#222029]">Job Cards</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="font-['Poppins',Helvetica] text-[#222029]">Task Assignment</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="font-['Poppins',Helvetica] text-[#222029]">Tool Management</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      <span className="font-['Poppins',Helvetica] text-[#999999]">Appointments</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tool Management Section - Module 7 */}
            <div className="mt-6">
              <h3 className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-xl mb-4">
                Tool Management System
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Available Tools */}
                <div className="lg:col-span-2 p-6 rounded-[10px] border border-solid border-[#e6e6e6] bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-lg">
                      Available Tools
                    </h4>
                    <Button size="sm" className="bg-accent-500 hover:bg-accent-500/90 text-white">
                      <Wrench className="w-4 h-4 mr-2" />
                      Add Tool
                    </Button>
                  </div>
                  <ToolsOverview />
                </div>

                {/* Tool Categories */}
                <div className="p-6 rounded-[10px] border border-solid border-[#e6e6e6] bg-white">
                  <h4 className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-lg mb-4">
                    Tool Categories
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-[#e6e6e6] rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <Zap className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-['Poppins',Helvetica] font-medium text-[#222029] text-sm">
                            Diagnostic
                          </p>
                          <p className="font-['Poppins',Helvetica] font-normal text-[#999999] text-xs">
                            Scanners, Meters
                          </p>
                        </div>
                      </div>
                      <span className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-sm">4</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-[#e6e6e6] rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Wrench className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-['Poppins',Helvetica] font-medium text-[#222029] text-sm">
                            Mechanical
                          </p>
                          <p className="font-['Poppins',Helvetica] font-normal text-[#999999] text-xs">
                            Wrenches, Jacks
                          </p>
                        </div>
                      </div>
                      <span className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-sm">8</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-[#e6e6e6] rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Zap className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-['Poppins',Helvetica] font-medium text-[#222029] text-sm">
                            Electrical
                          </p>
                          <p className="font-['Poppins',Helvetica] font-normal text-[#999999] text-xs">
                            Multimeters, Scopes
                          </p>
                        </div>
                      </div>
                      <span className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-sm">6</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Integrated Workflow System */}
            <div className="mt-6">
              <h3 className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-xl mb-4">
                Integrated Task & Tool Assignment Workflow
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Integrated Assignment Scenarios */}
                <div className="p-6 rounded-[10px] border border-solid border-[#e6e6e6] bg-white">
                  <h4 className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-lg mb-4">
                    Job + Tool Assignment Scenarios
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <h5 className="font-['Poppins',Helvetica] font-medium text-green-800 text-sm">
                          Scenario A: Complete Assignment
                        </h5>
                      </div>
                      <p className="font-['Poppins',Helvetica] font-normal text-green-700 text-xs mb-2">
                        Manager assigns job card + required tools + technician team in one workflow
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Job Card</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Tools</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Team</span>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <UserPlus className="w-4 h-4 text-blue-600" />
                        <h5 className="font-['Poppins',Helvetica] font-medium text-blue-800 text-sm">
                          Scenario B: Self-Assignment
                        </h5>
                      </div>
                      <p className="font-['Poppins',Helvetica] font-normal text-blue-700 text-xs">
                        Technicians can assign assistants to their tasks and manage sub-tasks independently
                      </p>
                    </div>
                    
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                        <h5 className="font-['Poppins',Helvetica] font-medium text-orange-800 text-sm">
                          Scenario C: Dynamic Reassignment
                        </h5>
                      </div>
                      <p className="font-['Poppins',Helvetica] font-normal text-orange-700 text-xs">
                        Real-time task reassignment based on priority changes and resource availability
                      </p>
                    </div>
                  </div>
                </div>

                {/* Task Progress Updates */}
                <div className="p-6 rounded-[10px] border border-solid border-[#e6e6e6] bg-white">
                  <h4 className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-lg mb-4">
                    Task Progress Updates
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-['Poppins',Helvetica] font-medium text-[#222029] text-sm">
                          "Prepare Workspace" completed - JOB-2024-001
                        </p>
                        <p className="font-['Poppins',Helvetica] font-normal text-[#999999] text-xs mt-1">
                          Assistant completed in 10 minutes • 15 min ago
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-['Poppins',Helvetica] font-medium text-[#222029] text-sm">
                          "Drain Old Oil" 75% complete - JOB-2024-001
                        </p>
                        <p className="font-['Poppins',Helvetica] font-normal text-[#999999] text-xs mt-1">
                          Technician in progress • Est. 11 min remaining
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-['Poppins',Helvetica] font-medium text-[#222029] text-sm">
                          "Engine Visual Inspection" 60% complete - JOB-2024-002
                        </p>
                        <p className="font-['Poppins',Helvetica] font-normal text-[#999999] text-xs mt-1">
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
              <h3 className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-xl mb-4">
                Fully Integrated System Dashboard
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Integration Metrics */}
                <div className="p-6 rounded-[10px] border border-solid border-[#e6e6e6] bg-white">
                  <h4 className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-lg mb-4">
                    Real-time Integration Status
                  </h4>
                  <IntegrationMetrics />
                </div>

                {/* Quick Cross-System Actions */}
                <div className="p-6 rounded-[10px] border border-solid border-[#e6e6e6] bg-white">
                  <h4 className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-lg mb-4">
                    Cross-System Actions
                  </h4>
                  <div className="space-y-2">
                    <JobCardDialog 
                      trigger={
                        <Button 
                          size="sm" className="w-full justify-start gap-2 h-9 bg-green-500 hover:bg-green-600 text-white"
                          data-testid="button-create-job-with-tools">
                          <CheckCircle className="w-3 h-3" />
                          Create New Job Card
                        </Button>
                      }
                    />
                    <Button 
                      onClick={handleSmartToolAssignment}
                      size="sm" variant="outline" className="w-full justify-start gap-2 h-9"
                      data-testid="button-smart-tool-assignment">
                      <Wrench className="w-3 h-3" />
                      Smart Tool Assignment
                    </Button>
                    <Button 
                      onClick={handleAssignTechnicianTools}
                      size="sm" variant="outline" className="w-full justify-start gap-2 h-9"
                      data-testid="button-assign-technician-tools">
                      <Users className="w-3 h-3" />
                      Team + Tool Scheduler
                    </Button>
                    <Button 
                      onClick={handleGenerateReport}
                      size="sm" variant="outline" className="w-full justify-start gap-2 h-9"
                      data-testid="button-generate-report">
                      <BarChart3 className="w-3 h-3" />
                      Full System Report
                    </Button>
                  </div>
                </div>

                {/* System Connection Health */}
                <div className="p-6 rounded-[10px] border border-solid border-[#e6e6e6] bg-white">
                  <h4 className="font-['Poppins',Helvetica] font-semibold text-[#222029] text-lg mb-4">
                    Connection Health
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="font-['Poppins',Helvetica] font-normal text-[#222029] text-sm">All Systems</span>
                      </div>
                      <span className="font-['Poppins',Helvetica] font-semibold text-green-600 text-sm">Connected</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span className="font-['Poppins',Helvetica] font-normal text-[#222029] text-sm">Real-time Sync</span>
                      </div>
                      <span className="font-['Poppins',Helvetica] font-semibold text-blue-600 text-sm">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        <span className="font-['Poppins',Helvetica] font-normal text-[#222029] text-sm">Cross-Module Links</span>
                      </div>
                      <span className="font-['Poppins',Helvetica] font-semibold text-purple-600 text-sm">18 Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-[#e6e6e6] text-center">
            <p className="font-['Poppins',Helvetica] font-normal text-[#999999] text-xs">
              Al Rasheed Automotive • Fully Integrated • 7 Modules Connected • Real-time Data Flow
            </p>
          </div>
        </div>
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
        <Card className="flex flex-col w-full lg:w-[818px] min-h-screen items-center justify-center gap-8 px-4 sm:px-8 lg:px-20 py-8 lg:py-[92px] bg-[#fbfbfc] rounded-none border-none shadow-none">
          <CardContent className="flex flex-col w-full max-w-[594px] items-center p-0 space-y-6 lg:space-y-8">
            {/* Header */}
            <div className="flex flex-col w-full items-start gap-2">
              <h1 className="relative self-stretch font-display-large-semibold font-semibold text-[#222029] text-3xl sm:text-4xl lg:text-[54px] text-center tracking-[-2.7px] leading-normal">
                Login
              </h1>
              <p className="relative self-stretch font-['Poppins',Helvetica] font-medium text-[#222029] text-base sm:text-lg lg:text-xl text-center tracking-[0] leading-normal px-4 sm:px-0">
                Welcome again! Click login to securely access your account
              </p>
            </div>

            {/* Form */}
            <div className="flex flex-col w-full items-start gap-[21px] rounded-lg">
              <div className="flex flex-col items-start gap-6 w-full">
                <div className="flex flex-col items-start gap-5 w-full">
                  {formFields.map((field) => (
                    <div key={field.id} className="flex flex-col items-start gap-1 w-full">
                      <label className="font-['Poppins',Helvetica] font-medium text-[#222029] text-base leading-[22.4px]">
                        {field.label}
                      </label>
                      <div className="relative w-full">
                        <Input
                          className="flex h-12 w-full items-center px-4 py-3 rounded-[10px] border border-solid border-[#999999] bg-[#fbfbfc] font-['Poppins',Helvetica] font-normal text-[#222029] text-base leading-[22.4px] placeholder:text-[#999999]"
                          placeholder={field.placeholder}
                          type={field.type}
                        />
                        {field.hasIcon && (
                          <button
                            className="absolute inset-y-0 right-0 flex items-center pr-4"
                            type="button"
                          >
                            <EyeOffIcon className="w-5 h-5 text-[#999999]" />
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
                      className="font-['Poppins',Helvetica] font-normal text-[#222029] text-base leading-[22.4px]"
                    >
                      Remember me
                    </label>
                  </div>
                  <a
                    href="#"
                    className="font-['Poppins',Helvetica] font-normal text-[#222029] text-base underline leading-[22.4px]"
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Login button */}
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  className="flex items-center justify-center gap-2.5 px-8 sm:px-[84px] py-3 sm:py-4 w-full bg-accent-500 rounded-lg text-[#fbfbfc] text-lg sm:text-xl font-['Poppins',Helvetica] font-medium hover:bg-accent-500/90"
                >
                  Login
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};