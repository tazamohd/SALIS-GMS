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
  title: string;
  description?: string;
  icon?: LucideIcon;
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
  tabs: TabConfig[];
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  headerContent?: ReactNode;
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
}: TabsPageLayoutProps) {
  const isControlled = activeTab !== undefined && onTabChange !== undefined;
  
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
        {...(isControlled 
          ? { value: activeTab, onValueChange: onTabChange }
          : { defaultValue: defaultTab || tabs[0]?.id }
        )}
        className="w-full"
      >
        <div className="group relative mb-6">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-50"></div>
          <TabsList 
            className="relative grid w-full backdrop-blur-xl bg-white/70 dark:bg-black/30 rounded-2xl p-1 border border-purple-200/50 dark:border-white/10 shadow-lg" 
            style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
          >
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                data-testid={`tab-${tab.id}`}
                className="relative rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
              >
                {tab.icon && <tab.icon className="mr-2 h-4 w-4" />}
                {tab.label}
                {tab.badge !== undefined && (
                  <span className="ml-2 rounded-full bg-white/20 dark:bg-white/10 px-2 py-0.5 text-xs font-medium">
                    {tab.badge}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-6">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </StandardPageLayout>
  );
}
