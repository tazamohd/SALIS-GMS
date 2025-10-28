import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Package, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";

export default function PartsAutoReorder() {
  const { toast } = useToast();

  // Fetch auto-reorder rules from backend
  const { data: rules = [] } = useQuery<any[]>({
    queryKey: ['/api/auto-reorder/rules'],
  });

  // Fetch reorder history from backend
  const { data: history = [] } = useQuery<any[]>({
    queryKey: ['/api/auto-reorder/history'],
  });

  // Check and trigger reorders mutation
  const checkReordersMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/auto-reorder/check', {});
    },
    onSuccess: (data: any) => {
      toast({
        title: "Auto-Reorder Check Complete",
        description: `${data.triggered || 0} orders triggered`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auto-reorder/rules'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auto-reorder/history'] });
    },
    onError: (error: any) => {
      toast({
        title: "Check Failed",
        description: error.message || "Failed to check reorders",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white">
            📦 Parts Auto-Reordering
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Automated inventory replenishment</p>
        </div>
        <Button 
          onClick={() => checkReordersMutation.mutate()}
          disabled={checkReordersMutation.isPending}
          data-testid="button-check-reorders"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {checkReordersMutation.isPending ? "Checking..." : "Check Reorders"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Rules</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-active-rules">{rules.length}</h3>
              </div>
              <Package className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Auto-Ordered</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-auto-ordered">{history.length}</h3>
              </div>
              <RefreshCw className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Low Stock</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-low-stock">
                  {rules.filter((r: any) => r.isActive).length}
                </h3>
              </div>
              <AlertTriangle className="h-12 w-12 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-this-month">
                  {history.filter((h: any) => new Date(h.triggeredAt).getMonth() === new Date().getMonth()).length}
                </h3>
              </div>
              <CheckCircle className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Reorder Rules</CardTitle>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No reorder rules defined</div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule: any) => (
                <div key={rule.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg" data-testid={`rule-${rule.id}`}>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Part ID: {rule.partId}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Min: {rule.minQuantity} / Reorder: {rule.reorderQuantity}</p>
                  </div>
                  <Badge variant={rule.isActive ? "default" : "secondary"}>{rule.isActive ? "Active" : "Inactive"}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Recent Auto-Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No auto-orders triggered yet. Click "Check Reorders" to evaluate stock levels.
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded" data-testid={`order-${order.id}`}>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{order.partName || `Part #${order.partNumber}`}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {order.quantityOrdered} from {order.supplier || 'Default Supplier'}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={order.orderStatus === "received" ? "default" : "secondary"} data-testid={`badge-status-${order.id}`}>
                      {order.orderStatus}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{new Date(order.triggeredAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
