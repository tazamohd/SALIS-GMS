import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function WelcomePage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      setLocation("/login");
      return;
    }

    const userAny = user as any;
    const primaryPortal = userAny.primaryPortal || "/dashboard";
    
    setTimeout(() => {
      setLocation(primaryPortal);
    }, 1500);
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-salis-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600 dark:text-gray-400" />
      </div>
    );
  }

  const userAny = user as any;
  const userName = userAny?.firstName || "User";
  const primaryPortal = userAny?.primaryPortal || "/dashboard";
  const roles = userAny?.roles || [];

  return (
    <div className="min-h-screen bg-white dark:bg-salis-black flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <span className="text-3xl font-bold text-gray-700 dark:text-gray-300">
            {userName.charAt(0).toUpperCase()}
          </span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {userName}!
        </h1>
        
        {roles.length > 0 && (
          <p className="text-gray-600 dark:text-gray-400">
            Logged in as: <span className="font-medium">{roles.join(", ")}</span>
          </p>
        )}
        
        <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Redirecting to your portal...</span>
        </div>
        
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Taking you to {primaryPortal}
        </p>
      </div>
    </div>
  );
}
