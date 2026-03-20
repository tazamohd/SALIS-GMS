import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  ArrowRightLeft,
  RefreshCw,
  Settings,
  TrendingUp,
  DollarSign,
  Globe,
  Clock,
  ArrowDownUp,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface CurrencyRate {
  code: string;
  name: string;
  flag: string;
  buyRate: number;
  sellRate: number;
  midRate: number;
  lastUpdated: string;
}

interface CurrencySettingsData {
  defaultCurrency: string;
  decimalPlaces: number;
  numberFormat: "en" | "eu";
  autoConversion: boolean;
}

interface ConvertResult {
  from: string;
  to: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  timestamp: string;
}

interface CurrencyTransaction {
  id: number;
  date: string;
  description: string;
  originalAmount: number;
  originalCurrency: string;
  rateUsed: number;
  sarEquivalent: number;
  type: "invoice" | "payment" | "refund" | "expense";
  reference: string;
  customerName: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function CurrencySettings() {
  const { t } = useTranslation();
  const { toast } = useToast();

  // Converter state
  const [convertAmount, setConvertAmount] = useState<string>("100");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("SAR");
  const [convertResult, setConvertResult] = useState<ConvertResult | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<CurrencySettingsData | null>(null);

  // Transaction filters
  const [txTypeFilter, setTxTypeFilter] = useState("all");
  const [txCurrencyFilter, setTxCurrencyFilter] = useState("all");

  // ---- Queries ----
  const { data: ratesData, isLoading: ratesLoading } = useQuery<{ rates: CurrencyRate[] }>({
    queryKey: ["/api/currency/rates"],
  });

  const { data: settingsData, isLoading: settingsLoading } = useQuery<{ settings: CurrencySettingsData }>({
    queryKey: ["/api/currency/settings"],
  });

  const { data: txData, isLoading: txLoading } = useQuery<{
    transactions: CurrencyTransaction[];
    summary: { count: number; totalSAR: number; currencies: string[] };
  }>({
    queryKey: ["/api/currency/transactions", txTypeFilter, txCurrencyFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (txTypeFilter !== "all") params.set("type", txTypeFilter);
      if (txCurrencyFilter !== "all") params.set("currency", txCurrencyFilter);
      const res = await fetch(`/api/currency/transactions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load transactions");
      return res.json();
    },
  });

  // ---- Mutations ----
  const convertMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/currency/convert", {
        amount: parseFloat(convertAmount),
        from: fromCurrency,
        to: toCurrency,
      });
      return res.json();
    },
    onSuccess: (data: ConvertResult) => setConvertResult(data),
    onError: () =>
      toast({ title: "Conversion failed", description: "Please check your input", variant: "destructive" }),
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: Partial<CurrencySettingsData>) => {
      const res = await apiRequest("PUT", "/api/currency/settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/currency/settings"] });
      toast({ title: "Settings saved", description: "Currency settings updated successfully" });
    },
    onError: () =>
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" }),
  });

  // Initialize settings form when data loads
  if (settingsData && !settingsForm) {
    setSettingsForm(settingsData.settings);
  }

  const rates = ratesData?.rates ?? [];
  const transactions = txData?.transactions ?? [];
  const summary = txData?.summary;

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setConvertResult(null);
  };

  const formatNumber = (value: number, decimals = 2) => {
    const format = settingsData?.settings?.numberFormat ?? "en";
    if (format === "eu") {
      return value.toLocaleString("de-DE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }
    return value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const txTypeBadge = (type: string) => {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      invoice: { label: "Invoice", variant: "default" },
      payment: { label: "Payment", variant: "secondary" },
      refund: { label: "Refund", variant: "destructive" },
      expense: { label: "Expense", variant: "outline" },
    };
    const entry = map[type] ?? { label: type, variant: "outline" as const };
    return <Badge variant={entry.variant}>{entry.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            Multi-Currency Management
          </h1>
          <p className="text-muted-foreground">
            Exchange rates, converter, display settings, and transaction log
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" /> Base: SAR
          </Badge>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Supported Currencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Default Currency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settingsData?.settings?.defaultCurrency ?? "SAR"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.count ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total (SAR Equiv.)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summary?.totalSAR ?? 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rates" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rates" className="gap-1">
            <TrendingUp className="h-4 w-4" /> Exchange Rates
          </TabsTrigger>
          <TabsTrigger value="converter" className="gap-1">
            <ArrowRightLeft className="h-4 w-4" /> Converter
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1">
            <Settings className="h-4 w-4" /> Settings
          </TabsTrigger>
          <TabsTrigger value="transactions" className="gap-1">
            <DollarSign className="h-4 w-4" /> Transaction Log
          </TabsTrigger>
        </TabsList>

        {/* ================================================================
            TAB 1 — Exchange Rates
        ================================================================ */}
        <TabsContent value="rates">
          <Card>
            <CardHeader>
              <CardTitle>Live Exchange Rates</CardTitle>
              <CardDescription>All rates are relative to SAR (Saudi Riyal) as the base currency</CardDescription>
            </CardHeader>
            <CardContent>
              {ratesLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">Loading rates...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">Flag</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead className="text-right">Buy Rate</TableHead>
                      <TableHead className="text-right">Sell Rate</TableHead>
                      <TableHead className="text-right">Mid Rate</TableHead>
                      <TableHead className="text-right">1 Unit = SAR</TableHead>
                      <TableHead className="text-right">Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rates.map((rate) => (
                      <TableRow key={rate.code}>
                        <TableCell className="text-xl">{rate.flag}</TableCell>
                        <TableCell className="font-mono font-semibold">{rate.code}</TableCell>
                        <TableCell>{rate.name}</TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(rate.buyRate, 4)}</TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(rate.sellRate, 4)}</TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(rate.midRate, 4)}</TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {rate.code === "SAR"
                            ? "1.0000"
                            : formatNumber(1 / rate.midRate, 4)}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {formatDate(rate.lastUpdated)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================
            TAB 2 — Converter
        ================================================================ */}
        <TabsContent value="converter">
          <Card>
            <CardHeader>
              <CardTitle>Currency Converter</CardTitle>
              <CardDescription>Convert amounts between supported currencies using mid-market rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr]">
                {/* From */}
                <div className="space-y-3">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={convertAmount}
                    onChange={(e) => {
                      setConvertAmount(e.target.value);
                      setConvertResult(null);
                    }}
                    placeholder="Enter amount"
                    className="text-lg"
                  />
                  <Label>From Currency</Label>
                  <Select value={fromCurrency} onValueChange={(v) => { setFromCurrency(v); setConvertResult(null); }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {rates.map((r) => (
                        <SelectItem key={r.code} value={r.code}>
                          {r.flag} {r.code} — {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Swap button */}
                <div className="flex items-center justify-center">
                  <Button variant="outline" size="icon" onClick={swapCurrencies} title="Swap currencies">
                    <ArrowDownUp className="h-5 w-5" />
                  </Button>
                </div>

                {/* To */}
                <div className="space-y-3">
                  <Label>Converted Amount</Label>
                  <Input
                    readOnly
                    value={convertResult ? formatNumber(convertResult.convertedAmount, 4) : "—"}
                    className="text-lg bg-muted"
                    placeholder="Result"
                  />
                  <Label>To Currency</Label>
                  <Select value={toCurrency} onValueChange={(v) => { setToCurrency(v); setConvertResult(null); }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {rates.map((r) => (
                        <SelectItem key={r.code} value={r.code}>
                          {r.flag} {r.code} — {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  onClick={() => convertMutation.mutate()}
                  disabled={convertMutation.isPending || !convertAmount || parseFloat(convertAmount) <= 0}
                >
                  {convertMutation.isPending ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                  )}
                  Convert
                </Button>

                {convertResult && (
                  <p className="text-sm text-muted-foreground">
                    Rate: 1 {convertResult.from} = {formatNumber(convertResult.rate, 6)} {convertResult.to}
                  </p>
                )}
              </div>

              {convertResult && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-4">
                    <p className="text-center text-lg">
                      <span className="font-semibold">
                        {formatNumber(convertResult.amount, 2)} {convertResult.from}
                      </span>{" "}
                      ={" "}
                      <span className="text-2xl font-bold text-primary">
                        {formatNumber(convertResult.convertedAmount, 4)} {convertResult.to}
                      </span>
                    </p>
                    <p className="text-center text-xs text-muted-foreground mt-1">
                      as of {formatDate(convertResult.timestamp)}
                    </p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================
            TAB 3 — Settings
        ================================================================ */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Currency Display Settings</CardTitle>
              <CardDescription>Configure how currencies are displayed throughout the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {settingsLoading || !settingsForm ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">Loading settings...</div>
              ) : (
                <>
                  {/* Default currency */}
                  <div className="grid gap-2">
                    <Label>Default Display Currency</Label>
                    <Select
                      value={settingsForm.defaultCurrency}
                      onValueChange={(v) => setSettingsForm({ ...settingsForm, defaultCurrency: v })}
                    >
                      <SelectTrigger className="w-[300px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {rates.map((r) => (
                          <SelectItem key={r.code} value={r.code}>
                            {r.flag} {r.code} — {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      All amounts will be shown in this currency by default
                    </p>
                  </div>

                  {/* Decimal places */}
                  <div className="grid gap-2">
                    <Label>Decimal Places</Label>
                    <Select
                      value={String(settingsForm.decimalPlaces)}
                      onValueChange={(v) => setSettingsForm({ ...settingsForm, decimalPlaces: parseInt(v) })}
                    >
                      <SelectTrigger className="w-[300px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 — 1,234</SelectItem>
                        <SelectItem value="1">1 — 1,234.5</SelectItem>
                        <SelectItem value="2">2 — 1,234.56</SelectItem>
                        <SelectItem value="3">3 — 1,234.567</SelectItem>
                        <SelectItem value="4">4 — 1,234.5678</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Number format */}
                  <div className="grid gap-2">
                    <Label>Number Format</Label>
                    <Select
                      value={settingsForm.numberFormat}
                      onValueChange={(v) => setSettingsForm({ ...settingsForm, numberFormat: v as "en" | "eu" })}
                    >
                      <SelectTrigger className="w-[300px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English — 1,234.56</SelectItem>
                        <SelectItem value="eu">European — 1.234,56</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Auto-conversion */}
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={settingsForm.autoConversion}
                      onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, autoConversion: checked })}
                    />
                    <div>
                      <Label>Auto-Conversion</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically display SAR equivalent next to foreign currency amounts
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => saveSettingsMutation.mutate(settingsForm)}
                    disabled={saveSettingsMutation.isPending}
                  >
                    {saveSettingsMutation.isPending ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Settings className="mr-2 h-4 w-4" />
                    )}
                    Save Settings
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================
            TAB 4 — Transaction Log
        ================================================================ */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Multi-Currency Transactions</CardTitle>
                  <CardDescription>Recent transactions involving foreign currencies with SAR equivalents</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={txTypeFilter} onValueChange={setTxTypeFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="invoice">Invoice</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="refund">Refund</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={txCurrencyFilter} onValueChange={setTxCurrencyFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Currencies</SelectItem>
                      {rates
                        .filter((r) => r.code !== "SAR")
                        .map((r) => (
                          <SelectItem key={r.code} value={r.code}>
                            {r.flag} {r.code}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {txLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">Loading transactions...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No transactions found</div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Original Amount</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">SAR Equivalent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="text-xs whitespace-nowrap">{formatDate(tx.date)}</TableCell>
                          <TableCell className="font-mono text-xs">{tx.reference}</TableCell>
                          <TableCell>{txTypeBadge(tx.type)}</TableCell>
                          <TableCell className="max-w-[140px] truncate">{tx.customerName}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{tx.description}</TableCell>
                          <TableCell className="text-right font-mono whitespace-nowrap">
                            {formatNumber(tx.originalAmount)} {tx.originalCurrency}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">{formatNumber(tx.rateUsed, 4)}</TableCell>
                          <TableCell className="text-right font-mono font-semibold whitespace-nowrap">
                            {formatNumber(tx.sarEquivalent)} SAR
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {summary && (
                    <div className="mt-4 flex items-center justify-end gap-6 text-sm text-muted-foreground border-t pt-4">
                      <span>
                        Showing <strong>{summary.count}</strong> transactions across{" "}
                        <strong>{summary.currencies.length}</strong> currencies
                      </span>
                      <span className="font-semibold text-foreground">
                        Net Total: {formatNumber(summary.totalSAR)} SAR
                      </span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
