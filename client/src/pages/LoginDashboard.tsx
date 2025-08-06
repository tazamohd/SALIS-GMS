import { EyeOffIcon, LogOut, UserIcon, BarChart3, Settings, Bell, Home, Users, FileText, TrendingUp, Building2, UserPlus, Shield } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import type { User, Garage } from "@shared/schema";

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

export const LoginDashboard = (): JSX.Element => {
  const { user, isAuthenticated } = useAuth() as { user: User | undefined; isAuthenticated: boolean };

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
                    Available Modules
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
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span className="font-['Poppins',Helvetica] text-[#222029]">Tool Management</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span className="font-['Poppins',Helvetica] text-[#222029]">Job Cards</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      <span className="font-['Poppins',Helvetica] text-[#999999]">Appointments</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      <span className="font-['Poppins',Helvetica] text-[#999999]">Billing</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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