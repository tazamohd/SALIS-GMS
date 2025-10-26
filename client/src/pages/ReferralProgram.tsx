import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Gift, DollarSign, TrendingUp, Copy, Plus, Mail } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ReferralProgram() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: referrals = [] } = useQuery({
    queryKey: ["/api/referrals"],
  });

  const createReferral = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/referrals", "POST", data);
    },
    onSuccess: () => {
      toast({ title: "Referral sent", description: "Invitation email sent to referee." });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/referrals"] });
    },
  });

  // Mock data
  const mockReferrals = [
    {
      id: "1",
      referrerName: "John Smith",
      refereeName: "Mike Davis",
      refereeEmail: "mike.davis@example.com",
      referralCode: "JOHN-MIKE-2024",
      status: "completed",
      firstVisitDate: "2024-10-20T10:00:00Z",
      firstPurchaseAmount: 450.00,
      referrerReward: 50.00,
      refereeReward: 25.00,
      referrerRewardClaimed: true,
      refereeRewardClaimed: true,
      createdAt: "2024-10-15T09:00:00Z",
    },
    {
      id: "2",
      referrerName: "Sarah Johnson",
      refereeName: "Emily Brown",
      refereeEmail: "emily.brown@example.com",
      referralCode: "SARAH-EMILY-2024",
      status: "pending",
      referrerReward: 50.00,
      refereeReward: 25.00,
      createdAt: "2024-10-22T14:30:00Z",
      expiresAt: "2024-11-22T14:30:00Z",
    },
    {
      id: "3",
      referrerName: "Mike Wilson",
      refereeName: "Tom Anderson",
      refereeEmail: "tom.anderson@example.com",
      referralCode: "MIKE-TOM-2024",
      status: "completed",
      firstVisitDate: "2024-10-18T11:00:00Z",
      firstPurchaseAmount: 325.00,
      referrerReward: 50.00,
      refereeReward: 25.00,
      referrerRewardClaimed: false,
      refereeRewardClaimed: true,
      createdAt: "2024-10-10T16:20:00Z",
    },
  ];

  const stats = {
    totalReferrals: 48,
    successfulReferrals: 32,
    pendingReferrals: 16,
    totalRewardsIssued: 3200,
    conversionRate: 67,
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: "secondary",
      completed: "default",
      rewarded: "default",
      expired: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const copyReferralCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Code copied", description: "Referral code copied to clipboard." });
  };

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
              Send Referral
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Send Referral Invitation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Referrer (Customer)</label>
                <Input placeholder="Select customer..." className="mt-1" data-testid="input-referrer" />
              </div>
              <div>
                <label className="text-sm font-medium">Referee Name</label>
                <Input placeholder="Friend's name" className="mt-1" data-testid="input-referee-name" />
              </div>
              <div>
                <label className="text-sm font-medium">Referee Email</label>
                <Input type="email" placeholder="friend@example.com" className="mt-1" data-testid="input-referee-email" />
              </div>
              <div>
                <label className="text-sm font-medium">Referee Phone (Optional)</label>
                <Input type="tel" placeholder="+1 (555) 123-4567" className="mt-1" data-testid="input-referee-phone" />
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
                    refereeEmail: "test@example.com",
                    refereeName: "Test User",
                  });
                }}
                data-testid="button-send-invitation"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Invitation
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
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">${stats.totalRewardsIssued}</h3>
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

      {/* Referrals List */}
      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockReferrals.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                data-testid={`referral-${referral.id}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {referral.referrerName} → {referral.refereeName}
                    </h3>
                    {getStatusBadge(referral.status)}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <span className="font-medium">Code:</span>{" "}
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0"
                        onClick={() => copyReferralCode(referral.referralCode)}
                        data-testid={`button-copy-${referral.id}`}
                      >
                        {referral.referralCode} <Copy className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                    {referral.status === "completed" && (
                      <>
                        <div>
                          <span className="font-medium">First Visit:</span>{" "}
                          {new Date(referral.firstVisitDate!).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Purchase:</span> ${referral.firstPurchaseAmount}
                        </div>
                        <div>
                          <span className="font-medium">Rewards:</span> ${referral.referrerReward} / ${referral.refereeReward}
                        </div>
                      </>
                    )}
                    {referral.status === "pending" && referral.expiresAt && (
                      <div>
                        <span className="font-medium">Expires:</span>{" "}
                        {new Date(referral.expiresAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  {referral.status === "completed" && (
                    <div className="flex gap-3 mt-2">
                      {referral.referrerRewardClaimed ? (
                        <span className="text-xs text-green-600">✓ Referrer rewarded</span>
                      ) : (
                        <Button size="sm" variant="outline" data-testid={`button-reward-referrer-${referral.id}`}>
                          Claim Referrer Reward
                        </Button>
                      )}
                      {referral.refereeRewardClaimed && (
                        <span className="text-xs text-green-600">✓ Referee rewarded</span>
                      )}
                    </div>
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
