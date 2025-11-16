import { useQuery, useMutation } from "@tanstack/react-query";
import { StandardPageLayout } from "@/components/layouts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MapPin, Truck, Clock, TrendingUp } from "lucide-react";

export default function RoutingOptimizer() {
  const { toast } = useToast();

  const { data: routes = [] } = useQuery<any[]>({
    queryKey: ['/api/routing/routes'],
  });

  const optimizeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/routing/optimize", "POST", {
        optimizationDate: new Date().toISOString(),
        stops: [],
        routeType: 'parts_transfer',
      });
    },
    onSuccess: () => {
      toast({ title: "Route Optimized", description: "Route optimization completed successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/routing/routes'] });
    },
    onError: (error: any) => {
      toast({ title: "Optimization Failed", description: error.message || "Failed to optimize route", variant: "destructive" });
    },
  });

  const stats = {
    totalRoutes: routes.length,
    activeRoutes: routes.filter((r: any) => r.status === 'in_progress').length,
    distanceSaved: routes.reduce((acc: number, r: any) => acc + (r.distanceSaved || 0), 0),
    timeSaved: routes.reduce((acc: number, r: any) => acc + (r.timeSaved || 0), 0),
  };

  return (
    <StandardPageLayout
      title="Multi-Location Routing"
      description="Optimize delivery and service routes"
      icon={MapPin}
      actions={[
        {
          label: optimizeMutation.isPending ? "Optimizing..." : "Create Route",
          onClick: () => optimizeMutation.mutate(),
          variant: "default",
        },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Routes</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-total-routes">{stats.totalRoutes}</h3>
              </div>
              <Truck className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Routes</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-active-routes">{stats.activeRoutes}</h3>
              </div>
              <MapPin className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Distance Saved</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-distance-saved">{stats.distanceSaved} km</h3>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Time Saved</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-time-saved">{stats.timeSaved} min</h3>
              </div>
              <Clock className="h-12 w-12 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800 mt-6">
        <CardContent className="p-6">
          <div className="text-center py-12 text-gray-500">
            No routes available. Click "Create Route" to optimize a new delivery route.
          </div>
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
}
