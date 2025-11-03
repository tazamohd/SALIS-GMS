import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, MapPin, Bell, Lock, LogOut, Settings } from "lucide-react";
import { Link } from "wouter";
import type { User as UserType } from "@shared/schema";

export default function CustomerMobileProfile() {
  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/auth/user"],
  });

  const profileSections = [
    {
      title: "Account Settings",
      items: [
        { icon: User, label: "Personal Information", route: "/profile", testId: "link-personal" },
        { icon: Mail, label: "Email & Notifications", route: "/profile", testId: "link-notifications" },
        { icon: Lock, label: "Password & Security", route: "/security", testId: "link-security" },
      ],
    },
    {
      title: "Preferences",
      items: [
        { icon: Bell, label: "Notification Settings", route: "/settings", testId: "link-notif-settings" },
        { icon: Settings, label: "App Settings", route: "/settings", testId: "link-app-settings" },
      ],
    },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user?.name || "User"}</h2>
              <p className="text-sm opacity-90">{user?.email}</p>
              <p className="text-xs opacity-75 mt-1">Customer Account</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-base text-gray-900 dark:text-white">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.email || "Not set"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.phone || "Not set"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Sections */}
      {profileSections.map((section) => (
        <div key={section.title}>
          <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300 px-1">
            {section.title}
          </h3>
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="p-0">
              {section.items.map((item, index) => (
                <Link key={item.route} href={item.route}>
                  <div
                    className={`flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                      index < section.items.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""
                    }`}
                    data-testid={item.testId}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</span>
                    </div>
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      ))}

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
        SALIS AUTO Mobile v1.0.0
      </p>
    </div>
  );
}
