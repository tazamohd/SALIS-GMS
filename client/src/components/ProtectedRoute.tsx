import { ReactNode } from "react";
import { useLocation, Redirect } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Shield, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { USER_ROLES, ROLE_GROUPS, hasRole, type UserRoleValue } from "@shared/rbac";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRoleValue[];
  requireAuth?: boolean;
  fallbackPath?: string;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles,
  requireAuth = true,
  fallbackPath = "/login"
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0E1117] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#0A5ED7] dark:text-[#0BB3FF] mx-auto" />
          <p className="text-[#64748B] font-poppins">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Redirect to={fallbackPath} />;
  }

  if (allowedRoles && allowedRoles.length > 0 && user) {
    const userRole = (user as any).role as string;
    const hasAccess = hasRole(userRole, allowedRoles);
    
    if (!hasAccess) {
      return <AccessDenied userRole={userRole} requiredRoles={allowedRoles} />;
    }
  }

  return <>{children}</>;
}

interface RoleGuardProps {
  children: ReactNode;
  roles: UserRoleValue[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, roles, fallback }: RoleGuardProps) {
  const { user } = useAuth();
  
  if (!user) return fallback || null;
  
  const userRole = (user as any).role as string;
  const hasAccess = hasRole(userRole, roles);
  
  if (!hasAccess) return fallback || null;
  
  return <>{children}</>;
}

interface AccessDeniedProps {
  userRole?: string;
  requiredRoles?: UserRoleValue[];
}

function AccessDenied({ userRole, requiredRoles }: AccessDeniedProps) {
  const [, setLocation] = useLocation();
  
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0E1117] flex items-center justify-center p-6">
      <Card className="max-w-md w-full bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#F97316]/10 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-[#F97316]" />
          </div>
          <CardTitle className="text-xl text-[#0B1F3B] dark:text-white">
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-[#F97316] bg-[#F97316]/10 rounded-lg p-3">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-medium">Insufficient Permissions</span>
          </div>
          
          <p className="text-[#64748B] text-sm">
            Your current role does not have permission to access this page.
          </p>
          
          {userRole && (
            <p className="text-xs text-[#64748B]">
              Current role: <span className="font-medium text-[#0A5ED7]">{userRole}</span>
            </p>
          )}
          
          <div className="pt-4 space-y-2">
            <Button 
              onClick={() => setLocation("/dashboard")}
              className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white"
            >
              Go to Dashboard
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
            >
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { USER_ROLES, ROLE_GROUPS };
