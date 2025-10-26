import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Link2,
  TrendingUp,
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

export default function AccountingIntegration() {
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
      toast({ title: "Connection initiated", description: "Please complete the authorization process." });
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/connections"] });
    },
  });

  const syncMutation = useMutation({
    mutationFn: async (syncType: string) => {
      return await apiRequest("/api/accounting/sync", "POST", { syncType });
    },
    onSuccess: () => {
      toast({ title: "Sync started", description: "Data is being synchronized." });
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/sync-history"] });
    },
  });

  // Mock data
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
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white">
            💼 Accounting Integration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Sync with QuickBooks and Xero for automated bookkeeping
          </p>
        </div>
        <Select value={selectedProvider} onValueChange={setSelectedProvider}>
          <SelectTrigger className="w-48" data-testid="select-provider">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="quickbooks">QuickBooks</SelectItem>
            <SelectItem value="xero">Xero</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-total-synced">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Synced</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{syncStats.totalSynced}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Records</p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-last-sync">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last Sync</p>
                <h3 className="text-xl font-bold mt-2 text-gray-900 dark:text-white">
                  {new Date(syncStats.lastSync).toLocaleTimeString()}
                </h3>
                <p className="text-sm text-green-600 mt-1">Successfully completed</p>
              </div>
              <RefreshCw className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-pending">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{syncStats.pendingItems}</h3>
                <p className="text-sm text-yellow-600 mt-1">Awaiting sync</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-failed">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{syncStats.failedItems}</h3>
                <p className="text-sm text-red-600 mt-1">Needs attention</p>
              </div>
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList className="bg-gray-100 dark:bg-salis-gray-dark">
          <TabsTrigger value="connections" data-testid="tab-connections">Connections</TabsTrigger>
          <TabsTrigger value="sync" data-testid="tab-sync">Sync History</TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="connections">
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockConnections.length > 0 ? (
                mockConnections.map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg"
                    data-testid={`connection-${connection.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <Link2 className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
                          {connection.provider}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{connection.companyName}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Last synced: {new Date(connection.lastSyncAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={connection.isActive ? "default" : "secondary"}>
                        {connection.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => syncMutation.mutate("all")}
                        data-testid="button-sync-now"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync Now
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No connections yet</p>
                  <Button
                    onClick={() => connectMutation.mutate(selectedProvider)}
                    data-testid="button-connect"
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Connect {selectedProvider}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync">
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sync History</CardTitle>
                <Button size="sm" onClick={() => syncMutation.mutate("all")} data-testid="button-refresh-history">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockSyncHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg"
                    data-testid={`sync-${item.id}`}
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(item.status)}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{item.syncType}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                        {item.error && (
                          <p className="text-sm text-red-600 mt-1">Error: {item.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">{item.count} records</p>
                      <Badge variant={item.status === "synced" ? "default" : "destructive"} className="mt-1">
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Sync Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Auto-Sync Invoices</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Automatically sync new invoices</p>
                </div>
                <Switch defaultChecked data-testid="switch-auto-sync-invoices" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Auto-Sync Payments</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Automatically sync payment records</p>
                </div>
                <Switch defaultChecked data-testid="switch-auto-sync-payments" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Auto-Sync Customers</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Keep customer data in sync</p>
                </div>
                <Switch data-testid="switch-auto-sync-customers" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Auto-Sync Expenses</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sync vendor bills and expenses</p>
                </div>
                <Switch data-testid="switch-auto-sync-expenses" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
