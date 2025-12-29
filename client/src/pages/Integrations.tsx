import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Mail, 
  DollarSign, 
  Activity,
  Settings,
  RefreshCw,
  Clock,
  AlertCircle,
  Link as LinkIcon
} from "lucide-react";
import { TabsPageLayout, TabConfig } from "@/components/layouts";

export default function Integrations() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const { data: connections = [], isLoading: connectionsLoading } = useQuery({
    queryKey: ['/api/integrations/connections'],
  });

  const { data: syncLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['/api/integrations/sync-logs'],
  });

  const { data: accountingTransactions = [], isLoading: accountingLoading } = useQuery({
    queryKey: ['/api/integrations/accounting/transactions'],
  });

  const toggleConnectionMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return await apiRequest(`/api/integrations/connections/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations/connections'] });
      toast({
        title: t('common.success', 'Success'),
        description: t('integrations.statusUpdated', 'Integration status updated successfully'),
      });
    },
    onError: () => {
      toast({
        title: t('common.error', 'Error'),
        description: t('integrations.statusUpdateFailed', 'Failed to update integration status'),
        variant: "destructive",
      });
    },
  });

  const syncAccountingMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/integrations/accounting/sync', {
        method: 'POST',
      });
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations/sync-logs'] });
      if (result.success) {
        toast({
          title: t('common.success', 'Success'),
          description: t('integrations.accountingSynced', 'Accounting data synced successfully'),
        });
      } else {
        toast({
          title: t('common.info', 'Information'),
          description: result.message || t('integrations.accountingNotConfigured', 'Accounting integration not configured'),
        });
      }
    },
    onError: () => {
      toast({
        title: t('common.error', 'Error'),
        description: t('integrations.accountingSyncFailed', 'Failed to sync accounting data'),
        variant: "destructive",
      });
    },
  });

  const obdScanMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/integrations/obd/scan', {
        method: 'POST',
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: t('common.success', 'Success'),
          description: t('integrations.obdScanCompleted', 'OBD diagnostic scan completed'),
        });
      } else {
        toast({
          title: t('common.info', 'Information'),
          description: result.message || t('integrations.obdNotConfigured', 'OBD-II diagnostics not configured'),
        });
      }
    },
    onError: () => {
      toast({
        title: t('common.error', 'Error'),
        description: t('integrations.obdScanFailed', 'Failed to perform OBD scan'),
        variant: "destructive",
      });
    },
  });

  const integrationCards = [
    {
      id: 'google-calendar',
      name: t('integrations.googleCalendar', 'Google Calendar'),
      description: t('integrations.googleCalendarDesc', 'Sync appointments to Google Calendar automatically'),
      icon: Calendar,
      color: 'text-gray-700 dark:text-gray-300',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      status: 'active',
      type: t('integrations.connected', 'Connected')
    },
    {
      id: 'gmail',
      name: t('integrations.gmail', 'Gmail'),
      description: t('integrations.gmailDesc', 'Send automated email notifications via Gmail'),
      icon: Mail,
      color: 'text-gray-800 dark:text-gray-200',
      bgColor: 'bg-gray-200 dark:bg-gray-700',
      status: 'active',
      type: t('integrations.connected', 'Connected')
    },
    {
      id: 'accounting',
      name: t('integrations.accountingSoftware', 'Accounting Software'),
      description: t('integrations.accountingSoftwareDesc', 'Sync invoices and transactions with QuickBooks or Xero'),
      icon: DollarSign,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      status: 'inactive',
      type: t('integrations.available', 'Available')
    },
    {
      id: 'obd',
      name: t('integrations.obdDiagnostics', 'OBD-II Diagnostics'),
      description: t('integrations.obdDiagnosticsDesc', 'Connect OBD-II adapters for vehicle diagnostics'),
      icon: Activity,
      color: 'text-gray-700 dark:text-gray-300',
      bgColor: 'bg-gray-200 dark:bg-gray-700',
      status: 'inactive',
      type: t('integrations.available', 'Available')
    },
  ];

  const tabs: TabConfig[] = [
    {
      id: 'overview',
      label: t('integrations.overview', 'Overview'),
      icon: LinkIcon,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrationCards.map((integration) => {
              const Icon = integration.icon;
              const isActive = integration.status === 'active';

              return (
                <Card key={integration.id} data-testid={`card-integration-${integration.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${integration.bgColor}`}>
                          <Icon className={`h-6 w-6 ${integration.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-black dark:text-white">{integration.name}</CardTitle>
                          <CardDescription className="text-gray-900 dark:text-white/60">{integration.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={isActive ? "default" : "secondary"} data-testid={`badge-status-${integration.id}`}>
                        {integration.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isActive ? (
                          <CheckCircle2 className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-900 dark:text-white/50" />
                        )}
                        <span className={`text-sm ${isActive ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white/60'}`}>
                          {isActive ? t('common.active', 'Active') : t('integrations.notConfigured', 'Not Configured')}
                        </span>
                      </div>
                      {integration.id === 'accounting' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => syncAccountingMutation.mutate()}
                          disabled={syncAccountingMutation.isPending}
                          data-testid="button-sync-accounting"
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${syncAccountingMutation.isPending ? 'animate-spin' : ''}`} />
                          {t('integrations.sync', 'Sync')}
                        </Button>
                      )}
                      {integration.id === 'obd' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => obdScanMutation.mutate()}
                          disabled={obdScanMutation.isPending}
                          data-testid="button-scan-obd"
                        >
                          <Activity className={`h-4 w-4 mr-2 ${obdScanMutation.isPending ? 'animate-spin' : ''}`} />
                          {t('integrations.scan', 'Scan')}
                        </Button>
                      )}
                      {isActive && (
                        <Button
                          size="sm"
                          variant="ghost"
                          data-testid={`button-settings-${integration.id}`}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">{t('integrations.integrationStatus', 'Integration Status')}</CardTitle>
              <CardDescription className="text-gray-900 dark:text-white/60">{t('integrations.recentSyncActivity', 'Recent sync activity and status')}</CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="text-center py-8 text-gray-900 dark:text-white/60">{t('integrations.loadingSyncLogs', 'Loading sync logs...')}</div>
              ) : syncLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-900 dark:text-white/60">{t('integrations.noSyncActivity', 'No sync activity yet')}</div>
              ) : (
                <div className="space-y-3">
                  {syncLogs.slice(0, 5).map((log: any, index: number) => (
                    <div 
                      key={log.id || index} 
                      className="flex items-center justify-between p-3 bg-gray-100 dark:bg-salis-black rounded-lg"
                      data-testid={`log-entry-${index}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          log.status === 'success' ? 'bg-gray-200 dark:bg-gray-700' : 
                          log.status === 'failed' ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-100 dark:bg-salis-gray-dark'
                        }`}>
                          {log.status === 'success' ? (
                            <CheckCircle2 className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                          ) : log.status === 'failed' ? (
                            <AlertCircle className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-black dark:text-white">
                            {log.syncType?.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </p>
                          <p className="text-xs text-gray-900 dark:text-white/60">
                            {log.recordsProcessed} {t('integrations.records', 'record(s)')} • {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                        {log.status === 'success' ? t('common.success', 'Success') : t('common.failed', 'Failed')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: 'sync-logs',
      label: t('integrations.syncLogs', 'Sync Logs'),
      icon: Clock,
      content: (
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
          <CardHeader>
            <CardTitle className="text-black dark:text-white">{t('integrations.syncHistory', 'Sync History')}</CardTitle>
            <CardDescription className="text-gray-900 dark:text-white/60">{t('integrations.detailedSyncHistory', 'Detailed history of all integration syncs')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              {logsLoading ? (
                <div className="text-center py-8 text-gray-900 dark:text-white/60">{t('common.loading', 'Loading...')}</div>
              ) : syncLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-900 dark:text-white/60">{t('integrations.noSyncLogs', 'No sync logs available')}</div>
              ) : (
                <div className="space-y-3">
                  {syncLogs.map((log: any, index: number) => (
                    <div 
                      key={log.id || index} 
                      className="p-4 border border-gray-200 dark:border-salis-gray-dark rounded-lg"
                      data-testid={`sync-log-${index}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-black dark:text-white">
                              {log.syncType?.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </h4>
                            <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                              {log.status === 'success' ? t('common.success', 'Success') : t('common.failed', 'Failed')}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-gray-900 dark:text-white/70">
                            <p>{t('integrations.recordsLabel', 'Records')}: {log.recordsProcessed}</p>
                            <p>{t('integrations.timeLabel', 'Time')}: {new Date(log.createdAt).toLocaleString()}</p>
                            {log.errorMessage && (
                              <p className="text-gray-700 dark:text-gray-300">{t('common.error', 'Error')}: {log.errorMessage}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      ),
    },
    {
      id: 'accounting',
      label: t('integrations.accounting', 'Accounting'),
      icon: DollarSign,
      content: (
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-black dark:text-white">{t('integrations.accountingTransactions', 'Accounting Transactions')}</CardTitle>
                <CardDescription className="text-gray-900 dark:text-white/60">{t('integrations.transactionsPendingSync', 'Transactions pending sync with accounting software')}</CardDescription>
              </div>
              <Button
                onClick={() => syncAccountingMutation.mutate()}
                disabled={syncAccountingMutation.isPending}
                data-testid="button-sync-all-accounting"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncAccountingMutation.isPending ? 'animate-spin' : ''}`} />
                {t('integrations.syncAll', 'Sync All')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              {accountingLoading ? (
                <div className="text-center py-8 text-gray-900 dark:text-white/60">{t('common.loading', 'Loading...')}</div>
              ) : accountingTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
                  <p className="text-gray-900 dark:text-white/60 mb-2">{t('integrations.noAccountingTransactions', 'No accounting transactions')}</p>
                  <p className="text-sm text-gray-900 dark:text-white/50">
                    {t('integrations.configureAccountingIntegration', 'Configure QuickBooks or Xero integration to sync transactions')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {accountingTransactions.map((transaction: any, index: number) => (
                    <div 
                      key={transaction.id || index} 
                      className="p-4 border border-gray-200 dark:border-salis-gray-dark rounded-lg"
                      data-testid={`transaction-${index}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-black dark:text-white">{transaction.transactionType}</h4>
                          <p className="text-sm text-gray-900 dark:text-white/70">
                            {new Date(transaction.transactionDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-black dark:text-white">
                            {transaction.currency} {transaction.amount}
                          </p>
                          <Badge variant={transaction.syncStatus === 'synced' ? 'default' : 'secondary'}>
                            {transaction.syncStatus === 'synced' ? t('integrations.synced', 'Synced') : t('common.pending', 'Pending')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <TabsPageLayout
      title={t('integrations.title', 'Integrations')}
      description={t('integrations.pageDescription', 'Connect and manage third-party services')}
      icon={LinkIcon}
      tabs={tabs}
      defaultTab="overview"
    />
  );
}
