import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  PiggyBank,
  Target,
  BarChart3,
  Calendar,
  Shield,
  Percent,
  FileText,
  DollarSign,
  ExternalLink,
  Wallet,
  ArrowLeft,
} from "lucide-react";

const reserveAllocationSchema = z.object({
  reserveType: z.string().min(1, "Reserve type is required"),
  amount: z.string().min(1, "Amount is required"),
  fiscalYear: z.string().min(1, "Fiscal year is required"),
  allocationDate: z.string().min(1, "Date is required"),
  description: z.string().optional(),
  approvedBy: z.string().min(1, "Approver is required"),
});

type ReserveAllocationFormData = z.infer<typeof reserveAllocationSchema>;

const profitDistributionSchema = z.object({
  distributionType: z.string().min(1, "Distribution type is required"),
  totalAmount: z.string().min(1, "Total amount is required"),
  fiscalYear: z.string().min(1, "Fiscal year is required"),
  distributionDate: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
});

type ProfitDistributionFormData = z.infer<typeof profitDistributionSchema>;

export default function RetainedEarnings() {
  const { t } = useTranslation();
  const [isReserveDialogOpen, setIsReserveDialogOpen] = useState(false);
  const [isDistributionDialogOpen, setIsDistributionDialogOpen] = useState(false);

  const reserveForm = useForm<ReserveAllocationFormData>({
    resolver: zodResolver(reserveAllocationSchema),
    defaultValues: {
      reserveType: "",
      amount: "",
      fiscalYear: "",
      allocationDate: "",
      description: "",
      approvedBy: "",
    },
  });

  const distributionForm = useForm<ProfitDistributionFormData>({
    resolver: zodResolver(profitDistributionSchema),
    defaultValues: {
      distributionType: "",
      totalAmount: "",
      fiscalYear: "",
      distributionDate: "",
      notes: "",
    },
  });

  const onReserveSubmit = (data: ReserveAllocationFormData) => {
    console.log("Reserve allocation:", data);
    setIsReserveDialogOpen(false);
    reserveForm.reset();
  };

  const onDistributionSubmit = (data: ProfitDistributionFormData) => {
    console.log("Profit distribution:", data);
    setIsDistributionDialogOpen(false);
    distributionForm.reset();
  };

  const reserves = [
    { id: 1, type: "Legal Reserve", requiredPercent: 10, currentBalance: 100000, targetBalance: 200000, status: "Building" },
    { id: 2, type: "General Reserve", requiredPercent: 0, currentBalance: 150000, targetBalance: 300000, status: "Building" },
    { id: 3, type: "Statutory Reserve", requiredPercent: 5, currentBalance: 50000, targetBalance: 100000, status: "Building" },
    { id: 4, type: "Contingency Reserve", requiredPercent: 0, currentBalance: 75000, targetBalance: 150000, status: "Active" },
  ];

  const profitLossHistory = [
    { id: 1, year: "2024", revenue: 2500000, expenses: 1800000, netProfit: 700000, retained: 490000, distributed: 210000 },
    { id: 2, year: "2023", revenue: 2200000, expenses: 1700000, netProfit: 500000, retained: 350000, distributed: 150000 },
    { id: 3, year: "2022", revenue: 1900000, expenses: 1500000, netProfit: 400000, retained: 280000, distributed: 120000 },
  ];

  const distributions = [
    { id: 1, date: "2024-03-15", type: "Dividend", amount: 100000, recipients: "All Partners", status: "Completed" },
    { id: 2, date: "2024-06-20", type: "Bonus", amount: 50000, recipients: "Staff", status: "Completed" },
    { id: 3, date: "2024-09-10", type: "Dividend", amount: 60000, recipients: "All Partners", status: "Completed" },
  ];

  const reserveAllocations = [
    { id: 1, date: "2024-01-15", type: "Legal Reserve", amount: 35000, year: "2023", approvedBy: "Board" },
    { id: 2, date: "2024-01-15", type: "General Reserve", amount: 50000, year: "2023", approvedBy: "Board" },
    { id: 3, date: "2024-01-15", type: "Contingency Reserve", amount: 25000, year: "2023", approvedBy: "Management" },
  ];

  const tabs = [
    {
      id: "overview",
      label: t('retainedEarnings.overview', 'Overview'),
      icon: PiggyBank,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-50 dark:bg-salis-gray-dark/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('retainedEarnings.totalRetainedEarnings', 'Total Retained Earnings')}</p>
                    <p className="text-2xl font-bold font-montserrat" data-testid="text-total-retained">SAR 1,120,000</p>
                  </div>
                  <PiggyBank className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 dark:bg-salis-gray-dark/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('retainedEarnings.totalReserves', 'Total Reserves')}</p>
                    <p className="text-2xl font-bold font-montserrat" data-testid="text-total-reserves">SAR 375,000</p>
                  </div>
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 dark:bg-salis-gray-dark/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('retainedEarnings.currentYearProfit', 'Current Year Profit')}</p>
                    <p className="text-2xl font-bold font-montserrat text-green-600" data-testid="text-current-profit">SAR 700,000</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 dark:bg-salis-gray-dark/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('retainedEarnings.distributedYTD', 'Distributed YTD')}</p>
                    <p className="text-2xl font-bold font-montserrat" data-testid="text-distributed-ytd">SAR 210,000</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-50 dark:bg-salis-gray-dark/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('retainedEarnings.reserveStatus', 'Reserve Status')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {reserves.map((reserve) => (
                  <div key={reserve.id} className="space-y-2" data-testid={`reserve-progress-${reserve.id}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{reserve.type}</span>
                        {reserve.requiredPercent > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {reserve.requiredPercent}% {t('retainedEarnings.required', 'Required')}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        SAR {reserve.currentBalance.toLocaleString()} / SAR {reserve.targetBalance.toLocaleString()}
                      </div>
                    </div>
                    <Progress value={(reserve.currentBalance / reserve.targetBalance) * 100} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{Math.round((reserve.currentBalance / reserve.targetBalance) * 100)}% {t('retainedEarnings.complete', 'Complete')}</span>
                      <Badge className={reserve.status === "Active" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                        {reserve.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "profit-loss",
      label: t('retainedEarnings.profitLoss', 'Profit & Loss'),
      icon: BarChart3,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('retainedEarnings.annualProfitLossSummary', 'Annual Profit & Loss Summary')}</h3>
          <Card className="bg-gray-50 dark:bg-salis-gray-dark/30">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('retainedEarnings.fiscalYear', 'Fiscal Year')}</TableHead>
                    <TableHead className="text-right">{t('retainedEarnings.revenue', 'Revenue')}</TableHead>
                    <TableHead className="text-right">{t('retainedEarnings.expenses', 'Expenses')}</TableHead>
                    <TableHead className="text-right">{t('retainedEarnings.netProfit', 'Net Profit')}</TableHead>
                    <TableHead className="text-right">{t('retainedEarnings.retained', 'Retained')}</TableHead>
                    <TableHead className="text-right">{t('retainedEarnings.distributed', 'Distributed')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profitLossHistory.map((record) => (
                    <TableRow key={record.id} data-testid={`row-profit-loss-${record.id}`}>
                      <TableCell className="font-medium font-montserrat">{record.year}</TableCell>
                      <TableCell className="text-right font-montserrat">SAR {record.revenue.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-montserrat text-red-600">SAR {record.expenses.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-montserrat text-green-600 font-bold">SAR {record.netProfit.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-montserrat">SAR {record.retained.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-montserrat">SAR {record.distributed.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-50 dark:bg-salis-gray-dark/30">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm text-gray-500">{t('retainedEarnings.threeYearAvgProfit', '3-Year Avg Profit')}</p>
                <p className="text-xl font-bold font-montserrat" data-testid="text-avg-profit">SAR 533,333</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 dark:bg-salis-gray-dark/30">
              <CardContent className="p-4 text-center">
                <Percent className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-gray-500">{t('retainedEarnings.retentionRate', 'Retention Rate')}</p>
                <p className="text-xl font-bold font-montserrat" data-testid="text-retention-rate">70%</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 dark:bg-salis-gray-dark/30">
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-sm text-gray-500">{t('retainedEarnings.profitMargin', 'Profit Margin')}</p>
                <p className="text-xl font-bold font-montserrat" data-testid="text-profit-margin">28%</p>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: "reserves",
      label: t('retainedEarnings.reserves', 'Reserves'),
      icon: Shield,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t('retainedEarnings.reserveAllocations', 'Reserve Allocations')}</h3>
            <Dialog open={isReserveDialogOpen} onOpenChange={setIsReserveDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-reserve">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('retainedEarnings.allocateToReserve', 'Allocate to Reserve')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('retainedEarnings.allocateToReserve', 'Allocate to Reserve')}</DialogTitle>
                </DialogHeader>
                <Form {...reserveForm}>
                  <form onSubmit={reserveForm.handleSubmit(onReserveSubmit)} className="space-y-4">
                    <FormField
                      control={reserveForm.control}
                      name="reserveType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('retainedEarnings.reserveType', 'Reserve Type')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-reserve-type">
                                <SelectValue placeholder={t('retainedEarnings.selectReserveType', 'Select reserve type')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="legal">{t('retainedEarnings.legalReserve', 'Legal Reserve')}</SelectItem>
                              <SelectItem value="general">{t('retainedEarnings.generalReserve', 'General Reserve')}</SelectItem>
                              <SelectItem value="statutory">{t('retainedEarnings.statutoryReserve', 'Statutory Reserve')}</SelectItem>
                              <SelectItem value="contingency">{t('retainedEarnings.contingencyReserve', 'Contingency Reserve')}</SelectItem>
                              <SelectItem value="expansion">{t('retainedEarnings.expansionReserve', 'Expansion Reserve')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={reserveForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('retainedEarnings.amountSAR', 'Amount (SAR)')}</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} data-testid="input-reserve-amount" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={reserveForm.control}
                        name="fiscalYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('retainedEarnings.fiscalYear', 'Fiscal Year')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-fiscal-year">
                                  <SelectValue placeholder={t('retainedEarnings.selectYear', 'Select year')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="2024">2024</SelectItem>
                                <SelectItem value="2023">2023</SelectItem>
                                <SelectItem value="2022">2022</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={reserveForm.control}
                      name="allocationDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('retainedEarnings.allocationDate', 'Allocation Date')}</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-allocation-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={reserveForm.control}
                      name="approvedBy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('retainedEarnings.approvedBy', 'Approved By')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-approved-by">
                                <SelectValue placeholder={t('retainedEarnings.selectApprover', 'Select approver')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="board">{t('retainedEarnings.boardOfDirectors', 'Board of Directors')}</SelectItem>
                              <SelectItem value="management">{t('retainedEarnings.management', 'Management')}</SelectItem>
                              <SelectItem value="partners">{t('retainedEarnings.partnersMeeting', 'Partners Meeting')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={reserveForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('retainedEarnings.descriptionOptional', 'Description (Optional)')}</FormLabel>
                          <FormControl>
                            <Textarea {...field} data-testid="input-reserve-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" data-testid="button-submit-reserve">
                      {t('retainedEarnings.allocateToReserve', 'Allocate to Reserve')}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="bg-gray-50 dark:bg-salis-gray-dark/30">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.date', 'Date')}</TableHead>
                    <TableHead>{t('retainedEarnings.reserveType', 'Reserve Type')}</TableHead>
                    <TableHead>{t('retainedEarnings.fiscalYear', 'Fiscal Year')}</TableHead>
                    <TableHead>{t('retainedEarnings.approvedBy', 'Approved By')}</TableHead>
                    <TableHead className="text-right">{t('common.amount', 'Amount')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reserveAllocations.map((allocation) => (
                    <TableRow key={allocation.id} data-testid={`row-reserve-allocation-${allocation.id}`}>
                      <TableCell className="font-montserrat">{allocation.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{allocation.type}</Badge>
                      </TableCell>
                      <TableCell className="font-montserrat">{allocation.year}</TableCell>
                      <TableCell>{allocation.approvedBy}</TableCell>
                      <TableCell className="text-right font-montserrat text-blue-600">
                        SAR {allocation.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "distributions",
      label: t('retainedEarnings.distributions', 'Distributions'),
      icon: DollarSign,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t('retainedEarnings.profitDistributions', 'Profit Distributions')}</h3>
            <Dialog open={isDistributionDialogOpen} onOpenChange={setIsDistributionDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-distribution">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('retainedEarnings.newDistribution', 'New Distribution')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('retainedEarnings.newProfitDistribution', 'New Profit Distribution')}</DialogTitle>
                </DialogHeader>
                <Form {...distributionForm}>
                  <form onSubmit={distributionForm.handleSubmit(onDistributionSubmit)} className="space-y-4">
                    <FormField
                      control={distributionForm.control}
                      name="distributionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('retainedEarnings.distributionType', 'Distribution Type')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-distribution-type">
                                <SelectValue placeholder={t('retainedEarnings.selectType', 'Select type')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="dividend">{t('retainedEarnings.partnerDividend', 'Partner Dividend')}</SelectItem>
                              <SelectItem value="bonus">{t('retainedEarnings.staffBonus', 'Staff Bonus')}</SelectItem>
                              <SelectItem value="interim">{t('retainedEarnings.interimDividend', 'Interim Dividend')}</SelectItem>
                              <SelectItem value="special">{t('retainedEarnings.specialDistribution', 'Special Distribution')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={distributionForm.control}
                        name="totalAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('retainedEarnings.totalAmountSAR', 'Total Amount (SAR)')}</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} data-testid="input-distribution-amount" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={distributionForm.control}
                        name="fiscalYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('retainedEarnings.fiscalYear', 'Fiscal Year')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-dist-fiscal-year">
                                  <SelectValue placeholder={t('retainedEarnings.selectYear', 'Select year')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="2024">2024</SelectItem>
                                <SelectItem value="2023">2023</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={distributionForm.control}
                      name="distributionDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('retainedEarnings.distributionDate', 'Distribution Date')}</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-distribution-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={distributionForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('retainedEarnings.notesOptional', 'Notes (Optional)')}</FormLabel>
                          <FormControl>
                            <Textarea {...field} data-testid="input-distribution-notes" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" data-testid="button-submit-distribution">
                      {t('retainedEarnings.createDistribution', 'Create Distribution')}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="bg-gray-50 dark:bg-salis-gray-dark/30">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.date', 'Date')}</TableHead>
                    <TableHead>{t('common.type', 'Type')}</TableHead>
                    <TableHead>{t('retainedEarnings.recipients', 'Recipients')}</TableHead>
                    <TableHead className="text-right">{t('common.amount', 'Amount')}</TableHead>
                    <TableHead>{t('common.status', 'Status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {distributions.map((distribution) => (
                    <TableRow key={distribution.id} data-testid={`row-distribution-${distribution.id}`}>
                      <TableCell className="font-montserrat">{distribution.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{distribution.type}</Badge>
                      </TableCell>
                      <TableCell>{distribution.recipients}</TableCell>
                      <TableCell className="text-right font-montserrat text-amber-600">
                        SAR {distribution.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          {distribution.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <TabsPageLayout
      title={t('retainedEarnings.title', 'Retained Earnings & Reserves')}
      titleArabic={t('retainedEarnings.titleArabic', 'الاحتياطات والأرباح والخسائر')}
      description={t('retainedEarnings.description', 'Manage retained earnings, profit reserves, and distributions')}
      descriptionArabic={t('retainedEarnings.descriptionArabic', 'إدارة الأرباح المحتجزة والاحتياطات وتوزيعات الأرباح')}
      icon={PiggyBank}
      tabs={tabs}
      defaultTab="overview"
    />
  );
}
