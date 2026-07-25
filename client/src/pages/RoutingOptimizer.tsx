import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { StandardPageLayout } from "@/components/layouts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MapPin, Truck, Clock, TrendingUp } from "lucide-react";

export default function RoutingOptimizer() {
  const { t } = useTranslation();
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
      toast({ title: t('routing.routeOptimized', 'Route Optimized'), description: t('routing.optimizationCompleted', 'Route optimization completed successfully') });
      queryClient.invalidateQueries({ queryKey: ['/api/routing/routes'] });
    },
    onError: (error: any) => {
      toast({ title: t('routing.optimizationFailed', 'Optimization Failed'), description: error.message || t('routing.failedToOptimize', 'Failed to optimize route'), variant: "destructive" });
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
      title={t('routing.multiLocationRouting', 'Multi-Location Routing')}
      description={t('routing.optimizeDeliveryRoutes', 'Optimize delivery and service routes')}
      icon={MapPin}
      actions={[
        {
          label: optimizeMutation.isPending ? t('routing.optimizing', 'Optimizing...') : t('routing.createRoute', 'Create Route'),
          onClick: () => optimizeMutation.mutate(),
          variant: "default",
        },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('routing.totalRoutes', 'Total Routes')}</p>
                <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white" data-testid="text-total-routes">{stats.totalRoutes}</h3>
              </div>
              <Truck className="h-12 w-12 text-[#0A5ED7]" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('routing.activeRoutes', 'Active Routes')}</p>
                <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white" data-testid="text-active-routes">{stats.activeRoutes}</h3>
              </div>
              <MapPin className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('routing.distanceSaved', 'Distance Saved')}</p>
                <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white" data-testid="text-distance-saved">{stats.distanceSaved} {t('common.km', 'km')}</h3>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('routing.timeSaved', 'Time Saved')}</p>
                <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white" data-testid="text-time-saved">{stats.timeSaved} {t('common.min', 'min')}</h3>
              </div>
              <Clock className="h-12 w-12 text-[#F97316]" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] mt-6">
        <CardContent className="p-6">
          <div className="text-center py-12 text-[#64748B]">
            {t('routing.noRoutesAvailable', 'No routes available. Click "Create Route" to optimize a new delivery route.')}
          </div>
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
}
