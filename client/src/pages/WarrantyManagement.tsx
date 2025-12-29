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
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";

// Interface for warranty claims with warranty data
interface WarrantyClaimWithWarranty {
  claim: WarrantyClaim;
  warranty: Warranty;
}

// Extend insert schemas for form handling
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

  // Fetch active warranties
  const { data: activeWarranties = [], isLoading: activeLoading } = useQuery<Warranty[]>({
    queryKey: ["/api/warranties/active"],
    enabled: selectedTab === "active",
  });

  // Fetch expired warranties
  const { data: expiredWarranties = [], isLoading: expiredLoading } = useQuery<Warranty[]>({
    queryKey: ["/api/warranties/expired"],
    enabled: selectedTab === "expired",
  });

  // Fetch expiring warranties (within 30 days)
  const { data: expiringWarranties = [] } = useQuery<Warranty[]>({
    queryKey: ["/api/warranties/expiring?days=30"],
  });

  // Fetch warranty claims
  const { data: claims = [], isLoading: claimsLoading } = useQuery<WarrantyClaimWithWarranty[]>({
    queryKey: ["/api/warranty-claims"],
    enabled: selectedTab === "claims",
  });

  // Fetch vehicles for dropdown
  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
    enabled: isWarrantyDialogOpen,
  });

  // Fetch customers for dropdown
  const { data: customers = [] } = useQuery<User[]>({
    queryKey: ["/api/customers"],
    enabled: isWarrantyDialogOpen,
  });

  // Fetch all warranties for claim creation
  const { data: allWarranties = [] } = useQuery<Warranty[]>({
    queryKey: ["/api/warranties"],
    enabled: isClaimDialogOpen,
  });

  // Warranty Form
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

  // Claim Form
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

  // Create/Update Warranty Mutation
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

  // Create/Update Claim Mutation
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

  // Delete Mutations
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
      return <Badge variant="secondary" data-testid={`badge-warranty-status-${warranty.id}`}>{t('payments.warranty.expired', 'Expired')}</Badge>;
    }
    if (daysUntilExpiry <= 30) {
      return <Badge className="bg-salis-gray dark:bg-salis-gray-light text-white dark:text-salis-black" data-testid={`badge-warranty-status-${warranty.id}`}>{t('payments.warranty.expiringSoon', 'Expiring Soon')}</Badge>;
    }
    return <Badge className="bg-salis-black dark:bg-white text-white dark:text-salis-black" data-testid={`badge-warranty-status-${warranty.id}`}>{t('payments.warranty.active', 'Active')}</Badge>;
  };

  const getClaimStatusBadge = (status: string, claimId: string) => {
    const statusColors: Record<string, string> = {
      submitted: "bg-salis-gray dark:bg-salis-gray-light",
      under_review: "bg-salis-gray-dark dark:bg-salis-gray",
      approved: "bg-salis-black dark:bg-white",
      rejected: "bg-salis-gray dark:bg-salis-gray-light",
      paid: "bg-salis-black dark:bg-white",
    };
    
    return (
      <Badge className={`${statusColors[status] || "bg-salis-gray"} text-white dark:text-salis-black`} data-testid={`badge-claim-status-${claimId}`}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-white dark:bg-salis-black min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-montserrat font-semibold text-salis-black dark:text-white">
            Warranty Management
          </h1>
          <p className="text-sm text-salis-gray mt-1">
            Track parts & labor warranties, process claims, and monitor expiration dates
          </p>
        </div>
        {expiringWarranties.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-salis-gray-light dark:bg-salis-gray-dark rounded-lg">
            <AlertTriangle className="h-5 w-5 text-salis-black dark:text-white" />
            <span className="text-sm text-salis-black dark:text-white">
              {expiringWarranties.length} {expiringWarranties.length === 1 ? "warranty" : "warranties"} expiring within 30 days
            </span>
          </div>
        )}
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-salis-gray-light dark:bg-salis-gray-dark">
          <TabsTrigger value="active" className="flex items-center gap-2" data-testid="tab-active-warranties">
            <Shield className="h-4 w-4" />
            Active Warranties
          </TabsTrigger>
          <TabsTrigger value="expired" className="flex items-center gap-2" data-testid="tab-expired-warranties">
            <AlertTriangle className="h-4 w-4" />
            Expired
          </TabsTrigger>
          <TabsTrigger value="claims" className="flex items-center gap-2" data-testid="tab-claims">
            <FileText className="h-4 w-4" />
            Claims
          </TabsTrigger>
        </TabsList>

        {/* Active Warranties Tab */}
        <TabsContent value="active" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-salis-black dark:text-white">
              Active Warranties
            </h2>
            <Button
              onClick={() => {
                setEditingWarrantyId(null);
                warrantyForm.reset();
                setIsWarrantyDialogOpen(true);
              }}
              className="bg-salis-black dark:bg-white text-white dark:text-salis-black"
              data-testid="button-create-warranty"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Warranty
            </Button>
          </div>

          <div className="border border-salis-gray-light dark:border-salis-gray-dark rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-salis-gray-light dark:bg-salis-gray-dark">
                  <TableHead className="text-salis-black dark:text-white">Warranty #</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Type</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Coverage</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Provider</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Start Date</TableHead>
                  <TableHead className="text-salis-black dark:text-white">End Date</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Status</TableHead>
                  <TableHead className="text-salis-black dark:text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-salis-gray">
                      Loading warranties...
                    </TableCell>
                  </TableRow>
                ) : activeWarranties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-salis-gray">
                      No active warranties found. Create one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  activeWarranties.map((warranty) => (
                    <TableRow key={warranty.id} className="border-b border-salis-gray-light dark:border-salis-gray-dark" data-testid={`row-warranty-${warranty.id}`}>
                      <TableCell className="font-medium text-salis-black dark:text-white" data-testid={`text-warranty-number-${warranty.id}`}>
                        {warranty.warrantyNumber || "—"}
                      </TableCell>
                      <TableCell className="text-salis-gray capitalize" data-testid={`text-warranty-type-${warranty.id}`}>{warranty.warrantyType}</TableCell>
                      <TableCell className="text-salis-gray max-w-xs truncate" data-testid={`text-warranty-coverage-${warranty.id}`}>{warranty.coverageDescription}</TableCell>
                      <TableCell className="text-salis-gray" data-testid={`text-warranty-provider-${warranty.id}`}>{warranty.providerName || warranty.provider}</TableCell>
                      <TableCell className="text-salis-gray" data-testid={`text-warranty-start-date-${warranty.id}`}>
                        {warranty.startDate ? format(new Date(warranty.startDate), "MMM dd, yyyy") : "—"}
                      </TableCell>
                      <TableCell className="text-salis-gray" data-testid={`text-warranty-end-date-${warranty.id}`}>
                        {warranty.endDate ? format(new Date(warranty.endDate), "MMM dd, yyyy") : "—"}
                      </TableCell>
                      <TableCell>{getStatusBadge(warranty)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditWarranty(warranty)}
                            data-testid={`button-edit-warranty-${warranty.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteWarrantyMutation.mutate(warranty.id)}
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

        {/* Expired Warranties Tab */}
        <TabsContent value="expired" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-salis-black dark:text-white">
              Expired Warranties
            </h2>
          </div>

          <div className="border border-salis-gray-light dark:border-salis-gray-dark rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-salis-gray-light dark:bg-salis-gray-dark">
                  <TableHead className="text-salis-black dark:text-white">Warranty #</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Type</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Coverage</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Provider</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Expired On</TableHead>
                  <TableHead className="text-salis-black dark:text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiredLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-salis-gray">
                      Loading expired warranties...
                    </TableCell>
                  </TableRow>
                ) : expiredWarranties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-salis-gray">
                      No expired warranties found.
                    </TableCell>
                  </TableRow>
                ) : (
                  expiredWarranties.map((warranty) => (
                    <TableRow key={warranty.id} className="border-b border-salis-gray-light dark:border-salis-gray-dark" data-testid={`row-expired-warranty-${warranty.id}`}>
                      <TableCell className="font-medium text-salis-black dark:text-white" data-testid={`text-expired-warranty-number-${warranty.id}`}>
                        {warranty.warrantyNumber || "—"}
                      </TableCell>
                      <TableCell className="text-salis-gray capitalize" data-testid={`text-expired-warranty-type-${warranty.id}`}>{warranty.warrantyType}</TableCell>
                      <TableCell className="text-salis-gray max-w-xs truncate" data-testid={`text-expired-warranty-coverage-${warranty.id}`}>{warranty.coverageDescription}</TableCell>
                      <TableCell className="text-salis-gray" data-testid={`text-expired-warranty-provider-${warranty.id}`}>{warranty.providerName || warranty.provider}</TableCell>
                      <TableCell className="text-salis-gray" data-testid={`text-expired-warranty-end-date-${warranty.id}`}>
                        {warranty.endDate ? format(new Date(warranty.endDate), "MMM dd, yyyy") : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteWarrantyMutation.mutate(warranty.id)}
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

        {/* Claims Tab */}
        <TabsContent value="claims" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-salis-black dark:text-white">
              Warranty Claims
            </h2>
            <Button
              onClick={() => {
                setEditingClaimId(null);
                claimForm.reset();
                setIsClaimDialogOpen(true);
              }}
              className="bg-salis-black dark:bg-white text-white dark:text-salis-black"
              data-testid="button-create-claim"
            >
              <Plus className="mr-2 h-4 w-4" />
              Submit Claim
            </Button>
          </div>

          <div className="border border-salis-gray-light dark:border-salis-gray-dark rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-salis-gray-light dark:bg-salis-gray-dark">
                  <TableHead className="text-salis-black dark:text-white">Claim #</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Warranty</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Issue</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Claim Date</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Claim Amount</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Approved Amount</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Status</TableHead>
                  <TableHead className="text-salis-black dark:text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claimsLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-salis-gray">
                      Loading claims...
                    </TableCell>
                  </TableRow>
                ) : claims.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-salis-gray">
                      No claims submitted yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  claims.map((item) => (
                    <TableRow key={item.claim.id} className="border-b border-salis-gray-light dark:border-salis-gray-dark" data-testid={`row-claim-${item.claim.id}`}>
                      <TableCell className="font-medium text-salis-black dark:text-white" data-testid={`text-claim-number-${item.claim.id}`}>
                        {item.claim.claimNumber || "—"}
                      </TableCell>
                      <TableCell className="text-salis-gray" data-testid={`text-claim-warranty-number-${item.claim.id}`}>{item.warranty?.warrantyNumber || "—"}</TableCell>
                      <TableCell className="text-salis-gray max-w-xs truncate" data-testid={`text-claim-issue-${item.claim.id}`}>{item.claim.issueDescription}</TableCell>
                      <TableCell className="text-salis-gray" data-testid={`text-claim-date-${item.claim.id}`}>
                        {item.claim.claimDate ? format(new Date(item.claim.claimDate), "MMM dd, yyyy") : "—"}
                      </TableCell>
                      <TableCell className="text-salis-gray" data-testid={`text-claim-amount-${item.claim.id}`}>${item.claim.claimAmount || "0.00"}</TableCell>
                      <TableCell className="text-salis-gray" data-testid={`text-approved-amount-${item.claim.id}`}>${item.claim.approvedAmount || "—"}</TableCell>
                      <TableCell>{getClaimStatusBadge(item.claim.status || "submitted", item.claim.id)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClaim(item)}
                            data-testid={`button-edit-claim-${item.claim.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteClaimMutation.mutate(item.claim.id)}
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

      {/* Warranty Dialog */}
      <Dialog open={isWarrantyDialogOpen} onOpenChange={setIsWarrantyDialogOpen}>
        <DialogContent className="max-w-3xl bg-white dark:bg-salis-black max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-salis-black dark:text-white">
              {editingWarrantyId ? "Edit Warranty" : "Create Warranty"}
            </DialogTitle>
            <DialogDescription className="text-salis-gray">
              {editingWarrantyId ? "Update warranty details" : "Add a new warranty record"}
            </DialogDescription>
          </DialogHeader>
          <Form {...warrantyForm}>
            <form
              onSubmit={warrantyForm.handleSubmit((data) => warrantyMutation.mutate(data))}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={warrantyForm.control}
                  name="warrantyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Warranty Type *</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger data-testid="select-warranty-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="parts">Parts</SelectItem>
                            <SelectItem value="labor">Labor</SelectItem>
                            <SelectItem value="combined">Combined</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={warrantyForm.control}
                  name="warrantyNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Warranty Number</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} placeholder="WRT-2024-001" data-testid="input-warranty-number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={warrantyForm.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Provider *</FormLabel>
                      <FormControl>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <SelectTrigger data-testid="select-provider">
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manufacturer">Manufacturer</SelectItem>
                            <SelectItem value="garage">Garage</SelectItem>
                            <SelectItem value="third_party">Third Party</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={warrantyForm.control}
                  name="providerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Provider Name</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} placeholder="ACME Parts Co." data-testid="input-provider-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={warrantyForm.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Vehicle</FormLabel>
                      <FormControl>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <SelectTrigger data-testid="select-vehicle">
                            <SelectValue placeholder="Select vehicle" />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicles.map((vehicle: any) => (
                              <SelectItem key={vehicle.id} value={vehicle.id}>
                                {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={warrantyForm.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Customer</FormLabel>
                      <FormControl>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <SelectTrigger data-testid="select-customer">
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.map((customer: any) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.fullName} - {customer.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={warrantyForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Start Date *</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-start-date" />
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
                      <FormLabel className="text-salis-black dark:text-white">End Date *</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-end-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={warrantyForm.control}
                  name="mileageLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Mileage Limit (km)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="100000" data-testid="input-mileage-limit" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={warrantyForm.control}
                  name="currentMileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Current Mileage (km)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="50000" data-testid="input-current-mileage" />
                      </FormControl>
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
                    <FormLabel className="text-salis-black dark:text-white">Coverage Description *</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Describe what is covered..." data-testid="input-coverage-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={warrantyForm.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Terms</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} placeholder="Warranty terms..." data-testid="input-terms" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={warrantyForm.control}
                  name="exclusions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Exclusions</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} placeholder="What is not covered..." data-testid="input-exclusions" />
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
                  onClick={() => setIsWarrantyDialogOpen(false)}
                  data-testid="button-cancel-warranty"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={warrantyMutation.isPending}
                  className="bg-salis-black dark:bg-white text-white dark:text-salis-black"
                  data-testid="button-submit-warranty"
                >
                  {warrantyMutation.isPending ? "Saving..." : editingWarrantyId ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Claim Dialog */}
      <Dialog open={isClaimDialogOpen} onOpenChange={setIsClaimDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-salis-black">
          <DialogHeader>
            <DialogTitle className="text-salis-black dark:text-white">
              {editingClaimId ? "Edit Claim" : "Submit Warranty Claim"}
            </DialogTitle>
            <DialogDescription className="text-salis-gray">
              {editingClaimId ? "Update claim details" : "Submit a new warranty claim"}
            </DialogDescription>
          </DialogHeader>
          <Form {...claimForm}>
            <form
              onSubmit={claimForm.handleSubmit((data) => claimMutation.mutate(data))}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={claimForm.control}
                  name="warrantyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Warranty *</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger data-testid="select-warranty-for-claim">
                            <SelectValue placeholder="Select warranty" />
                          </SelectTrigger>
                          <SelectContent>
                            {allWarranties.map((warranty: Warranty) => (
                              <SelectItem key={warranty.id} value={warranty.id}>
                                {warranty.warrantyNumber || warranty.id.substring(0, 8)} - {warranty.coverageDescription.substring(0, 30)}...
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={claimForm.control}
                  name="claimNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Claim Number</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} placeholder="CLM-2024-001" data-testid="input-claim-number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={claimForm.control}
                  name="claimDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white">Claim Date *</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-claim-date" />
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
                      <FormLabel className="text-salis-black dark:text-white">Claim Amount</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="500.00" data-testid="input-claim-amount" />
                      </FormControl>
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
                    <FormLabel className="text-salis-black dark:text-white">Issue Description *</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Describe the issue..." data-testid="input-issue-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsClaimDialogOpen(false)}
                  data-testid="button-cancel-claim"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={claimMutation.isPending}
                  className="bg-salis-black dark:bg-white text-white dark:text-salis-black"
                  data-testid="button-submit-claim"
                >
                  {claimMutation.isPending ? "Submitting..." : editingClaimId ? "Update" : "Submit"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
