import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TabsPageLayout } from "@/components/layouts";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  TrendingDown, 
  AlertTriangle, 
  Plus,
  FileText,
  DollarSign,
  Package,
  Wrench,
  XCircle,
  BarChart3,
  Calendar
} from "lucide-react";
import { format, subDays } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const lossEntrySchema = z.object({
  lossType: z.enum(["inventory", "service", "equipment", "bad_debt", "theft", "damage", "obsolete", "other"]),
  description: z.string().min(1, "Description is required"),
  amount: z.string().min(1, "Amount is required"),
  currency: z.string().default("SAR"),
  lossDate: z.string().min(1, "Date is required"),
  referenceId: z.string().optional(),
  referenceType: z.string().optional(),
  recoveredAmount: z.string().default("0"),
  insuranceClaimed: z.boolean().default(false),
  insuranceAmount: z.string().optional(),
  status: z.enum(["pending", "approved", "recovered", "written_off"]).default("pending"),
  notes: z.string().optional(),
});

const writeOffSchema = z.object({
  lossEntryId: z.string().min(1, "Loss entry is required"),
  approvedBy: z.string().min(1, "Approver is required"),
  approvalDate: z.string().min(1, "Approval date is required"),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
});

type LossEntryFormData = z.infer<typeof lossEntrySchema>;
type WriteOffFormData = z.infer<typeof writeOffSchema>;

interface LossEntry {
  id: string;
  lossType: string;
  description: string;
  amount: string;
  currency: string;
  lossDate: string;
  referenceId?: string;
  referenceType?: string;
  recoveredAmount: string;
  insuranceClaimed: boolean;
  insuranceAmount?: string;
  status: string;
  notes?: string;
  createdAt: string;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'];

export default function LossAccount() {
  const { toast } = useToast();
  const [isLossDialogOpen, setIsLossDialogOpen] = useState(false);
  const [isWriteOffDialogOpen, setIsWriteOffDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [selectedType, setSelectedType] = useState<string>("all");

  const { data: lossEntries = [], isLoading } = useQuery<LossEntry[]>({
    queryKey: ["/api/loss-entries"],
  });

  const lossForm = useForm<LossEntryFormData>({
    resolver: zodResolver(lossEntrySchema),
    defaultValues: {
      lossType: "inventory",
      description: "",
      amount: "",
      currency: "SAR",
      lossDate: new Date().toISOString().split("T")[0],
      referenceId: "",
      referenceType: "",
      recoveredAmount: "0",
      insuranceClaimed: false,
      insuranceAmount: "",
      status: "pending",
      notes: "",
    },
  });

  const writeOffForm = useForm<WriteOffFormData>({
    resolver: zodResolver(writeOffSchema),
    defaultValues: {
      lossEntryId: "",
      approvedBy: "",
      approvalDate: new Date().toISOString().split("T")[0],
      reason: "",
      notes: "",
    },
  });

  const lossMutation = useMutation({
    mutationFn: async (data: LossEntryFormData) => {
      return await apiRequest("POST", "/api/loss-entries", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loss-entries"] });
      setIsLossDialogOpen(false);
      lossForm.reset();
      toast({ title: "Loss entry recorded" });
    },
    onError: () => {
      toast({ title: "Error recording loss", variant: "destructive" });
    },
  });

  const writeOffMutation = useMutation({
    mutationFn: async (data: WriteOffFormData) => {
      return await apiRequest("POST", `/api/loss-entries/${data.lossEntryId}/write-off`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loss-entries"] });
      setIsWriteOffDialogOpen(false);
      writeOffForm.reset();
      toast({ title: "Write-off approved" });
    },
    onError: () => {
      toast({ title: "Error processing write-off", variant: "destructive" });
    },
  });

  const filteredEntries = lossEntries.filter(entry => {
    const matchesType = selectedType === "all" || entry.lossType === selectedType;
    const matchesPeriod = new Date(entry.lossDate) >= subDays(new Date(), parseInt(selectedPeriod));
    return matchesType && matchesPeriod;
  });

  const totalLosses = filteredEntries.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const totalRecovered = filteredEntries.reduce((sum, e) => sum + parseFloat(e.recoveredAmount || "0"), 0);
  const pendingLosses = filteredEntries.filter(e => e.status === "pending").length;
  const writtenOff = filteredEntries.filter(e => e.status === "written_off").length;

  const lossesByType = filteredEntries.reduce((acc, entry) => {
    const type = entry.lossType;
    if (!acc[type]) acc[type] = 0;
    acc[type] += parseFloat(entry.amount);
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(lossesByType).map(([name, value]) => ({ name, value }));

  const trendData = Array.from({ length: 12 }, (_, i) => {
    const date = subDays(new Date(), (11 - i) * 30);
    const monthLosses = lossEntries.filter(e => {
      const entryDate = new Date(e.lossDate);
      return entryDate.getMonth() === date.getMonth() && entryDate.getFullYear() === date.getFullYear();
    });
    return {
      month: format(date, "MMM"),
      losses: monthLosses.reduce((sum, e) => sum + parseFloat(e.amount), 0),
      recovered: monthLosses.reduce((sum, e) => sum + parseFloat(e.recoveredAmount || "0"), 0),
    };
  });

  const getLossIcon = (type: string) => {
    switch (type) {
      case "inventory": return Package;
      case "service": return Wrench;
      case "equipment": return Wrench;
      case "bad_debt": return DollarSign;
      case "theft": return AlertTriangle;
      case "damage": return XCircle;
      default: return FileText;
    }
  };

  const overviewTab = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40" data-testid="select-period">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-40" data-testid="select-type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="inventory">Inventory</SelectItem>
              <SelectItem value="service">Service</SelectItem>
              <SelectItem value="equipment">Equipment</SelectItem>
              <SelectItem value="bad_debt">Bad Debt</SelectItem>
              <SelectItem value="theft">Theft</SelectItem>
              <SelectItem value="damage">Damage</SelectItem>
              <SelectItem value="obsolete">Obsolete</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsLossDialogOpen(true)} data-testid="button-add-loss">
          <Plus className="h-4 w-4 mr-2" />
          Record Loss
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card data-testid="card-total-losses">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Losses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              SAR {totalLosses.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-recovered">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Recovered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              SAR {totalRecovered.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-net-loss">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Net Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              SAR {(totalLosses - totalRecovered).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-pending">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingLosses}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Loss Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="losses" stroke="#ef4444" name="Losses" />
                <Line type="monotone" dataKey="recovered" stroke="#22c55e" name="Recovered" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Losses by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const entriesTab = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Loss Entries</h3>
        <Button onClick={() => setIsLossDialogOpen(true)} data-testid="button-new-entry">
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center">Loading entries...</CardContent>
        </Card>
      ) : filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No loss entries found for the selected period
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Recovered</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => {
                const Icon = getLossIcon(entry.lossType);
                return (
                  <TableRow key={entry.id} data-testid={`row-loss-${entry.id}`}>
                    <TableCell>{format(new Date(entry.lossDate), "dd/MM/yyyy")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="capitalize">{entry.lossType.replace("_", " ")}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      {entry.currency} {parseFloat(entry.amount).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {entry.currency} {parseFloat(entry.recoveredAmount || "0").toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          entry.status === "written_off" ? "destructive" :
                          entry.status === "recovered" ? "default" :
                          entry.status === "approved" ? "secondary" : "outline"
                        }
                      >
                        {entry.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {entry.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            writeOffForm.setValue("lossEntryId", entry.id);
                            setIsWriteOffDialogOpen(true);
                          }}
                          data-testid={`button-writeoff-${entry.id}`}
                        >
                          Write Off
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );

  const writeOffsTab = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Write-Off Summary</CardTitle>
          <CardDescription>
            Total written off: SAR {filteredEntries.filter(e => e.status === "written_off").reduce((sum, e) => sum + parseFloat(e.amount), 0).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEntries.filter(e => e.status === "written_off").length === 0 ? (
            <p className="text-center text-gray-500 py-4">No write-offs in this period</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries
                  .filter(e => e.status === "written_off")
                  .map((entry) => (
                    <TableRow key={entry.id} data-testid={`row-writeoff-${entry.id}`}>
                      <TableCell>{format(new Date(entry.lossDate), "dd/MM/yyyy")}</TableCell>
                      <TableCell className="capitalize">{entry.lossType.replace("_", " ")}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell className="text-right font-medium">
                        {entry.currency} {parseFloat(entry.amount).toLocaleString()}
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

  const reportsTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Loss Report by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(lossesByType).map(([type, amount]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="capitalize">{type.replace("_", " ")}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-red-500 rounded-full"
                        style={{ width: `${(amount / totalLosses) * 100}%` }}
                      />
                    </div>
                    <span className="font-medium w-24 text-right">SAR {amount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recovery Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-5xl font-bold">
                {totalLosses > 0 ? Math.round((totalRecovered / totalLosses) * 100) : 0}%
              </div>
              <p className="text-gray-500 mt-2">of losses recovered</p>
              <div className="mt-4 text-sm">
                <p>Total Losses: SAR {totalLosses.toLocaleString()}</p>
                <p>Total Recovered: SAR {totalRecovered.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline" data-testid="button-export-pdf">
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" data-testid="button-export-excel">
              <BarChart3 className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <TabsPageLayout
        title="Loss Account"
        description="حساب الخسائر - Track and manage business losses, write-offs, and recovery"
        defaultTab="overview"
        tabs={[
          { id: "overview", label: "Overview", icon: TrendingDown, content: overviewTab },
          { id: "entries", label: "Loss Entries", icon: FileText, content: entriesTab },
          { id: "writeoffs", label: "Write-Offs", icon: XCircle, content: writeOffsTab },
          { id: "reports", label: "Reports", icon: BarChart3, content: reportsTab },
        ]}
      />

      <Dialog open={isLossDialogOpen} onOpenChange={setIsLossDialogOpen}>
        <DialogContent className="max-w-2xl" data-testid="modal-loss-entry">
          <DialogHeader>
            <DialogTitle>Record Loss Entry</DialogTitle>
            <DialogDescription>Document a new loss for accounting purposes</DialogDescription>
          </DialogHeader>
          <Form {...lossForm}>
            <form onSubmit={lossForm.handleSubmit((data) => lossMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={lossForm.control}
                  name="lossType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loss Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-loss-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="inventory">Inventory Loss</SelectItem>
                          <SelectItem value="service">Service Loss</SelectItem>
                          <SelectItem value="equipment">Equipment Loss</SelectItem>
                          <SelectItem value="bad_debt">Bad Debt</SelectItem>
                          <SelectItem value="theft">Theft</SelectItem>
                          <SelectItem value="damage">Damage</SelectItem>
                          <SelectItem value="obsolete">Obsolete Stock</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={lossForm.control}
                  name="lossDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-loss-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={lossForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="0.00" data-testid="input-loss-amount" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={lossForm.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-loss-currency">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SAR">SAR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={lossForm.control}
                  name="recoveredAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recovered Amount</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="0.00" data-testid="input-recovered" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={lossForm.control}
                  name="referenceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference ID</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="INV-001, JC-001, etc." data-testid="input-reference" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={lossForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Describe the loss..." data-testid="input-loss-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={lossForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Additional notes..." data-testid="input-loss-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsLossDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={lossMutation.isPending} data-testid="button-save-loss">
                  {lossMutation.isPending ? "Saving..." : "Record Loss"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isWriteOffDialogOpen} onOpenChange={setIsWriteOffDialogOpen}>
        <DialogContent data-testid="modal-writeoff">
          <DialogHeader>
            <DialogTitle>Approve Write-Off</DialogTitle>
            <DialogDescription>Approve this loss for write-off</DialogDescription>
          </DialogHeader>
          <Form {...writeOffForm}>
            <form onSubmit={writeOffForm.handleSubmit((data) => writeOffMutation.mutate(data))} className="space-y-4">
              <FormField
                control={writeOffForm.control}
                name="approvedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Approved By</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Manager name" data-testid="input-approver" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={writeOffForm.control}
                name="approvalDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Approval Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" data-testid="input-approval-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={writeOffForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Reason for write-off..." data-testid="input-writeoff-reason" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsWriteOffDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" disabled={writeOffMutation.isPending} data-testid="button-confirm-writeoff">
                  {writeOffMutation.isPending ? "Processing..." : "Confirm Write-Off"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
