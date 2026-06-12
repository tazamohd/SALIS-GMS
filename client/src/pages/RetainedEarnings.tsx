import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Plus,
  PiggyBank,
  Target,
  BarChart3,
  Shield,
  Percent,
  DollarSign,
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
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#64748B]">{t('retainedEarnings.totalRetainedEarnings', 'Total Retained Earnings')}</p>
                    <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-total-retained">SAR 1,120,000</p>
                  </div>
                  <PiggyBank className="h-8 w-8 text-[#0A5ED7]" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#64748B]">{t('retainedEarnings.totalReserves', 'Total Reserves')}</p>
                    <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-total-reserves">SAR 375,000</p>
                  </div>
                  <Shield className="h-8 w-8 text-[#0A5ED7]" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#64748B]">{t('retainedEarnings.currentYearProfit', 'Current Year Profit')}</p>
                    <p className="text-2xl font-bold text-[#0A5ED7]" data-testid="text-current-profit">SAR 700,000</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-[#0A5ED7]" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#64748B]">{t('retainedEarnings.distributedYTD', 'Distributed YTD')}</p>
                    <p className="text-2xl font-bold text-[#F97316]" data-testid="text-distributed-ytd">SAR 210,000</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-[#F97316]" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <Shield className="h-5 w-5 text-[#0A5ED7]" />
                {t('retainedEarnings.reserveStatus', 'Reserve Status')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {reserves.map((reserve) => (
                  <div key={reserve.id} className="space-y-2" data-testid={`reserve-progress-${reserve.id}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#0B1F3B] dark:text-white">{reserve.type}</span>
                        {reserve.requiredPercent > 0 && (
                          <Badge variant="outline" className="text-xs border-[#E2E8F0] dark:border-[#232A36] text-[#64748B]">
                            {reserve.requiredPercent}% {t('retainedEarnings.required', 'Required')}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-[#64748B]">
                        SAR {reserve.currentBalance.toLocaleString()} / SAR {reserve.targetBalance.toLocaleString()}
                      </div>
                    </div>
                    <Progress value={(reserve.currentBalance / reserve.targetBalance) * 100} className="h-2" />
                    <div className="flex justify-between text-xs text-[#64748B]">
                      <span>{Math.round((reserve.currentBalance / reserve.targetBalance) * 100)}% {t('retainedEarnings.complete', 'Complete')}</span>
                      <Badge className={reserve.status === "Active" ? "bg-[#0A5ED7] text-white" : "bg-[#0BB3FF] text-white"}>
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
          <h3 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">{t('retainedEarnings.annualProfitLossSummary', 'Annual Profit & Loss Summary')}</h3>
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                    <TableHead className="text-[#64748B]">{t('retainedEarnings.fiscalYear', 'Fiscal Year')}</TableHead>
                    <TableHead className="text-right text-[#64748B]">{t('retainedEarnings.revenue', 'Revenue')}</TableHead>
                    <TableHead className="text-right text-[#64748B]">{t('retainedEarnings.expenses', 'Expenses')}</TableHead>
                    <TableHead className="text-right text-[#64748B]">{t('retainedEarnings.netProfit', 'Net Profit')}</TableHead>
                    <TableHead className="text-right text-[#64748B]">{t('retainedEarnings.retained', 'Retained')}</TableHead>
                    <TableHead className="text-right text-[#64748B]">{t('retainedEarnings.distributed', 'Distributed')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profitLossHistory.map((record) => (
                    <TableRow key={record.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-profit-loss-${record.id}`}>
                      <TableCell className="font-medium text-[#0B1F3B] dark:text-white">{record.year}</TableCell>
                      <TableCell className="text-right text-[#0B1F3B] dark:text-white">SAR {record.revenue.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-[#F97316]">SAR {record.expenses.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-[#0A5ED7] font-bold">SAR {record.netProfit.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-[#0B1F3B] dark:text-white">SAR {record.retained.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-[#0B1F3B] dark:text-white">SAR {record.distributed.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-[#0A5ED7]" />
                <p className="text-sm text-[#64748B]">{t('retainedEarnings.threeYearAvgProfit', '3-Year Avg Profit')}</p>
                <p className="text-xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-avg-profit">SAR 533,333</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardContent className="p-4 text-center">
                <Percent className="h-8 w-8 mx-auto mb-2 text-[#0A5ED7]" />
                <p className="text-sm text-[#64748B]">{t('retainedEarnings.retentionRate', 'Retention Rate')}</p>
                <p className="text-xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-retention-rate">70%</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-[#0BB3FF]" />
                <p className="text-sm text-[#64748B]">{t('retainedEarnings.profitMargin', 'Profit Margin')}</p>
                <p className="text-xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-profit-margin">28%</p>
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
            <h3 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">{t('retainedEarnings.reserveAllocations', 'Reserve Allocations')}</h3>
            <Dialog open={isReserveDialogOpen} onOpenChange={setIsReserveDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952b8] hover:to-[#0aa0e6] text-white" data-testid="button-add-reserve">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('retainedEarnings.allocateToReserve', 'Allocate to Reserve')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <DialogHeader>
                  <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('retainedEarnings.allocateToReserve', 'Allocate to Reserve')}</DialogTitle>
                </DialogHeader>
                <Form {...reserveForm}>
                  <form onSubmit={reserveForm.handleSubmit(onReserveSubmit)} className="space-y-4">
                    <FormField
                      control={reserveForm.control}
                      name="reserveType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B1F3B] dark:text-white">{t('retainedEarnings.reserveType', 'Reserve Type')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-reserve-type">
                                <SelectValue placeholder={t('retainedEarnings.selectReserveType', 'Select reserve type')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
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
                            <FormLabel className="text-[#0B1F3B] dark:text-white">{t('retainedEarnings.amountSAR', 'Amount (SAR)')}</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-reserve-amount" />
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
                            <FormLabel className="text-[#0B1F3B] dark:text-white">{t('retainedEarnings.fiscalYear', 'Fiscal Year')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-fiscal-year">
                                  <SelectValue placeholder={t('retainedEarnings.selectYear', 'Select year')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
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
                          <FormLabel className="text-[#0B1F3B] dark:text-white">{t('retainedEarnings.allocationDate', 'Allocation Date')}</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-allocation-date" />
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
                          <FormLabel className="text-[#0B1F3B] dark:text-white">{t('retainedEarnings.approvedBy', 'Approved By')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-approved-by">
                                <SelectValue placeholder={t('retainedEarnings.selectApprover', 'Select approver')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
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
                          <FormLabel className="text-[#0B1F3B] dark:text-white">{t('retainedEarnings.descriptionOptional', 'Description (Optional)')}</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-reserve-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952b8] hover:to-[#0aa0e6] text-white" data-testid="button-submit-reserve">
                      {t('retainedEarnings.allocateToReserve', 'Allocate to Reserve')}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                    <TableHead className="text-[#64748B]">{t('common.date', 'Date')}</TableHead>
                    <TableHead className="text-[#64748B]">{t('retainedEarnings.reserveType', 'Reserve Type')}</TableHead>
                    <TableHead className="text-[#64748B]">{t('retainedEarnings.fiscalYear', 'Fiscal Year')}</TableHead>
                    <TableHead className="text-[#64748B]">{t('retainedEarnings.approvedBy', 'Approved By')}</TableHead>
                    <TableHead className="text-right text-[#64748B]">{t('common.amount', 'Amount')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reserveAllocations.map((allocation) => (
                    <TableRow key={allocation.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-reserve-allocation-${allocation.id}`}>
                      <TableCell className="text-[#0B1F3B] dark:text-white">{allocation.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-[#E2E8F0] dark:border-[#232A36] text-[#64748B]">{allocation.type}</Badge>
                      </TableCell>
                      <TableCell className="text-[#0B1F3B] dark:text-white">{allocation.year}</TableCell>
                      <TableCell className="text-[#0B1F3B] dark:text-white">{allocation.approvedBy}</TableCell>
                      <TableCell className="text-right text-[#0A5ED7]">
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
            <h3 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">{t('retainedEarnings.profitDistributions', 'Profit Distributions')}</h3>
            <Dialog open={isDistributionDialogOpen} onOpenChange={setIsDistributionDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952b8] hover:to-[#0aa0e6] text-white" data-testid="button-add-distribution">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('retainedEarnings.newDistribution', 'New Distribution')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <DialogHeader>
                  <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('retainedEarnings.newProfitDistribution', 'New Profit Distribution')}</DialogTitle>
                </DialogHeader>
                <Form {...distributionForm}>
                  <form onSubmit={distributionForm.handleSubmit(onDistributionSubmit)} className="space-y-4">
                    <FormField
                      control={distributionForm.control}
                      name="distributionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B1F3B] dark:text-white">{t('retainedEarnings.distributionType', 'Distribution Type')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-distribution-type">
                                <SelectValue placeholder={t('retainedEarnings.selectType', 'Select type')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                              <SelectItem value="dividend">{t('retainedEarnings.dividend', 'Dividend')}</SelectItem>
                              <SelectItem value="bonus">{t('retainedEarnings.bonus', 'Staff Bonus')}</SelectItem>
                              <SelectItem value="withdrawal">{t('retainedEarnings.partnerWithdrawal', 'Partner Withdrawal')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={distributionForm.control}
                      name="totalAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B1F3B] dark:text-white">{t('retainedEarnings.totalAmountSAR', 'Total Amount (SAR)')}</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-distribution-amount" />
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
                          <FormLabel className="text-[#0B1F3B] dark:text-white">{t('retainedEarnings.fiscalYear', 'Fiscal Year')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-dist-fiscal-year">
                                <SelectValue placeholder={t('retainedEarnings.selectYear', 'Select year')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                              <SelectItem value="2024">2024</SelectItem>
                              <SelectItem value="2023">2023</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={distributionForm.control}
                      name="distributionDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B1F3B] dark:text-white">{t('retainedEarnings.distributionDate', 'Distribution Date')}</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-distribution-date" />
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
                          <FormLabel className="text-[#0B1F3B] dark:text-white">{t('retainedEarnings.notesOptional', 'Notes (Optional)')}</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-distribution-notes" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952b8] hover:to-[#0aa0e6] text-white" data-testid="button-submit-distribution">
                      {t('retainedEarnings.createDistribution', 'Create Distribution')}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                    <TableHead className="text-[#64748B]">{t('common.date', 'Date')}</TableHead>
                    <TableHead className="text-[#64748B]">{t('common.type', 'Type')}</TableHead>
                    <TableHead className="text-[#64748B]">{t('retainedEarnings.recipients', 'Recipients')}</TableHead>
                    <TableHead className="text-right text-[#64748B]">{t('common.amount', 'Amount')}</TableHead>
                    <TableHead className="text-[#64748B]">{t('common.status', 'Status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {distributions.map((dist) => (
                    <TableRow key={dist.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-distribution-${dist.id}`}>
                      <TableCell className="text-[#0B1F3B] dark:text-white">{dist.date}</TableCell>
                      <TableCell>
                        <Badge className="bg-[#0A5ED7] text-white">{dist.type}</Badge>
                      </TableCell>
                      <TableCell className="text-[#0B1F3B] dark:text-white">{dist.recipients}</TableCell>
                      <TableCell className="text-right text-[#F97316] font-medium">
                        SAR {dist.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-[#0A5ED7] text-white">{dist.status}</Badge>
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
    <div className="p-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen">
      <TabsPageLayout
        title={t('retainedEarnings.title', 'Retained Earnings')}
        description={t('retainedEarnings.description', 'Manage reserves, profit allocations, and distributions')}
        defaultTab="overview"
        tabs={tabs}
      />
    </div>
  );
}
