import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardPage } from "@/components/layouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Leaf, Droplet, Battery, Recycle } from "lucide-react";

export default function EnvironmentalCompliance() {
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
        title: "Record Created",
        description: "Environmental compliance record created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/compliance/environmental'] });
      queryClient.invalidateQueries({ queryKey: ['/api/compliance/environmental/analytics'] });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create compliance record",
        variant: "destructive",
      });
    },
  });

  const metrics = [
    { label: "Total This Month", value: stats.totalDisposals, icon: Leaf, color: "text-green-600" },
    { label: "Compliance Rate", value: `${stats.complianceRate}%`, icon: Droplet, color: "text-blue-600" },
    { label: "Disposal Costs", value: `$${Math.round(stats.thisMonthCost)}`, icon: Battery, color: "text-yellow-600" },
    { label: "Recycling Rate", value: `${stats.recyclingRate}%`, icon: Recycle, color: "text-purple-600" },
  ];

  return (
    <DashboardPage
      title="🌱 Environmental Compliance"
      description="Track waste disposal and environmental compliance"
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
        className="mb-6"
      >
        {createRecordMutation.isPending ? "Adding..." : "Add Disposal Record"}
      </Button>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Recent Disposal Records</CardTitle>
        </CardHeader>
        <CardContent>
          {recordsLoading ? (
            <div className="text-center py-8 text-gray-500">Loading records...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No disposal records found</div>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg" data-testid={`record-${record.id}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{record.wasteType}</h3>
                      <Badge>{record.complianceType?.replace("_", " ")}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {record.quantity} {record.unit} • {record.disposalCompany}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">${record.cost || 0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(record.recordDate).toLocaleDateString()}</p>
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
