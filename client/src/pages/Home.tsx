import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";
import { LogOut, Shield, User as UserIcon } from "lucide-react";

export default function Home() {
  const { user } = useAuth() as { user: User | undefined };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || 'U';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/api/logout'}
            className="flex items-center gap-2"
            data-testid="button-sign-out"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.profileImageUrl || ''} />
                <AvatarFallback>
                  {getInitials(user?.firstName, user?.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">
                  Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
                </CardTitle>
                <CardDescription>
                  {user?.email || 'Manage your account and settings below'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Name:</span>
                <p className="text-gray-900 dark:text-white">
                  {user?.firstName || user?.lastName 
                    ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
                    : 'Not provided'
                  }
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email:</span>
                <p className="text-gray-900 dark:text-white">{user?.email || 'Not provided'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID:</span>
                <p className="text-gray-900 dark:text-white font-mono text-sm">{user?.id}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Authentication</span>
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                    Secured
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Session Active</span>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    Connected
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and settings for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col" data-testid="button-edit-profile">
                <UserIcon className="h-6 w-6 mb-2" />
                Edit Profile
              </Button>
              <Button variant="outline" className="h-20 flex-col" data-testid="button-security-settings">
                <Shield className="h-6 w-6 mb-2" />
                Security Settings
              </Button>
              <Button variant="outline" className="h-20 flex-col" data-testid="button-sign-out-quick">
                <LogOut className="h-6 w-6 mb-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}