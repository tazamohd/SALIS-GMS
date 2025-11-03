import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Wrench, Award, Clock, Settings, LogOut } from "lucide-react";
import { Link } from "wouter";
import type { User as UserType } from "@shared/schema";

export default function TechnicianMobileProfile() {
  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/auth/user"],
  });

  return (
    <div className="p-4 space-y-4">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || "T"}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user?.name || "Technician"}</h2>
              <p className="text-sm opacity-90">{user?.email}</p>
              <p className="text-xs opacity-75 mt-1">Technician Portal</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-4 text-center">
            <Wrench className="h-6 w-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Jobs Today</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">0h</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Hours</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-4 text-center">
            <Award className="h-6 w-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">98%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Quality</div>
          </CardContent>
        </Card>
      </div>

      {/* Menu Items */}
      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300 px-1">Settings</h3>
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-0">
            <Link href="/profile">
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Personal Information</span>
                </div>
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <Link href="/settings">
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">App Settings</span>
                </div>
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <Link href="/time-clock">
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Timesheet History</span>
                </div>
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Logout */}
      <Button
        variant="destructive"
        className="w-full"
        onClick={() => {
          window.location.href = "/api/auth/logout";
        }}
        data-testid="button-logout"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>

      {/* App Version */}
      <p className="text-xs text-center text-gray-400 dark:text-gray-600">
        SALIS AUTO Technician v1.0.0
      </p>
    </div>
  );
}
