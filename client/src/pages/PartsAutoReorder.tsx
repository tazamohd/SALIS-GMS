import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { StandardPageLayout } from "@/components/layouts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Package, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";

export default function PartsAutoReorder() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const { data: rules = [] } = useQuery<any[]>({
    queryKey: ['/api/auto-reorder/rules'],
  });

  const { data: history = [] } = useQuery<any[]>({
    queryKey: ['/api/auto-reorder/history'],
  });

  const checkReordersMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/auto-reorder/check", "POST", {});
    },
    onSuccess: (data: any) => {
      toast({ title: t('partsAutoReorder.checkComplete', 'Auto-Reorder Check Complete'), description: `${data.triggered || 0} ${t('partsAutoReorder.ordersTriggered', 'orders triggered')}` });
      queryClient.invalidateQueries({ queryKey: ['/api/auto-reorder/rules'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auto-reorder/history'] });
    },
    onError: (error: any) => {
      toast({ title: t('partsAutoReorder.checkFailed', 'Check Failed'), description: error.message || t('partsAutoReorder.failedToCheck', 'Failed to check reorders'), variant: "destructive" });
    },
  });

  return (
    <StandardPageLayout
      title={t('partsAutoReorder.title', 'Parts Auto-Reordering')}
      description={t('partsAutoReorder.description', 'Automated inventory replenishment')}
      icon={Package}
      actions={[
        {
          label: checkReordersMutation.isPending ? t('partsAutoReorder.checking', 'Checking...') : t('partsAutoReorder.checkReorders', 'Check Reorders'),
          icon: RefreshCw,
          onClick: () => checkReordersMutation.mutate(),
          variant: "default",
        },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('partsAutoReorder.activeRules', 'Active Rules')}</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('partsAutoReorder.autoOrdered', 'Auto-Ordered')}</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-auto-ordered">{history.length}</h3>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('partsAutoReorder.lowStockItems', 'Low Stock Items')}</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-low-stock">0</h3>
              </div>
              <AlertTriangle className="h-12 w-12 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('partsAutoReorder.totalSaved', 'Total Saved')}</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-total-saved">$0</h3>
              </div>
              <RefreshCw className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800 mt-6">
        <CardContent className="p-6">
          <div className="text-center py-12 text-gray-500">
            {t('partsAutoReorder.noRulesConfigured', 'No auto-reorder rules configured. Create rules to automate inventory replenishment.')}
          </div>
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
}
