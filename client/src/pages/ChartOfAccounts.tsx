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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  FolderTree,
  Plus,
  Search,
  Download,
  Upload,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Building2,
  CreditCard,
  Wallet,
  TrendingUp,
  TrendingDown,
  FileText,
  ExternalLink,
  LayoutList,
  FolderOpen,
  Folder,
  DollarSign,
  CircleDot,
  Filter,
  RefreshCw,
} from "lucide-react";

const accountSchema = z.object({
  code: z.string().min(1, "Account code is required"),
  nameAr: z.string().min(1, "Arabic name is required"),
  nameEn: z.string().min(1, "English name is required"),
  type: z.string().min(1, "Account type is required"),
  parentCode: z.string().optional(),
  nature: z.string().min(1, "Nature is required"),
  level: z.string().min(1, "Level is required"),
  isActive: z.string().min(1, "Status is required"),
  description: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface Account {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  parentCode: string | null;
  nature: "debit" | "credit";
  level: number;
  isActive: boolean;
  balance: number;
  children?: Account[];
}

const sampleAccounts: Account[] = [
  {
    id: "1",
    code: "1",
    nameAr: "الأصول",
    nameEn: "Assets",
    type: "asset",
    parentCode: null,
    nature: "debit",
    level: 1,
    isActive: true,
    balance: 5250000,
    children: [
      {
        id: "11",
        code: "11",
        nameAr: "الأصول المتداولة",
        nameEn: "Current Assets",
        type: "asset",
        parentCode: "1",
        nature: "debit",
        level: 2,
        isActive: true,
        balance: 2750000,
        children: [
          {
            id: "111",
            code: "111",
            nameAr: "النقدية والبنوك",
            nameEn: "Cash and Banks",
            type: "asset",
            parentCode: "11",
            nature: "debit",
            level: 3,
            isActive: true,
            balance: 850000,
            children: [
              { id: "1111", code: "1111", nameAr: "الصندوق", nameEn: "Cash on Hand", type: "asset", parentCode: "111", nature: "debit", level: 4, isActive: true, balance: 45000 },
              { id: "1112", code: "1112", nameAr: "البنك الأهلي", nameEn: "Al Ahli Bank", type: "asset", parentCode: "111", nature: "debit", level: 4, isActive: true, balance: 380000 },
              { id: "1113", code: "1113", nameAr: "بنك الراجحي", nameEn: "Al Rajhi Bank", type: "asset", parentCode: "111", nature: "debit", level: 4, isActive: true, balance: 425000 },
            ],
          },
          {
            id: "112",
            code: "112",
            nameAr: "الذمم المدينة",
            nameEn: "Accounts Receivable",
            type: "asset",
            parentCode: "11",
            nature: "debit",
            level: 3,
            isActive: true,
            balance: 650000,
            children: [
              { id: "1121", code: "1121", nameAr: "ذمم العملاء", nameEn: "Customer Receivables", type: "asset", parentCode: "112", nature: "debit", level: 4, isActive: true, balance: 580000 },
              { id: "1122", code: "1122", nameAr: "أوراق القبض", nameEn: "Notes Receivable", type: "asset", parentCode: "112", nature: "debit", level: 4, isActive: true, balance: 70000 },
            ],
          },
          {
            id: "113",
            code: "113",
            nameAr: "المخزون",
            nameEn: "Inventory",
            type: "asset",
            parentCode: "11",
            nature: "debit",
            level: 3,
            isActive: true,
            balance: 1250000,
            children: [
              { id: "1131", code: "1131", nameAr: "قطع الغيار", nameEn: "Spare Parts", type: "asset", parentCode: "113", nature: "debit", level: 4, isActive: true, balance: 850000 },
              { id: "1132", code: "1132", nameAr: "الزيوت والسوائل", nameEn: "Oils and Fluids", type: "asset", parentCode: "113", nature: "debit", level: 4, isActive: true, balance: 180000 },
              { id: "1133", code: "1133", nameAr: "الإطارات", nameEn: "Tires", type: "asset", parentCode: "113", nature: "debit", level: 4, isActive: true, balance: 220000 },
            ],
          },
        ],
      },
      {
        id: "12",
        code: "12",
        nameAr: "الأصول الثابتة",
        nameEn: "Fixed Assets",
        type: "asset",
        parentCode: "1",
        nature: "debit",
        level: 2,
        isActive: true,
        balance: 2500000,
        children: [
          { id: "121", code: "121", nameAr: "المباني", nameEn: "Buildings", type: "asset", parentCode: "12", nature: "debit", level: 3, isActive: true, balance: 1500000 },
          { id: "122", code: "122", nameAr: "المعدات والآلات", nameEn: "Equipment & Machinery", type: "asset", parentCode: "12", nature: "debit", level: 3, isActive: true, balance: 650000 },
          { id: "123", code: "123", nameAr: "الأثاث والتجهيزات", nameEn: "Furniture & Fixtures", type: "asset", parentCode: "12", nature: "debit", level: 3, isActive: true, balance: 180000 },
          { id: "124", code: "124", nameAr: "السيارات", nameEn: "Vehicles", type: "asset", parentCode: "12", nature: "debit", level: 3, isActive: true, balance: 320000 },
          { id: "125", code: "125", nameAr: "مجمع الإهلاك", nameEn: "Accumulated Depreciation", type: "asset", parentCode: "12", nature: "credit", level: 3, isActive: true, balance: -150000 },
        ],
      },
    ],
  },
  {
    id: "2",
    code: "2",
    nameAr: "الخصوم",
    nameEn: "Liabilities",
    type: "liability",
    parentCode: null,
    nature: "credit",
    level: 1,
    isActive: true,
    balance: 1720000,
    children: [
      {
        id: "21",
        code: "21",
        nameAr: "الخصوم المتداولة",
        nameEn: "Current Liabilities",
        type: "liability",
        parentCode: "2",
        nature: "credit",
        level: 2,
        isActive: true,
        balance: 920000,
        children: [
          { id: "211", code: "211", nameAr: "الذمم الدائنة", nameEn: "Accounts Payable", type: "liability", parentCode: "21", nature: "credit", level: 3, isActive: true, balance: 450000 },
          { id: "212", code: "212", nameAr: "أوراق الدفع", nameEn: "Notes Payable", type: "liability", parentCode: "21", nature: "credit", level: 3, isActive: true, balance: 120000 },
          { id: "213", code: "213", nameAr: "ضريبة القيمة المضافة", nameEn: "VAT Payable", type: "liability", parentCode: "21", nature: "credit", level: 3, isActive: true, balance: 85000 },
          { id: "214", code: "214", nameAr: "الرواتب المستحقة", nameEn: "Salaries Payable", type: "liability", parentCode: "21", nature: "credit", level: 3, isActive: true, balance: 165000 },
          { id: "215", code: "215", nameAr: "مستحقات أخرى", nameEn: "Other Accruals", type: "liability", parentCode: "21", nature: "credit", level: 3, isActive: true, balance: 100000 },
        ],
      },
      {
        id: "22",
        code: "22",
        nameAr: "الخصوم طويلة الأجل",
        nameEn: "Long-term Liabilities",
        type: "liability",
        parentCode: "2",
        nature: "credit",
        level: 2,
        isActive: true,
        balance: 800000,
        children: [
          { id: "221", code: "221", nameAr: "القروض البنكية", nameEn: "Bank Loans", type: "liability", parentCode: "22", nature: "credit", level: 3, isActive: true, balance: 600000 },
          { id: "222", code: "222", nameAr: "التزامات الإيجار", nameEn: "Lease Obligations", type: "liability", parentCode: "22", nature: "credit", level: 3, isActive: true, balance: 200000 },
        ],
      },
    ],
  },
  {
    id: "3",
    code: "3",
    nameAr: "حقوق الملكية",
    nameEn: "Equity",
    type: "equity",
    parentCode: null,
    nature: "credit",
    level: 1,
    isActive: true,
    balance: 3530000,
    children: [
      { id: "31", code: "31", nameAr: "رأس المال", nameEn: "Share Capital", type: "equity", parentCode: "3", nature: "credit", level: 2, isActive: true, balance: 2500000 },
      { id: "32", code: "32", nameAr: "الأرباح المحتجزة", nameEn: "Retained Earnings", type: "equity", parentCode: "3", nature: "credit", level: 2, isActive: true, balance: 850000 },
      { id: "33", code: "33", nameAr: "أرباح العام الحالي", nameEn: "Current Year Profit", type: "equity", parentCode: "3", nature: "credit", level: 2, isActive: true, balance: 180000 },
    ],
  },
  {
    id: "4",
    code: "4",
    nameAr: "الإيرادات",
    nameEn: "Revenue",
    type: "revenue",
    parentCode: null,
    nature: "credit",
    level: 1,
    isActive: true,
    balance: 4850000,
    children: [
      {
        id: "41",
        code: "41",
        nameAr: "إيرادات الخدمات",
        nameEn: "Service Revenue",
        type: "revenue",
        parentCode: "4",
        nature: "credit",
        level: 2,
        isActive: true,
        balance: 3200000,
        children: [
          { id: "411", code: "411", nameAr: "إيرادات الصيانة", nameEn: "Maintenance Revenue", type: "revenue", parentCode: "41", nature: "credit", level: 3, isActive: true, balance: 2100000 },
          { id: "412", code: "412", nameAr: "إيرادات الإصلاح", nameEn: "Repair Revenue", type: "revenue", parentCode: "41", nature: "credit", level: 3, isActive: true, balance: 850000 },
          { id: "413", code: "413", nameAr: "إيرادات الفحص", nameEn: "Inspection Revenue", type: "revenue", parentCode: "41", nature: "credit", level: 3, isActive: true, balance: 250000 },
        ],
      },
      {
        id: "42",
        code: "42",
        nameAr: "إيرادات المبيعات",
        nameEn: "Sales Revenue",
        type: "revenue",
        parentCode: "4",
        nature: "credit",
        level: 2,
        isActive: true,
        balance: 1650000,
        children: [
          { id: "421", code: "421", nameAr: "مبيعات قطع الغيار", nameEn: "Spare Parts Sales", type: "revenue", parentCode: "42", nature: "credit", level: 3, isActive: true, balance: 1200000 },
          { id: "422", code: "422", nameAr: "مبيعات الزيوت", nameEn: "Oil Sales", type: "revenue", parentCode: "42", nature: "credit", level: 3, isActive: true, balance: 280000 },
          { id: "423", code: "423", nameAr: "مبيعات الإطارات", nameEn: "Tire Sales", type: "revenue", parentCode: "42", nature: "credit", level: 3, isActive: true, balance: 170000 },
        ],
      },
    ],
  },
  {
    id: "5",
    code: "5",
    nameAr: "المصروفات",
    nameEn: "Expenses",
    type: "expense",
    parentCode: null,
    nature: "debit",
    level: 1,
    isActive: true,
    balance: 4670000,
    children: [
      {
        id: "51",
        code: "51",
        nameAr: "تكلفة المبيعات",
        nameEn: "Cost of Sales",
        type: "expense",
        parentCode: "5",
        nature: "debit",
        level: 2,
        isActive: true,
        balance: 2850000,
        children: [
          { id: "511", code: "511", nameAr: "تكلفة قطع الغيار", nameEn: "Spare Parts Cost", type: "expense", parentCode: "51", nature: "debit", level: 3, isActive: true, balance: 1800000 },
          { id: "512", code: "512", nameAr: "تكلفة العمالة المباشرة", nameEn: "Direct Labor Cost", type: "expense", parentCode: "51", nature: "debit", level: 3, isActive: true, balance: 850000 },
          { id: "513", code: "513", nameAr: "تكاليف غير مباشرة", nameEn: "Overhead Costs", type: "expense", parentCode: "51", nature: "debit", level: 3, isActive: true, balance: 200000 },
        ],
      },
      {
        id: "52",
        code: "52",
        nameAr: "المصروفات التشغيلية",
        nameEn: "Operating Expenses",
        type: "expense",
        parentCode: "5",
        nature: "debit",
        level: 2,
        isActive: true,
        balance: 1520000,
        children: [
          { id: "521", code: "521", nameAr: "الرواتب والأجور", nameEn: "Salaries & Wages", type: "expense", parentCode: "52", nature: "debit", level: 3, isActive: true, balance: 980000 },
          { id: "522", code: "522", nameAr: "الإيجار", nameEn: "Rent Expense", type: "expense", parentCode: "52", nature: "debit", level: 3, isActive: true, balance: 180000 },
          { id: "523", code: "523", nameAr: "الكهرباء والماء", nameEn: "Utilities", type: "expense", parentCode: "52", nature: "debit", level: 3, isActive: true, balance: 85000 },
          { id: "524", code: "524", nameAr: "الإهلاك", nameEn: "Depreciation", type: "expense", parentCode: "52", nature: "debit", level: 3, isActive: true, balance: 150000 },
          { id: "525", code: "525", nameAr: "التأمين", nameEn: "Insurance", type: "expense", parentCode: "52", nature: "debit", level: 3, isActive: true, balance: 65000 },
          { id: "526", code: "526", nameAr: "مصروفات أخرى", nameEn: "Other Expenses", type: "expense", parentCode: "52", nature: "debit", level: 3, isActive: true, balance: 60000 },
        ],
      },
      {
        id: "53",
        code: "53",
        nameAr: "المصروفات الإدارية",
        nameEn: "Administrative Expenses",
        type: "expense",
        parentCode: "5",
        nature: "debit",
        level: 2,
        isActive: true,
        balance: 300000,
        children: [
          { id: "531", code: "531", nameAr: "مصروفات مكتبية", nameEn: "Office Expenses", type: "expense", parentCode: "53", nature: "debit", level: 3, isActive: true, balance: 120000 },
          { id: "532", code: "532", nameAr: "مصروفات قانونية", nameEn: "Legal Expenses", type: "expense", parentCode: "53", nature: "debit", level: 3, isActive: true, balance: 80000 },
          { id: "533", code: "533", nameAr: "مصروفات تدريب", nameEn: "Training Expenses", type: "expense", parentCode: "53", nature: "debit", level: 3, isActive: true, balance: 100000 },
        ],
      },
    ],
  },
];

const flattenAccounts = (accounts: Account[], result: Account[] = []): Account[] => {
  accounts.forEach((account) => {
    result.push(account);
    if (account.children) {
      flattenAccounts(account.children, result);
    }
  });
  return result;
};

const allAccounts = flattenAccounts(sampleAccounts);

const getTypeColor = (type: string) => {
  switch (type) {
    case "asset":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "liability":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "equity":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "revenue":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "expense":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "asset":
      return <Building2 className="h-4 w-4" />;
    case "liability":
      return <CreditCard className="h-4 w-4" />;
    case "equity":
      return <Wallet className="h-4 w-4" />;
    case "revenue":
      return <TrendingUp className="h-4 w-4" />;
    case "expense":
      return <TrendingDown className="h-4 w-4" />;
    default:
      return <CircleDot className="h-4 w-4" />;
  }
};

interface AccountTreeNodeProps {
  account: Account;
  level?: number;
}

function AccountTreeNode({ account, level = 0 }: AccountTreeNodeProps) {
  const [isOpen, setIsOpen] = useState(level < 2);
  const hasChildren = account.children && account.children.length > 0;

  return (
    <div className="select-none">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div
          className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors ${
            level === 0 ? "bg-muted/30" : ""
          }`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
          data-testid={`tree-node-${account.code}`}
        >
          {hasChildren ? (
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" data-testid={`button-toggle-${account.code}`}>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          ) : (
            <div className="w-6" />
          )}
          
          {hasChildren ? (
            isOpen ? (
              <FolderOpen className="h-4 w-4 text-yellow-600" />
            ) : (
              <Folder className="h-4 w-4 text-yellow-600" />
            )
          ) : (
            <FileText className="h-4 w-4 text-muted-foreground" />
          )}

          <span className="font-mono text-sm font-medium text-muted-foreground w-16">
            {account.code}
          </span>
          
          <span className="flex-1 text-sm">
            {account.nameAr}
            <span className="text-muted-foreground ml-2">({account.nameEn})</span>
          </span>

          <Badge variant="outline" className={getTypeColor(account.type)}>
            {getTypeIcon(account.type)}
            <span className="ml-1 capitalize">{account.type}</span>
          </Badge>

          <span className={`font-mono text-sm font-medium w-32 text-right ${
            account.balance >= 0 ? "text-green-600" : "text-red-600"
          }`}>
            SAR {Math.abs(account.balance).toLocaleString()}
          </span>

          <Badge variant={account.isActive ? "default" : "secondary"} className="w-16 justify-center">
            {account.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        {hasChildren && (
          <CollapsibleContent>
            {account.children?.map((child) => (
              <AccountTreeNode key={child.id} account={child} level={level + 1} />
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
}

export default function ChartOfAccounts() {
  const { t } = useTranslation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      code: "",
      nameAr: "",
      nameEn: "",
      type: "",
      parentCode: "",
      nature: "",
      level: "",
      isActive: "true",
      description: "",
    },
  });

  const onSubmit = (data: AccountFormData) => {
    console.log("New account:", data);
    setIsAddDialogOpen(false);
    form.reset();
  };

  const totalAssets = allAccounts.filter(a => a.type === "asset" && a.level === 1).reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = allAccounts.filter(a => a.type === "liability" && a.level === 1).reduce((sum, a) => sum + a.balance, 0);
  const totalEquity = allAccounts.filter(a => a.type === "equity" && a.level === 1).reduce((sum, a) => sum + a.balance, 0);
  const totalRevenue = allAccounts.filter(a => a.type === "revenue" && a.level === 1).reduce((sum, a) => sum + a.balance, 0);
  const totalExpenses = allAccounts.filter(a => a.type === "expense" && a.level === 1).reduce((sum, a) => sum + a.balance, 0);

  const filteredAccounts = allAccounts.filter((account) => {
    const matchesSearch =
      account.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.nameAr.includes(searchQuery) ||
      account.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || account.type === filterType;
    return matchesSearch && matchesType;
  });

  const treeViewTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card data-testid="card-total-assets" className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B] flex items-center gap-2">
              <Building2 className="h-4 w-4 text-green-600" />
              {t('accounting.totalAssets', 'Total Assets')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              SAR {totalAssets.toLocaleString()}
            </div>
            <p className="text-xs text-[#64748B] mt-1">{t('accounting.totalAssetsAr', 'Total Assets')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-liabilities" className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B] flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-red-600" />
              {t('accounting.totalLiabilities', 'Total Liabilities')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              SAR {totalLiabilities.toLocaleString()}
            </div>
            <p className="text-xs text-[#64748B] mt-1">{t('accounting.totalLiabilitiesAr', 'Total Liabilities')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-equity" className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4 text-blue-600" />
              {t('accounting.totalEquity', 'Total Equity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              SAR {totalEquity.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('accounting.totalEquityAr', 'Total Equity')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-revenue">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              {t('accounting.totalRevenue', 'Total Revenue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              SAR {totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('accounting.totalRevenueAr', 'Revenue')}</p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-expenses">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-600" />
              {t('accounting.totalExpenses', 'Total Expenses')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              SAR {totalExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('accounting.totalExpensesAr', 'Expenses')}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <FolderTree className="h-5 w-5" />
                {t('accounting.accountTreeStructure', 'Account Tree Structure')}
              </CardTitle>
              <CardDescription className="text-[#64748B]">{t('accounting.accountTreeDescription', 'Hierarchical view of all accounts')}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-[#E2E8F0] dark:border-[#232A36]" data-testid="button-expand-all">
                <ChevronDown className="h-4 w-4 mr-1" />
                {t('common.expandAll', 'Expand All')}
              </Button>
              <Button variant="outline" size="sm" className="border-[#E2E8F0] dark:border-[#232A36]" data-testid="button-collapse-all">
                <ChevronRight className="h-4 w-4 mr-1" />
                {t('common.collapseAll', 'Collapse All')}
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90" data-testid="button-add-account">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('accounting.addAccount', 'Add Account')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl" data-testid="modal-add-account">
                  <DialogHeader>
                    <DialogTitle>{t('accounting.addNewAccount', 'Add New Account')}</DialogTitle>
                    <DialogDescription>{t('accounting.addNewAccountDescription', 'Create a new account in the chart')}</DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('accounting.accountCode', 'Account Code')}</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder={t('accounting.accountCodePlaceholder', 'e.g., 1111')} data-testid="input-account-code" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="parentCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('accounting.parentAccount', 'Parent Account')}</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-parent-account">
                                    <SelectValue placeholder={t('accounting.selectParent', 'Select parent')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="none">{t('accounting.noneRootAccount', 'None (Root Account)')}</SelectItem>
                                  {allAccounts.filter(a => a.level < 4).map((account) => (
                                    <SelectItem key={account.id} value={account.code}>
                                      {account.code} - {account.nameEn}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="nameAr"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('accounting.arabicName', 'Arabic Name')}</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder={t('accounting.accountNameAr', 'Account name (Arabic)')} dir="rtl" data-testid="input-name-ar" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="nameEn"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('accounting.englishName', 'English Name')}</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder={t('accounting.accountNameEn', 'Account name')} data-testid="input-name-en" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('accounting.accountType', 'Account Type')}</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-account-type">
                                    <SelectValue placeholder={t('accounting.selectType', 'Select type')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="asset">{t('accounting.asset', 'Asset')}</SelectItem>
                                  <SelectItem value="liability">{t('accounting.liability', 'Liability')}</SelectItem>
                                  <SelectItem value="equity">{t('accounting.equity', 'Equity')}</SelectItem>
                                  <SelectItem value="revenue">{t('accounting.revenue', 'Revenue')}</SelectItem>
                                  <SelectItem value="expense">{t('accounting.expense', 'Expense')}</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="nature"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('accounting.nature', 'Nature')}</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-nature">
                                    <SelectValue placeholder={t('accounting.selectNature', 'Select nature')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="debit">{t('accounting.debitNature', 'Debit')}</SelectItem>
                                  <SelectItem value="credit">{t('accounting.creditNature', 'Credit')}</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="level"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('accounting.level', 'Level')}</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-level">
                                    <SelectValue placeholder={t('accounting.selectLevel', 'Select level')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">{t('accounting.level1Main', 'Level 1 (Main)')}</SelectItem>
                                  <SelectItem value="2">{t('accounting.level2Category', 'Level 2 (Category)')}</SelectItem>
                                  <SelectItem value="3">{t('accounting.level3SubCategory', 'Level 3 (Sub-category)')}</SelectItem>
                                  <SelectItem value="4">{t('accounting.level4Detail', 'Level 4 (Detail)')}</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('common.description', 'Description')}</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder={t('accounting.accountDescriptionPlaceholder', 'Account description (optional)')} data-testid="input-description" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} data-testid="button-cancel">
                          {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button type="submit" data-testid="button-save-account">
                          {t('accounting.saveAccount', 'Save Account')}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg p-2">
            {sampleAccounts.map((account) => (
              <AccountTreeNode key={account.id} account={account} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('accounting.relatedFinancialModules', 'Related Financial Modules')}</CardTitle>
          <CardDescription className="text-[#64748B]">{t('accounting.relatedFinancialModulesDescription', 'Quick access to related modules')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/assets-management">
              <Card className="cursor-pointer hover:border-primary transition-colors h-full bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="link-assets-management">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Building2 className="h-8 w-8 text-green-600" />
                    <ExternalLink className="h-4 w-4 text-[#64748B]" />
                  </div>
                  <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{t('nav.assets_management', 'Assets Management')}</CardTitle>
                  <CardDescription className="text-[#64748B]">{t('accounting.assetsAr', 'Assets')}</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/liabilities-management">
              <Card className="cursor-pointer hover:border-primary transition-colors h-full bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="link-liabilities-management">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CreditCard className="h-8 w-8 text-red-600" />
                    <ExternalLink className="h-4 w-4 text-[#64748B]" />
                  </div>
                  <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{t('nav.liabilities', 'Liabilities')}</CardTitle>
                  <CardDescription className="text-[#64748B]">{t('accounting.liabilitiesAr', 'Liabilities')}</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/equity-management">
              <Card className="cursor-pointer hover:border-primary transition-colors h-full bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="link-equity-management">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Wallet className="h-8 w-8 text-blue-600" />
                    <ExternalLink className="h-4 w-4 text-[#64748B]" />
                  </div>
                  <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{t('nav.equity_management', 'Equity Management')}</CardTitle>
                  <CardDescription className="text-[#64748B]">{t('accounting.equityAr', 'Equity')}</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/sales-management">
              <Card className="cursor-pointer hover:border-primary transition-colors h-full bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="link-sales-management">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <ExternalLink className="h-4 w-4 text-[#64748B]" />
                  </div>
                  <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{t('nav.sales_revenue', 'Sales & Revenue')}</CardTitle>
                  <CardDescription className="text-[#64748B]">{t('accounting.salesRevenueAr', 'Sales & Revenue')}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const listViewTab = (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <LayoutList className="h-5 w-5" />
                {t('accounting.allAccountsList', 'All Accounts List')}
              </CardTitle>
              <CardDescription className="text-[#64748B]">{t('accounting.allAccountsListDescription', 'Flat view of all accounts')}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                <Input
                  placeholder={t('accounting.searchAccounts', 'Search accounts...')}
                  className="pl-9 w-64 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-accounts"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-filter-type">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={t('accounting.filterByType', 'Filter by type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('accounting.allTypes', 'All Types')}</SelectItem>
                  <SelectItem value="asset">{t('accounting.assets', 'Assets')}</SelectItem>
                  <SelectItem value="liability">{t('accounting.liabilities', 'Liabilities')}</SelectItem>
                  <SelectItem value="equity">{t('accounting.equityType', 'Equity')}</SelectItem>
                  <SelectItem value="revenue">{t('accounting.revenueType', 'Revenue')}</SelectItem>
                  <SelectItem value="expense">{t('accounting.expenses', 'Expenses')}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="border-[#E2E8F0] dark:border-[#232A36]" data-testid="button-export">
                <Download className="h-4 w-4 mr-2" />
                {t('common.export', 'Export')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">{t('accounting.code', 'Code')}</TableHead>
                <TableHead>{t('accounting.arabicName', 'Arabic Name')}</TableHead>
                <TableHead>{t('accounting.englishName', 'English Name')}</TableHead>
                <TableHead>{t('common.type', 'Type')}</TableHead>
                <TableHead>{t('accounting.nature', 'Nature')}</TableHead>
                <TableHead>{t('accounting.level', 'Level')}</TableHead>
                <TableHead className="text-right">{t('accounting.balance', 'Balance')}</TableHead>
                <TableHead>{t('common.status', 'Status')}</TableHead>
                <TableHead className="text-right">{t('common.actions', 'Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id} data-testid={`row-account-${account.code}`}>
                  <TableCell className="font-mono font-medium">{account.code}</TableCell>
                  <TableCell dir="rtl">{account.nameAr}</TableCell>
                  <TableCell>{account.nameEn}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getTypeColor(account.type)}>
                      {getTypeIcon(account.type)}
                      <span className="ml-1 capitalize">{account.type}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={account.nature === "debit" ? "default" : "secondary"}>
                      {account.nature === "debit" ? t('accounting.debit', 'Debit') : t('accounting.credit', 'Credit')}
                    </Badge>
                  </TableCell>
                  <TableCell>{account.level}</TableCell>
                  <TableCell className={`text-right font-mono ${account.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    SAR {Math.abs(account.balance).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={account.isActive ? "default" : "secondary"}>
                      {account.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" data-testid={`button-edit-${account.code}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" data-testid={`button-delete-${account.code}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const accountTypesTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-green-500 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-assets-summary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <Building2 className="h-5 w-5 text-green-600" />
              {t('accounting.assetsTitle', 'Assets')}
            </CardTitle>
            <CardDescription className="text-[#64748B]">{t('accounting.assetsDescription', 'Resources owned by the business')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-4">
              SAR {totalAssets.toLocaleString()}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-[#0B1F3B] dark:text-white">
                <span>{t('accounting.currentAssets', 'Current Assets')}</span>
                <span className="font-medium">SAR 2,750,000</span>
              </div>
              <div className="flex justify-between text-sm text-[#0B1F3B] dark:text-white">
                <span>{t('accounting.fixedAssets', 'Fixed Assets')}</span>
                <span className="font-medium">SAR 2,500,000</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-[#64748B]">
              {t('accounting.normalBalance', 'Normal Balance')}: <Badge variant="outline" className="border-[#E2E8F0] dark:border-[#232A36]">{t('accounting.debitNature', 'Debit')}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-liabilities-summary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <CreditCard className="h-5 w-5 text-red-600" />
              {t('accounting.liabilitiesTitle', 'Liabilities')}
            </CardTitle>
            <CardDescription className="text-[#64748B]">{t('accounting.liabilitiesDescription', 'Obligations owed to others')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 mb-4">
              SAR {totalLiabilities.toLocaleString()}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-[#0B1F3B] dark:text-white">
                <span>{t('accounting.currentLiabilities', 'Current Liabilities')}</span>
                <span className="font-medium">SAR 920,000</span>
              </div>
              <div className="flex justify-between text-sm text-[#0B1F3B] dark:text-white">
                <span>{t('accounting.longTermLiabilities', 'Long-term Liabilities')}</span>
                <span className="font-medium">SAR 800,000</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-[#64748B]">
              {t('accounting.normalBalance', 'Normal Balance')}: <Badge variant="outline" className="border-[#E2E8F0] dark:border-[#232A36]">{t('accounting.creditNature', 'Credit')}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-equity-summary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <Wallet className="h-5 w-5 text-blue-600" />
              {t('accounting.equityTitle', 'Equity')}
            </CardTitle>
            <CardDescription className="text-[#64748B]">{t('accounting.equityDescription', "Owner's stake in the business")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-4">
              SAR {totalEquity.toLocaleString()}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-[#0B1F3B] dark:text-white">
                <span>{t('accounting.shareCapital', 'Share Capital')}</span>
                <span className="font-medium">SAR 2,500,000</span>
              </div>
              <div className="flex justify-between text-sm text-[#0B1F3B] dark:text-white">
                <span>{t('accounting.retainedEarnings', 'Retained Earnings')}</span>
                <span className="font-medium">SAR 1,030,000</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-[#64748B]">
              {t('accounting.normalBalance', 'Normal Balance')}: <Badge variant="outline" className="border-[#E2E8F0] dark:border-[#232A36]">{t('accounting.creditNature', 'Credit')}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-revenue-summary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              {t('accounting.revenueTitle', 'Revenue')}
            </CardTitle>
            <CardDescription className="text-[#64748B]">{t('accounting.revenueDescription', 'Income from business operations')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-4">
              SAR {totalRevenue.toLocaleString()}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-[#0B1F3B] dark:text-white">
                <span>{t('accounting.serviceRevenue', 'Service Revenue')}</span>
                <span className="font-medium">SAR 3,200,000</span>
              </div>
              <div className="flex justify-between text-sm text-[#0B1F3B] dark:text-white">
                <span>{t('accounting.salesRevenue', 'Sales Revenue')}</span>
                <span className="font-medium">SAR 1,650,000</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-[#64748B]">
              {t('accounting.normalBalance', 'Normal Balance')}: <Badge variant="outline" className="border-[#E2E8F0] dark:border-[#232A36]">{t('accounting.creditNature', 'Credit')}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#F97316] bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-expenses-summary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <TrendingDown className="h-5 w-5 text-[#F97316]" />
              {t('accounting.expensesTitle', 'Expenses')}
            </CardTitle>
            <CardDescription className="text-[#64748B]">{t('accounting.expensesDescription', 'Costs of business operations')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#F97316] mb-4">
              SAR {totalExpenses.toLocaleString()}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-[#0B1F3B] dark:text-white">
                <span>{t('accounting.costOfSales', 'Cost of Sales')}</span>
                <span className="font-medium">SAR 2,850,000</span>
              </div>
              <div className="flex justify-between text-sm text-[#0B1F3B] dark:text-white">
                <span>{t('accounting.operatingExpenses', 'Operating Expenses')}</span>
                <span className="font-medium">SAR 1,820,000</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-[#64748B]">
              {t('accounting.normalBalance', 'Normal Balance')}: <Badge variant="outline" className="border-[#E2E8F0] dark:border-[#232A36]">{t('accounting.debitNature', 'Debit')}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-accounting-equation">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <DollarSign className="h-5 w-5" />
              {t('accounting.accountingEquation', 'Accounting Equation')}
            </CardTitle>
            <CardDescription className="text-[#64748B]">{t('accounting.accountingEquationAr', 'Balance Sheet Equation')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
                <p className="text-lg font-medium text-[#0B1F3B] dark:text-white">{t('accounting.equationFormula', 'Assets = Liabilities + Equity')}</p>
                <p className="text-sm text-[#64748B] mt-1">{t('accounting.equationFormulaAr', 'Assets = Liabilities + Equity')}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded">
                  <p className="text-xs text-[#64748B]">{t('accounting.assets', 'Assets')}</p>
                  <p className="font-bold text-green-600">{totalAssets.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded">
                  <p className="text-xs text-[#64748B]">{t('accounting.liabilities', 'Liabilities')}</p>
                  <p className="font-bold text-red-600">{totalLiabilities.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded">
                  <p className="text-xs text-[#64748B]">{t('accounting.equityType', 'Equity')}</p>
                  <p className="font-bold text-blue-600">{totalEquity.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-center">
                <Badge variant={totalAssets === (totalLiabilities + totalEquity) ? "default" : "destructive"} className={totalAssets === (totalLiabilities + totalEquity) ? "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" : "bg-[#F97316] text-white"}>
                  {totalAssets === (totalLiabilities + totalEquity) ? t('accounting.balancedCheck', '✓ Balanced') : t('accounting.unbalancedCheck', '⚠ Unbalanced')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const tabs = [
    {
      id: "tree-view",
      label: t('accounting.chartOfAccounts.tabs.treeView', 'Tree View'),
      icon: FolderTree,
      content: treeViewTab,
    },
    {
      id: "list-view",
      label: t('accounting.chartOfAccounts.tabs.listView', 'List View'),
      icon: LayoutList,
      content: listViewTab,
    },
    {
      id: "account-types",
      label: t('accounting.chartOfAccounts.tabs.accountTypes', 'Account Types'),
      icon: FileText,
      content: accountTypesTab,
    },
  ];

  return (
    <TabsPageLayout
      title={t('accounting.chartOfAccounts.title', 'Chart of Accounts')}
      description={t('accounting.chartOfAccounts.description', 'Manage your complete chart of accounts with hierarchical structure')}
      icon={FolderTree}
      tabs={tabs}
      defaultTab="tree-view"
    />
  );
}
