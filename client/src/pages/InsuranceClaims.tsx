import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, DollarSign, FileText, TrendingUp } from "lucide-react";

export default function InsuranceClaims() {
  const mockClaims = [
    { id: "CLM-2024-001", customer: "John Smith", vehicle: "2020 Honda Civic", company: "State Farm", claimAmount: 3500, approvedAmount: 3200, status: "approved", date: "2024-10-20" },
    { id: "CLM-2024-002", customer: "Sarah Johnson", vehicle: "2019 Toyota Camry", company: "Geico", claimAmount: 5200, approvedAmount: null, status: "pending", date: "2024-10-24" },
    { id: "CLM-2024-003", customer: "Mike Wilson", vehicle: "2021 Ford F-150", company: "Allstate", claimAmount: 1800, approvedAmount: 1800, status: "paid", date: "2024-10-18" },
  ];

  const stats = { totalClaims: 24, pendingReview: 5, approvalRate: 92, totalValue: 45800 };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white">
            🛡️ Insurance Claims
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track insurance claims</p>
        </div>
        <Button data-testid="button-create-claim">Submit Claim</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Claims</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.totalClaims}</h3>
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
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.pendingReview}</h3>
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
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.approvalRate}%</h3>
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
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">${stats.totalValue.toLocaleString()}</h3>
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
          <div className="space-y-3">
            {mockClaims.map((claim) => (
              <div key={claim.id} className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg" data-testid={`claim-${claim.id}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{claim.id}</h3>
                    <Badge variant={claim.status === "paid" ? "default" : claim.status === "approved" ? "secondary" : "outline"}>
                      {claim.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white mb-1">
                    {claim.customer} - {claim.vehicle}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {claim.company} • {new Date(claim.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">${claim.claimAmount.toLocaleString()}</p>
                  {claim.approvedAmount && (
                    <p className="text-sm text-green-600">Approved: ${claim.approvedAmount.toLocaleString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
