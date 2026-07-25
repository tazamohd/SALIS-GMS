/**
 * SALIS AUTO - Saudi Arabia Compliance Dashboard
 * Comprehensive view of ZATCA compliance, VAT reporting,
 * Hijri calendar, Saudization ratio, and GOSI status.
 */

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  FileCheck,
  Receipt,
  Calendar,
  Users,
  Building2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Moon,
} from "lucide-react";

interface SaudiDashboardData {
  hijriDate: {
    day: number;
    month: number;
    year: number;
    monthName: string;
    monthNameArabic: string;
    formatted: string;
    isRamadan: boolean;
  };
  zatca: {
    complianceRate: number;
    compliantInvoices: number;
    nonCompliantInvoices: number;
    totalChecked: number;
    recentIssues: Array<{ invoiceNumber: string; errors: string[] }>;
  };
  vat: {
    period: string;
    totalInvoices: number;
    totalRevenue: number;
    vatCollected: number;
    vatPayable: number;
    totalPaid: number;
  };
  labor: {
    totalEmployees: number;
    saudiEmployees: number;
    nonSaudiEmployees: number;
    saudizationRatio: number;
    saudizationTarget: number;
    saudizationStatus: string;
    gosiStatus: string;
    gosiLastPayment: string;
  };
}

export default function SaudiComplianceDashboard() {
  const { data, isLoading, error } = useQuery<SaudiDashboardData>({
    queryKey: ["/api/saudi/dashboard"],
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Saudi Compliance Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-32" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Saudi Compliance Dashboard</h1>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              Failed to load Saudi compliance data. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Saudi Compliance Dashboard</h1>
          <p className="text-muted-foreground">
            ZATCA, VAT, Saudization & GOSI compliance overview
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Auto-refreshing
        </Badge>
      </div>

      {/* Hijri Date & Ramadan Banner */}
      <Card className="border-l-4 border-l-emerald-600">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="text-lg font-semibold">
                  {data.hijriDate.day} {data.hijriDate.monthName}{" "}
                  {data.hijriDate.year} AH
                </p>
                <p className="text-sm text-muted-foreground">
                  {data.hijriDate.day} {data.hijriDate.monthNameArabic}{" "}
                  {data.hijriDate.year} &#x0647;&#x0640;
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.hijriDate.formatted}
                </p>
              </div>
            </div>
            {data.hijriDate.isRamadan && (
              <Badge className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1">
                <Moon className="h-3 w-3" />
                Ramadan Mubarak
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ZATCA Compliance Rate */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              ZATCA Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data.zatca.complianceRate}%
            </div>
            <Progress
              value={data.zatca.complianceRate}
              className="mt-2 h-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {data.zatca.compliantInvoices} of {data.zatca.totalChecked}{" "}
              invoices compliant
            </p>
          </CardContent>
        </Card>

        {/* VAT Collected */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              VAT Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              SAR {data.vat.vatCollected.toLocaleString("en-SA", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.vat.period} &middot; {data.vat.totalInvoices} invoices
            </p>
          </CardContent>
        </Card>

        {/* Saudization Ratio */}
        <Card
          className={`border-l-4 ${
            data.labor.saudizationStatus === "compliant"
              ? "border-l-green-500"
              : "border-l-red-500"
          }`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Saudization (Nitaqat)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data.labor.saudizationRatio}%
            </div>
            <Progress
              value={data.labor.saudizationRatio}
              className="mt-2 h-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Target: {data.labor.saudizationTarget}% &middot;{" "}
              {data.labor.saudiEmployees} of {data.labor.totalEmployees}{" "}
              employees
            </p>
          </CardContent>
        </Card>

        {/* GOSI Status */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              GOSI Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {data.labor.gosiStatus === "active" ? (
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  Active
                </Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Last payment:{" "}
              {new Date(data.labor.gosiLastPayment).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ZATCA Compliance Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              ZATCA E-Invoicing (Phase 2)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {data.zatca.compliantInvoices}
                </div>
                <p className="text-xs text-muted-foreground">Compliant</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {data.zatca.nonCompliantInvoices}
                </div>
                <p className="text-xs text-muted-foreground">Non-Compliant</p>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {data.zatca.totalChecked}
                </div>
                <p className="text-xs text-muted-foreground">Total Checked</p>
              </div>
            </div>

            <Separator />

            {data.zatca.recentIssues.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-medium flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Recent Compliance Issues
                </p>
                {data.zatca.recentIssues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="border rounded-lg p-3 bg-amber-50 dark:bg-amber-950/20"
                  >
                    <p className="text-sm font-medium">
                      Invoice #{issue.invoiceNumber}
                    </p>
                    <ul className="mt-1 space-y-1">
                      {issue.errors.map((err, errIdx) => (
                        <li
                          key={errIdx}
                          className="text-xs text-muted-foreground flex items-center gap-1"
                        >
                          <XCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                          {err}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <p className="text-sm">All invoices are ZATCA compliant</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* VAT Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-green-500" />
              VAT Summary &mdash; {data.vat.period}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Revenue (incl. VAT)
                </span>
                <span className="font-semibold">
                  SAR{" "}
                  {data.vat.totalRevenue.toLocaleString("en-SA", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  VAT Collected (15%)
                </span>
                <span className="font-semibold text-green-600">
                  SAR{" "}
                  {data.vat.vatCollected.toLocaleString("en-SA", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  VAT Payable to ZATCA
                </span>
                <span className="font-semibold text-blue-600">
                  SAR{" "}
                  {data.vat.vatPayable.toLocaleString("en-SA", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Paid by Customers
                </span>
                <span className="font-semibold">
                  SAR{" "}
                  {data.vat.totalPaid.toLocaleString("en-SA", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <Separator />

            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                VAT returns are due by the end of the month following the tax
                period. Ensure all invoices are ZATCA Phase 2 compliant before
                filing.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Saudization Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500" />
              Saudization (Nitaqat Program)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">
                  {data.labor.totalEmployees}
                </div>
                <p className="text-xs text-muted-foreground">Total Staff</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {data.labor.saudiEmployees}
                </div>
                <p className="text-xs text-muted-foreground">Saudi Nationals</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {data.labor.nonSaudiEmployees}
                </div>
                <p className="text-xs text-muted-foreground">Non-Saudi</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Saudization Ratio</span>
                <span className="font-medium">
                  {data.labor.saudizationRatio}% / {data.labor.saudizationTarget}%
                  target
                </span>
              </div>
              <Progress value={data.labor.saudizationRatio} className="h-3" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Nitaqat Status:
              </span>
              <Badge
                className={
                  data.labor.saudizationStatus === "compliant"
                    ? "bg-green-100 text-green-800 border-green-300"
                    : "bg-red-100 text-red-800 border-red-300"
                }
              >
                {data.labor.saudizationStatus === "compliant"
                  ? "Compliant"
                  : "Non-Compliant"}
              </Badge>
            </div>

            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                Stub data: Nationality field not yet available in employee
                records. Actual Saudization ratio will be calculated once
                nationality data is captured.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* GOSI Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-500" />
              GOSI (Social Insurance)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`h-3 w-3 rounded-full ${
                  data.labor.gosiStatus === "active"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              />
              <span className="text-sm font-medium">
                Registration Status:{" "}
                {data.labor.gosiStatus === "active" ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Registered Employees
                </span>
                <span className="font-semibold">
                  {data.labor.totalEmployees}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Last Payment Date
                </span>
                <span className="font-semibold">
                  {new Date(data.labor.gosiLastPayment).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" },
                  )}
                </span>
              </div>
            </div>

            <Separator />

            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                Stub data: GOSI integration is pending. Employer contribution
                rate is 12% and employee contribution rate is 10% of eligible
                salary. Connect GOSI API for real-time status.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
