import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { TabsPageLayout, type TabConfig } from "@/components/layouts";
import { DashboardPage } from "@/components/layouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Award, AlertCircle, CheckCircle, TrendingUp, FileText, ClipboardCheck } from "lucide-react";

export default function ISOQualityManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("ncs");

  const { data: nonConformances = [], isLoading: ncsLoading } = useQuery<any[]>({
    queryKey: ['/api/quality/non-conformances'],
  });

  const { data: checklists = [], isLoading: checklistsLoading } = useQuery<any[]>({
    queryKey: ['/api/quality/checklists'],
  });

  const stats = {
    totalNCs: nonConformances.length,
    openNCs: nonConformances.filter((nc: any) => nc.status !== 'resolved' && nc.status !== 'closed').length,
    closedThisMonth: nonConformances.filter((nc: any) => {
      const detectedDate = new Date(nc.detectedDate);
      const now = new Date();
      return (nc.status === 'resolved' || nc.status === 'closed') &&
        detectedDate.getMonth() === now.getMonth() &&
        detectedDate.getFullYear() === now.getFullYear();
    }).length,
    complianceScore: nonConformances.length > 0 
      ? Math.round((nonConformances.filter((nc: any) => nc.status === 'resolved').length / nonConformances.length) * 100)
      : 100,
  };

  const createNCMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/quality/non-conformances', data);
    },
    onSuccess: () => {
      toast({
        title: t('quality.ncReported', 'Non-Conformance Reported'),
        description: t('quality.ncCreatedSuccess', 'Non-conformance created successfully'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/quality/non-conformances'] });
    },
    onError: (error: any) => {
      toast({
        title: t('quality.reportFailed', 'Report Failed'),
        description: error.message || t('quality.failedToReportNc', 'Failed to report non-conformance'),
        variant: "destructive",
      });
    },
  });

  const metrics = [
    {
      label: t('quality.totalNCs', 'Total NCs'),
      value: stats.totalNCs,
      icon: AlertCircle,
      color: 'text-yellow-600',
    },
    {
      label: t('quality.open', 'Open'),
      value: stats.openNCs,
      icon: AlertCircle,
      color: 'text-red-600',
    },
    {
      label: t('quality.closedThisMonth', 'Closed This Month'),
      value: stats.closedThisMonth,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      label: t('quality.complianceScore', 'Compliance Score'),
      value: `${stats.complianceScore}%`,
      icon: Award,
      color: 'text-blue-600',
    },
  ];

  const tabs: TabConfig[] = [
    {
      id: "ncs",
      label: t('quality.nonConformances', 'Non-Conformances'),
      icon: FileText,
      badge: nonConformances.length,
      content: (
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>{t('quality.recentNonConformances', 'Recent Non-Conformances')}</CardTitle>
          </CardHeader>
          <CardContent>
            {ncsLoading ? (
              <div className="text-center py-8 text-gray-500">{t('quality.loadingNonConformances', 'Loading non-conformances...')}</div>
            ) : nonConformances.length === 0 ? (
              <div className="text-center py-8 text-gray-500">{t('quality.noNonConformancesFound', 'No non-conformances found')}</div>
            ) : (
              <div className="space-y-3">
                {nonConformances.map((nc) => (
                  <div key={nc.id} className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg" data-testid={`nc-${nc.id}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{nc.ncNumber}</h3>
                        <Badge variant={nc.severity === "major" ? "destructive" : "secondary"}>{nc.severity}</Badge>
                        <Badge>{nc.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white mb-1">{nc.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('quality.detectedBy', 'Detected by')} {nc.detectedBy} • {new Date(nc.detectedDate).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={nc.status === "resolved" ? "default" : "secondary"}>{nc.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ),
    },
    {
      id: "checklists",
      label: t('quality.qualityChecklists', 'Quality Checklists'),
      icon: ClipboardCheck,
      badge: checklists.length,
      content: (
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>{t('quality.qualityChecklists', 'Quality Checklists')}</CardTitle>
          </CardHeader>
          <CardContent>
            {checklistsLoading ? (
              <div className="text-center py-8 text-gray-500">{t('quality.loadingChecklists', 'Loading checklists...')}</div>
            ) : checklists.length === 0 ? (
              <div className="text-center py-8 text-gray-500">{t('quality.noChecklistsFound', 'No quality checklists found')}</div>
            ) : (
              <div className="space-y-3">
                {checklists.map((checklist) => (
                  <div key={checklist.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg" data-testid={`checklist-${checklist.id}`}>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{checklist.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{checklist.itemCount || 0} {t('quality.items', 'items')} • {checklist.category?.replace("_", " ")}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">{checklist.completionRate || 0}%</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('quality.completion', 'Completion')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <DashboardPage
      title={t('quality.isoQualityManagement', 'ISO 9001 Quality Management')}
      description={t('quality.isoDescription', 'Quality control and non-conformance tracking')}
      icon={Award}
      metrics={metrics}
    >
      <div className="mb-4 flex justify-end">
        <Button 
          onClick={() => {
            createNCMutation.mutate({
              ncNumber: `NC-${Date.now()}`,
              title: 'New Non-Conformance',
              description: 'Sample non-conformance description',
              severity: 'minor',
              category: 'process',
              detectedBy: 'current-user',
              detectedDate: new Date().toISOString(),
            });
          }}
          disabled={createNCMutation.isPending}
          data-testid="button-report-nc"
        >
          {createNCMutation.isPending ? t('quality.reporting', 'Reporting...') : t('quality.reportNonConformance', 'Report Non-Conformance')}
        </Button>
      </div>

      <TabsPageLayout
        title=""
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </DashboardPage>
  );
}
