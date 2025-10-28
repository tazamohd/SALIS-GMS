import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MapPin, Truck, Clock, TrendingUp } from "lucide-react";

export default function RoutingOptimizer() {
  const { toast } = useToast();

  // Fetch routes from backend
  const { data: routes = [] } = useQuery<any[]>({
    queryKey: ['/api/routing/routes'],
  });

  // Create route optimization mutation
  const optimizeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/routing/optimize', {
        optimizationDate: new Date().toISOString(),
        stops: [],
        routeType: 'parts_transfer',
      });
    },
    onSuccess: () => {
      toast({
        title: "Route Optimized",
        description: "Route optimization completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/routing/routes'] });
    },
    onError: (error: any) => {
      toast({
        title: "Optimization Failed",
        description: error.message || "Failed to optimize route",
        variant: "destructive",
      });
    },
  });

  // Calculate statistics from routes
  const stats = {
    totalRoutes: routes.length,
    activeRoutes: routes.filter((r: any) => r.status === 'in_progress').length,
    distanceSaved: routes.reduce((acc: number, r: any) => acc + (r.distanceSaved || 0), 0),
    timeSaved: routes.reduce((acc: number, r: any) => acc + (r.timeSaved || 0), 0),
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white">
            🗺️ Multi-Location Routing
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Optimize delivery and service routes</p>
        </div>
        <Button 
          onClick={() => optimizeMutation.mutate()}
          disabled={optimizeMutation.isPending}
          data-testid="button-create-route"
        >
          {optimizeMutation.isPending ? "Optimizing..." : "Create Route"}
        </Button>
      </div>

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
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Today</p>
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
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-distance-saved">{stats.distanceSaved.toFixed(1)}mi</h3>
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
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-time-saved">{stats.timeSaved}min</h3>
              </div>
              <Clock className="h-12 w-12 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Today's Routes</CardTitle>
        </CardHeader>
        <CardContent>
          {routes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No routes available. Click "Create Route" to optimize a new route.
            </div>
          ) : (
            <div className="space-y-3">
              {routes.map((route: any) => (
                <div key={route.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg" data-testid={`route-${route.id}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge>{route.type?.replace("_", " ") || route.routeType?.replace("_", " ") || "route"}</Badge>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{route.driver || "Unassigned"}</h3>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>{route.stops?.length || 0} stops</span>
                      <span>•</span>
                      <span>{route.distance || 0} miles</span>
                      <span>•</span>
                      <span>{route.duration || 0} min</span>
                    </div>
                  </div>
                  <Badge variant={route.status === "completed" ? "default" : route.status === "in_progress" ? "secondary" : "outline"}>
                    {route.status || "planned"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
