import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Shield, DollarSign, FileText, TrendingUp } from "lucide-react";
import { DashboardPage } from "@/components/layouts";

export default function InsuranceClaims() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const { data: claims = [], isLoading: claimsLoading } = useQuery<any[]>({
    queryKey: ['/api/insurance/claims'],
  });

  const { data: analytics } = useQuery<any>({
    queryKey: ['/api/insurance/claims/analytics'],
  });

  const stats = {
    totalClaims: claims.length,
    pendingReview: claims.filter((c: any) => c.status === 'pending').length,
    approvalRate: claims.length > 0 
      ? Math.round((claims.filter((c: any) => c.status === 'approved' || c.status === 'paid').length / claims.length) * 100)
      : 0,
    totalValue: claims.reduce((sum: number, c: any) => sum + (Number(c.claimAmount) || 0), 0),
  };

  const createClaimMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/insurance/claims', data);
    },
    onSuccess: () => {
      toast({
        title: t('payments.insurance.claimFiled', 'Claim Filed'),
        description: t('payments.insurance.claimCreatedSuccess', 'Insurance claim created successfully'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/insurance/claims'] });
      queryClient.invalidateQueries({ queryKey: ['/api/insurance/claims/analytics'] });
    },
    onError: (error: any) => {
      toast({
        title: t('payments.insurance.filingFailed', 'Filing Failed'),
        description: error.message || t('payments.insurance.claimCreateFailed', 'Failed to file insurance claim'),
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ claimId, status }: { claimId: number; status: string }) => {
      return apiRequest('PATCH', `/api/insurance/claims/${claimId}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: t('common.statusUpdated', 'Status Updated'),
        description: t('payments.insurance.claimStatusUpdated', 'Claim status updated successfully'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/insurance/claims'] });
      queryClient.invalidateQueries({ queryKey: ['/api/insurance/claims/analytics'] });
    },
    onError: (error: any) => {
      toast({
        title: t('common.updateFailed', 'Update Failed'),
        description: error.message || t('payments.insurance.statusUpdateFailed', 'Failed to update claim status'),
        variant: "destructive",
      });
    },
  });

  const metrics = [
    {
      label: t('payments.insurance.totalClaims', 'Total Claims'),
      value: stats.totalClaims,
      icon: FileText,
      color: "text-[#0A5ED7]",
    },
    {
      label: t('payments.insurance.pendingReview', 'Pending Review'),
      value: stats.pendingReview,
      icon: Shield,
      color: "text-[#F97316]",
    },
    {
      label: t('payments.insurance.approvalRate', 'Approval Rate'),
      value: `${stats.approvalRate}%`,
      icon: TrendingUp,
      color: "text-[#0BB3FF]",
    },
    {
      label: t('payments.insurance.totalValue', 'Total Value'),
      value: `$${Math.round(stats.totalValue).toLocaleString()}`,
      icon: DollarSign,
      color: "text-[#0A5ED7]",
    },
  ];

  return (
    <DashboardPage
      title={t('payments.insurance.title', 'Insurance Claims')}
      description={t('payments.insurance.description', 'Manage and track insurance claims')}
      icon={Shield}
      metrics={metrics}
    >
      <Button 
        onClick={() => {
          createClaimMutation.mutate({
            claimNumber: `CLM-${Date.now()}`,
            customerId: 1,
            vehicleId: 1,
            incidentDate: new Date().toISOString(),
            claimType: 'accident',
            insuranceCompany: 'State Farm',
            policyNumber: 'POL-2024-001',
            claimAmount: 3500,
            description: 'Sample insurance claim',
          });
        }}
        disabled={createClaimMutation.isPending}
        data-testid="button-create-claim"
        className="absolute top-8 right-8 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90"
      >
        {createClaimMutation.isPending ? t('common.submitting', 'Submitting...') : t('payments.insurance.submitClaim', 'Submit Claim')}
      </Button>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('payments.insurance.recentClaims', 'Recent Claims')}</CardTitle>
        </CardHeader>
        <CardContent>
          {claimsLoading ? (
            <div className="text-center py-8 text-[#64748B]">{t('common.loading', 'Loading claims...')}</div>
          ) : claims.length === 0 ? (
            <div className="text-center py-8 text-[#64748B]">{t('payments.insurance.noClaimsFound', 'No insurance claims found')}</div>
          ) : (
            <div className="space-y-3">
              {claims.map((claim) => (
                <div key={claim.id} className="flex items-start justify-between p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]" data-testid={`claim-${claim.id}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{claim.claimNumber}</h3>
                      <Badge 
                        variant={claim.status === "paid" ? "default" : claim.status === "approved" ? "secondary" : "outline"}
                        className={
                          claim.status === "paid" 
                            ? "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" 
                            : claim.status === "approved" 
                            ? "bg-[#0A5ED7] text-white" 
                            : "border-[#E2E8F0] dark:border-[#232A36] text-[#64748B]"
                        }
                      >
                        {claim.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#0B1F3B] dark:text-white mb-1">
                      {claim.claimType} - {claim.insuranceCompany}
                    </p>
                    <p className="text-sm text-[#64748B]">
                      Policy: {claim.policyNumber} • {new Date(claim.incidentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#0B1F3B] dark:text-white">${Number(claim.claimAmount || 0).toLocaleString()}</p>
                    {claim.approvedAmount && (
                      <p className="text-sm text-[#0BB3FF]">{t('payments.insurance.approved', 'Approved')}: ${Number(claim.approvedAmount).toLocaleString()}</p>
                    )}
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
