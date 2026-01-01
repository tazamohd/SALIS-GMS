import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Crown, 
  Gift, 
  Star, 
  Users, 
  TrendingUp,
  Award,
  Percent,
  Ticket,
  Sparkles,
  Settings,
  Plus,
  Search,
  Eye,
  Edit,
  Check,
  X,
  Zap,
  Target,
  Trophy
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, AreaChart, Area, ComposedChart } from "recharts";

interface LoyaltyTier {
  id: string;
  tierName: string;
  tierNameAr?: string;
  minPoints: number;
  maxPoints?: number;
  pointsMultiplier: number;
  discountPercentage: number;
  color: string;
  icon: string;
  memberCount: number;
}

interface LoyaltyMember {
  id: string;
  customerName: string;
  email: string;
  tierName: string;
  tierColor: string;
  currentPoints: number;
  lifetimePoints: number;
  pointsToNextTier: number;
  memberSince: string;
}

interface LoyaltyOffer {
  id: string;
  offerName: string;
  description: string;
  pointsCost: number;
  discountValue: number;
  tierRequired: string;
  expiresAt: string;
  isActive: boolean;
  redemptionCount: number;
}

export default function LoyaltyProgram() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [viewingMember, setViewingMember] = useState<LoyaltyMember | null>(null);
  const [editingOffer, setEditingOffer] = useState<LoyaltyOffer | null>(null);
  const [offerStates, setOfferStates] = useState<Record<string, boolean>>({});
  const [newOfferForm, setNewOfferForm] = useState({ name: '', description: '', pointsCost: '', value: '', tier: '' });

  const tierColors = {
    bronze: { bg: 'bg-gradient-to-r from-[#CD7F32] to-[#B87333]', text: 'text-[#CD7F32]', border: 'border-[#CD7F32]' },
    silver: { bg: 'bg-gradient-to-r from-[#C0C0C0] to-[#A8A8A8]', text: 'text-[#C0C0C0]', border: 'border-[#C0C0C0]' },
    gold: { bg: 'bg-gradient-to-r from-[#FFD700] to-[#FFA500]', text: 'text-[#FFD700]', border: 'border-[#FFD700]' },
    platinum: { bg: 'bg-gradient-to-r from-[#E5E4E2] to-[#B4B4B4]', text: 'text-[#E5E4E2]', border: 'border-[#E5E4E2]' },
  };

  const tiers: LoyaltyTier[] = [
    { id: "1", tierName: t('loyalty.tierBronze', 'Bronze'), tierNameAr: "برونزي", minPoints: 0, maxPoints: 999, pointsMultiplier: 1, discountPercentage: 0, color: "#CD7F32", icon: "medal", memberCount: 245 },
    { id: "2", tierName: t('loyalty.tierSilver', 'Silver'), tierNameAr: "فضي", minPoints: 1000, maxPoints: 4999, pointsMultiplier: 1.25, discountPercentage: 5, color: "#C0C0C0", icon: "star", memberCount: 128 },
    { id: "3", tierName: t('loyalty.tierGold', 'Gold'), tierNameAr: "ذهبي", minPoints: 5000, maxPoints: 14999, pointsMultiplier: 1.5, discountPercentage: 10, color: "#FFD700", icon: "crown", memberCount: 67 },
    { id: "4", tierName: t('loyalty.tierPlatinum', 'Platinum'), tierNameAr: "بلاتينيوم", minPoints: 15000, pointsMultiplier: 2, discountPercentage: 15, color: "#E5E4E2", icon: "diamond", memberCount: 23 },
  ];

  const members: LoyaltyMember[] = [
    { id: "1", customerName: "Ahmed Al-Rashid", email: "ahmed@example.com", tierName: "Gold", tierColor: "#FFD700", currentPoints: 7540, lifetimePoints: 12340, pointsToNextTier: 7460, memberSince: "2023-01-15" },
    { id: "2", customerName: "Fatima Hassan", email: "fatima@example.com", tierName: "Platinum", tierColor: "#E5E4E2", currentPoints: 18200, lifetimePoints: 25600, pointsToNextTier: 0, memberSince: "2022-06-20" },
    { id: "3", customerName: "Mohammed Khalid", email: "mohammed@example.com", tierName: "Silver", tierColor: "#C0C0C0", currentPoints: 2340, lifetimePoints: 4500, pointsToNextTier: 2660, memberSince: "2023-08-10" },
    { id: "4", customerName: "Sara Abdullah", email: "sara@example.com", tierName: "Bronze", tierColor: "#CD7F32", currentPoints: 450, lifetimePoints: 450, pointsToNextTier: 550, memberSince: "2024-02-01" },
  ];

  const offers: LoyaltyOffer[] = [
    { id: "1", offerName: t('loyalty.freeOilChange', 'Free Oil Change'), description: t('loyalty.freeOilChangeDesc', 'Complimentary oil change service'), pointsCost: 500, discountValue: 150, tierRequired: "Bronze", expiresAt: "2025-03-31", isActive: true, redemptionCount: 45 },
    { id: "2", offerName: t('loyalty.brakeServiceDiscount', '20% Off Brake Service'), description: t('loyalty.brakeServiceDiscountDesc', '20% discount on any brake service'), pointsCost: 750, discountValue: 200, tierRequired: "Silver", expiresAt: "2025-06-30", isActive: true, redemptionCount: 23 },
    { id: "3", offerName: t('loyalty.premiumDetailingPackage', 'Premium Detailing Package'), description: t('loyalty.premiumDetailingPackageDesc', 'Full interior and exterior detailing'), pointsCost: 1500, discountValue: 400, tierRequired: "Gold", expiresAt: "2025-12-31", isActive: true, redemptionCount: 12 },
    { id: "4", offerName: t('loyalty.vipServicePackage', 'VIP Service Package'), description: t('loyalty.vipServicePackageDesc', 'Priority service with loaner vehicle'), pointsCost: 3000, discountValue: 800, tierRequired: "Platinum", expiresAt: "2025-12-31", isActive: true, redemptionCount: 5 },
  ];

  const tierDistributionData = tiers.map(tier => ({
    name: tier.tierName,
    value: tier.memberCount,
    color: tier.color,
  }));

  const pointsGrowthData = [
    { month: t('months.jan', 'Jan'), earned: 12500, redeemed: 4500 },
    { month: t('months.feb', 'Feb'), earned: 15200, redeemed: 5800 },
    { month: t('months.mar', 'Mar'), earned: 18700, redeemed: 6200 },
    { month: t('months.apr', 'Apr'), earned: 16400, redeemed: 7100 },
    { month: t('months.may', 'May'), earned: 21300, redeemed: 8500 },
    { month: t('months.jun', 'Jun'), earned: 24800, redeemed: 9200 },
  ];

  const totalMembers = tiers.reduce((sum, tier) => sum + tier.memberCount, 0);
  const totalActiveOffers = offers.filter(o => o.isActive).length;
  const totalRedemptions = offers.reduce((sum, o) => sum + o.redemptionCount, 0);

  const handleToggleOffer = (offerId: string, offerName: string, currentState: boolean) => {
    const newState = !currentState;
    setOfferStates(prev => ({ ...prev, [offerId]: newState }));
    toast({
      title: newState 
        ? t('loyalty.offerActivatedSuccess', 'Offer Activated')
        : t('loyalty.offerDeactivatedSuccess', 'Offer Deactivated'),
      description: newState
        ? t('loyalty.offerActivatedDesc', '{{offer}} is now available for redemption', { offer: offerName })
        : t('loyalty.offerDeactivatedDesc', '{{offer}} has been paused. Customers cannot redeem this offer.', { offer: offerName })
    });
  };

  const handleCreateOffer = () => {
    if (!newOfferForm.name) {
      toast({ title: t('loyalty.validationError', 'Validation Error'), description: t('loyalty.offerNameRequired', 'Please enter an offer name'), variant: 'destructive' });
      return;
    }
    if (!newOfferForm.pointsCost || parseInt(newOfferForm.pointsCost) <= 0) {
      toast({ title: t('loyalty.validationError', 'Validation Error'), description: t('loyalty.pointsCostRequired', 'Please enter a valid points cost'), variant: 'destructive' });
      return;
    }
    if (!newOfferForm.tier) {
      toast({ title: t('loyalty.validationError', 'Validation Error'), description: t('loyalty.tierRequired', 'Please select a minimum tier'), variant: 'destructive' });
      return;
    }
    toast({
      title: t('loyalty.offerCreatedSuccess', 'Offer Created Successfully'),
      description: t('loyalty.offerCreatedDesc', '{{offer}} has been added to the rewards catalog', { offer: newOfferForm.name })
    });
    setNewOfferForm({ name: '', description: '', pointsCost: '', value: '', tier: '' });
    setIsOfferDialogOpen(false);
  };

  const overviewTab = (
    <div className="space-y-6" data-testid="loyalty-overview">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#0A5ED7] to-[#0BB3FF] border-0 text-white relative overflow-hidden" data-testid="card-total-members">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">{t('loyalty.totalMembers', 'Total Members')}</p>
                <p className="text-3xl font-bold" data-testid="text-members-count">{totalMembers}</p>
                <p className="text-xs text-white/70 mt-1">+12% {t('common.thisMonth', 'this month')}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#0B1F3B] to-[#1a3a5c] border-0 text-white relative overflow-hidden" data-testid="card-active-offers">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">{t('loyalty.activeOffers', 'Active Offers')}</p>
                <p className="text-3xl font-bold" data-testid="text-offers-count">{totalActiveOffers}</p>
                <p className="text-xs text-white/70 mt-1">{t('loyalty.rewardsAvailable', 'rewards available')}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Gift className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-redemptions">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('loyalty.redemptions', 'Redemptions')}</p>
                <p className="text-3xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-redemptions-count">{totalRedemptions}</p>
                <p className="text-xs text-[#10B981] mt-1">+8 {t('common.thisWeek', 'this week')}</p>
              </div>
              <div className="p-3 bg-[#10B981]/10 rounded-xl">
                <Ticket className="w-6 h-6 text-[#10B981]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-avg-points">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('loyalty.avgPoints', 'Avg. Points')}</p>
                <p className="text-3xl font-bold text-[#0A5ED7]" data-testid="text-avg-points">2,450</p>
                <p className="text-xs text-[#64748B] mt-1">{t('loyalty.perMember', 'per member')}</p>
              </div>
              <div className="p-3 bg-[#0A5ED7]/10 rounded-xl">
                <Star className="w-6 h-6 text-[#0A5ED7]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]">
                <Crown className="w-4 h-4 text-white" />
              </div>
              {t('loyalty.tierDistribution', 'Tier Distribution')}
            </CardTitle>
            <CardDescription className="text-[#64748B]">{t('loyalty.membersByTier', 'Members by loyalty tier')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={tierDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {tierDistributionData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#151A23', border: '1px solid #232A36', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              {t('loyalty.pointsActivity', 'Points Activity')}
            </CardTitle>
            <CardDescription className="text-[#64748B]">{t('loyalty.pointsEarnedVsRedeemed', 'Points earned vs redeemed')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={pointsGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip contentStyle={{ backgroundColor: '#151A23', border: '1px solid #232A36', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="earned" fill="#0A5ED7" name={t('loyalty.earned', 'Earned')} radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="redeemed" stroke="#0BB3FF" strokeWidth={3} name={t('loyalty.redeemed', 'Redeemed')} dot={{ fill: '#0BB3FF', strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
            <div className="p-2 rounded-lg bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]">
              <Award className="w-4 h-4 text-white" />
            </div>
            {t('loyalty.loyaltyTiers', 'Loyalty Tiers')}
          </CardTitle>
          <CardDescription className="text-[#64748B]">{t('loyalty.tierBenefits', 'Tier benefits and requirements')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className="p-4 bg-[#F8FAFC] dark:bg-[#0E1117] border-2 rounded-xl text-center transition-all hover:shadow-lg"
                style={{ borderColor: tier.color }}
                data-testid={`tier-card-${tier.tierName.toLowerCase()}`}
              >
                <div 
                  className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${tier.color}, ${tier.color}99)` }}
                >
                  <Crown className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-lg text-[#0B1F3B] dark:text-white">{tier.tierName}</h3>
                <p className="text-sm text-[#64748B] mb-3">{tier.tierNameAr}</p>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-white dark:bg-[#151A23] rounded-lg">
                    <p className="text-[#64748B]">{tier.minPoints.toLocaleString()}+ {t('loyalty.points', 'points')}</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 p-2 bg-[#0A5ED7]/10 rounded-lg">
                      <p className="text-[#0A5ED7] font-semibold">{tier.pointsMultiplier}x</p>
                      <p className="text-xs text-[#64748B]">{t('loyalty.multiplier', 'multiplier')}</p>
                    </div>
                    {tier.discountPercentage > 0 && (
                      <div className="flex-1 p-2 bg-[#10B981]/10 rounded-lg">
                        <p className="text-[#10B981] font-semibold">{tier.discountPercentage}%</p>
                        <p className="text-xs text-[#64748B]">{t('common.discount', 'discount')}</p>
                      </div>
                    )}
                  </div>
                  <p className="text-[#64748B] pt-2">{tier.memberCount} {t('loyalty.members', 'members')}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const membersTab = (
    <div className="space-y-6" data-testid="loyalty-members">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <Input
            placeholder={t('loyalty.searchMembers', 'Search members...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
            data-testid="input-search-members"
          />
        </div>
        <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" data-testid="button-add-member">
          <Plus className="w-4 h-4 mr-2" />
          {t('loyalty.addMember', 'Add Member')}
        </Button>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardContent className="p-0">
          <div className="divide-y divide-[#E2E8F0] dark:divide-[#232A36]">
            {members.map((member) => (
              <div key={member.id} className="p-4 flex items-center justify-between hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117] transition-colors" data-testid={`member-row-${member.id}`}>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center shadow-md"
                    style={{ background: `linear-gradient(135deg, ${member.tierColor}, ${member.tierColor}99)` }}
                  >
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0B1F3B] dark:text-white">{member.customerName}</p>
                    <p className="text-sm text-[#64748B]">{member.email}</p>
                  </div>
                </div>
                <div className="text-center">
                  <Badge 
                    className="px-3 py-1 text-white border-0"
                    style={{ backgroundColor: member.tierColor }}
                  >
                    {member.tierName}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#0A5ED7]">{member.currentPoints.toLocaleString()} {t('loyalty.pts', 'pts')}</p>
                  <p className="text-sm text-[#64748B]">
                    {member.pointsToNextTier > 0 
                      ? `${member.pointsToNextTier.toLocaleString()} ${t('loyalty.toNextTier', 'to next tier')}` 
                      : t('loyalty.maxTier', 'Max tier')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10"
                    onClick={() => setViewingMember(member)}
                    data-testid={`button-view-member-${member.id}`}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {t('common.view', 'View')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!viewingMember} onOpenChange={(open) => !open && setViewingMember(null)}>
        <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]">
                <Users className="w-4 h-4 text-white" />
              </div>
              {t('loyalty.memberDetails', 'Member Details')}
            </DialogTitle>
            <DialogDescription className="text-[#64748B]">{t('loyalty.viewMemberInfo', 'View loyalty member information')}</DialogDescription>
          </DialogHeader>
          {viewingMember && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#0A5ED7]/5 to-[#0BB3FF]/5 border border-[#0A5ED7]/20">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${viewingMember.tierColor}, ${viewingMember.tierColor}99)` }}
                >
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#0B1F3B] dark:text-white">{viewingMember.customerName}</p>
                  <p className="text-sm text-[#64748B]">{viewingMember.email}</p>
                  <Badge 
                    className="mt-1 text-white border-0"
                    style={{ backgroundColor: viewingMember.tierColor }}
                  >
                    {viewingMember.tierName} {t('loyalty.member', 'Member')}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36]">
                  <p className="text-xs text-[#64748B] mb-1">{t('loyalty.currentPoints', 'Current Points')}</p>
                  <p className="text-xl font-bold text-[#0A5ED7]">{viewingMember.currentPoints.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36]">
                  <p className="text-xs text-[#64748B] mb-1">{t('loyalty.lifetimePoints', 'Lifetime Points')}</p>
                  <p className="text-xl font-bold text-[#0B1F3B] dark:text-white">{viewingMember.lifetimePoints.toLocaleString()}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36]">
                <div className="flex justify-between mb-2">
                  <p className="text-xs text-[#64748B]">{t('loyalty.progressToNextTier', 'Progress to Next Tier')}</p>
                  <p className="text-xs text-[#0A5ED7] font-medium">
                    {viewingMember.pointsToNextTier > 0 
                      ? `${viewingMember.pointsToNextTier.toLocaleString()} ${t('loyalty.pointsNeeded', 'points needed')}`
                      : t('loyalty.maxTierReached', 'Max tier reached!')}
                  </p>
                </div>
                <Progress 
                  value={viewingMember.pointsToNextTier > 0 ? ((viewingMember.currentPoints / (viewingMember.currentPoints + viewingMember.pointsToNextTier)) * 100) : 100} 
                  className="h-2"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36]">
                <p className="text-xs text-[#64748B] mb-1">{t('loyalty.memberSince', 'Member Since')}</p>
                <p className="font-semibold text-[#0B1F3B] dark:text-white">{new Date(viewingMember.memberSince).toLocaleDateString()}</p>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
                onClick={() => setViewingMember(null)}
                data-testid="button-close-member-details"
              >
                {t('common.close', 'Close')}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  const offersTab = (
    <div className="space-y-6" data-testid="loyalty-offers">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">{t('loyalty.activeRewards', 'Active Rewards')}</h3>
          <p className="text-sm text-[#64748B]">{t('loyalty.manageRewards', 'Manage your loyalty rewards catalog')}</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
          onClick={() => setIsOfferDialogOpen(true)} 
          data-testid="button-add-offer"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('loyalty.addOffer', 'Add Offer')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.map((offer) => {
          const isActive = offerStates[offer.id] !== undefined ? offerStates[offer.id] : offer.isActive;
          return (
            <Card key={offer.id} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] overflow-hidden" data-testid={`offer-card-${offer.id}`}>
              <div className={`h-2 ${isActive ? 'bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]' : 'bg-[#64748B]'}`} />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{offer.offerName}</CardTitle>
                  <Switch
                    checked={isActive}
                    onCheckedChange={() => handleToggleOffer(offer.id, offer.offerName, isActive)}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#0A5ED7] data-[state=checked]:to-[#0BB3FF]"
                    data-testid={`switch-offer-${offer.id}`}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#64748B] mb-4">{offer.description}</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg">
                    <span className="text-sm text-[#64748B]">{t('loyalty.pointsCost', 'Points Cost')}</span>
                    <span className="font-bold text-[#0A5ED7]">{offer.pointsCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg">
                    <span className="text-sm text-[#64748B]">{t('loyalty.value', 'Value')}</span>
                    <span className="font-bold text-[#10B981]">{t('common.sar', 'SAR')} {offer.discountValue}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg">
                    <span className="text-sm text-[#64748B]">{t('loyalty.tierRequired', 'Tier Required')}</span>
                    <Badge className="bg-[#0A5ED7]/10 text-[#0A5ED7] border-[#0A5ED7]/30">{offer.tierRequired}+</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg">
                    <span className="text-sm text-[#64748B]">{t('loyalty.redemptions', 'Redemptions')}</span>
                    <span className="font-medium text-[#0B1F3B] dark:text-white">{offer.redemptionCount}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10" 
                    onClick={() => setEditingOffer(offer)}
                    data-testid={`button-edit-offer-${offer.id}`}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    {t('common.edit', 'Edit')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-[#E2E8F0] dark:border-[#232A36] text-[#64748B]" 
                    data-testid={`button-view-offer-${offer.id}`}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {t('common.view', 'View')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]">
                <Gift className="w-4 h-4 text-white" />
              </div>
              {t('loyalty.createNewOffer', 'Create New Offer')}
            </DialogTitle>
            <DialogDescription className="text-[#64748B]">{t('loyalty.addNewReward', 'Add a new reward to your loyalty program')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[#0B1F3B] dark:text-white">{t('loyalty.offerName', 'Offer Name')} <span className="text-[#F97316]">*</span></Label>
              <Input 
                placeholder={t('loyalty.offerNamePlaceholder', 'e.g., Free Oil Change')} 
                value={newOfferForm.name}
                onChange={(e) => setNewOfferForm(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="input-offer-name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#0B1F3B] dark:text-white">{t('common.description', 'Description')}</Label>
              <Input 
                placeholder={t('loyalty.describeOffer', 'Describe the offer...')} 
                value={newOfferForm.description}
                onChange={(e) => setNewOfferForm(prev => ({ ...prev, description: e.target.value }))}
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="input-offer-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#0B1F3B] dark:text-white">{t('loyalty.pointsCost', 'Points Cost')} <span className="text-[#F97316]">*</span></Label>
                <Input 
                  type="number" 
                  placeholder="500" 
                  value={newOfferForm.pointsCost}
                  onChange={(e) => setNewOfferForm(prev => ({ ...prev, pointsCost: e.target.value }))}
                  className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                  data-testid="input-offer-points"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#0B1F3B] dark:text-white">{t('loyalty.valueSar', 'Value (SAR)')}</Label>
                <Input 
                  type="number" 
                  placeholder="150" 
                  value={newOfferForm.value}
                  onChange={(e) => setNewOfferForm(prev => ({ ...prev, value: e.target.value }))}
                  className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                  data-testid="input-offer-value"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[#0B1F3B] dark:text-white">{t('loyalty.minimumTier', 'Minimum Tier')} <span className="text-[#F97316]">*</span></Label>
              <Select value={newOfferForm.tier} onValueChange={(value) => setNewOfferForm(prev => ({ ...prev, tier: value }))}>
                <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-offer-tier">
                  <SelectValue placeholder={t('loyalty.selectTier', 'Select minimum tier')} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#151A23]">
                  <SelectItem value="bronze">{t('loyalty.tierBronze', 'Bronze')}</SelectItem>
                  <SelectItem value="silver">{t('loyalty.tierSilver', 'Silver')}</SelectItem>
                  <SelectItem value="gold">{t('loyalty.tierGold', 'Gold')}</SelectItem>
                  <SelectItem value="platinum">{t('loyalty.tierPlatinum', 'Platinum')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                className="flex-1 border-[#E2E8F0] dark:border-[#232A36]"
                onClick={() => setIsOfferDialogOpen(false)} 
                data-testid="button-cancel-offer"
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
                onClick={handleCreateOffer} 
                data-testid="button-create-offer"
              >
                {t('loyalty.createOffer', 'Create Offer')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingOffer} onOpenChange={(open) => !open && setEditingOffer(null)}>
        <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]">
                <Edit className="w-4 h-4 text-white" />
              </div>
              {t('loyalty.editOffer', 'Edit Offer')}: {editingOffer?.offerName}
            </DialogTitle>
            <DialogDescription className="text-[#64748B]">{t('loyalty.modifyReward', 'Modify reward details')}</DialogDescription>
          </DialogHeader>
          {editingOffer && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-xl bg-[#0A5ED7]/5 border border-[#0A5ED7]/20">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-[#64748B]">{t('loyalty.totalRedemptions', 'Total Redemptions')}</p>
                  <p className="text-2xl font-bold text-[#0A5ED7]">{editingOffer.redemptionCount}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[#0B1F3B] dark:text-white">{t('loyalty.offerName', 'Offer Name')}</Label>
                <Input 
                  defaultValue={editingOffer.offerName}
                  className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                  data-testid="input-edit-offer-name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#0B1F3B] dark:text-white">{t('loyalty.pointsCost', 'Points Cost')}</Label>
                  <Input 
                    type="number" 
                    defaultValue={editingOffer.pointsCost}
                    className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                    data-testid="input-edit-points-cost"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#0B1F3B] dark:text-white">{t('loyalty.valueSar', 'Value (SAR)')}</Label>
                  <Input 
                    type="number" 
                    defaultValue={editingOffer.discountValue}
                    className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                    data-testid="input-edit-value"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline"
                  className="flex-1 border-[#E2E8F0] dark:border-[#232A36]"
                  onClick={() => setEditingOffer(null)}
                  data-testid="button-cancel-edit-offer"
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
                  onClick={() => {
                    toast({
                      title: t('loyalty.offerUpdatedSuccess', 'Offer Updated'),
                      description: t('loyalty.offerUpdatedDesc', '{{offer}} has been updated successfully', { offer: editingOffer.offerName })
                    });
                    setEditingOffer(null);
                  }}
                  data-testid="button-save-offer"
                >
                  {t('common.save', 'Save Changes')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  const settingsTab = (
    <div className="space-y-6" data-testid="loyalty-settings">
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
            <div className="p-2 rounded-lg bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]">
              <Settings className="w-4 h-4 text-white" />
            </div>
            {t('loyalty.programSettings', 'Program Settings')}
          </CardTitle>
          <CardDescription className="text-[#64748B]">{t('loyalty.configureSettings', 'Configure loyalty program parameters')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#0B1F3B] dark:text-white">{t('loyalty.pointsPerSar', 'Points per SAR Spent')}</Label>
              <Input 
                type="number" 
                defaultValue="1" 
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="input-points-per-sar" 
              />
              <p className="text-xs text-[#64748B]">{t('loyalty.pointsPerSarHint', 'Number of points earned for every SAR spent')}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-[#0B1F3B] dark:text-white">{t('loyalty.pointsExpiry', 'Points Expiry (months)')}</Label>
              <Input 
                type="number" 
                defaultValue="24" 
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="input-points-expiry" 
              />
              <p className="text-xs text-[#64748B]">{t('loyalty.pointsExpiryHint', 'Points expire after this many months of inactivity')}</p>
            </div>
          </div>

          <div className="p-4 bg-[#F8FAFC] dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#0A5ED7]/10">
                <Gift className="w-5 h-5 text-[#0A5ED7]" />
              </div>
              <div>
                <p className="font-medium text-[#0B1F3B] dark:text-white">{t('loyalty.birthdayBonus', 'Birthday Bonus Points')}</p>
                <p className="text-sm text-[#64748B]">{t('loyalty.birthdayBonusDesc', 'Award bonus points on customer birthdays')}</p>
              </div>
            </div>
            <Input 
              type="number" 
              defaultValue="100" 
              className="w-24 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" 
              data-testid="input-birthday-bonus" 
            />
          </div>

          <div className="p-4 bg-[#F8FAFC] dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#10B981]/10">
                <Users className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <p className="font-medium text-[#0B1F3B] dark:text-white">{t('loyalty.referralBonus', 'Referral Bonus')}</p>
                <p className="text-sm text-[#64748B]">{t('loyalty.referralBonusDesc', 'Points for referring new customers')}</p>
              </div>
            </div>
            <Input 
              type="number" 
              defaultValue="250" 
              className="w-24 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" 
              data-testid="input-referral-bonus" 
            />
          </div>

          <div className="p-4 bg-[#F8FAFC] dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#F97316]/10">
                <Zap className="w-5 h-5 text-[#F97316]" />
              </div>
              <div>
                <p className="font-medium text-[#0B1F3B] dark:text-white">{t('loyalty.doublePointsDays', 'Double Points Days')}</p>
                <p className="text-sm text-[#64748B]">{t('loyalty.doublePointsDaysDesc', 'Enable promotional double points events')}</p>
              </div>
            </div>
            <Switch 
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#0A5ED7] data-[state=checked]:to-[#0BB3FF]"
              data-testid="switch-double-points"
            />
          </div>

          <Button 
            className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white mt-4"
            onClick={() => toast({ title: t('loyalty.settingsSaved', 'Settings Saved'), description: t('loyalty.settingsSavedDesc', 'Loyalty program settings have been updated') })}
            data-testid="button-save-settings"
          >
            {t('common.saveSettings', 'Save Settings')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const tabs = [
    { id: "overview", label: t('loyalty.overview', 'Overview'), icon: Sparkles, content: overviewTab },
    { id: "members", label: t('loyalty.members', 'Members'), icon: Users, content: membersTab },
    { id: "offers", label: t('loyalty.rewardsOffers', 'Rewards & Offers'), icon: Gift, content: offersTab },
    { id: "settings", label: t('common.settings', 'Settings'), icon: Settings, content: settingsTab },
  ];

  return (
    <TabsPageLayout
      title={t('loyalty.title', 'Customer Loyalty Program')}
      description={t('loyalty.description', 'Manage tiered rewards, points, and exclusive offers')}
      icon={Crown}
      tabs={tabs}
      defaultTab="overview"
    />
  );
}
