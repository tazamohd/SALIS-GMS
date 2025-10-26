import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  DollarSign,
  Percent,
  Users,
  Wrench,
  BarChart3,
  PieChart,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#000000", "#4B5563", "#6B7280", "#9CA3AF", "#D1D5DB"];

export default function ProfitAnalysis() {
  const [periodType, setPeriodType] = useState("monthly");
  const [selectedMetric, setSelectedMetric] = useState("service");

  const { data: profitData } = useQuery({
    queryKey: ["/api/analytics/profit-analysis", periodType],
  });

  // Mock data
  const monthlyProfit = [
    { month: "Jan", revenue: 45000, costs: 32000, profit: 13000, margin: 28.9 },
    { month: "Feb", revenue: 52000, costs: 35000, profit: 17000, margin: 32.7 },
    { month: "Mar", revenue: 48000, costs: 33000, profit: 15000, margin: 31.3 },
    { month: "Apr", revenue: 61000, costs: 38000, profit: 23000, margin: 37.7 },
    { month: "May", revenue: 55000, costs: 36000, profit: 19000, margin: 34.5 },
    { month: "Jun", revenue: 67000, costs: 40000, profit: 27000, margin: 40.3 },
  ];

  const serviceTypeProfitability = [
    { service: "Oil Change", revenue: 35000, cost: 18000, profit: 17000, margin: 48.6 },
    { service: "Brake Service", revenue: 48000, cost: 28000, profit: 20000, margin: 41.7 },
    { service: "Tire Rotation", revenue: 22000, cost: 12000, profit: 10000, margin: 45.5 },
    { service: "Diagnostics", revenue: 41000, cost: 15000, profit: 26000, margin: 63.4 },
    { service: "Engine Repair", revenue: 78000, cost: 52000, profit: 26000, margin: 33.3 },
  ];

  const technicianPerformance = [
    { name: "John Smith", revenue: 48500, jobs: 124, avgMargin: 38.2 },
    { name: "Sarah Johnson", revenue: 45200, jobs: 118, avgMargin: 35.8 },
    { name: "Mike Davis", revenue: 41800, jobs: 105, avgMargin: 32.4 },
    { name: "Emily Brown", revenue: 39600, jobs: 98, avgMargin: 34.1 },
  ];

  const costBreakdown = [
    { name: "Labor", value: 45 },
    { name: "Parts", value: 35 },
    { name: "Overhead", value: 15 },
    { name: "Other", value: 5 },
  ];

  const topCustomers = [
    { name: "ABC Fleet Services", revenue: 125800, visits: 48, ltv: 245000 },
    { name: "Smith Auto Group", revenue: 98500, visits: 32, ltv: 185000 },
    { name: "Johnson Motors", revenue: 87300, visits: 28, ltv: 152000 },
    { name: "Davis Transport", revenue: 76200, visits: 24, ltv: 138000 },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white">
            💰 Profit Margin Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Detailed profitability insights by service, technician, and customer
          </p>
        </div>
        <Select value={periodType} onValueChange={setPeriodType}>
          <SelectTrigger className="w-40" data-testid="select-period">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-total-revenue">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                  $328,000
                </h3>
                <p className="text-sm text-green-600 mt-1">+12.5% vs last period</p>
              </div>
              <DollarSign className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-total-costs">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Costs</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                  $214,000
                </h3>
                <p className="text-sm text-orange-600 mt-1">+8.2% vs last period</p>
              </div>
              <TrendingUp className="h-12 w-12 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-net-profit">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Net Profit</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                  $114,000
                </h3>
                <p className="text-sm text-green-600 mt-1">+18.9% vs last period</p>
              </div>
              <BarChart3 className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-profit-margin">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Profit Margin</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                  34.8%
                </h3>
                <p className="text-sm text-green-600 mt-1">+2.3% vs last period</p>
              </div>
              <Percent className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profit Trend Chart */}
      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Profit Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyProfit}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="profit" stroke="#000000" name="Net Profit" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#6B7280" name="Margin %" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="service" className="space-y-4">
        <TabsList className="bg-gray-100 dark:bg-salis-gray-dark">
          <TabsTrigger value="service" data-testid="tab-service">By Service Type</TabsTrigger>
          <TabsTrigger value="technician" data-testid="tab-technician">By Technician</TabsTrigger>
          <TabsTrigger value="customer" data-testid="tab-customer">By Customer</TabsTrigger>
          <TabsTrigger value="costs" data-testid="tab-costs">Cost Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="service">
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Service Type Profitability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceTypeProfitability.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg"
                    data-testid={`service-${index}`}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{service.service}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Revenue: ${service.revenue.toLocaleString()} | Cost: ${service.cost.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900 dark:text-white">
                        ${service.profit.toLocaleString()}
                      </p>
                      <p className="text-sm text-green-600">{service.margin.toFixed(1)}% margin</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technician">
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Technician Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {technicianPerformance.map((tech, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg"
                    data-testid={`technician-${index}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                        <Wrench className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{tech.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {tech.jobs} jobs completed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900 dark:text-white">
                        ${tech.revenue.toLocaleString()}
                      </p>
                      <p className="text-sm text-green-600">{tech.avgMargin.toFixed(1)}% avg margin</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customer">
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Top Customers by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg"
                    data-testid={`customer-${index}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                        <Users className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{customer.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {customer.visits} visits | LTV: ${customer.ltv.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900 dark:text-white">
                        ${customer.revenue.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">This period</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle>Cost Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={costBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {costBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle>Cost Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-gray-600 dark:text-gray-400">Labor Costs</span>
                    <span className="font-semibold text-gray-900 dark:text-white">$96,300 (45%)</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-gray-600 dark:text-gray-400">Parts Costs</span>
                    <span className="font-semibold text-gray-900 dark:text-white">$74,900 (35%)</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-gray-600 dark:text-gray-400">Overhead</span>
                    <span className="font-semibold text-gray-900 dark:text-white">$32,100 (15%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Other Expenses</span>
                    <span className="font-semibold text-gray-900 dark:text-white">$10,700 (5%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
