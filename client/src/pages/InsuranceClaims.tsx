import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Shield, DollarSign, FileText, TrendingUp } from "lucide-react";

export default function InsuranceClaims() {
  const { toast } = useToast();

  // Fetch insurance claims from backend
  const { data: claims = [], isLoading: claimsLoading } = useQuery<any[]>({
    queryKey: ['/api/insurance/claims'],
  });

  // Fetch analytics for KPIs
  const { data: analytics } = useQuery<any>({
    queryKey: ['/api/insurance/claims/analytics'],
  });

  // Calculate KPIs from real data
  const stats = {
    totalClaims: claims.length,
    pendingReview: claims.filter((c: any) => c.status === 'pending').length,
    approvalRate: claims.length > 0 
      ? Math.round((claims.filter((c: any) => c.status === 'approved' || c.status === 'paid').length / claims.length) * 100)
      : 0,
    totalValue: claims.reduce((sum: number, c: any) => sum + (Number(c.claimAmount) || 0), 0),
  };

  // Create insurance claim mutation
  const createClaimMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/insurance/claims', data);
    },
    onSuccess: () => {
      toast({
        title: "Claim Filed",
        description: "Insurance claim created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/insurance/claims'] });
      queryClient.invalidateQueries({ queryKey: ['/api/insurance/claims/analytics'] });
    },
    onError: (error: any) => {
      toast({
        title: "Filing Failed",
        description: error.message || "Failed to file insurance claim",
        variant: "destructive",
      });
    },
  });

  // Update claim status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ claimId, status }: { claimId: number; status: string }) => {
      return apiRequest('PATCH', `/api/insurance/claims/${claimId}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Claim status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/insurance/claims'] });
      queryClient.invalidateQueries({ queryKey: ['/api/insurance/claims/analytics'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update claim status",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white">
            🛡️ Insurance Claims
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track insurance claims</p>
        </div>
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
        >
          {createClaimMutation.isPending ? "Submitting..." : "Submit Claim"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Claims</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-total-claims">{stats.totalClaims}</h3>
              </div>
              <FileText className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Review</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-pending-review">{stats.pendingReview}</h3>
              </div>
              <Shield className="h-12 w-12 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Approval Rate</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-approval-rate">{stats.approvalRate}%</h3>
              </div>
              <TrendingUp className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-total-value">${Math.round(stats.totalValue).toLocaleString()}</h3>
              </div>
              <DollarSign className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Recent Claims</CardTitle>
        </CardHeader>
        <CardContent>
          {claimsLoading ? (
            <div className="text-center py-8 text-gray-500">Loading claims...</div>
          ) : claims.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No insurance claims found</div>
          ) : (
            <div className="space-y-3">
              {claims.map((claim) => (
                <div key={claim.id} className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg" data-testid={`claim-${claim.id}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{claim.claimNumber}</h3>
                      <Badge variant={claim.status === "paid" ? "default" : claim.status === "approved" ? "secondary" : "outline"}>
                        {claim.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white mb-1">
                      {claim.claimType} - {claim.insuranceCompany}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Policy: {claim.policyNumber} • {new Date(claim.incidentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">${Number(claim.claimAmount || 0).toLocaleString()}</p>
                    {claim.approvedAmount && (
                      <p className="text-sm text-green-600">Approved: ${Number(claim.approvedAmount).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
