import { EyeOffIcon, LogOut, UserIcon, BarChart3, Settings, Bell, Home, Users, FileText, TrendingUp } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";

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
                    <Home className="w-4 h-4" />
                    New Project
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3 h-12 border-[#e6e6e6] text-[#222029] hover:bg-gray-50 rounded-lg">
                    <Users className="w-4 h-4" />
                    Invite Team
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3 h-12 border-[#e6e6e6] text-[#222029] hover:bg-gray-50 rounded-lg">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Button>
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
                  {/* Email field */}
                  <div className="flex flex-col items-start gap-1 w-full">
                    <label className="font-['Poppins',Helvetica] font-medium text-[#222029] text-base leading-[22.4px]">
                      {formFields[0].label}
                    </label>
                    <Input
                      className="h-12 sm:h-[60px] px-4 sm:px-5 py-3 sm:py-3.5 rounded-[10px] border border-solid border-[#e6e6e6] font-['Poppins',Helvetica] text-primary-400 text-sm sm:text-base"
                      placeholder={formFields[0].placeholder}
                      type={formFields[0].type}
                    />
                  </div>

                  {/* Password field */}
                  <div className="flex flex-col items-start gap-1 w-full">
                    <label className="font-['Poppins',Helvetica] font-medium text-[#222029] text-base leading-[22.4px]">
                      {formFields[1].label}
                    </label>
                    <div className="flex h-12 sm:h-[60px] items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 w-full rounded-[10px] border border-solid border-[#e6e6e6] relative">
                      <Input
                        className="border-0 p-0 h-full shadow-none font-['Poppins',Helvetica] font-normal text-[#999999] text-sm sm:text-base"
                        placeholder={formFields[1].placeholder}
                        type={formFields[1].type}
                      />
                      <EyeOffIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 absolute right-4 sm:right-5" />
                    </div>
                  </div>

                  {/* Remember me and Forgot Password */}
                  <div className="flex items-center justify-between w-full">
                    <div className="inline-flex items-center gap-2">
                      <Checkbox
                        id="remember-me"
                        className="w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-sm"
                      />
                      <label
                        htmlFor="remember-me"
                        className="font-['Poppins',Helvetica] font-medium text-[#222029] text-xs sm:text-sm"
                      >
                        Remember me
                      </label>
                    </div>
                    <a
                      href="#"
                      className="font-['Poppins',Helvetica] font-normal text-accent-500 text-xs sm:text-sm text-right underline"
                    >
                      Forgot Password?
                    </a>
                  </div>
                </div>
              </div>

              {/* Login button */}
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="flex items-center justify-center gap-2.5 px-8 sm:px-[84px] py-3 sm:py-4 w-full bg-accent-500 rounded-lg text-[#fbfbfc] text-lg sm:text-xl font-['Poppins',Helvetica] font-medium hover:bg-accent-500/90"
              >
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};
