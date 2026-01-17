import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Target } from "lucide-react";

export default function ProfitMarginAnalysis() {
  const { t } = useTranslation();

  const services = [
    { name: t('services.engineRepair', 'Engine Repair'), revenue: 45000, cost: 28000, margin: 37.8 },
    { name: t('services.oilChange', 'Oil Change'), revenue: 12000, cost: 4000, margin: 66.7 },
    { name: t('services.brakeService', 'Brake Service'), revenue: 28000, cost: 15000, margin: 46.4 },
    { name: t('services.acService', 'AC Service'), revenue: 18000, cost: 9000, margin: 50.0 },
    { name: t('services.transmission', 'Transmission'), revenue: 35000, cost: 22000, margin: 37.1 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050510] via-[#0a0a1a] to-[#050510] p-6" data-testid="profit-margin-analysis-page">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white" data-testid="page-title">{t('profitMargin.title', 'Profit Margin Analysis')}</h1>
          <p className="text-gray-400 mt-1" data-testid="page-description">{t('profitMargin.description', 'Analyze profit margins across all services and products')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-total-revenue">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20"><DollarSign className="w-5 h-5 text-emerald-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white" data-testid="text-total-revenue">{t('common.currencySAR', 'SAR')} 138K</p>
                  <p className="text-sm text-gray-400">{t('profitMargin.totalRevenue', 'Total Revenue')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-total-costs">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20"><TrendingDown className="w-5 h-5 text-red-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white" data-testid="text-total-costs">{t('common.currencySAR', 'SAR')} 78K</p>
                  <p className="text-sm text-gray-400">{t('profitMargin.totalCosts', 'Total Costs')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-gross-profit">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-500/20"><TrendingUp className="w-5 h-5 text-sky-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white" data-testid="text-gross-profit">{t('common.currencySAR', 'SAR')} 60K</p>
                  <p className="text-sm text-gray-400">{t('profitMargin.grossProfit', 'Gross Profit')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-avg-margin">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20"><Target className="w-5 h-5 text-purple-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white" data-testid="text-avg-margin">43.5%</p>
                  <p className="text-sm text-gray-400">{t('profitMargin.avgMargin', 'Avg Margin')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-service-margins">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-sky-400" /> {t('profitMargin.serviceProfitMargins', 'Service Profit Margins')}</CardTitle>
            <CardDescription className="text-gray-400">{t('profitMargin.breakdownByServiceType', 'Breakdown of profit margins by service type')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services.map((service, idx) => (
                <div key={idx} data-testid={`service-row-${idx}`} className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium" data-testid={`text-service-name-${idx}`}>{service.name}</span>
                    <span data-testid={`text-margin-${idx}`} className={`font-bold ${service.margin > 50 ? 'text-emerald-400' : service.margin > 40 ? 'text-sky-400' : 'text-yellow-400'}`}>
                      {service.margin.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-400">{t('profitMargin.revenue', 'Revenue')}: <span className="text-emerald-400" data-testid={`text-revenue-${idx}`}>{t('common.currencySAR', 'SAR')} {service.revenue.toLocaleString()}</span></span>
                    <span className="text-gray-400">{t('profitMargin.cost', 'Cost')}: <span className="text-red-400" data-testid={`text-cost-${idx}`}>{t('common.currencySAR', 'SAR')} {service.cost.toLocaleString()}</span></span>
                    <span className="text-gray-400">{t('profitMargin.profit', 'Profit')}: <span className="text-sky-400" data-testid={`text-profit-${idx}`}>{t('common.currencySAR', 'SAR')} {(service.revenue - service.cost).toLocaleString()}</span></span>
                  </div>
                  <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full" style={{ width: `${service.margin}%` }} />
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
