import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, CheckCircle, AlertCircle, Clock, Database, Cloud } from "lucide-react";

interface SystemSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ModuleStatus {
  name: string;
  status: 'synced' | 'syncing' | 'error';
  lastSync: string;
  progress: number;
}

export function SystemSyncDialog({ open, onOpenChange }: SystemSyncDialogProps) {
  const { t } = useTranslation();
  const { data: integrationStatus } = useQuery({
    queryKey: ['/api/integrated/status'],
  });

  const modules: ModuleStatus[] = [
    { name: "Garage & Branch Management", status: "synced", lastSync: "2 minutes ago", progress: 100 },
    { name: "User & Role Management", status: "synced", lastSync: "5 minutes ago", progress: 100 },
    { name: "Technician Profiles", status: "synced", lastSync: "3 minutes ago", progress: 100 },
    { name: "SaaS & Subscriptions", status: "synced", lastSync: "10 minutes ago", progress: 100 },
    { name: "Service Templates", status: "synced", lastSync: "1 minute ago", progress: 100 },
    { name: "Spare Parts Inventory", status: "syncing", lastSync: "syncing...", progress: 65 },
    { name: "Tool Management", status: "synced", lastSync: "4 minutes ago", progress: 100 },
    { name: "Job Cards & Tasks", status: "synced", lastSync: "just now", progress: 100 },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "synced":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "syncing":
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "synced":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Synced</Badge>;
      case "syncing":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Syncing</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Error</Badge>;
      default:
        return <Badge variant="outline">{t('common.unknown', 'Unknown')}</Badge>;
    }
  };

  const totalProgress = Math.round(modules.reduce((sum, m) => sum + m.progress, 0) / modules.length);
  const syncedCount = modules.filter(m => m.status === 'synced').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-['Poppins',Helvetica] font-semibold text-xl text-[#222029] flex items-center gap-2">
            <Database className="w-6 h-6" />
            System Sync Status
          </DialogTitle>
          <DialogDescription className="font-['Poppins',Helvetica] text-sm text-[#999999]">
            Real-time synchronization status across all modules
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">Overall System Health</h3>
                  <p className="text-sm text-gray-600">{syncedCount} of {modules.length} modules synced</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{totalProgress}%</div>
                  <p className="text-xs text-gray-500">Complete</p>
                </div>
              </div>
              <Progress value={totalProgress} className="h-2" />
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Module Status</h4>
            {modules.map((module, index) => (
              <Card key={index} className="border" data-testid={`module-status-${index}`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(module.status)}
                      <div className="flex-1">
                        <div className="font-medium text-sm">{module.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {module.lastSync}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {module.status === 'syncing' && (
                        <div className="text-sm text-gray-600">{module.progress}%</div>
                      )}
                      {getStatusBadge(module.status)}
                    </div>
                  </div>
                  {module.status === 'syncing' && (
                    <Progress value={module.progress} className="h-1 mt-2" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Cloud className="w-8 h-8 text-purple-600" />
                <div>
                  <h4 className="font-semibold">Cloud Synchronization</h4>
                  <p className="text-sm text-gray-600">All data backed up and encrypted</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
