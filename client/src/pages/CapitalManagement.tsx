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
            <Card className="bg-gray-50 dark:bg-salis-gray-dark/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('capital.totalCapital', 'Total Capital')}</p>
                    <p className="text-2xl font-bold font-montserrat" data-testid="text-total-capital">SAR 1,000,000</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 dark:bg-salis-gray-dark/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('capital.totalShareholders', 'Total Shareholders')}</p>
                    <p className="text-2xl font-bold font-montserrat" data-testid="text-total-shareholders">3</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 dark:bg-salis-gray-dark/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('capital.issuedShares', 'Issued Shares')}</p>
                    <p className="text-2xl font-bold font-montserrat" data-testid="text-issued-shares">100,000</p>
                  </div>
                  <PieChart className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 dark:bg-salis-gray-dark/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('capital.parValue', 'Par Value')}</p>
                    <p className="text-2xl font-bold font-montserrat" data-testid="text-par-value">SAR 10</p>
                  </div>
                  <Landmark className="h-8 w-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-50 dark:bg-salis-gray-dark/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                {t('capital.ownershipDistribution', 'Ownership Distribution')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shareholders.map((shareholder) => (
                  <div key={shareholder.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{shareholder.name}</span>
                      <span className="text-sm text-gray-500">{shareholder.percentage}%</span>
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
            <h3 className="text-lg font-semibold">{t('capital.shareholderRegistry', 'Shareholder Registry')}</h3>
            <Dialog open={isContributionDialogOpen} onOpenChange={setIsContributionDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-contribution">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('capital.addContribution', 'Add Contribution')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('capital.addCapitalContribution', 'Add Capital Contribution')}</DialogTitle>
                </DialogHeader>
                <Form {...contributionForm}>
                  <form onSubmit={contributionForm.handleSubmit(onContributionSubmit)} className="space-y-4">
                    <FormField
                      control={contributionForm.control}
                      name="shareholderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('capital.shareholderName', 'Shareholder Name')}</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-shareholder-name" />
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
                          <FormLabel>{t('capital.contributionType', 'Contribution Type')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-contribution-type">
                                <SelectValue placeholder={t('capital.selectType', 'Select type')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
                            <FormLabel>{t('capital.amountSAR', 'Amount (SAR)')}</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} data-testid="input-contribution-amount" />
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
                            <FormLabel>{t('capital.sharePercent', 'Share %')}</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} data-testid="input-share-percentage" />
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
                          <FormLabel>{t('common.date', 'Date')}</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-contribution-date" />
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
                          <FormLabel>{t('capital.paymentMethod', 'Payment Method')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-payment-method">
                                <SelectValue placeholder={t('capital.selectMethod', 'Select method')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="bank_transfer">{t('capital.bankTransfer', 'Bank Transfer')}</SelectItem>
                              <SelectItem value="cash">{t('capital.cash', 'Cash')}</SelectItem>
                              <SelectItem value="check">{t('capital.check', 'Check')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" data-testid="button-submit-contribution">
                      {t('capital.addContribution', 'Add Contribution')}
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
                    <TableHead>{t('capital.shareholder', 'Shareholder')}</TableHead>
                    <TableHead>{t('common.type', 'Type')}</TableHead>
                    <TableHead className="text-right">{t('capital.shares', 'Shares')}</TableHead>
                    <TableHead className="text-right">{t('capital.ownershipPercent', 'Ownership %')}</TableHead>
                    <TableHead className="text-right">{t('capital.contribution', 'Contribution')}</TableHead>
                    <TableHead>{t('common.status', 'Status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shareholders.map((shareholder) => (
                    <TableRow key={shareholder.id} data-testid={`row-shareholder-${shareholder.id}`}>
                      <TableCell className="font-medium">{shareholder.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{shareholder.type}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-montserrat">{shareholder.shares.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-montserrat">{shareholder.percentage}%</TableCell>
                      <TableCell className="text-right font-montserrat">SAR {shareholder.contribution.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
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
            <h3 className="text-lg font-semibold">{t('capital.shareClasses', 'Share Classes')}</h3>
            <Dialog open={isStructureDialogOpen} onOpenChange={setIsStructureDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-share-class">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('capital.addShareClass', 'Add Share Class')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('capital.addShareClass', 'Add Share Class')}</DialogTitle>
                </DialogHeader>
                <Form {...structureForm}>
                  <form onSubmit={structureForm.handleSubmit(onStructureSubmit)} className="space-y-4">
                    <FormField
                      control={structureForm.control}
                      name="shareClass"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('capital.shareClassName', 'Share Class Name')}</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-share-class" />
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
                            <FormLabel>{t('capital.authorizedShares', 'Authorized Shares')}</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} data-testid="input-authorized-shares" />
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
                            <FormLabel>{t('capital.issuedShares', 'Issued Shares')}</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} data-testid="input-issued-shares" />
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
                          <FormLabel>{t('capital.parValueSAR', 'Par Value (SAR)')}</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} data-testid="input-par-value" />
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
                          <FormLabel>{t('capital.votingRights', 'Voting Rights')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-voting-rights">
                                <SelectValue placeholder={t('capital.selectVotingRights', 'Select voting rights')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1_vote">{t('capital.oneVotePerShare', '1 Vote Per Share')}</SelectItem>
                              <SelectItem value="no_vote">{t('capital.noVotingRights', 'No Voting Rights')}</SelectItem>
                              <SelectItem value="2_votes">{t('capital.twoVotesPerShare', '2 Votes Per Share')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" data-testid="button-submit-share-class">
                      {t('capital.addShareClass', 'Add Share Class')}
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
                    <TableHead>{t('capital.shareClass', 'Share Class')}</TableHead>
                    <TableHead className="text-right">{t('capital.authorized', 'Authorized')}</TableHead>
                    <TableHead className="text-right">{t('capital.issued', 'Issued')}</TableHead>
                    <TableHead className="text-right">{t('capital.available', 'Available')}</TableHead>
                    <TableHead className="text-right">{t('capital.parValue', 'Par Value')}</TableHead>
                    <TableHead>{t('capital.votingRights', 'Voting Rights')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shareClasses.map((sc) => (
                    <TableRow key={sc.id} data-testid={`row-share-class-${sc.id}`}>
                      <TableCell className="font-medium">{sc.class}</TableCell>
                      <TableCell className="text-right font-montserrat">{sc.authorized.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-montserrat">{sc.issued.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-montserrat">{(sc.authorized - sc.issued).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-montserrat">SAR {sc.parValue}</TableCell>
                      <TableCell>{sc.votingRights}</TableCell>
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
      label: t('capital.capitalHistory', 'Capital History'),
      icon: Calendar,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('capital.capitalTransactionHistory', 'Capital Transaction History')}</h3>
          <Card className="bg-gray-50 dark:bg-salis-gray-dark/30">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.date', 'Date')}</TableHead>
                    <TableHead>{t('capital.transactionType', 'Transaction Type')}</TableHead>
                    <TableHead>{t('capital.shareholder', 'Shareholder')}</TableHead>
                    <TableHead>{t('capital.paymentMethod', 'Payment Method')}</TableHead>
                    <TableHead className="text-right">{t('common.amount', 'Amount')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {capitalHistory.map((transaction) => (
                    <TableRow key={transaction.id} data-testid={`row-capital-history-${transaction.id}`}>
                      <TableCell className="font-montserrat">{transaction.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.type}</Badge>
                      </TableCell>
                      <TableCell>{transaction.shareholder}</TableCell>
                      <TableCell>{transaction.method}</TableCell>
                      <TableCell className="text-right font-montserrat text-green-600">
                        +SAR {transaction.amount.toLocaleString()}
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
    <div className="p-6 space-y-6">
      <TabsPageLayout
        title={t('capital.title', 'Capital Management')}
        description={t('capital.description', 'إدارة رأس المال - Manage shareholders, equity, and capital structure')}
        defaultTab="overview"
        tabs={tabs}
      />
    </div>
  );
}
