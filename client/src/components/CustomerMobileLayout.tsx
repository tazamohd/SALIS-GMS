import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Home, Calendar, Car, Receipt, User } from "lucide-react";

interface CustomerMobileLayoutProps {
  children: ReactNode;
}

export function CustomerMobileLayout({ children }: CustomerMobileLayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/customer-app", icon: Home, label: "Home" },
    { path: "/customer-app/booking", icon: Calendar, label: "Book" },
    { path: "/customer-app/vehicles", icon: Car, label: "Vehicles" },
    { path: "/customer-app/payments", icon: Receipt, label: "Payments" },
    { path: "/customer-app/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      {/* Mobile Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">SALIS AUTO</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">Customer Portal</p>
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
              (item.path !== "/customer-app" && location.startsWith(item.path));
            
            return (
              <Link key={item.path} href={item.path}>
                <a 
                  className={`flex flex-col items-center justify-center w-full h-full px-2 transition-colors ${
                    isActive 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
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
