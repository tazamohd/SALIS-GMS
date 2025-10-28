import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Gift, DollarSign, TrendingUp, Copy, Plus, Mail, AlertCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ReferralProgram() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: referrals = [], isLoading: referralsLoading } = useQuery({
    queryKey: ["/api/referrals"],
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/referrals/analytics"],
  });

  const referralsArray = (referrals as any[]) || [];
  const analyticsData = (analytics as any) || {};

  const createReferral = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/referrals/generate-code", "POST", data);
    },
    onSuccess: () => {
      toast({ title: "Referral code generated", description: "Referral code created successfully." });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/referrals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/referrals/analytics"] });
    },
  });

  const stats = {
    totalReferrals: analyticsData.totalReferrals || 0,
    successfulReferrals: analyticsData.successfulReferrals || 0,
    pendingReferrals: analyticsData.pendingReferrals || 0,
    totalRewardsIssued: analyticsData.totalRewardsIssued || 0,
    conversionRate: analyticsData.conversionRate || 0,
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: "secondary",
      active: "default",
      completed: "default",
      rewarded: "default",
      expired: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status || "Unknown"}</Badge>;
  };

  const copyReferralCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Code copied", description: "Referral code copied to clipboard." });
  };

  if (referralsLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-64"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white">
            🎁 Referral Program
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track customer referrals and rewards
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-referral">
              <Plus className="h-4 w-4 mr-2" />
              Generate Code
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Generate Referral Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Customer ID</label>
                <Input placeholder="Enter customer ID..." className="mt-1" data-testid="input-customer-id" />
              </div>
              <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Referral Rewards</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Referrer gets: $50 credit</li>
                  <li>• Referee gets: $25 off first service</li>
                  <li>• Minimum purchase: $100</li>
                </ul>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  createReferral.mutate({
                    customerId: "1",
                  });
                }}
                data-testid="button-generate-code"
              >
                <Gift className="h-4 w-4 mr-2" />
                Generate Code
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-total-referrals">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Referrals</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.totalReferrals}</h3>
              </div>
              <Users className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-successful">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Successful</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.successfulReferrals}</h3>
              </div>
              <Gift className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-pending">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.pendingReferrals}</h3>
              </div>
              <TrendingUp className="h-12 w-12 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-rewards">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rewards Issued</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                  ${stats.totalRewardsIssued}
                </h3>
              </div>
              <DollarSign className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-conversion">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.conversionRate}%</h3>
              </div>
              <TrendingUp className="h-12 w-12 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {referralsArray.length === 0 && !referralsLoading && (
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-12">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Referrals Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start generating referral codes to track customer referrals and rewards.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first">
                <Plus className="h-4 w-4 mr-2" />
                Generate First Code
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referrals List */}
      {referralsArray.length > 0 && (
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referralsArray.map((referral: any, index: number) => (
                <div
                  key={`referral-${referral.id || index}`}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  data-testid={`referral-${referral.id || index}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {referral.referrerName || "Referrer"} → {referral.refereeName || "Referee"}
                      </h3>
                      {getStatusBadge(referral.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 dark:text-gray-400">
                      {referral.referralCode && (
                        <div>
                          <span className="font-medium">Code:</span>{" "}
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0"
                            onClick={() => copyReferralCode(referral.referralCode)}
                            data-testid={`button-copy-${referral.id || index}`}
                          >
                            {referral.referralCode} <Copy className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      )}
                      {referral.status === "completed" && referral.firstVisitDate && (
                        <>
                          <div>
                            <span className="font-medium">First Visit:</span>{" "}
                            {new Date(referral.firstVisitDate).toLocaleDateString()}
                          </div>
                          {referral.firstPurchaseAmount && (
                            <div>
                              <span className="font-medium">Purchase:</span> ${referral.firstPurchaseAmount}
                            </div>
                          )}
                          {referral.referrerReward && referral.refereeReward && (
                            <div>
                              <span className="font-medium">Rewards:</span> ${referral.referrerReward} / ${referral.refereeReward}
                            </div>
                          )}
                        </>
                      )}
                      {referral.status === "pending" && referral.expiresAt && (
                        <div>
                          <span className="font-medium">Expires:</span>{" "}
                          {new Date(referral.expiresAt).toLocaleDateString()}
                        </div>
                      )}
                      {referral.createdAt && (
                        <div>
                          <span className="font-medium">Created:</span>{" "}
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    {referral.status === "completed" && (
                      <div className="flex gap-3 mt-2">
                        {referral.referrerRewardClaimed ? (
                          <span className="text-xs text-green-600">✓ Referrer rewarded</span>
                        ) : (
                          <span className="text-xs text-gray-600 dark:text-gray-400">Referrer reward pending</span>
                        )}
                        {referral.refereeRewardClaimed ? (
                          <span className="text-xs text-green-600">✓ Referee rewarded</span>
                        ) : (
                          <span className="text-xs text-gray-600 dark:text-gray-400">Referee reward pending</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
