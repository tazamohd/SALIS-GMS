import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StandardTablePage, Column } from "@/components/layouts/StandardTablePage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Copy } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ReferralProgram() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
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
      setCustomerId("");
      queryClient.invalidateQueries({ queryKey: ["/api/referrals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/referrals/analytics"] });
    },
  });

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

  const columns: Column<any>[] = [
    {
      header: "Referrer",
      accessorKey: "referrerName",
      cell: (row) => row.referrerName || "N/A",
    },
    {
      header: "Referral Code",
      accessorKey: "referralCode",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded text-sm">
            {row.referralCode || "N/A"}
          </code>
          {row.referralCode && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyReferralCode(row.referralCode)}
              data-testid={`button-copy-${row.id}`}
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
        </div>
      ),
    },
    {
      header: "Referred Customer",
      accessorKey: "referredCustomerName",
      cell: (row) => row.referredCustomerName || "-",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => getStatusBadge(row.status),
    },
    {
      header: "Reward",
      accessorKey: "rewardAmount",
      cell: (row) => row.rewardAmount ? `$${row.rewardAmount}` : "-",
    },
  ];

  return (
    <>
      <StandardTablePage
        title="Referral Program"
        description="Track customer referrals and rewards"
        icon={Users}
        actions={[
          {
            label: "Generate Code",
            onClick: () => setIsCreateDialogOpen(true),
            variant: "default",
          },
        ]}
        data={referralsArray}
        columns={columns}
        isLoading={referralsLoading}
        searchPlaceholder="Search referrals..."
        filters={[
          {
            id: "status",
            label: "Status",
            options: [
              { value: "all", label: "All Statuses" },
              { value: "pending", label: "Pending" },
              { value: "active", label: "Active" },
              { value: "completed", label: "Completed" },
              { value: "rewarded", label: "Rewarded" },
            ],
          },
        ]}
        emptyState={{
          icon: Users,
          title: "No referrals",
          description: "No referrals found.",
        }}
      />

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Referral Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Customer ID</label>
              <Input
                placeholder="Enter customer ID..."
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="mt-1"
                data-testid="input-customer-id"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => createReferral.mutate({ customerId })}
              disabled={!customerId}
              data-testid="button-generate"
            >
              Generate Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
