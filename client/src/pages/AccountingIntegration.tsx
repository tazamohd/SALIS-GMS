import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Link2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TabsPageLayout, TabConfig } from "@/components/layouts";

export default function AccountingIntegration() {
  const { t } = useTranslation();
  const [selectedProvider, setSelectedProvider] = useState<string>("quickbooks");
  const { toast } = useToast();

  const { data: connections = [] } = useQuery({
    queryKey: ["/api/accounting/connections"],
  });

  const { data: syncHistory = [] } = useQuery({
    queryKey: ["/api/accounting/sync-history"],
  });

  const connectMutation = useMutation({
    mutationFn: async (provider: string) => {
      return await apiRequest("/api/accounting/connect", "POST", { provider });
    },
    onSuccess: () => {
      toast({ title: t('accounting.connectionInitiated', 'Connection initiated'), description: t('accounting.completeAuthorization', 'Please complete the authorization process.') });
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/connections"] });
    },
  });

  const syncMutation = useMutation({
    mutationFn: async (syncType: string) => {
      return await apiRequest("/api/accounting/sync", "POST", { syncType });
    },
    onSuccess: () => {
      toast({ title: t('accounting.syncStarted', 'Sync started'), description: t('accounting.dataSynchronizing', 'Data is being synchronized.') });
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/sync-history"] });
    },
  });

  const mockConnections = [
    {
      id: "1",
      provider: "quickbooks",
      companyName: "SALIS AUTO Garage",
      isActive: true,
      lastSyncAt: "2024-10-26T10:30:00Z",
    },
  ];

  const mockSyncHistory = [
    { id: "1", syncType: "Invoices", status: "synced", count: 45, timestamp: "2024-10-26T10:30:00Z" },
    { id: "2", syncType: "Payments", status: "synced", count: 38, timestamp: "2024-10-26T10:25:00Z" },
    { id: "3", syncType: "Customers", status: "synced", count: 128, timestamp: "2024-10-26T09:15:00Z" },
    { id: "4", syncType: "Expenses", status: "failed", count: 0, timestamp: "2024-10-26T08:00:00Z", error: "Connection timeout" },
  ];

  const syncStats = {
    totalSynced: 211,
    lastSync: "2024-10-26T10:30:00Z",
    pendingItems: 3,
    failedItems: 1,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "synced":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-[#F97316]" />;
      default:
        return null;
    }
  };

  const summaryCards = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-total-synced">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">{t('accounting.totalSynced', 'Total Synced')}</p>
              <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white">{syncStats.totalSynced}</h3>
              <p className="text-sm text-[#64748B] mt-1">{t('accounting.records', 'Records')}</p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-last-sync">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">{t('accounting.lastSync', 'Last Sync')}</p>
              <h3 className="text-xl font-bold mt-2 text-[#0B1F3B] dark:text-white">
                {new Date(syncStats.lastSync).toLocaleTimeString()}
              </h3>
              <p className="text-sm text-green-600 mt-1">{t('accounting.successfullyCompleted', 'Successfully completed')}</p>
            </div>
            <RefreshCw className="h-12 w-12 text-[#0A5ED7]" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-pending">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">{t('common.pending', 'Pending')}</p>
              <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white">{syncStats.pendingItems}</h3>
              <p className="text-sm text-[#F97316] mt-1">{t('accounting.awaitingSync', 'Awaiting sync')}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-[#F97316]" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-failed">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">{t('common.failed', 'Failed')}</p>
              <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white">{syncStats.failedItems}</h3>
              <p className="text-sm text-red-600 mt-1">{t('accounting.needsAttention', 'Needs attention')}</p>
            </div>
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const tabs: TabConfig[] = [
    {
      id: "connections",
      label: t('accounting.connections', 'Connections'),
      icon: Link2,
      content: (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('accounting.connectedAccounts', 'Connected Accounts')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockConnections.length > 0 ? (
              mockConnections.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg"
                  data-testid={`connection-${connection.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Link2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#0B1F3B] dark:text-white capitalize">
                        {connection.provider}
                      </h3>
                      <p className="text-sm text-[#64748B]">{connection.companyName}</p>
                      <p className="text-xs text-[#64748B] mt-1">
                        {t('accounting.lastSynced', 'Last synced')}: {new Date(connection.lastSyncAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={connection.isActive ? "default" : "secondary"} className={connection.isActive ? "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" : ""}>
                      {connection.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => syncMutation.mutate("all")}
                      className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                      data-testid="button-sync-now"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {t('accounting.syncNow', 'Sync Now')}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-[#64748B] mb-4">{t('accounting.noConnectionsYet', 'No connections yet')}</p>
                <Button
                  onClick={() => connectMutation.mutate(selectedProvider)}
                  className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
                  data-testid="button-connect"
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  {t('accounting.connect', 'Connect')} {selectedProvider}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ),
    },
    {
      id: "sync",
      label: t('accounting.syncHistory', 'Sync History'),
      icon: RefreshCw,
      content: (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('accounting.syncHistory', 'Sync History')}</CardTitle>
              <Button size="sm" onClick={() => syncMutation.mutate("all")} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" data-testid="button-refresh-history">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('common.refresh', 'Refresh')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockSyncHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg"
                  data-testid={`sync-${item.id}`}
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(item.status)}
                    <div>
                      <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{t(`accounting.syncType.${item.syncType.toLowerCase()}`, item.syncType)}</h3>
                      <p className="text-sm text-[#64748B]">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                      {item.error && (
                        <p className="text-sm text-red-600 mt-1">{t('common.error', 'Error')}: {item.error}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#0B1F3B] dark:text-white">{item.count} {t('accounting.records', 'records')}</p>
                    <Badge variant={item.status === "synced" ? "default" : "destructive"} className={item.status === "synced" ? "bg-green-600 text-white mt-1" : "mt-1"}>
                      {t(`accounting.status.${item.status}`, item.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: "settings",
      label: t('common.settings', 'Settings'),
      icon: Settings,
      content: (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('accounting.syncSettings', 'Sync Settings')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{t('accounting.autoSyncInvoices', 'Auto-Sync Invoices')}</h3>
                <p className="text-sm text-[#64748B]">{t('accounting.autoSyncInvoicesDesc', 'Automatically sync new invoices')}</p>
              </div>
              <Switch defaultChecked data-testid="switch-auto-sync-invoices" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{t('accounting.autoSyncPayments', 'Auto-Sync Payments')}</h3>
                <p className="text-sm text-[#64748B]">{t('accounting.autoSyncPaymentsDesc', 'Automatically sync payment records')}</p>
              </div>
              <Switch defaultChecked data-testid="switch-auto-sync-payments" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{t('accounting.autoSyncCustomers', 'Auto-Sync Customers')}</h3>
                <p className="text-sm text-[#64748B]">{t('accounting.autoSyncCustomersDesc', 'Keep customer data in sync')}</p>
              </div>
              <Switch data-testid="switch-auto-sync-customers" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{t('accounting.autoSyncExpenses', 'Auto-Sync Expenses')}</h3>
                <p className="text-sm text-[#64748B]">{t('accounting.autoSyncExpensesDesc', 'Sync vendor bills and expenses')}</p>
              </div>
              <Switch data-testid="switch-auto-sync-expenses" />
            </div>
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <TabsPageLayout
      title={t('accounting.title', '💼 Accounting Integration')}
      description={t('accounting.description', 'Sync with QuickBooks and Xero for automated bookkeeping')}
      icon={DollarSign}
      headerContent={
        <>
          <div className="flex justify-end mb-6">
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger className="w-48 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <SelectItem value="quickbooks">{t('accounting.providers.quickbooks', 'QuickBooks')}</SelectItem>
                <SelectItem value="xero">{t('accounting.providers.xero', 'Xero')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {summaryCards}
        </>
      }
      tabs={tabs}
      defaultTab="connections"
    />
  );
}
