import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Home, Clipboard, Clock, Search, User } from "lucide-react";

interface TechnicianMobileLayoutProps {
  children: ReactNode;
}

export function TechnicianMobileLayout({ children }: TechnicianMobileLayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/technician-app", icon: Home, label: "Home" },
    { path: "/technician-app/jobs", icon: Clipboard, label: "Jobs" },
    { path: "/technician-app/clock", icon: Clock, label: "Time" },
    { path: "/technician-app/lookup", icon: Search, label: "Parts" },
    { path: "/technician-app/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      {/* Mobile Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-4 sticky top-0 z-10 text-white">
        <h1 className="text-xl font-bold">SALIS AUTO</h1>
        <p className="text-xs opacity-90">Technician Portal</p>
      </div>

      {/* Main Content */}
      <main className="pb-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path || 
              (item.path !== "/technician-app" && location.startsWith(item.path));
            
            return (
              <Link key={item.path} href={item.path}>
                <a 
                  className={`flex flex-col items-center justify-center w-full h-full px-2 transition-colors ${
                    isActive 
                      ? "text-purple-600 dark:text-purple-400" 
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  data-testid={`tech-nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </a>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
