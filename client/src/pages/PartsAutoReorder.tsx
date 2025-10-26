import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";

export default function PartsAutoReorder() {
  const mockRules = [
    { id: "1", partName: "Oil Filter", partNumber: "OF-123", currentStock: 15, reorderPoint: 20, reorderQuantity: 50, status: "triggered", lastTriggered: "2024-10-26T08:00:00Z" },
    { id: "2", partName: "Brake Pads", partNumber: "BP-456", currentStock: 45, reorderPoint: 30, reorderQuantity: 100, status: "active", lastTriggered: null },
    { id: "3", partName: "Air Filter", partNumber: "AF-789", currentStock: 8, reorderPoint: 15, reorderQuantity: 40, status: "triggered", lastTriggered: "2024-10-25T14:00:00Z" },
  ];

  const mockHistory = [
    { id: "1", partName: "Oil Filter", quantity: 50, supplier: "AutoParts Plus", status: "ordered", triggeredAt: "2024-10-26T08:00:00Z" },
    { id: "2", partName: "Transmission Fluid", quantity: 30, supplier: "Parts Warehouse", status: "received", triggeredAt: "2024-10-24T10:00:00Z" },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white">
            📦 Parts Auto-Reordering
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Automated inventory replenishment</p>
        </div>
        <Button data-testid="button-create-rule">Add Rule</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active Rules", value: "15", icon: Package, color: "blue" },
          { label: "Auto-Ordered", value: "8", icon: RefreshCw, color: "green" },
          { label: "Low Stock", value: "3", icon: AlertTriangle, color: "yellow" },
          { label: "This Month", value: "$2,450", icon: CheckCircle, color: "purple" },
        ].map((stat, i) => (
          <Card key={i} className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stat.value}</h3>
                </div>
                <stat.icon className={`h-12 w-12 text-${stat.color}-600`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Reorder Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{rule.partName}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">PN: {rule.partNumber}</p>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Stock: <span className={rule.currentStock < rule.reorderPoint ? "text-red-600 font-semibold" : ""}>{rule.currentStock}</span> / Reorder at: {rule.reorderPoint}
                </div>
                <Badge variant={rule.status === "triggered" ? "destructive" : "secondary"}>{rule.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Recent Auto-Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockHistory.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{order.partName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {order.quantity} from {order.supplier}</p>
                </div>
                <div className="text-right">
                  <Badge variant={order.status === "received" ? "default" : "secondary"}>{order.status}</Badge>
                  <p className="text-xs text-gray-500 mt-1">{new Date(order.triggeredAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
