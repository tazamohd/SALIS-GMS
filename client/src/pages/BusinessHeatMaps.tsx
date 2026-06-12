import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  MapPin,
  Wrench,
  TrendingUp,
  Calendar,
  Users,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TabsPageLayout, TabConfig } from "@/components/layouts";

export default function BusinessHeatMaps() {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [heatmapType, setHeatmapType] = useState("time_demand");

  const { data: heatmapData } = useQuery({
    queryKey: ["/api/analytics/heatmaps", heatmapType, selectedPeriod],
  });

  const days = [
    t('heatmaps.days.mon', 'Mon'),
    t('heatmaps.days.tue', 'Tue'),
    t('heatmaps.days.wed', 'Wed'),
    t('heatmaps.days.thu', 'Thu'),
    t('heatmaps.days.fri', 'Fri'),
    t('heatmaps.days.sat', 'Sat'),
    t('heatmaps.days.sun', 'Sun')
  ];
  const hours = ["8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm"];
  
  const timeHeatmap = days.map((day, dayIndex) => 
    hours.map((hour, hourIndex) => {
      const baseValue = Math.random() * 20 + 5;
      const peakBonus = (hourIndex >= 3 && hourIndex <= 6) ? 15 : 0;
      const weekendPenalty = (dayIndex === 5 || dayIndex === 6) ? -10 : 0;
      return Math.max(0, Math.round(baseValue + peakBonus + weekendPenalty));
    })
  );

  const serviceTypes = [
    { name: t('services.oilChange', 'Oil Change'), demand: 85 },
    { name: t('services.brakeService', 'Brake Service'), demand: 72 },
    { name: t('services.tireRotation', 'Tire Rotation'), demand: 68 },
    { name: t('services.diagnostics', 'Diagnostics'), demand: 58 },
    { name: t('services.engineRepair', 'Engine Repair'), demand: 45 },
    { name: t('services.transmission', 'Transmission'), demand: 32 },
    { name: t('services.acService', 'AC Service'), demand: 54 },
    { name: t('services.batteryReplace', 'Battery Replace'), demand: 48 },
  ];

  const technicianUtilization = [
    { name: "John Smith", utilization: [92, 88, 95, 90, 87, 78, 0] },
    { name: "Sarah Johnson", utilization: [88, 92, 86, 91, 89, 82, 0] },
    { name: "Mike Davis", utilization: [85, 87, 83, 88, 90, 75, 0] },
    { name: "Emily Brown", utilization: [90, 86, 91, 85, 88, 80, 0] },
  ];

  const getHeatColor = (value: number, max: number = 100) => {
    const intensity = value / max;
    if (intensity > 0.75) return "bg-[#0A5ED7] text-white";
    if (intensity > 0.5) return "bg-[#0BB3FF] text-white";
    if (intensity > 0.25) return "bg-[#0BB3FF]/40 text-[#0B1F3B] dark:text-white";
    return "bg-[#E2E8F0] dark:bg-[#232A36] text-[#64748B]";
  };

  const summaryCards = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-peak-hour">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">{t('heatmaps.peakHour', 'Peak Hour')}</p>
              <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white">11am-12pm</h3>
              <p className="text-sm text-[#64748B] mt-1">{t('heatmaps.busiestTime', 'Busiest time')}</p>
            </div>
            <Clock className="h-12 w-12 text-[#0A5ED7]" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-peak-day">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">{t('heatmaps.peakDay', 'Peak Day')}</p>
              <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white">{t('heatmaps.days.wed', 'Wednesday')}</h3>
              <p className="text-sm text-[#64748B] mt-1">{t('heatmaps.highestDemand', 'Highest demand')}</p>
            </div>
            <Calendar className="h-12 w-12 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-avg-utilization">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">{t('heatmaps.avgUtilization', 'Avg Utilization')}</p>
              <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white">88.5%</h3>
              <p className="text-sm text-green-600 mt-1">{t('heatmaps.vsLastPeriod', '+3.2% vs last period')}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-[#0BB3FF]" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-top-service">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">{t('heatmaps.topService', 'Top Service')}</p>
              <h3 className="text-xl font-bold mt-2 text-[#0B1F3B] dark:text-white">{t('services.oilChange', 'Oil Change')}</h3>
              <p className="text-sm text-[#64748B] mt-1">{t('heatmaps.demandShare', '85% demand share')}</p>
            </div>
            <Wrench className="h-12 w-12 text-[#F97316]" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const tabs: TabConfig[] = [
    {
      id: "time",
      label: t('heatmaps.tabs.timeDemand', 'Time Demand'),
      icon: Clock,
      content: (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <Clock className="h-5 w-5 text-[#0A5ED7]" />
              {t('heatmaps.appointmentDemand', 'Appointment Demand by Time & Day')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-sm font-semibold text-[#0B1F3B] dark:text-white">{t('heatmaps.hour', 'Hour')}</th>
                    {days.map(day => (
                      <th key={day} className="p-2 text-center text-sm font-semibold text-[#0B1F3B] dark:text-white">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hours.map((hour, hourIndex) => (
                    <tr key={hour}>
                      <td className="p-2 text-sm font-medium text-[#0B1F3B] dark:text-white">{hour}</td>
                      {days.map((day, dayIndex) => {
                        const value = timeHeatmap[dayIndex][hourIndex];
                        return (
                          <td key={day} className="p-1">
                            <div
                              className={`h-12 w-full flex items-center justify-center text-sm font-medium rounded ${getHeatColor(value, 30)}`}
                              data-testid={`cell-${dayIndex}-${hourIndex}`}
                            >
                              {value}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <span className="text-sm text-[#64748B]">{t('heatmaps.legend', 'Legend')}:</span>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-[#E2E8F0] dark:bg-[#232A36] rounded" />
                  <span className="text-sm text-[#64748B]">{t('heatmaps.low', 'Low')} (0-7)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-[#0BB3FF]/40 rounded" />
                  <span className="text-sm text-[#64748B]">{t('heatmaps.medium', 'Medium')} (8-15)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-[#0BB3FF] rounded" />
                  <span className="text-sm text-[#64748B]">{t('heatmaps.high', 'High')} (16-22)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-[#0A5ED7] rounded" />
                  <span className="text-sm text-[#64748B]">{t('heatmaps.peak', 'Peak')} (23+)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: "service",
      label: t('heatmaps.tabs.serviceDemand', 'Service Demand'),
      icon: Wrench,
      content: (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <Wrench className="h-5 w-5 text-[#0A5ED7]" />
              {t('heatmaps.serviceTypeDemand', 'Service Type Demand')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {serviceTypes.map((service, index) => (
                <div key={index} className="space-y-2" data-testid={`service-${index}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-[#0B1F3B] dark:text-white">
                      {service.name}
                    </span>
                    <span className="text-sm text-[#64748B]">
                      {service.demand}% {t('heatmaps.demand', 'demand')}
                    </span>
                  </div>
                  <div className="h-8 bg-[#E2E8F0] dark:bg-[#232A36] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] flex items-center justify-end px-3 transition-all"
                      style={{ width: `${service.demand}%` }}
                    >
                      <span className="text-xs font-semibold text-white">{service.demand}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: "technician",
      label: t('heatmaps.tabs.technicianUtilization', 'Technician Utilization'),
      icon: Users,
      content: (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <Users className="h-5 w-5 text-[#0A5ED7]" />
              {t('heatmaps.technicianUtilization', 'Technician Utilization')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-sm font-semibold text-[#0B1F3B] dark:text-white">{t('heatmaps.technician', 'Technician')}</th>
                    {days.map(day => (
                      <th key={day} className="p-2 text-center text-sm font-semibold text-[#0B1F3B] dark:text-white">
                        {day}
                      </th>
                    ))}
                    <th className="p-2 text-center text-sm font-semibold text-[#0B1F3B] dark:text-white">{t('heatmaps.avg', 'Avg')}</th>
                  </tr>
                </thead>
                <tbody>
                  {technicianUtilization.map((tech, techIndex) => {
                    const avg = Math.round(tech.utilization.reduce((a, b) => a + b, 0) / tech.utilization.filter(v => v > 0).length);
                    return (
                      <tr key={techIndex}>
                        <td className="p-2 text-sm font-medium text-[#0B1F3B] dark:text-white">
                          {tech.name}
                        </td>
                        {tech.utilization.map((util, dayIndex) => (
                          <td key={dayIndex} className="p-1">
                            {util > 0 ? (
                              <div
                                className={`h-12 w-full flex items-center justify-center text-sm font-medium rounded ${getHeatColor(util)}`}
                                data-testid={`tech-${techIndex}-${dayIndex}`}
                              >
                                {util}%
                              </div>
                            ) : (
                              <div className="h-12 w-full flex items-center justify-center text-sm text-[#64748B]">
                                -
                              </div>
                            )}
                          </td>
                        ))}
                        <td className="p-2 text-center">
                          <Badge variant={avg >= 85 ? "default" : "secondary"} className={avg >= 85 ? "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]" : ""}>
                            {avg}%
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-6 p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
              <h4 className="font-semibold text-[#0B1F3B] dark:text-white mb-2">{t('heatmaps.insights', 'Insights')}</h4>
              <ul className="space-y-1 text-sm text-[#64748B]">
                <li>• {t('heatmaps.insight1', 'Average team utilization: 88.5% (optimal range: 75-90%)')}</li>
                <li>• {t('heatmaps.insight2', 'All technicians maintaining high productivity')}</li>
                <li>• {t('heatmaps.insight3', 'Consider cross-training for weekend coverage')}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <TabsPageLayout
      title={t('heatmaps.title', '🗺️ Business Heat Maps')}
      description={t('heatmaps.description', 'Visualize demand patterns, peak hours, and resource utilization')}
      icon={MapPin}
      headerContent={
        <>
          <div className="flex justify-end mb-6">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <SelectItem value="week">{t('heatmaps.periods.thisWeek', 'This Week')}</SelectItem>
                <SelectItem value="month">{t('heatmaps.periods.thisMonth', 'This Month')}</SelectItem>
                <SelectItem value="quarter">{t('heatmaps.periods.thisQuarter', 'This Quarter')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {summaryCards}
        </>
      }
      tabs={tabs}
      defaultTab="time"
    />
  );
}
