import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  TrendingUp, 
  CheckCircle, 
  DollarSign, 
  RefreshCcw,
  AlertTriangle
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";
import type { FleetContract, ContractUtilization, ContractSLAMetric, ContractRenewal } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { TabsPageLayout, TabConfig } from "@/components/layouts/TabsPageLayout";

const COLORS = {
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
  primary: "#8b5cf6"
};

export default function ContractManagement() {
  const { t } = useTranslation();
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: contracts = [], isLoading: contractsLoading } = useQuery<(FleetContract & { 
    fleetGroup: any;
    utilization: ContractUtilization[];
    slaMetrics: ContractSLAMetric[];
    renewals: ContractRenewal[];
  })[]>({
    queryKey: ["/api/contracts/enhanced"],
  });

  const triggerRenewalMutation = useMutation({
    mutationFn: async (contractId: string) => 
      apiRequest(`/api/contracts/${contractId}/trigger-renewal`, "POST"),
    onSuccess: () => {
      toast({
        title: t('payments.contracts.renewalInitiated', 'Renewal Initiated'),
        description: t('payments.contracts.renewalStarted', 'Contract renewal process has been started'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts/enhanced"] });
    },
  });

  const acceptRenewalMutation = useMutation({
    mutationFn: async ({ renewalId, contractId }: { renewalId: string; contractId: string }) => 
      apiRequest(`/api/contracts/${contractId}/accept-renewal`, "POST", { renewalId }),
    onSuccess: () => {
      toast({
        title: t('payments.contracts.renewalAccepted', 'Renewal Accepted'),
        description: t('payments.contracts.renewedSuccess', 'Contract has been renewed successfully'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts/enhanced"] });
    },
  });

  const selectedContract = contracts.find(c => c.id === selectedContractId);

  const dashboardMetrics = contracts.reduce((acc, contract) => {
    const utilization = contract.utilization || [];
    const slaMetrics = contract.slaMetrics || [];
    const totalUtilized = utilization.reduce((sum, u) => sum + parseFloat(u.totalCost || "0"), 0);
    const serviceCap = parseFloat(contract.serviceCap || "0");

    const slaBreach = slaMetrics.filter(m => m.complianceStatus === "breached").length;
    const slaTotal = slaMetrics.length;
    const slaCompliance = slaTotal > 0 ? ((slaTotal - slaBreach) / slaTotal) * 100 : 100;

    const daysUntilExpiry = differenceInDays(new Date(contract.endDate), new Date());
    const needsRenewal = daysUntilExpiry <= (contract.renewalNoticeDays || 30) && contract.status === "active";

    return {
      totalContracts: acc.totalContracts + 1,
      activeContracts: acc.activeContracts + (contract.status === "active" ? 1 : 0),
      totalValue: acc.totalValue + parseFloat(contract.contractValue || "0"),
      totalUtilized: acc.totalUtilized + totalUtilized,
      avgUtilization: 0,
      slaCompliance: acc.slaCompliance + slaCompliance,
      expiringContracts: acc.expiringContracts + (needsRenewal ? 1 : 0),
      totalBreach: acc.totalBreach + slaBreach,
    };
  }, {
    totalContracts: 0,
    activeContracts: 0,
    totalValue: 0,
    totalUtilized: 0,
    avgUtilization: 0,
    slaCompliance: 0,
    expiringContracts: 0,
    totalBreach: 0,
  });

  dashboardMetrics.avgUtilization = dashboardMetrics.totalValue > 0 
    ? (dashboardMetrics.totalUtilized / dashboardMetrics.totalValue) * 100 
    : 0;
  dashboardMetrics.slaCompliance = contracts.length > 0 
    ? dashboardMetrics.slaCompliance / contracts.length 
    : 100;

  const utilizationChartData = contracts.map(contract => {
    const utilization = contract.utilization || [];
    const totalUtilized = utilization.reduce((sum, u) => sum + parseFloat(u.totalCost || "0"), 0);
    const serviceCap = parseFloat(contract.serviceCap || "0");
    const percentage = serviceCap > 0 ? (totalUtilized / serviceCap) * 100 : 0;

    return {
      name: contract.contractNumber,
      utilized: percentage,
      remaining: Math.max(0, 100 - percentage),
      amount: totalUtilized,
    };
  });

  const slaComplianceData = contracts.map(contract => {
    const slaMetrics = contract.slaMetrics || [];
    const total = slaMetrics.length;
    const met = slaMetrics.filter(m => m.complianceStatus === "met").length;
    const breached = slaMetrics.filter(m => m.complianceStatus === "breached").length;
    const warning = slaMetrics.filter(m => m.complianceStatus === "warning").length;

    return {
      name: contract.contractNumber,
      met,
      breached,
      warning,
      total,
      compliance: total > 0 ? (met / total) * 100 : 100,
    };
  });

  const expiringContractsData = contracts
    .map(contract => ({
      ...contract,
      daysUntilExpiry: differenceInDays(new Date(contract.endDate), new Date()),
    }))
    .filter(c => c.daysUntilExpiry <= 90 && c.daysUntilExpiry >= 0)
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

  if (contractsLoading) {
    return (
      <div className="flex items-center justify-center h-screen" data-testid="loading-contracts">
        <div className="text-xl">{t('common.loading', 'Loading contracts...')}</div>
      </div>
    );
  }

  const headerContent = (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-total-contracts">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('payments.contracts.totalContracts', 'Total Contracts')}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-contracts">{dashboardMetrics.totalContracts}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardMetrics.activeContracts} {t('payments.contracts.active', 'active')}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-contract-value">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('payments.contracts.totalContractValue', 'Total Contract Value')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-contract-value">
              ${dashboardMetrics.totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              ${dashboardMetrics.totalUtilized.toLocaleString()} {t('payments.contracts.utilized', 'utilized')}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-avg-utilization">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('payments.contracts.avgUtilization', 'Avg Utilization')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-utilization">
              {dashboardMetrics.avgUtilization.toFixed(1)}%
            </div>
            <Progress value={dashboardMetrics.avgUtilization} className="mt-2" />
          </CardContent>
        </Card>

        <Card data-testid="card-sla-compliance">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('payments.contracts.slaCompliance', 'SLA Compliance')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-sla-compliance">
              {dashboardMetrics.slaCompliance.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardMetrics.totalBreach} {t('payments.contracts.breaches', 'breaches')}
            </p>
          </CardContent>
        </Card>
      </div>

      {dashboardMetrics.expiringContracts > 0 && (
        <Card className="border-orange-500" data-testid="card-expiring-alert">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              {t('payments.contracts.contractsRequiringAttention', 'Contracts Requiring Attention')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                {dashboardMetrics.expiringContracts} {t('payments.contracts.contractsExpiringWithin', 'contracts expiring within renewal notice period')}
              </p>
              <div className="space-y-1">
                {expiringContractsData.slice(0, 5).map((contract) => (
                  <div key={contract.id} className="flex justify-between items-center text-sm" data-testid={`contract-expiring-${contract.id}`}>
                    <span className="font-medium">{contract.contractNumber}</span>
                    <span className="text-muted-foreground">
                      {contract.daysUntilExpiry} {t('payments.contracts.daysRemaining', 'days remaining')}
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => triggerRenewalMutation.mutate(contract.id)}
                      disabled={triggerRenewalMutation.isPending}
                      data-testid={`button-trigger-renewal-${contract.id}`}
                    >
                      <RefreshCcw className="h-3 w-3 mr-1" />
                      {t('payments.contracts.initiateRenewal', 'Initiate Renewal')}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );

  const tabs: TabConfig[] = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card data-testid="card-utilization-chart">
              <CardHeader>
                <CardTitle>Contract Utilization Overview</CardTitle>
                <CardDescription>Service spending vs. contract cap</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={utilizationChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="utilized" fill={COLORS.info} name="Utilized %" />
                    <Bar dataKey="remaining" fill={COLORS.success} name="Remaining %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card data-testid="card-sla-chart">
              <CardHeader>
                <CardTitle>SLA Performance</CardTitle>
                <CardDescription>Compliance status by contract</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={slaComplianceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="met" stackId="a" fill={COLORS.success} name="Met" />
                    <Bar dataKey="warning" stackId="a" fill={COLORS.warning} name="Warning" />
                    <Bar dataKey="breached" stackId="a" fill={COLORS.error} name="Breached" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="card-contracts-list">
            <CardHeader>
              <CardTitle>All Contracts</CardTitle>
              <CardDescription>Click on a contract to view details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contracts.map((contract) => {
                  const utilization = contract.utilization || [];
                  const totalUtilized = utilization.reduce((sum, u) => sum + parseFloat(u.totalCost || "0"), 0);
                  const serviceCap = parseFloat(contract.serviceCap || "0");
                  const utilizationPercentage = serviceCap > 0 ? (totalUtilized / serviceCap) * 100 : 0;
                  const daysUntilExpiry = differenceInDays(new Date(contract.endDate), new Date());

                  return (
                    <div
                      key={contract.id}
                      className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => setSelectedContractId(contract.id)}
                      data-testid={`contract-item-${contract.id}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold" data-testid={`text-contract-number-${contract.id}`}>
                              {contract.contractNumber}
                            </h3>
                            <Badge
                              variant={
                                contract.status === "active" ? "default" :
                                contract.status === "pending_renewal" ? "outline" :
                                "secondary"
                              }
                              data-testid={`badge-status-${contract.id}`}
                            >
                              {contract.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {contract.fleetGroup?.companyName || "Unknown Fleet"}
                          </p>
                          <div className="flex gap-4 text-sm">
                            <span>Type: {contract.contractType}</span>
                            <span>Expires: {format(new Date(contract.endDate), "MMM dd, yyyy")}</span>
                            <span className={daysUntilExpiry <= 30 ? "text-orange-500 font-medium" : ""}>
                              ({daysUntilExpiry} days)
                            </span>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="text-sm font-medium">
                            Utilization: {utilizationPercentage.toFixed(1)}%
                          </div>
                          <Progress value={utilizationPercentage} className="w-24" />
                          <div className="text-xs text-muted-foreground">
                            ${totalUtilized.toLocaleString()} / ${serviceCap.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "utilization",
      label: "Utilization",
      content: selectedContract ? (
        <ContractUtilizationDetail contract={selectedContract} />
      ) : (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Select a contract from the Overview tab to view detailed utilization
            </p>
          </CardContent>
        </Card>
      ),
    },
    {
      id: "sla",
      label: "SLA Compliance",
      content: selectedContract ? (
        <ContractSLADetail contract={selectedContract} />
      ) : (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Select a contract from the Overview tab to view SLA compliance details
            </p>
          </CardContent>
        </Card>
      ),
    },
    {
      id: "renewals",
      label: "Renewals",
      content: <ContractRenewalsTab contracts={contracts} onAcceptRenewal={acceptRenewalMutation.mutate} />,
    },
  ];

  return (
    <TabsPageLayout
      title="Contract Management & SLA Tracking"
      description="Monitor contract utilization, SLA compliance, and automated renewal workflows"
      icon={FileText}
      secondaryActions={[
        {
          label: "Back to Fleet",
          icon: FileText,
          onClick: () => window.location.href = "/fleet-management",
          variant: "outline",
          testId: "button-back-fleet",
        },
      ]}
      tabs={tabs}
      defaultTab="overview"
      headerContent={headerContent}
    />
  );
}

function ContractUtilizationDetail({ contract }: { contract: any }) {
  const utilization = contract.utilization || [];
  const totalUtilized = utilization.reduce((sum: number, u: any) => sum + parseFloat(u.totalCost || "0"), 0);
  const serviceCap = parseFloat(contract.serviceCap || "0");
  const remaining = serviceCap - totalUtilized;
  const utilizationPercentage = serviceCap > 0 ? (totalUtilized / serviceCap) * 100 : 0;

  const byServiceType = utilization.reduce((acc: any, u: any) => {
    const type = u.serviceType || "Other";
    if (!acc[type]) {
      acc[type] = { count: 0, total: 0 };
    }
    acc[type].count += 1;
    acc[type].total += parseFloat(u.totalCost || "0");
    return acc;
  }, {});

  const serviceTypeData = Object.entries(byServiceType).map(([name, data]: [string, any]) => ({
    name,
    value: data.total,
    count: data.count,
  }));

  return (
    <div className="space-y-4">
      <Card data-testid="card-utilization-summary">
        <CardHeader>
          <CardTitle>Utilization Summary - {contract.contractNumber}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Utilized</p>
              <p className="text-2xl font-bold" data-testid="text-total-utilized">
                ${totalUtilized.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Service Cap</p>
              <p className="text-2xl font-bold">${serviceCap.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Remaining Budget</p>
              <p className={`text-2xl font-bold ${remaining < 0 ? 'text-red-500' : 'text-green-500'}`}>
                ${remaining.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Utilization Progress</span>
              <span className="font-medium">{utilizationPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={utilizationPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card data-testid="card-service-breakdown">
          <CardHeader>
            <CardTitle>Service Type Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card data-testid="card-recent-usage">
          <CardHeader>
            <CardTitle>Recent Service Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {utilization.slice(0, 10).map((u: any) => (
                <div key={u.id} className="flex justify-between items-center text-sm" data-testid={`usage-item-${u.id}`}>
                  <div>
                    <p className="font-medium">{u.serviceType}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(u.serviceDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${parseFloat(u.totalCost || "0").toLocaleString()}</p>
                    {u.isCoveredByContract && (
                      <Badge variant="outline" className="text-xs">Covered</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ContractSLADetail({ contract }: { contract: any }) {
  const slaMetrics = contract.slaMetrics || [];
  const metCount = slaMetrics.filter((m: any) => m.complianceStatus === "met").length;
  const breachCount = slaMetrics.filter((m: any) => m.complianceStatus === "breached").length;
  const complianceRate = slaMetrics.length > 0 ? (metCount / slaMetrics.length) * 100 : 100;

  const totalPenalties = slaMetrics.reduce((sum: number, m: any) => 
    sum + parseFloat(m.penaltyApplied || "0"), 0
  );

  return (
    <div className="space-y-4">
      <Card data-testid="card-sla-summary">
        <CardHeader>
          <CardTitle>SLA Performance - {contract.contractNumber}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Compliance Rate</p>
              <p className="text-2xl font-bold" data-testid="text-compliance-rate">
                {complianceRate.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">SLA Met</p>
              <p className="text-2xl font-bold text-green-500">{metCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Breaches</p>
              <p className="text-2xl font-bold text-red-500">{breachCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Penalties</p>
              <p className="text-2xl font-bold text-orange-500">
                ${totalPenalties.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-sla-targets">
        <CardHeader>
          <CardTitle>SLA Targets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contract.slaResponseTime && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Response Time Target</span>
                  <span className="text-sm font-medium">{contract.slaResponseTime} minutes</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Average response time monitoring
                </div>
              </div>
            )}
            {contract.slaCompletionTime && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Completion Time Target</span>
                  <span className="text-sm font-medium">{contract.slaCompletionTime} hours</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Job completion deadline tracking
                </div>
              </div>
            )}
            {contract.slaUptimePercentage && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Uptime Target</span>
                  <span className="text-sm font-medium">{contract.slaUptimePercentage}%</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Service availability requirement
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-sla-incidents">
        <CardHeader>
          <CardTitle>SLA Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {slaMetrics.map((metric: any) => (
              <div 
                key={metric.id} 
                className="p-3 border rounded-lg"
                data-testid={`sla-incident-${metric.id}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={
                          metric.complianceStatus === "met" ? "default" :
                          metric.complianceStatus === "warning" ? "outline" :
                          "destructive"
                        }
                      >
                        {metric.complianceStatus}
                      </Badge>
                      <span className="text-sm font-medium">{metric.metricType}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Target: {metric.targetValue} | Actual: {metric.actualValue}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(metric.incidentDate), "MMM dd, yyyy HH:mm")}
                    </div>
                    {metric.notes && (
                      <p className="text-sm mt-2">{metric.notes}</p>
                    )}
                  </div>
                  {metric.penaltyApplied && parseFloat(metric.penaltyApplied) > 0 && (
                    <div className="text-right">
                      <div className="text-sm font-medium text-orange-500">
                        -${parseFloat(metric.penaltyApplied).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Penalty</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {slaMetrics.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No SLA metrics recorded
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ContractRenewalsTab({ contracts, onAcceptRenewal }: { 
  contracts: any[]; 
  onAcceptRenewal: (data: { renewalId: string; contractId: string }) => void;
}) {
  const allRenewals = contracts.flatMap(c => 
    (c.renewals || []).map((r: any) => ({ ...r, contract: c }))
  );

  const pendingRenewals = allRenewals.filter(r => r.status === "pending" || r.status === "notified");
  const completedRenewals = allRenewals.filter(r => r.status === "completed");

  return (
    <div className="space-y-4">
      <Card data-testid="card-pending-renewals">
        <CardHeader>
          <CardTitle>Pending Renewals ({pendingRenewals.length})</CardTitle>
          <CardDescription>Contracts requiring renewal action</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingRenewals.map((renewal: any) => (
              <div 
                key={renewal.id} 
                className="p-4 border rounded-lg"
                data-testid={`renewal-item-${renewal.id}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{renewal.contract.contractNumber}</h3>
                      <Badge variant="outline">{renewal.renewalType}</Badge>
                      <Badge>{renewal.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {renewal.contract.fleetGroup?.companyName || "Unknown Fleet"}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current End:</span>{" "}
                        {format(new Date(renewal.contract.endDate), "MMM dd, yyyy")}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Proposed Start:</span>{" "}
                        {format(new Date(renewal.proposedStartDate), "MMM dd, yyyy")}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Proposed End:</span>{" "}
                        {format(new Date(renewal.proposedEndDate), "MMM dd, yyyy")}
                      </div>
                      {renewal.proposedMonthlyFee && (
                        <div>
                          <span className="text-muted-foreground">New Monthly Fee:</span>{" "}
                          ${parseFloat(renewal.proposedMonthlyFee).toLocaleString()}
                        </div>
                      )}
                    </div>
                    {renewal.notificationSentAt && (
                      <p className="text-xs text-muted-foreground">
                        Notification sent: {format(new Date(renewal.notificationSentAt), "MMM dd, yyyy HH:mm")}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      onClick={() => onAcceptRenewal({ renewalId: renewal.id, contractId: renewal.contract.id })}
                      data-testid={`button-accept-renewal-${renewal.id}`}
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" data-testid={`button-negotiate-renewal-${renewal.id}`}>
                      Negotiate
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {pendingRenewals.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No pending renewals
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-completed-renewals">
        <CardHeader>
          <CardTitle>Renewal History</CardTitle>
          <CardDescription>Recently completed renewals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {completedRenewals.slice(0, 10).map((renewal: any) => (
              <div key={renewal.id} className="flex justify-between items-center p-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{renewal.contract.contractNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(renewal.proposedStartDate), "MMM dd, yyyy")}
                  </p>
                </div>
                <Badge variant="outline">Completed</Badge>
              </div>
            ))}
            {completedRenewals.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No renewal history
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
