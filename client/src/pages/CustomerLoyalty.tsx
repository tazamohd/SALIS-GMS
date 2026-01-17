import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Award, Gift, Users, Star, CreditCard, RefreshCw } from "lucide-react";
import { TabsPageLayout, TabConfig } from "@/components/layouts/TabsPageLayout";

const programSchema = z.object({
  name: z.string().min(1, "Program name is required"),
  description: z.string().optional(),
  isActive: z.boolean(),
  pointsPerDollar: z.number().min(0).default(1),
  tiers: z.array(z.object({
    name: z.string(),
    minimumPoints: z.number(),
    benefits: z.string()
  })).optional(),
});

const rewardSchema = z.object({
  programId: z.string().min(1, "Program is required"),
  name: z.string().min(1, "Reward name is required"),
  description: z.string().optional(),
  pointsCost: z.number().min(1, "Points cost is required"),
  rewardType: z.enum(["discount", "service", "product", "cashback"]),
  value: z.number().min(0),
  isActive: z.boolean().default(true),
});

type ProgramFormData = z.infer<typeof programSchema>;
type RewardFormData = z.infer<typeof rewardSchema>;

export default function CustomerLoyalty() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isCreateProgramDialogOpen, setIsCreateProgramDialogOpen] = useState(false);
  const [isCreateRewardDialogOpen, setIsCreateRewardDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);

  const { data: programs = [], isLoading: programsLoading } = useQuery<any[]>({
    queryKey: ["/api/loyalty-programs"],
  });

  const { data: accounts = [] } = useQuery<any[]>({
    queryKey: ["/api/loyalty-accounts"],
  });

  const { data: rewards = [] } = useQuery<any[]>({
    queryKey: ["/api/loyalty-programs", selectedProgram?.id, "rewards"],
    queryFn: () => selectedProgram ? fetch(`/api/loyalty-programs/${selectedProgram.id}/rewards`).then(r => r.json()) : Promise.resolve([]),
    enabled: !!selectedProgram,
  });

  const { data: redemptions = [] } = useQuery<any[]>({
    queryKey: ["/api/loyalty-redemptions"],
  });

  const programForm = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
      pointsPerDollar: 1,
      tiers: [
        { name: "Bronze", minimumPoints: 0, benefits: "Basic rewards" },
        { name: "Silver", minimumPoints: 500, benefits: "Enhanced rewards + priority service" },
        { name: "Gold", minimumPoints: 1500, benefits: "Premium rewards + exclusive offers" },
        { name: "Platinum", minimumPoints: 5000, benefits: "VIP treatment + maximum benefits" },
      ],
    }
  });

  const rewardForm = useForm<RewardFormData>({
    resolver: zodResolver(rewardSchema),
    defaultValues: {
      programId: selectedProgram?.id || "",
      name: "",
      description: "",
      pointsCost: 100,
      rewardType: "discount",
      value: 10,
      isActive: true,
    }
  });

  const createProgramMutation = useMutation({
    mutationFn: (data: ProgramFormData) => apiRequest("POST", "/api/loyalty-programs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loyalty-programs"] });
      toast({ title: t('common.success', 'Success'), description: t('customers.loyalty.programCreated', 'Loyalty program created successfully') });
      setIsCreateProgramDialogOpen(false);
      programForm.reset();
    },
    onError: () => {
      toast({ title: t('common.error', 'Error'), description: t('customers.loyalty.failedToCreateProgram', 'Failed to create loyalty program'), variant: "destructive" });
    }
  });

  const createRewardMutation = useMutation({
    mutationFn: (data: RewardFormData) => apiRequest("POST", "/api/loyalty-rewards", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loyalty-programs", selectedProgram?.id, "rewards"] });
      toast({ title: t('common.success', 'Success'), description: t('customers.loyalty.rewardCreated', 'Reward created successfully') });
      setIsCreateRewardDialogOpen(false);
      rewardForm.reset();
    },
    onError: () => {
      toast({ title: t('common.error', 'Error'), description: t('customers.loyalty.failedToCreateReward', 'Failed to create reward'), variant: "destructive" });
    }
  });

  const deleteProgramMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/loyalty-programs/${id}`, undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loyalty-programs"] });
      toast({ title: t('common.success', 'Success'), description: t('customers.loyalty.programDeleted', 'Program deleted successfully') });
    }
  });

  const onSubmitProgram = (data: ProgramFormData) => {
    createProgramMutation.mutate(data);
  };

  const onSubmitReward = (data: RewardFormData) => {
    createRewardMutation.mutate(data);
  };

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      bronze: "bg-salis-gray text-white",
      silver: "bg-salis-gray-dark text-white",
      gold: "bg-salis-black text-white",
      platinum: "bg-salis-black text-white",
    };
    return colors[tier.toLowerCase()] || "bg-salis-gray text-white";
  };

  const tabs: TabConfig[] = [
    {
      id: "programs",
      label: t('customers.loyalty.programs', 'Programs'),
      icon: Award,
      content: (
        <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
          <CardHeader>
            <CardTitle className="font-montserrat text-salis-black dark:text-white">{t('customers.loyalty.programs', 'Loyalty Programs')}</CardTitle>
            <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              {t('customers.loyalty.configurePrograms', 'Configure and manage your loyalty programs')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {programsLoading ? (
              <p className="text-salis-gray font-poppins" data-testid="text-loading">{t('common.loading', 'Loading programs...')}</p>
            ) : programs.length === 0 ? (
              <p className="text-salis-gray font-poppins" data-testid="text-no-programs">{t('customers.loyalty.noPrograms', 'No loyalty programs found')}</p>
            ) : (
              <div className="grid gap-4">
                {programs.map((program: any) => (
                  <Card 
                    key={program.id} 
                    className="border-salis-gray-light dark:border-salis-gray-dark cursor-pointer hover:border-salis-gray dark:hover:border-salis-gray transition-colors"
                    onClick={() => setSelectedProgram(program)}
                    data-testid={`card-program-${program.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Award className="h-5 w-5 text-salis-gray dark:text-salis-gray-light" />
                            <h3 className="text-lg font-montserrat font-medium text-salis-black dark:text-white" data-testid={`text-program-name-${program.id}`}>
                              {program.name}
                            </h3>
                            <Badge className={program.isActive ? "bg-salis-black text-white" : "bg-salis-gray-light text-salis-black"} data-testid={`badge-active-${program.id}`}>
                              {program.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                            </Badge>
                          </div>
                          <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins mb-3" data-testid={`text-program-description-${program.id}`}>
                            {program.description || t('customers.loyalty.noDescription', 'No description')}
                          </p>
                          <div className="flex items-center gap-6 text-sm">
                            <div>
                              <p className="text-salis-gray dark:text-salis-gray-light font-poppins">{t('customers.loyalty.pointsPerDollar', 'Points Per $1')}</p>
                              <p className="font-semibold text-salis-black dark:text-white" data-testid={`text-points-per-dollar-${program.id}`}>
                                {program.pointsPerDollar}
                              </p>
                            </div>
                            <div>
                              <p className="text-salis-gray dark:text-salis-gray-light font-poppins">{t('customers.loyalty.membershipTiers', 'Membership Tiers')}</p>
                              <div className="flex gap-1 mt-1">
                                {program.tiers && Array.isArray(program.tiers) && program.tiers.map((tier: any, idx: number) => (
                                  <Badge key={idx} className={getTierBadge(tier.name)} data-testid={`badge-tier-${tier.name}-${program.id}`}>
                                    {tier.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(t('customers.loyalty.deleteConfirm', 'Delete this program?'))) {
                              deleteProgramMutation.mutate(program.id);
                            }
                          }}
                          className="border-salis-gray-light dark:border-salis-gray-dark"
                          data-testid={`button-delete-program-${program.id}`}
                        >
                          {t('common.delete', 'Delete')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ),
    },
    {
      id: "members",
      label: t('customers.loyalty.members', 'Members'),
      icon: Users,
      content: (
        <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
          <CardHeader>
            <CardTitle className="font-montserrat text-salis-black dark:text-white">{t('customers.loyalty.members', 'Loyalty Members')}</CardTitle>
            <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              {t('customers.loyalty.manageMemberAccounts', 'View and manage customer loyalty accounts')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <p className="text-salis-gray font-poppins" data-testid="text-no-members">{t('customers.loyalty.noMembers', 'No loyalty members found')}</p>
            ) : (
              <div className="grid gap-4">
                {accounts.map((account: any) => (
                  <Card key={account.id} className="border-salis-gray-light dark:border-salis-gray-dark" data-testid={`card-member-${account.id}`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <Star className="h-8 w-8 text-salis-gray dark:text-salis-gray-light" />
                          <div>
                            <p className="font-semibold text-salis-black dark:text-white" data-testid={`text-member-tier-${account.id}`}>
                              {account.currentTier || t('customers.loyalty.bronze', 'Bronze')} {t('customers.loyalty.member', 'Member')}
                            </p>
                            <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins" data-testid={`text-member-points-${account.id}`}>
                              {account.currentPoints ?? 0} {t('customers.loyalty.points', 'points')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins">{t('customers.loyalty.totalEarned', 'Total Earned')}</p>
                          <p className="font-semibold text-salis-black dark:text-white" data-testid={`text-member-total-${account.id}`}>
                            {account.totalPointsEarned ?? 0} {t('customers.loyalty.pts', 'pts')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ),
    },
    {
      id: "rewards",
      label: t('customers.loyalty.rewards', 'Rewards'),
      icon: Gift,
      content: (
        <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-montserrat text-salis-black dark:text-white">{t('customers.loyalty.loyaltyRewards', 'Loyalty Rewards')}</CardTitle>
              <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
                {selectedProgram ? `${t('customers.loyalty.rewardsFor', 'Rewards for')}: ${selectedProgram.name}` : t('customers.loyalty.selectProgramToManage', 'Select a program to manage rewards')}
              </CardDescription>
            </div>
            {selectedProgram && (
              <Button
                onClick={() => setIsCreateRewardDialogOpen(true)}
                className="bg-salis-black hover:bg-salis-gray-dark text-white font-poppins"
                data-testid="button-create-reward"
              >
                <Gift className="mr-2 h-4 w-4" />
                {t('customers.loyalty.addReward', 'Add Reward')}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!selectedProgram ? (
              <p className="text-salis-gray font-poppins text-center py-8" data-testid="text-no-program-selected">
                {t('customers.loyalty.selectProgramFromTab', 'Select a program from the Programs tab to manage its rewards')}
              </p>
            ) : rewards.length === 0 ? (
              <p className="text-salis-gray font-poppins" data-testid="text-no-rewards">{t('customers.loyalty.noRewards', 'No rewards found')}</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {rewards.map((reward: any) => (
                  <Card key={reward.id} className="border-salis-gray-light dark:border-salis-gray-dark" data-testid={`card-reward-${reward.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Gift className="h-5 w-5 text-salis-gray dark:text-salis-gray-light" />
                          <h3 className="font-medium text-salis-black dark:text-white" data-testid={`text-reward-name-${reward.id}`}>
                            {reward.name}
                          </h3>
                        </div>
                        <Badge className={reward.isActive ? "bg-salis-black text-white" : "bg-salis-gray-light text-salis-black"} data-testid={`badge-reward-active-${reward.id}`}>
                          {reward.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                        </Badge>
                      </div>
                      <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins mb-3" data-testid={`text-reward-description-${reward.id}`}>
                        {reward.description || t('customers.loyalty.noDescription', 'No description')}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-salis-gray dark:text-salis-gray-light font-poppins">{t('customers.loyalty.cost', 'Cost')}</p>
                          <p className="text-lg font-bold text-salis-black dark:text-white" data-testid={`text-reward-cost-${reward.id}`}>
                            {reward.pointsCost} pts
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-salis-gray dark:text-salis-gray-light font-poppins">{t('customers.loyalty.value', 'Value')}</p>
                          <p className="text-lg font-bold text-salis-black dark:text-white" data-testid={`text-reward-value-${reward.id}`}>
                            ${reward.value}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ),
    },
    {
      id: "redemptions",
      label: t('customers.loyalty.redemptions', 'Redemptions'),
      icon: CreditCard,
      content: (
        <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
          <CardHeader>
            <CardTitle className="font-montserrat text-salis-black dark:text-white">{t('customers.loyalty.rewardRedemptions', 'Reward Redemptions')}</CardTitle>
            <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              {t('customers.loyalty.trackRedemptions', 'Track and manage customer reward redemptions')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {redemptions.length === 0 ? (
              <p className="text-salis-gray font-poppins" data-testid="text-no-redemptions">{t('customers.loyalty.noRedemptions', 'No redemptions found')}</p>
            ) : (
              <div className="grid gap-4">
                {redemptions.map((redemption: any) => (
                  <Card key={redemption.id} className="border-salis-gray-light dark:border-salis-gray-dark" data-testid={`card-redemption-${redemption.id}`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <RefreshCw className="h-6 w-6 text-salis-gray dark:text-salis-gray-light" />
                          <div>
                            <p className="font-semibold text-salis-black dark:text-white" data-testid={`text-redemption-code-${redemption.id}`}>
                              {redemption.redemptionCode}
                            </p>
                            <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins">
                              {redemption.pointsRedeemed} {t('customers.loyalty.pointsRedeemed', 'points redeemed')}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-salis-black text-white" data-testid={`badge-redemption-status-${redemption.id}`}>
                          {redemption.status || "pending"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <>
      <TabsPageLayout
        title={t('customers.loyalty.title', 'Customer Loyalty Program')}
        description={t('customers.loyalty.description', 'Manage loyalty programs, rewards, points, and customer memberships')}
        icon={Award}
        primaryAction={{
          label: t('customers.loyalty.createProgram', 'Create Program'),
          icon: Award,
          onClick: () => setIsCreateProgramDialogOpen(true),
          testId: "button-create-program",
        }}
        tabs={tabs}
        defaultTab="programs"
      />

      <Dialog open={isCreateProgramDialogOpen} onOpenChange={setIsCreateProgramDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-[#010101] border-salis-gray-light dark:border-salis-gray-dark">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-salis-black dark:text-white">{t('customers.loyalty.createProgramTitle', 'Create Loyalty Program')}</DialogTitle>
            <DialogDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              {t('customers.loyalty.createProgramDescription', 'Set up a new customer loyalty program with tiers and benefits')}
            </DialogDescription>
          </DialogHeader>
          <Form {...programForm}>
            <form onSubmit={programForm.handleSubmit(onSubmitProgram)} className="space-y-4">
              <FormField
                control={programForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white font-poppins">{t('customers.loyalty.programName', 'Program Name')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('customers.loyalty.vipRewardsProgramPlaceholder', 'VIP Rewards Program')} data-testid="input-program-name" className="bg-white dark:bg-[#010101]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={programForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white font-poppins">{t('common.description', 'Description')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t('customers.loyalty.earnPointsPlaceholder', 'Earn points with every service...')} rows={3} data-testid="input-program-description" className="bg-white dark:bg-[#010101]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={programForm.control}
                name="pointsPerDollar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white font-poppins">{t('customers.loyalty.pointsPerDollar', 'Points Per Dollar')}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        placeholder="1"
                        data-testid="input-points-per-dollar"
                        className="bg-white dark:bg-[#010101]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateProgramDialogOpen(false)}
                  className="border-salis-gray-light dark:border-salis-gray-dark"
                  data-testid="button-cancel-program"
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={createProgramMutation.isPending}
                  className="bg-salis-black hover:bg-salis-gray-dark text-white"
                  data-testid="button-submit-program"
                >
                  {createProgramMutation.isPending ? t('common.creating', 'Creating...') : t('customers.loyalty.createProgram', 'Create Program')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateRewardDialogOpen} onOpenChange={setIsCreateRewardDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-[#010101] border-salis-gray-light dark:border-salis-gray-dark">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-salis-black dark:text-white">{t('customers.loyalty.addReward', 'Add Reward')}</DialogTitle>
            <DialogDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              {t('customers.loyalty.createRewardFor', 'Create a new reward for')} {selectedProgram?.name}
            </DialogDescription>
          </DialogHeader>
          <Form {...rewardForm}>
            <form onSubmit={rewardForm.handleSubmit(onSubmitReward)} className="space-y-4">
              <FormField
                control={rewardForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white font-poppins">{t('customers.loyalty.rewardName', 'Reward Name')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('customers.loyalty.serviceDiscountPlaceholder', '$10 Service Discount')} data-testid="input-reward-name" className="bg-white dark:bg-[#010101]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={rewardForm.control}
                name="rewardType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white font-poppins">{t('customers.loyalty.rewardType', 'Reward Type')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-reward-type">
                          <SelectValue placeholder={t('customers.loyalty.selectType', 'Select type')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="discount">{t('customers.loyalty.discount', 'Discount')}</SelectItem>
                        <SelectItem value="service">{t('customers.loyalty.freeService', 'Free Service')}</SelectItem>
                        <SelectItem value="product">{t('customers.loyalty.product', 'Product')}</SelectItem>
                        <SelectItem value="cashback">{t('customers.loyalty.cashback', 'Cashback')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={rewardForm.control}
                  name="pointsCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white font-poppins">{t('customers.loyalty.pointsCost', 'Points Cost')}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          placeholder="100"
                          data-testid="input-points-cost"
                          className="bg-white dark:bg-[#010101]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={rewardForm.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white font-poppins">{t('customers.loyalty.valueDollar', 'Value ($)')}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          placeholder="10"
                          data-testid="input-reward-value"
                          className="bg-white dark:bg-[#010101]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateRewardDialogOpen(false)}
                  className="border-salis-gray-light dark:border-salis-gray-dark"
                  data-testid="button-cancel-reward"
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={createRewardMutation.isPending}
                  className="bg-salis-black hover:bg-salis-gray-dark text-white"
                  data-testid="button-submit-reward"
                >
                  {createRewardMutation.isPending ? t('common.creating', 'Creating...') : t('customers.loyalty.addReward', 'Add Reward')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
