import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { DashboardPage } from "@/components/layouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Leaf, Droplet, Battery, Recycle } from "lucide-react";

export default function EnvironmentalCompliance() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const { data: records = [], isLoading: recordsLoading } = useQuery<any[]>({
    queryKey: ['/api/compliance/environmental'],
  });

  const { data: analytics = [] } = useQuery<any[]>({
    queryKey: ['/api/compliance/environmental/analytics'],
  });

  const totalRecords = records.length || 0;
  const recyclingRecords = records.filter((r: any) => r.complianceType === 'recycling').length;
  const compliantRecords = records.filter((r: any) => r.certificationNumber || r.disposalCompany).length;
  
  const stats = {
    totalDisposals: totalRecords,
    complianceRate: totalRecords > 0 ? Math.round((compliantRecords / totalRecords) * 100) : 100,
    thisMonthCost: analytics.reduce((sum: number, item: any) => sum + (Number(item.totalCost) || 0), 0),
    recyclingRate: totalRecords > 0 ? Math.round((recyclingRecords / totalRecords) * 100) : 0,
  };

  const createRecordMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/compliance/environmental', data);
    },
    onSuccess: () => {
      toast({
        title: t('environmental.recordCreated', 'Record Created'),
        description: t('environmental.recordCreatedSuccess', 'Environmental compliance record created successfully'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/compliance/environmental'] });
      queryClient.invalidateQueries({ queryKey: ['/api/compliance/environmental/analytics'] });
    },
    onError: (error: any) => {
      toast({
        title: t('environmental.creationFailed', 'Creation Failed'),
        description: error.message || t('environmental.failedToCreateRecord', 'Failed to create compliance record'),
        variant: "destructive",
      });
    },
  });

  const metrics = [
    { label: t('environmental.totalThisMonth', 'Total This Month'), value: stats.totalDisposals, icon: Leaf, color: "text-green-600" },
    { label: t('environmental.complianceRate', 'Compliance Rate'), value: `${stats.complianceRate}%`, icon: Droplet, color: "text-[#0A5ED7]" },
    { label: t('environmental.disposalCosts', 'Disposal Costs'), value: `$${Math.round(stats.thisMonthCost)}`, icon: Battery, color: "text-[#F97316]" },
    { label: t('environmental.recyclingRate', 'Recycling Rate'), value: `${stats.recyclingRate}%`, icon: Recycle, color: "text-purple-600" },
  ];

  return (
    <DashboardPage
      title={t('environmental.environmentalCompliance', 'Environmental Compliance')}
      description={t('environmental.description', 'Track waste disposal and environmental compliance')}
      icon={Leaf}
      metrics={metrics}
    >
      <Button 
        onClick={() => {
          createRecordMutation.mutate({
            complianceType: 'waste_disposal',
            recordDate: new Date().toISOString(),
            wasteType: 'Used Oil',
            quantity: 55,
            unit: 'gallons',
            disposalMethod: 'recycling',
            disposalCompany: 'EcoWaste Inc',
            certificationNumber: 'CERT-2024-001',
            cost: 125,
          });
        }}
        disabled={createRecordMutation.isPending}
        data-testid="button-add-record"
        className="mb-6 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white"
      >
        {createRecordMutation.isPending ? t('environmental.adding', 'Adding...') : t('environmental.addDisposalRecord', 'Add Disposal Record')}
      </Button>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('environmental.recentDisposalRecords', 'Recent Disposal Records')}</CardTitle>
        </CardHeader>
        <CardContent>
          {recordsLoading ? (
            <div className="text-center py-8 text-[#64748B]">{t('environmental.loadingRecords', 'Loading records...')}</div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-[#64748B]">{t('environmental.noDisposalRecordsFound', 'No disposal records found')}</div>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]" data-testid={`record-${record.id}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{record.wasteType}</h3>
                      <Badge>{record.complianceType?.replace("_", " ")}</Badge>
                    </div>
                    <p className="text-sm text-[#64748B]">
                      {record.quantity} {record.unit} • {record.disposalCompany}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#0B1F3B] dark:text-white">${record.cost || 0}</p>
                    <p className="text-sm text-[#64748B]">{new Date(record.recordDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardPage>
  );
}
