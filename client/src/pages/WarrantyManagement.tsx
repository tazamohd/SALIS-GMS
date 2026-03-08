import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Plus,
  Pencil,
  Trash2,
  Shield,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import {
  insertWarrantySchema,
  insertWarrantyClaimSchema,
  type Warranty,
  type WarrantyClaim,
  type Vehicle,
  type User,
} from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

interface WarrantyClaimWithWarranty {
  claim: WarrantyClaim;
  warranty: Warranty;
}

const warrantyFormSchema = insertWarrantySchema.extend({
  startDate: z.string().min(1, "Start date required"),
  endDate: z.string().min(1, "End date required"),
  mileageLimit: z.string().optional().transform(val => val && val !== "" ? parseInt(val) : undefined),
  currentMileage: z.string().optional().transform(val => val && val !== "" ? parseInt(val) : undefined),
});

const claimFormSchema = insertWarrantyClaimSchema.extend({
  claimDate: z.string().min(1, "Claim date required"),
  claimAmount: z.string().optional().transform(val => val && val !== "" ? parseFloat(val) : undefined),
  approvedAmount: z.string().optional().transform(val => val && val !== "" ? parseFloat(val) : undefined),
  paymentDate: z.string().optional(),
});

type WarrantyFormData = z.input<typeof warrantyFormSchema>;
type ClaimFormData = z.input<typeof claimFormSchema>;

export default function WarrantyManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("active");
  const [isWarrantyDialogOpen, setIsWarrantyDialogOpen] = useState(false);
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  const [editingWarrantyId, setEditingWarrantyId] = useState<string | null>(null);
  const [editingClaimId, setEditingClaimId] = useState<string | null>(null);

  const { data: activeWarranties = [], isLoading: activeLoading } = useQuery<Warranty[]>({
    queryKey: ["/api/warranties/active"],
    enabled: selectedTab === "active",
  });

  const { data: expiredWarranties = [], isLoading: expiredLoading } = useQuery<Warranty[]>({
    queryKey: ["/api/warranties/expired"],
    enabled: selectedTab === "expired",
  });

  const { data: expiringWarranties = [] } = useQuery<Warranty[]>({
    queryKey: ["/api/warranties/expiring?days=30"],
  });

  const { data: claims = [], isLoading: claimsLoading } = useQuery<WarrantyClaimWithWarranty[]>({
    queryKey: ["/api/warranty-claims"],
    enabled: selectedTab === "claims",
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
    enabled: isWarrantyDialogOpen,
  });

  const { data: customers = [] } = useQuery<User[]>({
    queryKey: ["/api/customers"],
    enabled: isWarrantyDialogOpen,
  });

  const { data: allWarranties = [] } = useQuery<Warranty[]>({
    queryKey: ["/api/warranties"],
    enabled: isClaimDialogOpen,
  });

  const warrantyForm = useForm<WarrantyFormData>({
    resolver: zodResolver(warrantyFormSchema),
    defaultValues: {
      warrantyType: "parts",
      relatedType: "job_card",
      relatedId: "",
      vehicleId: "",
      customerId: "",
      warrantyNumber: "",
      provider: "garage",
      providerName: "",
      coverageDescription: "",
      startDate: "",
      endDate: "",
      mileageLimit: "",
      currentMileage: "",
      terms: "",
      exclusions: "",
      isTransferable: false,
      documentUrl: "",
    },
  });

  const claimForm = useForm<ClaimFormData>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      warrantyId: "",
      claimNumber: "",
      jobCardId: "",
      claimDate: new Date().toISOString().split("T")[0],
      issueDescription: "",
      claimAmount: "",
      approvedAmount: "",
      rejectionReason: "",
      approvalNotes: "",
      paymentDate: "",
    },
  });

  const warrantyMutation = useMutation({
    mutationFn: async (data: WarrantyFormData) => {
      const parsed = warrantyFormSchema.parse(data);
      if (editingWarrantyId) {
        return await apiRequest("PATCH", `/api/warranties/${editingWarrantyId}`, parsed);
      }
      return await apiRequest("POST", "/api/warranties", parsed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warranties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/warranties/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/warranties/expired"] });
      queryClient.invalidateQueries({ queryKey: ["/api/warranties/expiring"] });
      setIsWarrantyDialogOpen(false);
      setEditingWarrantyId(null);
      warrantyForm.reset();
      toast({
        title: editingWarrantyId ? t('payments.warranty.warrantyUpdated', 'Warranty Updated') : t('payments.warranty.warrantyCreated', 'Warranty Created'),
        description: t('common.changesSaved', 'Changes saved successfully'),
      });
    },
  });

  const claimMutation = useMutation({
    mutationFn: async (data: ClaimFormData) => {
      const parsed = claimFormSchema.parse(data);
      if (editingClaimId) {
        return await apiRequest("PATCH", `/api/warranty-claims/${editingClaimId}`, parsed);
      }
      return await apiRequest("POST", "/api/warranty-claims", parsed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warranty-claims"] });
      setIsClaimDialogOpen(false);
      setEditingClaimId(null);
      claimForm.reset();
      toast({
        title: editingClaimId ? t('payments.warranty.claimUpdated', 'Claim Updated') : t('payments.warranty.claimSubmitted', 'Claim Submitted'),
        description: t('common.changesSaved', 'Changes saved successfully'),
      });
    },
  });

  const deleteWarrantyMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/warranties/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warranties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/warranties/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/warranties/expired"] });
      toast({ title: t('payments.warranty.warrantyDeleted', 'Warranty Deleted'), description: t('payments.warranty.warrantyRemovedSuccess', 'Warranty removed successfully') });
    },
  });

  const deleteClaimMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/warranty-claims/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warranty-claims"] });
      toast({ title: t('payments.warranty.claimDeleted', 'Claim Deleted'), description: t('payments.warranty.claimRemovedSuccess', 'Claim removed successfully') });
    },
  });

  const handleEditWarranty = (warranty: Warranty) => {
    setEditingWarrantyId(warranty.id);
    warrantyForm.reset({
      warrantyType: warranty.warrantyType,
      relatedType: warranty.relatedType,
      relatedId: warranty.relatedId,
      vehicleId: warranty.vehicleId || "",
      customerId: warranty.customerId || "",
      warrantyNumber: warranty.warrantyNumber || "",
      provider: warranty.provider || "garage",
      providerName: warranty.providerName || "",
      coverageDescription: warranty.coverageDescription,
      startDate: warranty.startDate ? format(new Date(warranty.startDate), "yyyy-MM-dd") : "",
      endDate: warranty.endDate ? format(new Date(warranty.endDate), "yyyy-MM-dd") : "",
      mileageLimit: warranty.mileageLimit?.toString() || "",
      currentMileage: warranty.currentMileage?.toString() || "",
      terms: warranty.terms || "",
      exclusions: warranty.exclusions || "",
      isTransferable: warranty.isTransferable || false,
      documentUrl: warranty.documentUrl || "",
    });
    setIsWarrantyDialogOpen(true);
  };

  const handleEditClaim = (item: WarrantyClaimWithWarranty) => {
    setEditingClaimId(item.claim.id);
    claimForm.reset({
      warrantyId: item.claim.warrantyId,
      claimNumber: item.claim.claimNumber || "",
      jobCardId: item.claim.jobCardId || "",
      claimDate: item.claim.claimDate ? format(new Date(item.claim.claimDate), "yyyy-MM-dd") : "",
      issueDescription: item.claim.issueDescription,
      claimAmount: item.claim.claimAmount?.toString() || "",
      approvedAmount: item.claim.approvedAmount?.toString() || "",
      rejectionReason: item.claim.rejectionReason || "",
      approvalNotes: item.claim.approvalNotes || "",
      paymentDate: item.claim.paymentDate ? format(new Date(item.claim.paymentDate), "yyyy-MM-dd") : "",
    });
    setIsClaimDialogOpen(true);
  };

  const getStatusBadge = (warranty: Warranty) => {
    const daysUntilExpiry = differenceInDays(new Date(warranty.endDate), new Date());
    
    if (warranty.status === "expired" || daysUntilExpiry < 0) {
      return <Badge variant="secondary" className="bg-gray-100 text-[#64748B] dark:bg-gray-800 dark:text-gray-400" data-testid={`badge-warranty-status-${warranty.id}`}>{t('payments.warranty.expired', 'Expired')}</Badge>;
    }
    if (daysUntilExpiry <= 30) {
      return <Badge className="bg-[#F97316] text-white" data-testid={`badge-warranty-status-${warranty.id}`}>{t('payments.warranty.expiringSoon', 'Expiring Soon')}</Badge>;
    }
    return <Badge className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" data-testid={`badge-warranty-status-${warranty.id}`}>{t('payments.warranty.active', 'Active')}</Badge>;
  };

  const getClaimStatusBadge = (status: string, claimId: string) => {
    const statusColors: Record<string, string> = {
      submitted: "bg-[#64748B] text-white",
      under_review: "bg-[#F97316] text-white",
      approved: "bg-[#0A5ED7] text-white",
      rejected: "bg-red-500 text-white",
      paid: "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white",
    };
    
    return (
      <Badge className={statusColors[status] || "bg-[#64748B] text-white"} data-testid={`badge-claim-status-${claimId}`}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0B1F3B] dark:text-white">
            Warranty Management
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Track parts & labor warranties, process claims, and monitor expiration dates
          </p>
        </div>
        {expiringWarranties.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#F97316]/10 border border-[#F97316]/20 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-[#F97316]" />
            <span className="text-sm text-[#F97316]">
              {expiringWarranties.length} {expiringWarranties.length === 1 ? "warranty" : "warranties"} expiring within 30 days
            </span>
          </div>
        )}
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
          <TabsTrigger value="active" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white" data-testid="tab-active-warranties">
            <Shield className="h-4 w-4" />
            Active Warranties
          </TabsTrigger>
          <TabsTrigger value="expired" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white" data-testid="tab-expired-warranties">
            <AlertTriangle className="h-4 w-4" />
            Expired
          </TabsTrigger>
          <TabsTrigger value="claims" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white" data-testid="tab-claims">
            <FileText className="h-4 w-4" />
            Claims
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-[#0B1F3B] dark:text-white">
              Active Warranties
            </h2>
            <Button
              onClick={() => {
                setEditingWarrantyId(null);
                warrantyForm.reset();
                setIsWarrantyDialogOpen(true);
              }}
              className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white"
              data-testid="button-create-warranty"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Warranty
            </Button>
          </div>

          <div className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-white dark:bg-[#151A23]">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F8FAFC] dark:bg-[#0E1117] border-b border-[#E2E8F0] dark:border-[#232A36]">
                  <TableHead className="text-[#0B1F3B] dark:text-white">Warranty #</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Type</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Coverage</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Provider</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Start Date</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">End Date</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Status</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-[#64748B]">
                      Loading warranties...
                    </TableCell>
                  </TableRow>
                ) : activeWarranties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-[#64748B]">
                      No active warranties found. Create one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  activeWarranties.map((warranty) => (
                    <TableRow key={warranty.id} className="border-b border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-warranty-${warranty.id}`}>
                      <TableCell className="font-medium text-[#0B1F3B] dark:text-white" data-testid={`text-warranty-number-${warranty.id}`}>
                        {warranty.warrantyNumber || "—"}
                      </TableCell>
                      <TableCell className="text-[#64748B] capitalize" data-testid={`text-warranty-type-${warranty.id}`}>{warranty.warrantyType}</TableCell>
                      <TableCell className="text-[#64748B] max-w-xs truncate" data-testid={`text-warranty-coverage-${warranty.id}`}>{warranty.coverageDescription}</TableCell>
                      <TableCell className="text-[#64748B]" data-testid={`text-warranty-provider-${warranty.id}`}>{warranty.providerName || warranty.provider}</TableCell>
                      <TableCell className="text-[#64748B]" data-testid={`text-warranty-start-date-${warranty.id}`}>
                        {warranty.startDate ? format(new Date(warranty.startDate), "MMM dd, yyyy") : "—"}
                      </TableCell>
                      <TableCell className="text-[#64748B]" data-testid={`text-warranty-end-date-${warranty.id}`}>
                        {warranty.endDate ? format(new Date(warranty.endDate), "MMM dd, yyyy") : "—"}
                      </TableCell>
                      <TableCell>{getStatusBadge(warranty)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditWarranty(warranty)}
                            className="border-[#E2E8F0] dark:border-[#232A36]"
                            data-testid={`button-edit-warranty-${warranty.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteWarrantyMutation.mutate(warranty.id)}
                            className="border-[#E2E8F0] dark:border-[#232A36] hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20"
                            data-testid={`button-delete-warranty-${warranty.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-[#0B1F3B] dark:text-white">
              Expired Warranties
            </h2>
          </div>

          <div className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-white dark:bg-[#151A23]">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F8FAFC] dark:bg-[#0E1117] border-b border-[#E2E8F0] dark:border-[#232A36]">
                  <TableHead className="text-[#0B1F3B] dark:text-white">Warranty #</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Type</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Coverage</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Provider</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Expired On</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiredLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-[#64748B]">
                      Loading expired warranties...
                    </TableCell>
                  </TableRow>
                ) : expiredWarranties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-[#64748B]">
                      No expired warranties found.
                    </TableCell>
                  </TableRow>
                ) : (
                  expiredWarranties.map((warranty) => (
                    <TableRow key={warranty.id} className="border-b border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-expired-warranty-${warranty.id}`}>
                      <TableCell className="font-medium text-[#0B1F3B] dark:text-white" data-testid={`text-expired-warranty-number-${warranty.id}`}>
                        {warranty.warrantyNumber || "—"}
                      </TableCell>
                      <TableCell className="text-[#64748B] capitalize" data-testid={`text-expired-warranty-type-${warranty.id}`}>{warranty.warrantyType}</TableCell>
                      <TableCell className="text-[#64748B] max-w-xs truncate" data-testid={`text-expired-warranty-coverage-${warranty.id}`}>{warranty.coverageDescription}</TableCell>
                      <TableCell className="text-[#64748B]" data-testid={`text-expired-warranty-provider-${warranty.id}`}>{warranty.providerName || warranty.provider}</TableCell>
                      <TableCell className="text-[#64748B]" data-testid={`text-expired-warranty-end-date-${warranty.id}`}>
                        {warranty.endDate ? format(new Date(warranty.endDate), "MMM dd, yyyy") : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteWarrantyMutation.mutate(warranty.id)}
                          className="border-[#E2E8F0] dark:border-[#232A36] hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20"
                          data-testid={`button-delete-expired-warranty-${warranty.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="claims" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-[#0B1F3B] dark:text-white">
              Warranty Claims
            </h2>
            <Button
              onClick={() => {
                setEditingClaimId(null);
                claimForm.reset();
                setIsClaimDialogOpen(true);
              }}
              className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white"
              data-testid="button-create-claim"
            >
              <Plus className="mr-2 h-4 w-4" />
              Submit Claim
            </Button>
          </div>

          <div className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-white dark:bg-[#151A23]">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F8FAFC] dark:bg-[#0E1117] border-b border-[#E2E8F0] dark:border-[#232A36]">
                  <TableHead className="text-[#0B1F3B] dark:text-white">Claim #</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Warranty</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Issue</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Claim Date</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Amount</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white">Status</TableHead>
                  <TableHead className="text-[#0B1F3B] dark:text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claimsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-[#64748B]">
                      Loading claims...
                    </TableCell>
                  </TableRow>
                ) : claims.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-[#64748B]">
                      No warranty claims found. Submit one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  claims.map((item) => (
                    <TableRow key={item.claim.id} className="border-b border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-claim-${item.claim.id}`}>
                      <TableCell className="font-medium text-[#0B1F3B] dark:text-white" data-testid={`text-claim-number-${item.claim.id}`}>
                        {item.claim.claimNumber || "—"}
                      </TableCell>
                      <TableCell className="text-[#64748B]" data-testid={`text-claim-warranty-${item.claim.id}`}>
                        {item.warranty?.warrantyNumber || "—"}
                      </TableCell>
                      <TableCell className="text-[#64748B] max-w-xs truncate" data-testid={`text-claim-issue-${item.claim.id}`}>
                        {item.claim.issueDescription}
                      </TableCell>
                      <TableCell className="text-[#64748B]" data-testid={`text-claim-date-${item.claim.id}`}>
                        {item.claim.claimDate ? format(new Date(item.claim.claimDate), "MMM dd, yyyy") : "—"}
                      </TableCell>
                      <TableCell className="text-[#0B1F3B] dark:text-white font-medium" data-testid={`text-claim-amount-${item.claim.id}`}>
                        ${item.claim.claimAmount?.toLocaleString() || "—"}
                      </TableCell>
                      <TableCell>{getClaimStatusBadge(item.claim.status || "submitted", item.claim.id)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClaim(item)}
                            className="border-[#E2E8F0] dark:border-[#232A36]"
                            data-testid={`button-edit-claim-${item.claim.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteClaimMutation.mutate(item.claim.id)}
                            className="border-[#E2E8F0] dark:border-[#232A36] hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20"
                            data-testid={`button-delete-claim-${item.claim.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isWarrantyDialogOpen} onOpenChange={setIsWarrantyDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">
              {editingWarrantyId ? "Edit Warranty" : "Add New Warranty"}
            </DialogTitle>
            <DialogDescription className="text-[#64748B]">
              {editingWarrantyId ? "Update warranty details" : "Create a new warranty record"}
            </DialogDescription>
          </DialogHeader>
          <Form {...warrantyForm}>
            <form onSubmit={warrantyForm.handleSubmit((data) => warrantyMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={warrantyForm.control}
                  name="warrantyNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">Warranty Number</FormLabel>
                      <FormControl>
                        <Input placeholder="WRN-001" {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={warrantyForm.control}
                  name="warrantyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">Warranty Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                          <SelectItem value="parts">Parts</SelectItem>
                          <SelectItem value="labor">Labor</SelectItem>
                          <SelectItem value="full">Full Coverage</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={warrantyForm.control}
                name="coverageDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">Coverage Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe what is covered..." {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={warrantyForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={warrantyForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsWarrantyDialogOpen(false)} className="border-[#E2E8F0] dark:border-[#232A36]">
                  Cancel
                </Button>
                <Button type="submit" disabled={warrantyMutation.isPending} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90">
                  {warrantyMutation.isPending ? "Saving..." : editingWarrantyId ? "Update Warranty" : "Create Warranty"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isClaimDialogOpen} onOpenChange={setIsClaimDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">
              {editingClaimId ? "Edit Claim" : "Submit New Claim"}
            </DialogTitle>
            <DialogDescription className="text-[#64748B]">
              {editingClaimId ? "Update claim details" : "Submit a new warranty claim"}
            </DialogDescription>
          </DialogHeader>
          <Form {...claimForm}>
            <form onSubmit={claimForm.handleSubmit((data) => claimMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={claimForm.control}
                  name="claimNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">Claim Number</FormLabel>
                      <FormControl>
                        <Input placeholder="CLM-001" {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={claimForm.control}
                  name="warrantyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">Warranty</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                            <SelectValue placeholder="Select warranty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                          {allWarranties.map((w) => (
                            <SelectItem key={w.id} value={w.id}>
                              {w.warrantyNumber || w.id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={claimForm.control}
                name="issueDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">Issue Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the issue..." {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={claimForm.control}
                  name="claimDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">Claim Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={claimForm.control}
                  name="claimAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">Claim Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsClaimDialogOpen(false)} className="border-[#E2E8F0] dark:border-[#232A36]">
                  Cancel
                </Button>
                <Button type="submit" disabled={claimMutation.isPending} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90">
                  {claimMutation.isPending ? "Saving..." : editingClaimId ? "Update Claim" : "Submit Claim"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
