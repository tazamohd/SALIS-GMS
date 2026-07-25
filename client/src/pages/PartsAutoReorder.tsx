import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { StandardPageLayout } from "@/components/layouts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Package, RefreshCw, AlertTriangle, CheckCircle, DollarSign } from "lucide-react";

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
        <Card className="relative overflow-hidden bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] border-0 text-white">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">{t('partsAutoReorder.activeRules', 'Active Rules')}</p>
                <h3 className="text-2xl font-bold mt-2 text-white" data-testid="text-active-rules">{rules.length}</h3>
              </div>
              <Package className="h-12 w-12 text-white/80" />
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('partsAutoReorder.autoOrdered', 'Auto-Ordered')}</p>
                <h3 className="text-2xl font-bold mt-2 text-green-600 dark:text-green-400" data-testid="text-auto-ordered">{history.length}</h3>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#F97316]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('partsAutoReorder.lowStockItems', 'Low Stock Items')}</p>
                <h3 className="text-2xl font-bold mt-2 text-[#F97316]" data-testid="text-low-stock">0</h3>
              </div>
              <AlertTriangle className="h-12 w-12 text-[#F97316]" />
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('partsAutoReorder.totalSaved', 'Total Saved')}</p>
                <h3 className="text-2xl font-bold mt-2 text-purple-600 dark:text-purple-400" data-testid="text-total-saved">$0</h3>
              </div>
              <DollarSign className="h-12 w-12 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] mt-6">
        <CardContent className="p-6">
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] rounded-full flex items-center justify-center">
              <Package className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-[#0B1F3B] dark:text-white mb-2">{t('partsAutoReorder.noRulesTitle', 'No Auto-Reorder Rules')}</h3>
            <p className="text-[#64748B] mb-4">
              {t('partsAutoReorder.noRulesConfigured', 'No auto-reorder rules configured. Create rules to automate inventory replenishment.')}
            </p>
            <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white" data-testid="button-create-rule">
              {t('partsAutoReorder.createRule', 'Create Reorder Rule')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
}
