import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [heatmapType, setHeatmapType] = useState("time_demand");

  const { data: heatmapData } = useQuery({
    queryKey: ["/api/analytics/heatmaps", heatmapType, selectedPeriod],
  });

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = ["8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm"];
  
  const timeHeatmap = days.map(day => 
    hours.map((hour, hourIndex) => {
      const baseValue = Math.random() * 20 + 5;
      const peakBonus = (hourIndex >= 3 && hourIndex <= 6) ? 15 : 0;
      const weekendPenalty = (day === "Sat" || day === "Sun") ? -10 : 0;
      return Math.max(0, Math.round(baseValue + peakBonus + weekendPenalty));
    })
  );

  const serviceTypes = [
    { name: "Oil Change", demand: 85 },
    { name: "Brake Service", demand: 72 },
    { name: "Tire Rotation", demand: 68 },
    { name: "Diagnostics", demand: 58 },
    { name: "Engine Repair", demand: 45 },
    { name: "Transmission", demand: 32 },
    { name: "AC Service", demand: 54 },
    { name: "Battery Replace", demand: 48 },
  ];

  const technicianUtilization = [
    { name: "John Smith", utilization: [92, 88, 95, 90, 87, 78, 0] },
    { name: "Sarah Johnson", utilization: [88, 92, 86, 91, 89, 82, 0] },
    { name: "Mike Davis", utilization: [85, 87, 83, 88, 90, 75, 0] },
    { name: "Emily Brown", utilization: [90, 86, 91, 85, 88, 80, 0] },
  ];

  const getHeatColor = (value: number, max: number = 100) => {
    const intensity = value / max;
    if (intensity > 0.75) return "bg-black text-white";
    if (intensity > 0.5) return "bg-gray-700 text-white";
    if (intensity > 0.25) return "bg-gray-400 text-gray-900";
    return "bg-gray-200 text-gray-700";
  };

  const summaryCards = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-peak-hour">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Peak Hour</p>
              <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">11am-12pm</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Busiest time</p>
            </div>
            <Clock className="h-12 w-12 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-peak-day">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Peak Day</p>
              <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">Wednesday</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Highest demand</p>
            </div>
            <Calendar className="h-12 w-12 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-avg-utilization">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Utilization</p>
              <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">88.5%</h3>
              <p className="text-sm text-green-600 mt-1">+3.2% vs last period</p>
            </div>
            <TrendingUp className="h-12 w-12 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-top-service">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Top Service</p>
              <h3 className="text-xl font-bold mt-2 text-gray-900 dark:text-white">Oil Change</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">85% demand share</p>
            </div>
            <Wrench className="h-12 w-12 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const tabs: TabConfig[] = [
    {
      id: "time",
      label: "Time Demand",
      icon: Clock,
      content: (
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Appointment Demand by Time & Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Hour</th>
                    {days.map(day => (
                      <th key={day} className="p-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hours.map((hour, hourIndex) => (
                    <tr key={hour}>
                      <td className="p-2 text-sm font-medium text-gray-700 dark:text-gray-300">{hour}</td>
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
              <span className="text-sm text-gray-600 dark:text-gray-400">Legend:</span>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <span className="text-sm">Low (0-7)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-gray-400 rounded"></div>
                  <span className="text-sm">Medium (8-15)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-gray-700 rounded"></div>
                  <span className="text-sm">High (16-22)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-black rounded"></div>
                  <span className="text-sm">Peak (23+)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: "service",
      label: "Service Demand",
      icon: Wrench,
      content: (
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Service Type Demand
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {serviceTypes.map((service, index) => (
                <div key={index} className="space-y-2" data-testid={`service-${index}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {service.name}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {service.demand}% demand
                    </span>
                  </div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-black to-gray-700 flex items-center justify-end px-3 transition-all"
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
      label: "Technician Utilization",
      icon: Users,
      content: (
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Technician Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Technician</th>
                    {days.map(day => (
                      <th key={day} className="p-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {day}
                      </th>
                    ))}
                    <th className="p-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {technicianUtilization.map((tech, techIndex) => {
                    const avg = Math.round(tech.utilization.reduce((a, b) => a + b, 0) / tech.utilization.filter(v => v > 0).length);
                    return (
                      <tr key={techIndex}>
                        <td className="p-2 text-sm font-medium text-gray-900 dark:text-white">
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
                              <div className="h-12 w-full flex items-center justify-center text-sm text-gray-400">
                                -
                              </div>
                            )}
                          </td>
                        ))}
                        <td className="p-2 text-center">
                          <Badge variant={avg >= 85 ? "default" : "secondary"}>
                            {avg}%
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Insights</h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Average team utilization: 88.5% (optimal range: 75-90%)</li>
                <li>• All technicians maintaining high productivity</li>
                <li>• Consider cross-training for weekend coverage</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <TabsPageLayout
      title="🗺️ Business Heat Maps"
      description="Visualize demand patterns, peak hours, and resource utilization"
      icon={MapPin}
      headerContent={
        <>
          <div className="flex justify-end mb-6">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40" data-testid="select-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
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
