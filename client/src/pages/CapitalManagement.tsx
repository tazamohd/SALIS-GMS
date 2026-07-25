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
import { Label } from "@/components/ui/label";
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
import {
  Landmark,
  Plus,
  TrendingUp,
  Users,
  PieChart,
  FileText,
  Calendar,
  DollarSign,
  Building2,
  Percent,
  ExternalLink,
  Wallet,
  ArrowLeft,
} from "lucide-react";

const capitalContributionSchema = z.object({
  shareholderName: z.string().min(1, "Shareholder name is required"),
  contributionType: z.string().min(1, "Contribution type is required"),
  amount: z.string().min(1, "Amount is required"),
  sharePercentage: z.string().min(1, "Share percentage is required"),
  contributionDate: z.string().min(1, "Date is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  notes: z.string().optional(),
});

type CapitalContributionFormData = z.infer<typeof capitalContributionSchema>;

const capitalStructureSchema = z.object({
  shareClass: z.string().min(1, "Share class is required"),
  authorizedShares: z.string().min(1, "Authorized shares is required"),
  issuedShares: z.string().min(1, "Issued shares is required"),
  parValue: z.string().min(1, "Par value is required"),
  votingRights: z.string().min(1, "Voting rights is required"),
});

type CapitalStructureFormData = z.infer<typeof capitalStructureSchema>;

export default function CapitalManagement() {
  const { t } = useTranslation();
  const [isContributionDialogOpen, setIsContributionDialogOpen] = useState(false);
  const [isStructureDialogOpen, setIsStructureDialogOpen] = useState(false);

  const contributionForm = useForm<CapitalContributionFormData>({
    resolver: zodResolver(capitalContributionSchema),
    defaultValues: {
      shareholderName: "",
      contributionType: "",
      amount: "",
      sharePercentage: "",
      contributionDate: "",
      paymentMethod: "",
      notes: "",
    },
  });

  const structureForm = useForm<CapitalStructureFormData>({
    resolver: zodResolver(capitalStructureSchema),
    defaultValues: {
      shareClass: "",
      authorizedShares: "",
      issuedShares: "",
      parValue: "",
      votingRights: "",
    },
  });

  const onContributionSubmit = (data: CapitalContributionFormData) => {
    console.log("Capital contribution:", data);
    setIsContributionDialogOpen(false);
    contributionForm.reset();
  };

  const onStructureSubmit = (data: CapitalStructureFormData) => {
    console.log("Capital structure:", data);
    setIsStructureDialogOpen(false);
    structureForm.reset();
  };

  const shareholders = [
    { id: 1, name: "Ahmed Al-Rashid", shares: 50000, percentage: 50, type: "Founder", contribution: 500000, status: "Active" },
    { id: 2, name: "Mohammed Hassan", shares: 30000, percentage: 30, type: "Investor", contribution: 300000, status: "Active" },
    { id: 3, name: "Khalid Abdullah", shares: 20000, percentage: 20, type: "Partner", contribution: 200000, status: "Active" },
  ];

  const capitalHistory = [
    { id: 1, date: "2024-01-15", type: "Initial Capital", amount: 500000, shareholder: "Ahmed Al-Rashid", method: "Bank Transfer" },
    { id: 2, date: "2024-02-20", type: "Capital Increase", amount: 300000, shareholder: "Mohammed Hassan", method: "Bank Transfer" },
    { id: 3, date: "2024-03-10", type: "Capital Increase", amount: 200000, shareholder: "Khalid Abdullah", method: "Cash" },
  ];

  const shareClasses = [
    { id: 1, class: "Common Shares", authorized: 200000, issued: 100000, parValue: 10, votingRights: "1 vote per share" },
    { id: 2, class: "Preferred Shares", authorized: 50000, issued: 0, parValue: 100, votingRights: "No voting rights" },
  ];

  const tabs = [
    {
      id: "overview",
      label: t('capital.overview', 'Overview'),
      icon: Landmark,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#64748B]">{t('capital.totalCapital', 'Total Capital')}</p>
                    <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-total-capital">SAR 1,000,000</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#64748B]">{t('capital.totalShareholders', 'Total Shareholders')}</p>
                    <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-total-shareholders">3</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#64748B]">{t('capital.issuedShares', 'Issued Shares')}</p>
                    <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-issued-shares">100,000</p>
                  </div>
                  <PieChart className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#64748B]">{t('capital.parValue', 'Par Value')}</p>
                    <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-par-value">SAR 10</p>
                  </div>
                  <Landmark className="h-8 w-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <PieChart className="h-5 w-5" />
                {t('capital.ownershipDistribution', 'Ownership Distribution')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shareholders.map((shareholder) => (
                  <div key={shareholder.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#0B1F3B] dark:text-white">{shareholder.name}</span>
                      <span className="text-sm text-[#64748B]">{shareholder.percentage}%</span>
                    </div>
                    <Progress value={shareholder.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "shareholders",
      label: t('capital.shareholders', 'Shareholders'),
      icon: Users,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">{t('capital.shareholderRegistry', 'Shareholder Registry')}</h3>
            <Dialog open={isContributionDialogOpen} onOpenChange={setIsContributionDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90" data-testid="button-add-contribution">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('capital.addContribution', 'Add Contribution')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <DialogHeader>
                  <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('capital.addCapitalContribution', 'Add Capital Contribution')}</DialogTitle>
                </DialogHeader>
                <Form {...contributionForm}>
                  <form onSubmit={contributionForm.handleSubmit(onContributionSubmit)} className="space-y-4">
                    <FormField
                      control={contributionForm.control}
                      name="shareholderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B1F3B] dark:text-white">{t('capital.shareholderName', 'Shareholder Name')}</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-shareholder-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={contributionForm.control}
                      name="contributionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B1F3B] dark:text-white">{t('capital.contributionType', 'Contribution Type')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-contribution-type">
                                <SelectValue placeholder={t('capital.selectType', 'Select type')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                              <SelectItem value="cash">{t('capital.cash', 'Cash')}</SelectItem>
                              <SelectItem value="equipment">{t('capital.equipment', 'Equipment')}</SelectItem>
                              <SelectItem value="property">{t('capital.property', 'Property')}</SelectItem>
                              <SelectItem value="intellectual">{t('capital.intellectualProperty', 'Intellectual Property')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={contributionForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#0B1F3B] dark:text-white">{t('capital.amountSAR', 'Amount (SAR)')}</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-contribution-amount" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={contributionForm.control}
                        name="sharePercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#0B1F3B] dark:text-white">{t('capital.sharePercent', 'Share %')}</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-share-percentage" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={contributionForm.control}
                      name="contributionDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.date', 'Date')}</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-contribution-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={contributionForm.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B1F3B] dark:text-white">{t('capital.paymentMethod', 'Payment Method')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-payment-method">
                                <SelectValue placeholder={t('capital.selectMethod', 'Select method')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                              <SelectItem value="bank_transfer">{t('capital.bankTransfer', 'Bank Transfer')}</SelectItem>
                              <SelectItem value="cash">{t('capital.cash', 'Cash')}</SelectItem>
                              <SelectItem value="check">{t('capital.check', 'Check')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" data-testid="button-submit-contribution">
                      {t('capital.addContribution', 'Add Contribution')}
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
                  <TableRow className="border-b border-[#E2E8F0] dark:border-[#232A36] bg-[#F8FAFC] dark:bg-[#0E1117]">
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('capital.shareholder', 'Shareholder')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.type', 'Type')}</TableHead>
                    <TableHead className="text-right text-[#0B1F3B] dark:text-white">{t('capital.shares', 'Shares')}</TableHead>
                    <TableHead className="text-right text-[#0B1F3B] dark:text-white">{t('capital.ownershipPercent', 'Ownership %')}</TableHead>
                    <TableHead className="text-right text-[#0B1F3B] dark:text-white">{t('capital.contribution', 'Contribution')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.status', 'Status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shareholders.map((shareholder) => (
                    <TableRow key={shareholder.id} className="border-b border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-shareholder-${shareholder.id}`}>
                      <TableCell className="font-medium text-[#0B1F3B] dark:text-white">{shareholder.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white">{shareholder.type}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-[#0B1F3B] dark:text-white">{shareholder.shares.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-[#0B1F3B] dark:text-white">{shareholder.percentage}%</TableCell>
                      <TableCell className="text-right font-mono text-[#0B1F3B] dark:text-white">SAR {shareholder.contribution.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200">
                          {t('common.active', 'Active')}
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
    {
      id: "structure",
      label: t('capital.capitalStructure', 'Capital Structure'),
      icon: Building2,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">{t('capital.shareClasses', 'Share Classes')}</h3>
            <Dialog open={isStructureDialogOpen} onOpenChange={setIsStructureDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90" data-testid="button-add-share-class">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('capital.addShareClass', 'Add Share Class')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <DialogHeader>
                  <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('capital.addShareClass', 'Add Share Class')}</DialogTitle>
                </DialogHeader>
                <Form {...structureForm}>
                  <form onSubmit={structureForm.handleSubmit(onStructureSubmit)} className="space-y-4">
                    <FormField
                      control={structureForm.control}
                      name="shareClass"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B1F3B] dark:text-white">{t('capital.shareClassName', 'Share Class Name')}</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-share-class" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={structureForm.control}
                        name="authorizedShares"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#0B1F3B] dark:text-white">{t('capital.authorizedShares', 'Authorized Shares')}</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-authorized-shares" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={structureForm.control}
                        name="issuedShares"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#0B1F3B] dark:text-white">{t('capital.issuedShares', 'Issued Shares')}</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-issued-shares" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={structureForm.control}
                      name="parValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B1F3B] dark:text-white">{t('capital.parValueSAR', 'Par Value (SAR)')}</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-par-value" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={structureForm.control}
                      name="votingRights"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B1F3B] dark:text-white">{t('capital.votingRights', 'Voting Rights')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-voting-rights">
                                <SelectValue placeholder={t('capital.selectVotingRights', 'Select voting rights')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                              <SelectItem value="1_vote">{t('capital.oneVotePerShare', '1 Vote Per Share')}</SelectItem>
                              <SelectItem value="no_vote">{t('capital.noVotingRights', 'No Voting Rights')}</SelectItem>
                              <SelectItem value="2_votes">{t('capital.twoVotesPerShare', '2 Votes Per Share')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" data-testid="button-submit-share-class">
                      {t('capital.addShareClass', 'Add Share Class')}
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
                  <TableRow className="border-b border-[#E2E8F0] dark:border-[#232A36] bg-[#F8FAFC] dark:bg-[#0E1117]">
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('capital.shareClass', 'Share Class')}</TableHead>
                    <TableHead className="text-right text-[#0B1F3B] dark:text-white">{t('capital.authorized', 'Authorized')}</TableHead>
                    <TableHead className="text-right text-[#0B1F3B] dark:text-white">{t('capital.issued', 'Issued')}</TableHead>
                    <TableHead className="text-right text-[#0B1F3B] dark:text-white">{t('capital.available', 'Available')}</TableHead>
                    <TableHead className="text-right text-[#0B1F3B] dark:text-white">{t('capital.parValue', 'Par Value')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('capital.votingRights', 'Voting Rights')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shareClasses.map((sc) => (
                    <TableRow key={sc.id} className="border-b border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-share-class-${sc.id}`}>
                      <TableCell className="font-medium text-[#0B1F3B] dark:text-white">{sc.class}</TableCell>
                      <TableCell className="text-right font-mono text-[#0B1F3B] dark:text-white">{sc.authorized.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-[#0B1F3B] dark:text-white">{sc.issued.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-green-600 dark:text-green-400">{(sc.authorized - sc.issued).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-[#0B1F3B] dark:text-white">SAR {sc.parValue}</TableCell>
                      <TableCell className="text-[#64748B]">{sc.votingRights}</TableCell>
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
      id: "history",
      label: t('capital.history', 'History'),
      icon: Calendar,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">{t('capital.capitalTransactionHistory', 'Capital Transaction History')}</h3>
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#E2E8F0] dark:border-[#232A36] bg-[#F8FAFC] dark:bg-[#0E1117]">
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.date', 'Date')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.type', 'Type')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('capital.shareholder', 'Shareholder')}</TableHead>
                    <TableHead className="text-right text-[#0B1F3B] dark:text-white">{t('common.amount', 'Amount')}</TableHead>
                    <TableHead className="text-[#0B1F3B] dark:text-white">{t('capital.method', 'Method')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {capitalHistory.map((tx) => (
                    <TableRow key={tx.id} className="border-b border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-history-${tx.id}`}>
                      <TableCell className="text-[#0B1F3B] dark:text-white">{tx.date}</TableCell>
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white">{tx.type}</Badge>
                      </TableCell>
                      <TableCell className="text-[#0B1F3B] dark:text-white">{tx.shareholder}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-green-600 dark:text-green-400">
                        SAR {tx.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-[#64748B]">{tx.method}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('capital.relatedModules', 'Related Modules')}</CardTitle>
              <CardDescription className="text-[#64748B]">{t('capital.navigateToRelated', 'Navigate to related pages')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/equity-management">
                  <Button variant="outline" className="w-full justify-start border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]" data-testid="link-equity">
                    <Wallet className="h-4 w-4 mr-2" />
                    {t('capital.equity', 'Equity')}
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Button>
                </Link>
                <Link href="/retained-earnings">
                  <Button variant="outline" className="w-full justify-start border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]" data-testid="link-retained-earnings">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {t('capital.retainedEarnings', 'Retained Earnings')}
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Button>
                </Link>
                <Link href="/balance-sheet">
                  <Button variant="outline" className="w-full justify-start border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]" data-testid="link-balance-sheet">
                    <FileText className="h-4 w-4 mr-2" />
                    {t('capital.balanceSheet', 'Balance Sheet')}
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Button>
                </Link>
                <Link href="/general-ledger">
                  <Button variant="outline" className="w-full justify-start border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]" data-testid="link-general-ledger">
                    <FileText className="h-4 w-4 mr-2" />
                    {t('capital.generalLedger', 'General Ledger')}
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <TabsPageLayout
      title={t('capital.capitalManagementTitle', 'Capital Management')}
      description={t('capital.capitalManagementDescription', 'Manage shareholders, capital structure, and contributions')}
      icon={Landmark}
      tabs={tabs}
      defaultTab="overview"
    />
  );
}
