import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  CreditCard,
  Search,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Building2,
  Calendar,
  Download,
  Eye,
  Send,
  RefreshCw,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface PaymentRecord {
  id: number;
  orderNumber: string;
  supplierName: string;
  supplierBank: string;
  supplierIban: string;
  invoiceNumber: string;
  invoiceDate: string;
  amount: number;
  currency: string;
  status: "pending" | "approved" | "processing" | "paid" | "overdue" | "cancelled";
  dueDate: string;
  paidDate: string | null;
  paymentMethod: string;
  paymentReference: string | null;
  notes: string;
  guidanceNotes: string;
  approvalStatus: "pending" | "approved" | "rejected";
  approvedBy: string | null;
}

const mockPayments: PaymentRecord[] = [
  {
    id: 1,
    orderNumber: "PO-2024-001",
    supplierName: "AutoParts Plus",
    supplierBank: "Al Rajhi Bank",
    supplierIban: "SA44 2000 0001 2345 6789 0123",
    invoiceNumber: "INV-APP-2024-1234",
    invoiceDate: "2024-12-15",
    amount: 850,
    currency: "SAR",
    status: "approved",
    dueDate: "2024-12-30",
    paidDate: null,
    paymentMethod: "Bank Transfer",
    paymentReference: null,
    notes: "Brake pads order - urgent",
    guidanceNotes: "Verify invoice matches PO amount before processing. Contact supplier for any discrepancies.",
    approvalStatus: "approved",
    approvedBy: "Finance Manager",
  },
  {
    id: 2,
    orderNumber: "PO-2024-002",
    supplierName: "Gulf Auto Supplies",
    supplierBank: "SABB Bank",
    supplierIban: "SA66 4500 0000 0678 9012 3456",
    invoiceNumber: "INV-GAS-2024-5678",
    invoiceDate: "2024-12-14",
    amount: 2500,
    currency: "SAR",
    status: "processing",
    dueDate: "2024-12-28",
    paidDate: null,
    paymentMethod: "Bank Transfer",
    paymentReference: "TRX-2024-789456",
    notes: "Oil filters bulk order",
    guidanceNotes: "Monthly recurring order - check for loyalty discount eligibility.",
    approvalStatus: "approved",
    approvedBy: "Finance Manager",
  },
  {
    id: 3,
    orderNumber: "PO-2024-003",
    supplierName: "Mercedes Authorized Dealer",
    supplierBank: "NCB Bank",
    supplierIban: "SA88 1000 0000 1234 5678 9012",
    invoiceNumber: "INV-MAD-2024-9012",
    invoiceDate: "2024-12-10",
    amount: 4500,
    currency: "SAR",
    status: "paid",
    dueDate: "2024-12-25",
    paidDate: "2024-12-12",
    paymentMethod: "Bank Transfer",
    paymentReference: "TRX-2024-123789",
    notes: "Mercedes engine parts",
    guidanceNotes: "OEM parts - ensure warranty documentation is received with payment receipt.",
    approvalStatus: "approved",
    approvedBy: "Finance Manager",
  },
  {
    id: 4,
    orderNumber: "PO-2024-004",
    supplierName: "Premium Parts KSA",
    supplierBank: "Riyad Bank",
    supplierIban: "SA22 3000 0000 9876 5432 1098",
    invoiceNumber: "INV-PPK-2024-3456",
    invoiceDate: "2024-11-25",
    amount: 1800,
    currency: "SAR",
    status: "overdue",
    dueDate: "2024-12-10",
    paidDate: null,
    paymentMethod: "Bank Transfer",
    paymentReference: null,
    notes: "Tire order - payment delayed",
    guidanceNotes: "URGENT: Escalate to finance manager. Supplier relationship at risk.",
    approvalStatus: "approved",
    approvedBy: "Finance Manager",
  },
  {
    id: 5,
    orderNumber: "PO-2024-005",
    supplierName: "National Auto Parts",
    supplierBank: "Al Bilad Bank",
    supplierIban: "SA33 5000 0000 4567 8901 2345",
    invoiceNumber: "INV-NAP-2024-7890",
    invoiceDate: "2024-12-16",
    amount: 3200,
    currency: "SAR",
    status: "pending",
    dueDate: "2024-12-31",
    paidDate: null,
    paymentMethod: "Bank Transfer",
    paymentReference: null,
    notes: "Suspension parts order",
    guidanceNotes: "New supplier - verify banking details with accounts department.",
    approvalStatus: "pending",
    approvedBy: null,
  },
];

export default function PaymentTracking() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

  const payments = mockPayments;

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && (payment.status === "pending" || payment.status === "approved")) ||
      (activeTab === "processing" && payment.status === "processing") ||
      (activeTab === "paid" && payment.status === "paid") ||
      (activeTab === "overdue" && payment.status === "overdue");

    return matchesSearch && matchesTab;
  });

  const totalPending = payments
    .filter((p) => p.status === "pending" || p.status === "approved")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalProcessing = payments
    .filter((p) => p.status === "processing")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOverdue = payments
    .filter((p) => p.status === "overdue")
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string; label: string; icon: typeof Clock }> = {
      pending: { className: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300", label: "Pending Approval", icon: Clock },
      approved: { className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", label: "Approved", icon: CheckCircle },
      processing: { className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Processing", icon: RefreshCw },
      paid: { className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", label: "Paid", icon: CheckCircle },
      overdue: { className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", label: "Overdue", icon: AlertTriangle },
      cancelled: { className: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300", label: "Cancelled", icon: AlertTriangle },
    };
    const { className, label, icon: Icon } = config[status] || config.pending;
    return (
      <Badge className={className}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const stats = [
    { label: "Pending Approval", value: totalPending, count: payments.filter(p => p.status === "pending" || p.status === "approved").length, icon: Clock, color: "text-[#64748B]", bgColor: "bg-[#F8FAFC] dark:bg-[#0E1117]" },
    { label: "Processing", value: totalProcessing, count: payments.filter(p => p.status === "processing").length, icon: RefreshCw, color: "text-yellow-500", bgColor: "bg-yellow-50 dark:bg-yellow-900/20" },
    { label: "Paid This Month", value: totalPaid, count: payments.filter(p => p.status === "paid").length, icon: CheckCircle, color: "text-green-500", bgColor: "bg-green-50 dark:bg-green-900/20" },
    { label: "Overdue", value: totalOverdue, count: payments.filter(p => p.status === "overdue").length, icon: AlertTriangle, color: "text-red-500", bgColor: "bg-red-50 dark:bg-red-900/20" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">
          Payment Tracking
        </h1>
        <p className="text-[#64748B] mt-1">
          Track payment status for all purchase orders and supplier invoices
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <Badge variant="outline" className="border-[#E2E8F0] dark:border-[#232A36]">{stat.count} orders</Badge>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">
                  {stat.value.toLocaleString()} SAR
                </p>
                <p className="text-sm text-[#64748B]">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <CreditCard className="h-5 w-5 text-[#0A5ED7]" />
                Payment Records
              </CardTitle>
              <CardDescription className="text-[#64748B]">Track and manage all supplier payments</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                <Input
                  placeholder="Search payments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                  data-testid="input-search-payments"
                />
              </div>
              <Button variant="outline" className="border-[#E2E8F0] dark:border-[#232A36]" data-testid="button-export-payments">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
              <TabsTrigger value="pending" data-testid="tab-pending">Pending</TabsTrigger>
              <TabsTrigger value="processing" data-testid="tab-processing">Processing</TabsTrigger>
              <TabsTrigger value="paid" data-testid="tab-paid">Paid</TabsTrigger>
              <TabsTrigger value="overdue" data-testid="tab-overdue">Overdue</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] dark:border-[#232A36]">
                      <th className="text-left py-3 px-4 font-medium text-[#0B1F3B] dark:text-white">Order</th>
                      <th className="text-left py-3 px-4 font-medium text-[#0B1F3B] dark:text-white">Supplier</th>
                      <th className="text-left py-3 px-4 font-medium text-[#0B1F3B] dark:text-white">Invoice</th>
                      <th className="text-right py-3 px-4 font-medium text-[#0B1F3B] dark:text-white">Amount</th>
                      <th className="text-center py-3 px-4 font-medium text-[#0B1F3B] dark:text-white">Due Date</th>
                      <th className="text-center py-3 px-4 font-medium text-[#0B1F3B] dark:text-white">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-[#0B1F3B] dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-[#64748B]">
                          No payment records found
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((payment) => (
                        <tr
                          key={payment.id}
                          className="border-b border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]"
                          data-testid={`payment-${payment.id}`}
                        >
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm text-[#0B1F3B] dark:text-white">{payment.orderNumber}</span>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-[#0B1F3B] dark:text-white">{payment.supplierName}</p>
                            <p className="text-xs text-[#64748B]">{payment.supplierBank}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm text-[#0B1F3B] dark:text-white">{payment.invoiceNumber}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-semibold text-[#0B1F3B] dark:text-white">{payment.amount.toLocaleString()} {payment.currency}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`text-sm ${
                              payment.status === "overdue" ? "text-red-600 font-medium" : "text-[#64748B]"
                            }`}>
                              {new Date(payment.dueDate).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {getStatusBadge(payment.status)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedPayment(payment)}
                                  data-testid={`button-view-payment-${payment.id}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-lg bg-white dark:bg-[#151A23]">
                                <DialogHeader>
                                  <DialogTitle className="text-[#0B1F3B] dark:text-white">Payment Details</DialogTitle>
                                  <DialogDescription className="text-[#64748B]">{payment.orderNumber}</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg">
                                    <div>
                                      <p className="text-sm text-[#64748B]">Amount</p>
                                      <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{payment.amount.toLocaleString()} {payment.currency}</p>
                                    </div>
                                    {getStatusBadge(payment.status)}
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-[#64748B]">Supplier</p>
                                      <p className="font-medium text-[#0B1F3B] dark:text-white">{payment.supplierName}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-[#64748B]">Bank</p>
                                      <p className="font-medium text-[#0B1F3B] dark:text-white">{payment.supplierBank}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <p className="text-sm text-[#64748B]">IBAN</p>
                                      <p className="font-mono text-sm text-[#0B1F3B] dark:text-white">{payment.supplierIban}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-[#64748B]">Invoice Number</p>
                                      <p className="font-medium text-[#0B1F3B] dark:text-white">{payment.invoiceNumber}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-[#64748B]">Invoice Date</p>
                                      <p className="font-medium text-[#0B1F3B] dark:text-white">{new Date(payment.invoiceDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-[#64748B]">Due Date</p>
                                      <p className="font-medium text-[#0B1F3B] dark:text-white">{new Date(payment.dueDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-[#64748B]">Payment Method</p>
                                      <p className="font-medium text-[#0B1F3B] dark:text-white">{payment.paymentMethod}</p>
                                    </div>
                                  </div>

                                  {payment.paidDate && (
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                      <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                        <CheckCircle className="h-4 w-4" />
                                        <span className="font-medium">Paid on {new Date(payment.paidDate).toLocaleDateString()}</span>
                                      </div>
                                      {payment.paymentReference && (
                                        <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                                          Reference: {payment.paymentReference}
                                        </p>
                                      )}
                                    </div>
                                  )}

                                  {payment.notes && (
                                    <div>
                                      <p className="text-sm text-[#64748B] mb-1">Notes</p>
                                      <p className="text-sm p-2 bg-[#F8FAFC] dark:bg-[#0E1117] rounded text-[#0B1F3B] dark:text-white">{payment.notes}</p>
                                    </div>
                                  )}

                                  {payment.guidanceNotes && (
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                      <p className="text-sm font-medium text-[#0A5ED7] mb-1">
                                        Guidance Notes
                                      </p>
                                      <p className="text-sm text-[#0A5ED7]">{payment.guidanceNotes}</p>
                                    </div>
                                  )}

                                  <div className="flex justify-end gap-2 pt-4">
                                    {payment.status === "overdue" && (
                                      <Button variant="outline" className="border-[#E2E8F0] dark:border-[#232A36]" data-testid="button-send-reminder">
                                        <Send className="h-4 w-4 mr-2" />
                                        Send Reminder
                                      </Button>
                                    )}
                                    <Button variant="outline" className="border-[#E2E8F0] dark:border-[#232A36]" data-testid="button-download-invoice">
                                      <Download className="h-4 w-4 mr-2" />
                                      Download Invoice
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
