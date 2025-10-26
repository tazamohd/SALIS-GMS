import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, FileText, TrendingUp, DollarSign, Plus, Edit, Trash2, Eye, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertFranchiseGroupSchema, insertFranchiseContractSchema, insertFranchiseKpiSchema, insertRevenueSharingRuleSchema } from "@shared/schema";
import { z } from "zod";

type FranchiseGroup = {
  id: string;
  name: string;
  parentGroupId: string | null;
  description: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type FranchiseContract = {
  id: string;
  franchiseGroupId: string;
  branchId: string;
  contractNumber: string;
  startDate: Date;
  endDate: Date | null;
  status: string;
  signedByFranchisor: string | null;
  signedByFranchisee: string | null;
  terms: any;
  royaltyPercentage: string | null;
  marketingFeePercentage: string | null;
  territoryDescription: string | null;
  documentUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type FranchiseKpi = {
  id: string;
  branchId: string;
  month: string;
  revenueTarget: string;
  revenueActual: string | null;
  customerSatisfactionTarget: string;
  customerSatisfactionActual: string | null;
  vehiclesServicedTarget: number;
  vehiclesServicedActual: number | null;
  averageRepairTimeTarget: string;
  averageRepairTimeActual: string | null;
  employeeTurnoverRate: string | null;
  complianceScore: string | null;
  notes: string | null;
  createdAt: Date;
};

type RevenueSharingRule = {
  id: string;
  franchiseGroupId: string;
  ruleName: string;
  sharePercentageFranchisor: string;
  sharePercentageFranchisee: string;
  revenueType: string;
  minRevenueThreshold: string | null;
  maxRevenueThreshold: string | null;
  effectiveDate: Date;
  expirationDate: Date | null;
  isActive: boolean;
  createdAt: Date;
};

export default function FranchiseManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("groups");
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [showContractDialog, setShowContractDialog] = useState(false);
  const [showKpiDialog, setShowKpiDialog] = useState(false);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<FranchiseGroup | null>(null);
  const [editingContract, setEditingContract] = useState<FranchiseContract | null>(null);
  const [editingKpi, setEditingKpi] = useState<FranchiseKpi | null>(null);
  const [editingRule, setEditingRule] = useState<RevenueSharingRule | null>(null);

  const { data: franchiseGroups = [], isLoading: groupsLoading } = useQuery<FranchiseGroup[]>({
    queryKey: ["/api/franchise-groups"],
  });

  const { data: franchiseContracts = [], isLoading: contractsLoading } = useQuery<FranchiseContract[]>({
    queryKey: ["/api/franchise-contracts"],
  });

  const { data: revenueSharingRules = [], isLoading: rulesLoading } = useQuery<RevenueSharingRule[]>({
    queryKey: ["/api/revenue-sharing-rules"],
    enabled: false,
  });

  const groupForm = useForm<any>({
    defaultValues: {
      name: "",
      parentGroupId: undefined,
      description: undefined,
      contactEmail: undefined,
      contactPhone: undefined,
      logoUrl: undefined,
      isActive: true,
    },
  });

  const contractForm = useForm<any>({
    defaultValues: {
      franchiseGroupId: "",
      branchId: "",
      contractNumber: "",
      startDate: new Date(),
      endDate: undefined,
      status: "draft",
      signedByFranchisor: undefined,
      signedByFranchisee: undefined,
      terms: {},
      royaltyPercentage: undefined,
      marketingFeePercentage: undefined,
      territoryDescription: undefined,
      documentUrl: undefined,
    },
  });

  const kpiForm = useForm<any>({
    defaultValues: {
      branchId: "",
      month: new Date().toISOString().slice(0, 7),
      revenueTarget: "0",
      revenueActual: undefined,
      customerSatisfactionTarget: "4.5",
      customerSatisfactionActual: undefined,
      vehiclesServicedTarget: 0,
      vehiclesServicedActual: undefined,
      averageRepairTimeTarget: "0",
      averageRepairTimeActual: undefined,
      employeeTurnoverRate: undefined,
      complianceScore: undefined,
      notes: undefined,
    },
  });

  const ruleForm = useForm<any>({
    defaultValues: {
      franchiseGroupId: "",
      ruleName: "",
      sharePercentageFranchisor: "0",
      sharePercentageFranchisee: "100",
      revenueType: "all",
      minRevenueThreshold: undefined,
      maxRevenueThreshold: undefined,
      effectiveDate: new Date(),
      expirationDate: undefined,
      isActive: true,
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/franchise-groups", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-groups"] });
      toast({ title: "Franchise group created successfully" });
      setShowGroupDialog(false);
      groupForm.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error creating franchise group", description: error.message, variant: "destructive" });
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest(`/api/franchise-groups/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-groups"] });
      toast({ title: "Franchise group updated successfully" });
      setShowGroupDialog(false);
      setEditingGroup(null);
      groupForm.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error updating franchise group", description: error.message, variant: "destructive" });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/franchise-groups/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-groups"] });
      toast({ title: "Franchise group deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error deleting franchise group", description: error.message, variant: "destructive" });
    },
  });

  const createContractMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/franchise-contracts", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-contracts"] });
      toast({ title: "Franchise contract created successfully" });
      setShowContractDialog(false);
      contractForm.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error creating franchise contract", description: error.message, variant: "destructive" });
    },
  });

  const updateContractMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest(`/api/franchise-contracts/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-contracts"] });
      toast({ title: "Franchise contract updated successfully" });
      setShowContractDialog(false);
      setEditingContract(null);
      contractForm.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error updating franchise contract", description: error.message, variant: "destructive" });
    },
  });

  const createKpiMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/franchise-kpis", "POST", data),
    onSuccess: () => {
      toast({ title: "Franchise KPI created successfully" });
      setShowKpiDialog(false);
      kpiForm.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error creating franchise KPI", description: error.message, variant: "destructive" });
    },
  });

  const createRuleMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/revenue-sharing-rules", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/revenue-sharing-rules"] });
      toast({ title: "Revenue sharing rule created successfully" });
      setShowRuleDialog(false);
      ruleForm.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error creating revenue sharing rule", description: error.message, variant: "destructive" });
    },
  });

  const onGroupSubmit = (data: any) => {
    if (editingGroup) {
      updateGroupMutation.mutate({ id: editingGroup.id, data });
    } else {
      createGroupMutation.mutate(data);
    }
  };

  const onContractSubmit = (data: any) => {
    if (editingContract) {
      updateContractMutation.mutate({ id: editingContract.id, data });
    } else {
      createContractMutation.mutate(data);
    }
  };

  const onKpiSubmit = (data: any) => {
    createKpiMutation.mutate(data);
  };

  const onRuleSubmit = (data: any) => {
    createRuleMutation.mutate(data);
  };

  const handleEditGroup = (group: FranchiseGroup) => {
    setEditingGroup(group);
    groupForm.reset({
      name: group.name,
      parentGroupId: group.parentGroupId || undefined,
      description: group.description || undefined,
      contactEmail: group.contactEmail || undefined,
      contactPhone: group.contactPhone || undefined,
      logoUrl: group.logoUrl || undefined,
      isActive: group.isActive,
    });
    setShowGroupDialog(true);
  };

  const handleEditContract = (contract: FranchiseContract) => {
    setEditingContract(contract);
    contractForm.reset({
      franchiseGroupId: contract.franchiseGroupId,
      branchId: contract.branchId,
      contractNumber: contract.contractNumber,
      startDate: new Date(contract.startDate),
      endDate: contract.endDate ? new Date(contract.endDate) : undefined,
      status: contract.status,
      signedByFranchisor: contract.signedByFranchisor || undefined,
      signedByFranchisee: contract.signedByFranchisee || undefined,
      terms: contract.terms,
      royaltyPercentage: contract.royaltyPercentage || undefined,
      marketingFeePercentage: contract.marketingFeePercentage || undefined,
      territoryDescription: contract.territoryDescription || undefined,
      documentUrl: contract.documentUrl || undefined,
    });
    setShowContractDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      draft: { variant: "outline", icon: AlertCircle },
      active: { variant: "default", icon: CheckCircle2 },
      pending: { variant: "secondary", icon: AlertCircle },
      expired: { variant: "destructive", icon: XCircle },
    };

    const config = variants[status] || variants.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} data-testid={`status-${status}`} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-background dark:bg-background">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-foreground" data-testid="text-page-title">Franchise Command Center</h1>
        <p className="text-muted-foreground dark:text-muted-foreground" data-testid="text-page-description">
          Manage franchise groups, contracts, KPIs, and revenue sharing across your network
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted dark:bg-muted" data-testid="tabs-navigation">
          <TabsTrigger value="groups" data-testid="tab-groups" className="gap-2">
            <Building2 className="h-4 w-4" />
            Franchise Groups
          </TabsTrigger>
          <TabsTrigger value="contracts" data-testid="tab-contracts" className="gap-2">
            <FileText className="h-4 w-4" />
            Contracts
          </TabsTrigger>
          <TabsTrigger value="kpis" data-testid="tab-kpis" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            KPIs
          </TabsTrigger>
          <TabsTrigger value="revenue" data-testid="tab-revenue" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Revenue Sharing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground dark:text-foreground">Franchise Groups</h2>
            <Button onClick={() => { setEditingGroup(null); groupForm.reset(); setShowGroupDialog(true); }} data-testid="button-add-group">
              <Plus className="h-4 w-4 mr-2" />
              Add Franchise Group
            </Button>
          </div>

          <Card className="bg-card dark:bg-card border-border dark:border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border dark:border-border">
                    <TableHead className="text-foreground dark:text-foreground">Name</TableHead>
                    <TableHead className="text-foreground dark:text-foreground">Contact</TableHead>
                    <TableHead className="text-foreground dark:text-foreground">Status</TableHead>
                    <TableHead className="text-foreground dark:text-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupsLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground dark:text-muted-foreground">Loading...</TableCell>
                    </TableRow>
                  ) : franchiseGroups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground dark:text-muted-foreground">No franchise groups found</TableCell>
                    </TableRow>
                  ) : (
                    franchiseGroups.map((group) => (
                      <TableRow key={group.id} className="border-border dark:border-border" data-testid={`row-group-${group.id}`}>
                        <TableCell className="text-foreground dark:text-foreground">
                          <div>
                            <div className="font-medium">{group.name}</div>
                            {group.description && (
                              <div className="text-sm text-muted-foreground dark:text-muted-foreground">{group.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground dark:text-foreground">
                          {group.contactEmail && <div className="text-sm">{group.contactEmail}</div>}
                          {group.contactPhone && <div className="text-sm text-muted-foreground dark:text-muted-foreground">{group.contactPhone}</div>}
                        </TableCell>
                        <TableCell>
                          {group.isActive ? (
                            <Badge variant="default" data-testid="status-active">Active</Badge>
                          ) : (
                            <Badge variant="secondary" data-testid="status-inactive">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditGroup(group)} data-testid={`button-edit-${group.id}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteGroupMutation.mutate(group.id)} data-testid={`button-delete-${group.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground dark:text-foreground">Franchise Contracts</h2>
            <Button onClick={() => { setEditingContract(null); contractForm.reset(); setShowContractDialog(true); }} data-testid="button-add-contract">
              <Plus className="h-4 w-4 mr-2" />
              Add Contract
            </Button>
          </div>

          <Card className="bg-card dark:bg-card border-border dark:border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border dark:border-border">
                    <TableHead className="text-foreground dark:text-foreground">Contract #</TableHead>
                    <TableHead className="text-foreground dark:text-foreground">Period</TableHead>
                    <TableHead className="text-foreground dark:text-foreground">Fees</TableHead>
                    <TableHead className="text-foreground dark:text-foreground">Status</TableHead>
                    <TableHead className="text-foreground dark:text-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contractsLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground dark:text-muted-foreground">Loading...</TableCell>
                    </TableRow>
                  ) : franchiseContracts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground dark:text-muted-foreground">No franchise contracts found</TableCell>
                    </TableRow>
                  ) : (
                    franchiseContracts.map((contract) => (
                      <TableRow key={contract.id} className="border-border dark:border-border" data-testid={`row-contract-${contract.id}`}>
                        <TableCell className="text-foreground dark:text-foreground font-medium">{contract.contractNumber}</TableCell>
                        <TableCell className="text-foreground dark:text-foreground">
                          <div className="text-sm">
                            {new Date(contract.startDate).toLocaleDateString()} - {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "Ongoing"}
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground dark:text-foreground">
                          <div className="text-sm">
                            {contract.royaltyPercentage && <div>Royalty: {contract.royaltyPercentage}%</div>}
                            {contract.marketingFeePercentage && <div className="text-muted-foreground dark:text-muted-foreground">Marketing: {contract.marketingFeePercentage}%</div>}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(contract.status)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditContract(contract)} data-testid={`button-edit-${contract.id}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground dark:text-foreground">Franchise KPIs</h2>
            <Button onClick={() => { setEditingKpi(null); kpiForm.reset(); setShowKpiDialog(true); }} data-testid="button-add-kpi">
              <Plus className="h-4 w-4 mr-2" />
              Add KPI Report
            </Button>
          </div>

          <Card className="bg-card dark:bg-card border-border dark:border-border">
            <CardHeader>
              <CardTitle className="text-foreground dark:text-foreground">Performance Metrics</CardTitle>
              <CardDescription className="text-muted-foreground dark:text-muted-foreground">Track franchise performance across key metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">Select a branch to view KPI reports</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground dark:text-foreground">Revenue Sharing Rules</h2>
            <Button onClick={() => { setEditingRule(null); ruleForm.reset(); setShowRuleDialog(true); }} data-testid="button-add-rule">
              <Plus className="h-4 w-4 mr-2" />
              Add Revenue Rule
            </Button>
          </div>

          <Card className="bg-card dark:bg-card border-border dark:border-border">
            <CardHeader>
              <CardTitle className="text-foreground dark:text-foreground">Revenue Distribution</CardTitle>
              <CardDescription className="text-muted-foreground dark:text-muted-foreground">Manage revenue sharing agreements between franchisor and franchisees</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">No revenue sharing rules configured</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showGroupDialog} onOpenChange={setShowGroupDialog}>
        <DialogContent className="bg-background dark:bg-background border-border dark:border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground dark:text-foreground">{editingGroup ? "Edit Franchise Group" : "Add Franchise Group"}</DialogTitle>
            <DialogDescription className="text-muted-foreground dark:text-muted-foreground">
              {editingGroup ? "Update franchise group information" : "Create a new franchise group"}
            </DialogDescription>
          </DialogHeader>
          <Form {...groupForm}>
            <form onSubmit={groupForm.handleSubmit(onGroupSubmit)} className="space-y-4">
              <FormField
                control={groupForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground dark:text-foreground">Group Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter group name" data-testid="input-group-name" className="bg-background dark:bg-background text-foreground dark:text-foreground border-input dark:border-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={groupForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground dark:text-foreground">Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} placeholder="Enter description" data-testid="input-group-description" className="bg-background dark:bg-background text-foreground dark:text-foreground border-input dark:border-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={groupForm.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground dark:text-foreground">Contact Email</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="email" placeholder="contact@example.com" data-testid="input-group-email" className="bg-background dark:bg-background text-foreground dark:text-foreground border-input dark:border-input" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={groupForm.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground dark:text-foreground">Contact Phone</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="tel" placeholder="+1234567890" data-testid="input-group-phone" className="bg-background dark:bg-background text-foreground dark:text-foreground border-input dark:border-input" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowGroupDialog(false)} className="border-input dark:border-input text-foreground dark:text-foreground">
                  Cancel
                </Button>
                <Button type="submit" disabled={createGroupMutation.isPending || updateGroupMutation.isPending} data-testid="button-submit-group">
                  {editingGroup ? "Update" : "Create"} Group
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showContractDialog} onOpenChange={setShowContractDialog}>
        <DialogContent className="bg-background dark:bg-background border-border dark:border-border max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground dark:text-foreground">{editingContract ? "Edit Contract" : "Add Franchise Contract"}</DialogTitle>
            <DialogDescription className="text-muted-foreground dark:text-muted-foreground">
              {editingContract ? "Update contract information" : "Create a new franchise contract"}
            </DialogDescription>
          </DialogHeader>
          <Form {...contractForm}>
            <form onSubmit={contractForm.handleSubmit(onContractSubmit)} className="space-y-4">
              <FormField
                control={contractForm.control}
                name="contractNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground dark:text-foreground">Contract Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="FC-2024-001" data-testid="input-contract-number" className="bg-background dark:bg-background text-foreground dark:text-foreground border-input dark:border-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={contractForm.control}
                  name="royaltyPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground dark:text-foreground">Royalty %</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="number" step="0.01" placeholder="5.00" data-testid="input-royalty" className="bg-background dark:bg-background text-foreground dark:text-foreground border-input dark:border-input" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={contractForm.control}
                  name="marketingFeePercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground dark:text-foreground">Marketing Fee %</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} type="number" step="0.01" placeholder="2.00" data-testid="input-marketing-fee" className="bg-background dark:bg-background text-foreground dark:text-foreground border-input dark:border-input" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={contractForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground dark:text-foreground">Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-contract-status" className="bg-background dark:bg-background text-foreground dark:text-foreground border-input dark:border-input">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background dark:bg-background border-border dark:border-border">
                        <SelectItem value="draft" className="text-foreground dark:text-foreground">Draft</SelectItem>
                        <SelectItem value="pending" className="text-foreground dark:text-foreground">Pending</SelectItem>
                        <SelectItem value="active" className="text-foreground dark:text-foreground">Active</SelectItem>
                        <SelectItem value="expired" className="text-foreground dark:text-foreground">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowContractDialog(false)} className="border-input dark:border-input text-foreground dark:text-foreground">
                  Cancel
                </Button>
                <Button type="submit" disabled={createContractMutation.isPending || updateContractMutation.isPending} data-testid="button-submit-contract">
                  {editingContract ? "Update" : "Create"} Contract
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
