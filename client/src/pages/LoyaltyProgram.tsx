import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
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
  Search
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from "recharts";

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
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);

  const tiers: LoyaltyTier[] = [
    { id: "1", tierName: "Bronze", tierNameAr: "برونزي", minPoints: 0, maxPoints: 999, pointsMultiplier: 1, discountPercentage: 0, color: "#CD7F32", icon: "medal", memberCount: 245 },
    { id: "2", tierName: "Silver", tierNameAr: "فضي", minPoints: 1000, maxPoints: 4999, pointsMultiplier: 1.25, discountPercentage: 5, color: "#C0C0C0", icon: "star", memberCount: 128 },
    { id: "3", tierName: "Gold", tierNameAr: "ذهبي", minPoints: 5000, maxPoints: 14999, pointsMultiplier: 1.5, discountPercentage: 10, color: "#FFD700", icon: "crown", memberCount: 67 },
    { id: "4", tierName: "Platinum", tierNameAr: "بلاتينيوم", minPoints: 15000, pointsMultiplier: 2, discountPercentage: 15, color: "#E5E4E2", icon: "diamond", memberCount: 23 },
  ];

  const members: LoyaltyMember[] = [
    { id: "1", customerName: "Ahmed Al-Rashid", email: "ahmed@example.com", tierName: "Gold", tierColor: "#FFD700", currentPoints: 7540, lifetimePoints: 12340, pointsToNextTier: 7460, memberSince: "2023-01-15" },
    { id: "2", customerName: "Fatima Hassan", email: "fatima@example.com", tierName: "Platinum", tierColor: "#E5E4E2", currentPoints: 18200, lifetimePoints: 25600, pointsToNextTier: 0, memberSince: "2022-06-20" },
    { id: "3", customerName: "Mohammed Khalid", email: "mohammed@example.com", tierName: "Silver", tierColor: "#C0C0C0", currentPoints: 2340, lifetimePoints: 4500, pointsToNextTier: 2660, memberSince: "2023-08-10" },
    { id: "4", customerName: "Sara Abdullah", email: "sara@example.com", tierName: "Bronze", tierColor: "#CD7F32", currentPoints: 450, lifetimePoints: 450, pointsToNextTier: 550, memberSince: "2024-02-01" },
  ];

  const offers: LoyaltyOffer[] = [
    { id: "1", offerName: "Free Oil Change", description: "Complimentary oil change service", pointsCost: 500, discountValue: 150, tierRequired: "Bronze", expiresAt: "2025-03-31", isActive: true, redemptionCount: 45 },
    { id: "2", offerName: "20% Off Brake Service", description: "20% discount on any brake service", pointsCost: 750, discountValue: 200, tierRequired: "Silver", expiresAt: "2025-06-30", isActive: true, redemptionCount: 23 },
    { id: "3", offerName: "Premium Detailing Package", description: "Full interior and exterior detailing", pointsCost: 1500, discountValue: 400, tierRequired: "Gold", expiresAt: "2025-12-31", isActive: true, redemptionCount: 12 },
    { id: "4", offerName: "VIP Service Package", description: "Priority service with loaner vehicle", pointsCost: 3000, discountValue: 800, tierRequired: "Platinum", expiresAt: "2025-12-31", isActive: true, redemptionCount: 5 },
  ];

  const tierDistributionData = tiers.map(tier => ({
    name: tier.tierName,
    value: tier.memberCount,
    color: tier.color,
  }));

  const pointsGrowthData = [
    { month: "Jan", earned: 12500, redeemed: 4500 },
    { month: "Feb", earned: 15200, redeemed: 5800 },
    { month: "Mar", earned: 18700, redeemed: 6200 },
    { month: "Apr", earned: 16400, redeemed: 7100 },
    { month: "May", earned: 21300, redeemed: 8500 },
    { month: "Jun", earned: 24800, redeemed: 9200 },
  ];

  const totalMembers = tiers.reduce((sum, tier) => sum + tier.memberCount, 0);
  const totalActiveOffers = offers.filter(o => o.isActive).length;
  const totalRedemptions = offers.reduce((sum, o) => sum + o.redemptionCount, 0);

  const overviewTab = (
    <div className="space-y-6" data-testid="loyalty-overview">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="card-total-members">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-3xl font-bold" data-testid="text-members-count">{totalMembers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-active-offers">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Offers</p>
                <p className="text-3xl font-bold" data-testid="text-offers-count">{totalActiveOffers}</p>
              </div>
              <Gift className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-redemptions">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Redemptions</p>
                <p className="text-3xl font-bold" data-testid="text-redemptions-count">{totalRedemptions}</p>
              </div>
              <Ticket className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-avg-points">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Points</p>
                <p className="text-3xl font-bold" data-testid="text-avg-points">2,450</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5" />
              Tier Distribution
            </CardTitle>
            <CardDescription>Members by loyalty tier</CardDescription>
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Points Activity
            </CardTitle>
            <CardDescription>Points earned vs redeemed</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={pointsGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="earned" fill="#10b981" name="Earned" />
                <Bar dataKey="redeemed" fill="#6366f1" name="Redeemed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Loyalty Tiers
          </CardTitle>
          <CardDescription>Tier benefits and requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className="p-4 border rounded-lg text-center"
                style={{ borderColor: tier.color, borderWidth: 2 }}
                data-testid={`tier-card-${tier.tierName.toLowerCase()}`}
              >
                <div 
                  className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: tier.color }}
                >
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg">{tier.tierName}</h3>
                <p className="text-sm text-muted-foreground mb-2">{tier.tierNameAr}</p>
                <div className="space-y-1 text-sm">
                  <p>{tier.minPoints.toLocaleString()}+ points</p>
                  <p className="text-green-600">{tier.pointsMultiplier}x points</p>
                  {tier.discountPercentage > 0 && (
                    <p className="text-blue-600">{tier.discountPercentage}% discount</p>
                  )}
                  <p className="text-muted-foreground">{tier.memberCount} members</p>
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-members"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {members.map((member) => (
              <div key={member.id} className="p-4 flex items-center justify-between" data-testid={`member-row-${member.id}`}>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: member.tierColor }}
                  >
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{member.customerName}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="text-center">
                  <Badge style={{ backgroundColor: member.tierColor, color: 'white' }}>
                    {member.tierName}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="font-bold">{member.currentPoints.toLocaleString()} pts</p>
                  <p className="text-sm text-muted-foreground">
                    {member.pointsToNextTier > 0 ? `${member.pointsToNextTier.toLocaleString()} to next tier` : 'Max tier'}
                  </p>
                </div>
                <div>
                  <Button variant="ghost" size="sm" data-testid={`button-view-member-${member.id}`}>View</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const offersTab = (
    <div className="space-y-6" data-testid="loyalty-offers">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Active Rewards</h3>
        <Button onClick={() => setIsOfferDialogOpen(true)} data-testid="button-add-offer">
          <Plus className="w-4 h-4 mr-2" />
          Add Offer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.map((offer) => (
          <Card key={offer.id} data-testid={`offer-card-${offer.id}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{offer.offerName}</CardTitle>
                <Badge variant={offer.isActive ? "default" : "secondary"}>
                  {offer.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{offer.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Points Cost:</span>
                  <span className="font-medium">{offer.pointsCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Value:</span>
                  <span className="font-medium text-green-600">SAR {offer.discountValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tier Required:</span>
                  <Badge variant="outline">{offer.tierRequired}+</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Redemptions:</span>
                  <span>{offer.redemptionCount}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1" data-testid={`button-edit-offer-${offer.id}`}>Edit</Button>
                <Button variant="outline" size="sm" className="flex-1" data-testid={`button-deactivate-offer-${offer.id}`}>Deactivate</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Offer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Offer Name</Label>
              <Input placeholder="e.g., Free Oil Change" />
            </div>
            <div>
              <Label>Description</Label>
              <Input placeholder="Describe the offer..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Points Cost</Label>
                <Input type="number" placeholder="500" />
              </div>
              <div>
                <Label>Value (SAR)</Label>
                <Input type="number" placeholder="150" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOfferDialogOpen(false)} data-testid="button-cancel-offer">Cancel</Button>
            <Button onClick={() => setIsOfferDialogOpen(false)} data-testid="button-create-offer">Create Offer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  const settingsTab = (
    <div className="space-y-6" data-testid="loyalty-settings">
      <Card>
        <CardHeader>
          <CardTitle>Program Settings</CardTitle>
          <CardDescription>Configure loyalty program parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Points per SAR Spent</Label>
              <Input type="number" defaultValue="1" data-testid="input-points-per-sar" />
            </div>
            <div>
              <Label>Points Expiry (months)</Label>
              <Input type="number" defaultValue="24" data-testid="input-points-expiry" />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Birthday Bonus Points</p>
              <p className="text-sm text-muted-foreground">Award bonus points on customer birthdays</p>
            </div>
            <Input type="number" defaultValue="100" className="w-24" data-testid="input-birthday-bonus" />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Referral Bonus</p>
              <p className="text-sm text-muted-foreground">Points for referring new customers</p>
            </div>
            <Input type="number" defaultValue="250" className="w-24" data-testid="input-referral-bonus" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const tabs = [
    { id: "overview", label: "Overview", icon: Sparkles, content: overviewTab },
    { id: "members", label: "Members", icon: Users, content: membersTab },
    { id: "offers", label: "Rewards & Offers", icon: Gift, content: offersTab },
    { id: "settings", label: "Settings", icon: Settings, content: settingsTab },
  ];

  return (
    <TabsPageLayout
      title="Customer Loyalty Program"
      description="Manage tiered rewards, points, and exclusive offers"
      icon={Crown}
      tabs={tabs}
      defaultTab="overview"
    />
  );
}
