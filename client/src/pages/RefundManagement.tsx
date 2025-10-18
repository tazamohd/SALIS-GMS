import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, CheckCircle, XCircle, DollarSign, AlertTriangle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const refundSchema = z.object({
  invoiceId: z.string().min(1, "Invoice is required"),
  amount: z.string().min(1, "Amount is required"),
  reason: z.string().min(1, "Reason is required"),
  refundMethod: z.enum(["original", "store_credit", "cash", "check"]),
  notes: z.string().optional(),
});

type RefundFormData = z.infer<typeof refundSchema>;

export default function RefundManagement() {
  const { toast } = useToast();
  const [selectedGarageId, setSelectedGarageId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<any | null>(null);

  // Fetch garages
  const { data: garages = [] } = useQuery<any[]>({
    queryKey: ["/api/garages"],
  });

  // Set default garage
  useEffect(() => {
    if (!selectedGarageId && garages.length > 0) {
      setSelectedGarageId(garages[0].id);
    }
  }, [garages, selectedGarageId]);

  // Fetch refunds
  const { data: refunds = [], isLoading } = useQuery<any[]>({
    queryKey: [
      "/api/refunds",
      { garageId: selectedGarageId, status: statusFilter !== "all" ? statusFilter : undefined },
    ],
    enabled: !!selectedGarageId,
  });

  // Fetch invoices for dropdown
  const { data: invoices = [] } = useQuery<any[]>({
    queryKey: ["/api/invoices"],
  });

  // Refund form
  const refundForm = useForm<RefundFormData>({
    resolver: zodResolver(refundSchema),
    defaultValues: {
      invoiceId: "",
      amount: "",
      reason: "",
      refundMethod: "original",
      notes: "",
    },
  });

  // Create Refund
  const createRefundMutation = useMutation({
    mutationFn: async (data: RefundFormData) => {
      const payload = {
        ...data,
        garageId: selectedGarageId,
        amount: parseFloat(data.amount),
        status: "pending",
      };
      return apiRequest("POST", "/api/refunds", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          typeof query.queryKey[0] === 'string' && query.queryKey[0].includes('/api/refunds')
      });
      toast({ title: "Refund request created successfully" });
      setRefundDialogOpen(false);
      refundForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create refund request", variant: "destructive" });
    },
  });

  // Approve Refund
  const approveRefundMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/refunds/${id}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          typeof query.queryKey[0] === 'string' && query.queryKey[0].includes('/api/refunds')
      });
      toast({ title: "Refund approved" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve refund", variant: "destructive" });
    },
  });

  // Process Refund
  const processRefundMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/refunds/${id}/process`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          typeof query.queryKey[0] === 'string' && query.queryKey[0].includes('/api/refunds')
      });
      toast({ title: "Refund processed successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to process refund", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "outline", icon: AlertTriangle, color: "text-yellow-600" },
      approved: { variant: "default", icon: CheckCircle, color: "text-blue-600" },
      processed: { variant: "default", icon: CheckCircle, color: "text-green-600" },
      rejected: { variant: "destructive", icon: XCircle, color: "text-red-600" },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="p-8 bg-gray-800 min-h-screen space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Poppins',Helvetica] font-bold text-3xl text-soft-white" data-testid="text-page-title">
            Refund Management
          </h1>
          <p className="text-soft-white/60" data-testid="text-page-description">
            Manage customer refunds with approval workflow
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={selectedGarageId} onValueChange={setSelectedGarageId}>
            <SelectTrigger className="w-[200px]" data-testid="select-garage">
              <SelectValue placeholder="Select garage" />
            </SelectTrigger>
            <SelectContent>
              {garages.map((garage) => (
                <SelectItem key={garage.id} value={garage.id} data-testid={`select-garage-${garage.id}`}>
                  {garage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => refundForm.reset()} data-testid="button-create-refund">
                <Plus className="h-4 w-4 mr-2" />
                Create Refund
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-refund-form">
              <DialogHeader>
                <DialogTitle>Create Refund Request</DialogTitle>
                <DialogDescription>Initiate a refund for a customer invoice</DialogDescription>
              </DialogHeader>
              <Form {...refundForm}>
                <form onSubmit={refundForm.handleSubmit((data) => createRefundMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={refundForm.control}
                    name="invoiceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-refund-invoice">
                              <SelectValue placeholder="Select invoice" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {invoices.map((invoice) => (
                              <SelectItem key={invoice.id} value={invoice.id} data-testid={`select-invoice-${invoice.id}`}>
                                Invoice #{invoice.id.slice(0, 8)} - ${invoice.totalAmount}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={refundForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Refund Amount</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="input-refund-amount" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={refundForm.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Customer dissatisfaction" {...field} data-testid="input-refund-reason" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={refundForm.control}
                    name="refundMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Refund Method</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-refund-method">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="original" data-testid="select-method-original">Original Payment Method</SelectItem>
                            <SelectItem value="store_credit" data-testid="select-method-credit">Store Credit</SelectItem>
                            <SelectItem value="cash" data-testid="select-method-cash">Cash</SelectItem>
                            <SelectItem value="check" data-testid="select-method-check">Check</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={refundForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional notes..." {...field} data-testid="textarea-refund-notes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={createRefundMutation.isPending} data-testid="button-submit-refund">
                      {createRefundMutation.isPending ? "Creating..." : "Create Refund"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]" data-testid="select-status-filter">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-dark-navy border-neon-blue/30 bg-dark-navy border-neon-blue/30">
        <CardHeader>
          <CardTitle className="text-soft-white">Refund Requests</CardTitle>
          <CardDescription className="text-soft-white/60">Review and process customer refund requests</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-soft-white/60">Loading...</div>
          ) : refunds.length === 0 ? (
            <div className="text-center py-8 text-soft-white/60" data-testid="text-no-refunds">
              No refund requests found
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-neon-blue/20/30">
                <TableRow className="border-b border-neon-blue/30/50 hover:bg-neon-blue/20/20">
                  <TableHead className="text-soft-white">Invoice</TableHead>
                  <TableHead className="text-soft-white">Amount</TableHead>
                  <TableHead className="text-soft-white">Reason</TableHead>
                  <TableHead className="text-soft-white">Method</TableHead>
                  <TableHead className="text-soft-white">Requested</TableHead>
                  <TableHead className="text-soft-white">Status</TableHead>
                  <TableHead className="text-soft-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refunds.map((refund) => (
                  <TableRow key={refund.id} data-testid={`row-refund-${refund.id}`}>
                    <TableCell className="font-mono text-sm" data-testid={`text-refund-invoice-${refund.id}`}>
                      #{refund.invoiceId.slice(0, 8)}
                    </TableCell>
                    <TableCell className="font-semibold" data-testid={`text-refund-amount-${refund.id}`}>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {parseFloat(refund.amount).toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell data-testid={`text-refund-reason-${refund.id}`}>{refund.reason}</TableCell>
                    <TableCell data-testid={`text-refund-method-${refund.id}`}>
                      {refund.refundMethod.replace("_", " ")}
                    </TableCell>
                    <TableCell className="text-sm" data-testid={`text-refund-date-${refund.id}`}>
                      {format(new Date(refund.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell data-testid={`badge-refund-status-${refund.id}`}>
                      {getStatusBadge(refund.status)}
                    </TableCell>
                    <TableCell className="text-soft-white">
                      <div className="flex gap-2">
                        {refund.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => approveRefundMutation.mutate(refund.id)}
                            disabled={approveRefundMutation.isPending}
                            data-testid={`button-approve-refund-${refund.id}`}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        {refund.status === "approved" && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => processRefundMutation.mutate(refund.id)}
                            disabled={processRefundMutation.isPending}
                            data-testid={`button-process-refund-${refund.id}`}
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Process
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
