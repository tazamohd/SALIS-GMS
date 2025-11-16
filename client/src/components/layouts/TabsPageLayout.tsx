import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { StandardPageLayout } from "./StandardPageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface TabConfig {
  id: string;
  label: string;
  icon?: LucideIcon;
  content: ReactNode;
  badge?: string | number;
}

export interface TabsPageLayoutProps {
  // Page header
  title: string;
  description?: string;
  icon?: LucideIcon;
  
  // Actions
  primaryAction?: {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary" | "destructive";
    testId?: string;
  };
  secondaryActions?: {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary" | "destructive";
    testId?: string;
  }[];
  
  // Tabs
  tabs: TabConfig[];
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  
  // Optional content above tabs
  headerContent?: ReactNode;
  
  // Layout
  maxWidth?: "default" | "wide" | "full";
}

export function TabsPageLayout({
  title,
  description,
  icon,
  primaryAction,
  secondaryActions,
  tabs,
  defaultTab,
  activeTab,
  onTabChange,
  headerContent,
  maxWidth = "default",
}: TabsPageLayoutProps) {
  const isControlled = activeTab !== undefined && onTabChange !== undefined;
  
  // Combine actions for StandardPageLayout
  const actions = [
    ...(primaryAction ? [{ ...primaryAction }] : []),
    ...(secondaryActions || []),
  ];
  
  return (
    <StandardPageLayout
      title={title}
      description={description}
      icon={icon}
      actions={actions}
    >
      {headerContent}
      
      <Tabs
        value={isControlled ? activeTab : defaultTab || tabs[0]?.id}
        onValueChange={onTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              data-testid={`tab-${tab.id}`}
              className="relative"
            >
              {tab.icon && <tab.icon className="mr-2 h-4 w-4" />}
              {tab.label}
              {tab.badge !== undefined && (
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
                  {tab.badge}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-6">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </StandardPageLayout>
  );
}
