import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, DollarSign, Users, Clock, Wrench } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function BusinessIntelligence() {
  const [garageId, setGarageId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Get garages
  const { data: garages } = useQuery<any[]>({
    queryKey: ['/api/garages'],
  });

  useEffect(() => {
    if (garages && garages.length > 0 && !garageId) {
      setGarageId(garages[0].id);
    }
  }, [garages, garageId]);

  // Set default date range (last 30 days)
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  // BI Analytics Queries
  const { data: profitableServices } = useQuery({
    queryKey: ['/api/bi/profitable-services', { garageId, startDate, endDate }],
    enabled: !!garageId && !!startDate && !!endDate,
  });

  const { data: peakHours } = useQuery({
    queryKey: ['/api/bi/peak-hours', { garageId, startDate, endDate }],
    enabled: !!garageId && !!startDate && !!endDate,
  });

  const { data: technicianUtilization } = useQuery({
    queryKey: ['/api/bi/technician-utilization', { garageId, startDate, endDate }],
    enabled: !!garageId && !!startDate && !!endDate,
  });

  const { data: acquisitionCost } = useQuery({
    queryKey: ['/api/bi/customer-acquisition-cost', { garageId, startDate, endDate }],
    enabled: !!garageId && !!startDate && !!endDate,
  });

  const { data: customerLifetime } = useQuery({
    queryKey: ['/api/bi/customer-lifetime-value', { garageId, startDate, endDate }],
    enabled: !!garageId && !!startDate && !!endDate,
  });

  const topCustomers = customerLifetime?.customers
    ?.sort((a: any, b: any) => b.lifetimeValue - a.lifetimeValue)
    ?.slice(0, 5) || [];

  const avgLifetimeValue = customerLifetime?.customers?.length > 0
    ? customerLifetime.customers.reduce((sum: number, c: any) => sum + c.lifetimeValue, 0) / customerLifetime.customers.length
    : 0;

  return (
    <div className="p-8 bg-gray-800 min-h-screen space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-soft-white">Business Intelligence</h1>
          <p className="text-sm text-soft-white/60 mt-1">
            Track key metrics and insights for your garage business
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-dark-navy border-neon-blue/30 bg-dark-navy border-neon-blue/30">
        <CardHeader>
          <CardTitle className="text-soft-white">Filters</CardTitle>
          <CardDescription className="text-soft-white/60">Select garage and date range for analysis</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="garage">Garage</Label>
            <Select value={garageId} onValueChange={setGarageId}>
              <SelectTrigger id="garage" data-testid="select-garage">
                <SelectValue placeholder="Select garage" />
              </SelectTrigger>
              <SelectContent>
                {garages?.map((garage) => (
                  <SelectItem key={garage.id} value={garage.id}>
                    {garage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              data-testid="input-start-date"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              data-testid="input-end-date"
            />
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-dark-navy border-neon-blue/30 bg-dark-navy border-neon-blue/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Customer Lifetime Value</CardTitle>
            <DollarSign className="h-4 w-4 text-soft-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-clv">
              ${avgLifetimeValue.toFixed(2)}
            </div>
            <p className="text-xs text-soft-white/60">
              Total customers: {customerLifetime?.customers?.length || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-dark-navy border-neon-blue/30 bg-dark-navy border-neon-blue/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Acquisition Cost</CardTitle>
            <Users className="h-4 w-4 text-soft-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-cac">
              ${(acquisitionCost?.acquisitionCost || 0).toFixed(2)}
            </div>
            <p className="text-xs text-soft-white/60">
              New customers: {acquisitionCost?.newCustomers || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-dark-navy border-neon-blue/30 bg-dark-navy border-neon-blue/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
            <Clock className="h-4 w-4 text-soft-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-peak-hour">
              {peakHours?.peakHour || 0}:00
            </div>
            <p className="text-xs text-soft-white/60">
              Most busy time
            </p>
          </CardContent>
        </Card>

        <Card className="bg-dark-navy border-neon-blue/30 bg-dark-navy border-neon-blue/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Day</CardTitle>
            <TrendingUp className="h-4 w-4 text-soft-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-peak-day">
              {peakHours?.peakDay || 'N/A'}
            </div>
            <p className="text-xs text-soft-white/60">
              Most busy day
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Profitable Services */}
        <Card className="bg-dark-navy border-neon-blue/30 bg-dark-navy border-neon-blue/30">
          <CardHeader>
            <CardTitle className="text-soft-white">Most Profitable Services</CardTitle>
            <CardDescription className="text-soft-white/60">Revenue, cost, and profit by service type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={profitableServices?.services || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="serviceType" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#0088FE" name="Revenue" />
                <Bar dataKey="cost" fill="#FF8042" name="Cost" />
                <Bar dataKey="profit" fill="#00C49F" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Profit Margin by Service */}
        <Card className="bg-dark-navy border-neon-blue/30 bg-dark-navy border-neon-blue/30">
          <CardHeader>
            <CardTitle className="text-soft-white">Profit Margin by Service</CardTitle>
            <CardDescription className="text-soft-white/60">Percentage profit margin for each service type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={profitableServices?.services || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.serviceType}: ${entry.profitMargin.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="profitMargin"
                >
                  {profitableServices?.services?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours Analysis */}
        <Card className="bg-dark-navy border-neon-blue/30 bg-dark-navy border-neon-blue/30">
          <CardHeader>
            <CardTitle className="text-soft-white">Hourly Distribution</CardTitle>
            <CardDescription className="text-soft-white/60">Appointments and revenue by hour of day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={peakHours?.hourlyDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="count" stroke="#8884d8" name="Appointments" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue ($)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Distribution */}
        <Card className="bg-dark-navy border-neon-blue/30 bg-dark-navy border-neon-blue/30">
          <CardHeader>
            <CardTitle className="text-soft-white">Daily Distribution</CardTitle>
            <CardDescription className="text-soft-white/60">Appointments and revenue by day of week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={peakHours?.dailyDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Appointments" />
                <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technician Utilization */}
        <Card className="bg-dark-navy border-neon-blue/30 bg-dark-navy border-neon-blue/30">
          <CardHeader>
            <CardTitle className="text-soft-white">Technician Utilization Rates</CardTitle>
            <CardDescription className="text-soft-white/60">Hours worked vs available by technician</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={technicianUtilization?.technicians || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalHoursWorked" fill="#0088FE" name="Hours Worked" />
                <Bar dataKey="totalHoursAvailable" fill="#82ca9d" name="Hours Available" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Acquisition Sources */}
        <Card className="bg-dark-navy border-neon-blue/30 bg-dark-navy border-neon-blue/30">
          <CardHeader>
            <CardTitle className="text-soft-white">Customer Acquisition Sources</CardTitle>
            <CardDescription className="text-soft-white/60">New customers by acquisition channel</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={acquisitionCost?.customersBySource || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.source}: ${entry.count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {acquisitionCost?.customersBySource?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers by Lifetime Value */}
      <Card className="bg-dark-navy border-neon-blue/30 bg-dark-navy border-neon-blue/30">
        <CardHeader>
          <CardTitle className="text-soft-white">Top Customers by Lifetime Value</CardTitle>
          <CardDescription className="text-soft-white/60">Top 5 customers ranked by total revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCustomers.map((customer: any, index: number) => (
              <div
                key={customer.id}
                className="flex items-center justify-between p-3 border border-neon-blue/30 rounded-lg"
                data-testid={`customer-${index}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{customer.name || 'Unknown'}</p>
                    <p className="text-sm text-soft-white/60">
                      {customer.totalInvoices} invoices • {customer.totalVisits} visits
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    ${customer.lifetimeValue.toFixed(2)}
                  </p>
                  <p className="text-sm text-soft-white/60">
                    Avg: ${customer.avgInvoiceValue.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technician Performance Details */}
      <Card className="bg-dark-navy border-neon-blue/30 bg-dark-navy border-neon-blue/30">
        <CardHeader>
          <CardTitle className="text-soft-white">Technician Performance Details</CardTitle>
          <CardDescription className="text-soft-white/60">Detailed metrics for each technician</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {technicianUtilization?.technicians?.map((tech: any) => (
              <div
                key={tech.id}
                className="flex items-center justify-between p-3 border border-neon-blue/30 rounded-lg"
                data-testid={`technician-${tech.id}`}
              >
                <div className="flex items-center gap-3">
                  <Wrench className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium">{tech.name}</p>
                    <p className="text-sm text-soft-white/60">
                      {tech.jobsCompleted} jobs completed
                    </p>
                  </div>
                </div>
                <div className="flex gap-8 text-right">
                  <div>
                    <p className="text-sm text-soft-white/60">Utilization</p>
                    <p className="text-lg font-bold">{tech.utilizationRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-soft-white/60">Hours Worked</p>
                    <p className="text-lg font-bold">{tech.totalHoursWorked.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-soft-white/60">Revenue</p>
                    <p className="text-lg font-bold text-green-600">
                      ${tech.revenueGenerated.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
