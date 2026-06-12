import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Building2, Store, Truck, Users, Shield, Activity,
  CreditCard, Plus, Search, CheckCircle, XCircle, MapPin, Eye, Edit, RefreshCw,
  TrendingUp, Package, MessageSquare,
  Star, LayoutDashboard, Crown, Settings,
  Server, Database, Cpu, HardDrive, Wifi
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const BRAND_BLUE = "#0A5ED7";
const BRAND_CYAN = "#0BB3FF";
const BRAND_NAVY = "#0B1F3B";
const BRAND_ORANGE = "#F97316";

const garageSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  ownerName: z.string().min(2, "Owner name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Valid phone required"),
  address: z.string().min(5, "Address required"),
  city: z.string().min(2, "City required"),
  country: z.string().min(2, "Country required"),
  subscriptionPlan: z.enum(["STARTER", "PRO", "ENTERPRISE"]),
  vatNumber: z.string().optional(),
  maxBranches: z.coerce.number().min(1).max(500),
});

const supplierSchema = z.object({
  name: z.string().min(2, "Name required"),
  contactPerson: z.string().min(2, "Contact person required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Valid phone required"),
  address: z.string().min(5, "Address required"),
  country: z.string().min(2, "Country required"),
  category: z.enum(["SPARE_PARTS", "TOOLS", "CONSUMABLES", "TYRES", "ELECTRONICS", "LUBRICANTS", "OTHER"]),
  paymentTerms: z.string().min(2, "Payment terms required"),
  website: z.string().optional(),
  notes: z.string().optional(),
});

const storeSchema = z.object({
  name: z.string().min(2, "Store name required"),
  ownerEmail: z.string().email("Valid email required"),
  description: z.string().min(10, "Description required"),
  category: z.enum(["SPARE_PARTS", "TOOLS", "ACCESSORIES", "TYRES", "LUBRICANTS", "FULL_SERVICE"]),
  country: z.string().min(2, "Country required"),
  city: z.string().min(2, "City required"),
  commissionRate: z.coerce.number().min(0).max(50),
  currency: z.string().min(3, "Currency required"),
});

type GarageFormData = z.infer<typeof garageSchema>;
type SupplierFormData = z.infer<typeof supplierSchema>;
type StoreFormData = z.infer<typeof storeSchema>;

const PLAN_COLORS: Record<string, string> = {
  STARTER: "text-gray-500 bg-gray-100 dark:bg-gray-800",
  PRO: "text-blue-500 bg-blue-50 dark:bg-blue-900/30",
  ENTERPRISE: "text-purple-500 bg-purple-50 dark:bg-purple-900/30",
};

const mockPlatformStats = {
  totalGarages: 284,
  activeGarages: 261,
  totalSuppliers: 147,
  activeSuppliers: 139,
  totalStores: 52,
  activeStores: 49,
  totalUsers: 4820,
  supportTickets: 18,
  monthlyRevenue: 485200,
  revenueGrowth: 14.2,
};

const revenueData = [
  { month: "Oct", revenue: 380000 },
  { month: "Nov", revenue: 420000 },
  { month: "Dec", revenue: 395000 },
  { month: "Jan", revenue: 451000 },
  { month: "Feb", revenue: 467000 },
  { month: "Mar", revenue: 485200 },
];

const planDistribution = [
  { name: "Starter", value: 142, color: "#94a3b8" },
  { name: "Pro", value: 98, color: BRAND_BLUE },
  { name: "Enterprise", value: 44, color: "#7c3aed" },
];

const mockGarages = [
  { id: "1", name: "Al-Rashid Auto Center", owner: "Mohammed Al-Rashid", city: "Riyadh", country: "Saudi Arabia", plan: "ENTERPRISE", status: "active", users: 45, branches: 8, revenue: 125000, joinedAt: "2023-06-12" },
  { id: "2", name: "Gulf Motors Workshop", owner: "Ahmed Al-Farsi", city: "Dubai", country: "UAE", plan: "PRO", status: "active", users: 18, branches: 3, revenue: 48000, joinedAt: "2024-01-08" },
  { id: "3", name: "Salam Car Care", owner: "Khalid Ibrahim", city: "Jeddah", country: "Saudi Arabia", plan: "STARTER", status: "active", users: 6, branches: 1, revenue: 12000, joinedAt: "2024-03-15" },
  { id: "4", name: "Platinum Auto Works", owner: "Omar Hassan", city: "Abu Dhabi", country: "UAE", plan: "ENTERPRISE", status: "active", users: 67, branches: 12, revenue: 230000, joinedAt: "2023-02-20" },
  { id: "5", name: "Desert Drive Service", owner: "Faisal Al-Mutairi", city: "Dammam", country: "Saudi Arabia", plan: "PRO", status: "suspended", users: 12, branches: 2, revenue: 31000, joinedAt: "2023-11-05" },
];

const mockSuppliers = [
  { id: "1", name: "Gulf Auto Parts Co.", contact: "Ali Hassan", category: "SPARE_PARTS", country: "Saudi Arabia", status: "active", orders: 284, rating: 4.8 },
  { id: "2", name: "TechDrive Automotive", contact: "Karim Mansour", category: "ELECTRONICS", country: "UAE", status: "active", orders: 156, rating: 4.6 },
  { id: "3", name: "ProTyre International", contact: "Sara Al-Ahmad", category: "TYRES", country: "Jordan", status: "active", orders: 93, rating: 4.9 },
  { id: "4", name: "MasterLube Solutions", contact: "Rami Khalil", category: "LUBRICANTS", country: "Bahrain", status: "inactive", orders: 44, rating: 4.2 },
];

const mockStores = [
  { id: "1", name: "AutoParts Express", owner: "Nader Saleh", category: "SPARE_PARTS", country: "Saudi Arabia", status: "active", products: 1284, sales: 84200, commission: 8 },
  { id: "2", name: "TireZone Online", owner: "Basim Al-Khatib", category: "TYRES", country: "UAE", status: "active", products: 312, sales: 48900, commission: 6 },
  { id: "3", name: "Garage Tools Hub", owner: "Yasser Mahmoud", category: "TOOLS", country: "Saudi Arabia", status: "pending", products: 748, sales: 0, commission: 7 },
];

const mockSupportTickets = [
  { id: "T-001", garage: "Al-Rashid Auto Center", user: "Mohammed Al-Rashid", subject: "Invoice ZATCA sync issue", priority: "HIGH", status: "open", created: "2026-03-08", type: "Technical" },
  { id: "T-002", garage: "Gulf Motors Workshop", user: "Ahmed Al-Farsi", subject: "Cannot add technician accounts", priority: "MEDIUM", status: "in_progress", created: "2026-03-09", type: "Account" },
  { id: "T-003", garage: "Salam Car Care", user: "Khalid Ibrahim", subject: "Upgrade to PRO plan", priority: "LOW", status: "open", created: "2026-03-10", type: "Billing" },
  { id: "T-004", garage: "Desert Drive Service", user: "Faisal Al-Mutairi", subject: "Suspension appeal - billing issue resolved", priority: "HIGH", status: "open", created: "2026-03-10", type: "Billing" },
  { id: "T-005", garage: "Platinum Auto Works", user: "Omar Hassan", subject: "Custom report builder feature request", priority: "LOW", status: "resolved", created: "2026-03-07", type: "Feature" },
];

const systemHealth = {
  apiLatency: 87,
  dbConnections: 124,
  uptime: 99.97,
  cpuUsage: 38,
  memoryUsage: 62,
  diskUsage: 44,
  activeWebSockets: 312,
  cacheHitRate: 94.2,
};

function OverviewTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Garages", value: mockPlatformStats.totalGarages, active: mockPlatformStats.activeGarages, icon: Building2, color: BRAND_BLUE },
          { label: "Suppliers", value: mockPlatformStats.totalSuppliers, active: mockPlatformStats.activeSuppliers, icon: Truck, color: "#7c3aed" },
          { label: "E-Commerce Stores", value: mockPlatformStats.totalStores, active: mockPlatformStats.activeStores, icon: Store, color: "#059669" },
          { label: "Platform Users", value: mockPlatformStats.totalUsers.toLocaleString(), active: null, icon: Users, color: "#d97706" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-[#64748B] dark:text-[#9BA4B0] font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#0F172A] dark:text-white mt-1">{stat.value}</p>
                  {stat.active !== null && (
                    <p className="text-xs text-green-500 mt-1">{stat.active} active</p>
                  )}
                </div>
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}20` }}>
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-[#0A5ED7] to-[#0BB3FF] border-0 text-white">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium opacity-90">Monthly Revenue</p>
              <TrendingUp className="h-4 w-4 opacity-80" />
            </div>
            <p className="text-3xl font-bold">SAR {(mockPlatformStats.monthlyRevenue / 1000).toFixed(0)}K</p>
            <p className="text-xs mt-1 opacity-80">+{mockPlatformStats.revenueGrowth}% vs last month</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#64748B] dark:text-[#9BA4B0] font-medium">Open Support Tickets</p>
              <MessageSquare className="h-4 w-4 text-[#F97316]" />
            </div>
            <p className="text-3xl font-bold text-[#0F172A] dark:text-white">{mockPlatformStats.supportTickets}</p>
            <p className="text-xs text-[#F97316] mt-1">4 high priority</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#64748B] dark:text-[#9BA4B0] font-medium">System Uptime</p>
              <Activity className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-[#0F172A] dark:text-white">{systemHealth.uptime}%</p>
            <p className="text-xs text-green-500 mt-1">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-[#0F172A] dark:text-white">Platform Revenue (6 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BRAND_BLUE} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={BRAND_BLUE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" className="dark:opacity-20" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: any) => [`SAR ${v.toLocaleString()}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke={BRAND_BLUE} fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-[#0F172A] dark:text-white">Subscription Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <ResponsiveContainer width="60%" height={160}>
              <PieChart>
                <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                  {planDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {planDistribution.map((plan) => (
                <div key={plan.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: plan.color }} />
                  <div>
                    <p className="text-xs font-medium text-[#0F172A] dark:text-white">{plan.name}</p>
                    <p className="text-xs text-[#64748B] dark:text-[#9BA4B0]">{plan.value} garages</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-[#0F172A] dark:text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { icon: Building2, color: BRAND_BLUE, text: "New garage registered: Al-Safa Motors — Riyadh", time: "2 min ago" },
              { icon: CreditCard, color: "#7c3aed", text: "Gulf Motors Workshop upgraded to ENTERPRISE plan", time: "18 min ago" },
              { icon: MessageSquare, color: BRAND_ORANGE, text: "High priority ticket T-001 opened by Al-Rashid Auto", time: "1 hr ago" },
              { icon: Store, color: "#059669", text: "New e-commerce store approved: AutoParts Express", time: "3 hrs ago" },
              { icon: Shield, color: "#ef4444", text: "Suspicious login attempt blocked — Desert Drive Service", time: "5 hrs ago" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-[#E2E8F0] dark:border-[#232A36] last:border-0">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}15` }}>
                  <item.icon className="h-4 w-4" style={{ color: item.color }} />
                </div>
                <p className="flex-1 text-sm text-[#0F172A] dark:text-[#E6EAF0]">{item.text}</p>
                <span className="text-xs text-[#64748B] dark:text-[#9BA4B0] whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GaragesTab() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [planFilter, setPlanFilter] = useState("ALL");

  const form = useForm<GarageFormData>({
    resolver: zodResolver(garageSchema),
    defaultValues: {
      name: "", ownerName: "", email: "", phone: "", address: "",
      city: "", country: "Saudi Arabia", subscriptionPlan: "STARTER",
      vatNumber: "", maxBranches: 1,
    },
  });

  const createGarageMutation = useMutation({
    mutationFn: (data: GarageFormData) => apiRequest("POST", "/api/platform-admin/garages", data),
    onSuccess: () => {
      toast({ title: "Garage created successfully", description: "The garage account is now active." });
      setDialogOpen(false);
      form.reset();
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const filtered = mockGarages.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.owner.toLowerCase().includes(search.toLowerCase()) ||
      g.city.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === "ALL" || g.plan === planFilter;
    return matchSearch && matchPlan;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
            <Input placeholder="Search garages..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-64 h-9" />
          </div>
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="All Plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Plans</SelectItem>
              <SelectItem value="STARTER">Starter</SelectItem>
              <SelectItem value="PRO">Pro</SelectItem>
              <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="h-9 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0 hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          New Garage
        </Button>
      </div>

      <Card className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36]">
        <Table>
          <TableHeader>
            <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
              <TableHead>Garage</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Branches</TableHead>
              <TableHead>Revenue/mo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((garage) => (
              <TableRow key={garage.id} className="border-[#E2E8F0] dark:border-[#232A36]">
                <TableCell>
                  <div>
                    <p className="font-semibold text-sm text-[#0F172A] dark:text-white">{garage.name}</p>
                    <p className="text-xs text-[#64748B] dark:text-[#9BA4B0]">{garage.owner}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-[#64748B] dark:text-[#9BA4B0]">
                    <MapPin className="h-3 w-3" />
                    {garage.city}, {garage.country}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={PLAN_COLORS[garage.plan]}>
                    {garage.plan}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{garage.users}</TableCell>
                <TableCell className="text-sm">{garage.branches}</TableCell>
                <TableCell className="text-sm font-medium">SAR {garage.revenue.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={garage.status === "active" ? "text-green-500 border-green-200 bg-green-50 dark:bg-green-900/20" : "text-red-500 border-red-200 bg-red-50 dark:bg-red-900/20"}>
                    {garage.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Edit className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-[#F97316] hover:text-[#F97316]">
                      {garage.status === "active" ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-[#0B1F3B] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#0F172A] dark:text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#0A5ED7]" />
              Register New Garage
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((d) => createGarageMutation.mutate(d))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Garage Name</FormLabel>
                    <FormControl><Input placeholder="Al-Rashid Auto Center" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="ownerName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Name</FormLabel>
                    <FormControl><Input placeholder="Mohammed Al-Rashid" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="owner@garage.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input placeholder="+966 50 000 0000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="vatNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>VAT/TRN Number</FormLabel>
                    <FormControl><Input placeholder="310XXXXXXXXXX" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl><Input placeholder="Street, district..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl><Input placeholder="Riyadh" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="country" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl><Input placeholder="Saudi Arabia" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="subscriptionPlan" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subscription Plan</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="STARTER">Starter</SelectItem>
                        <SelectItem value="PRO">Pro</SelectItem>
                        <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="maxBranches" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Branches</FormLabel>
                    <FormControl><Input type="number" min={1} max={500} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createGarageMutation.isPending} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0">
                  {createGarageMutation.isPending ? "Creating..." : "Create Garage"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SuppliersTab() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "", contactPerson: "", email: "", phone: "", address: "",
      country: "Saudi Arabia", category: "SPARE_PARTS",
      paymentTerms: "NET30", website: "", notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: SupplierFormData) => apiRequest("POST", "/api/platform-admin/suppliers", data),
    onSuccess: () => {
      toast({ title: "Supplier added", description: "The supplier has been registered on the platform." });
      setDialogOpen(false);
      form.reset();
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const filtered = mockSuppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contact.toLowerCase().includes(search.toLowerCase())
  );

  const categoryLabels: Record<string, string> = {
    SPARE_PARTS: "Spare Parts", TOOLS: "Tools", CONSUMABLES: "Consumables",
    TYRES: "Tyres", ELECTRONICS: "Electronics", LUBRICANTS: "Lubricants", OTHER: "Other",
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <Input placeholder="Search suppliers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-64 h-9" />
        </div>
        <Button onClick={() => setDialogOpen(true)} className="h-9 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <Card className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36]">
        <Table>
          <TableHeader>
            <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
              <TableHead>Supplier</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((supplier) => (
              <TableRow key={supplier.id} className="border-[#E2E8F0] dark:border-[#232A36]">
                <TableCell>
                  <div>
                    <p className="font-semibold text-sm text-[#0F172A] dark:text-white">{supplier.name}</p>
                    <p className="text-xs text-[#64748B] dark:text-[#9BA4B0]">{supplier.contact}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[#0A5ED7] border-blue-200 bg-blue-50 dark:bg-blue-900/20 text-xs">
                    {categoryLabels[supplier.category] || supplier.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-[#64748B] dark:text-[#9BA4B0]">{supplier.country}</TableCell>
                <TableCell className="text-sm">{supplier.orders}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">{supplier.rating}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={supplier.status === "active" ? "text-green-500 border-green-200 bg-green-50 dark:bg-green-900/20" : "text-gray-500 border-gray-200"}>
                    {supplier.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Edit className="h-3.5 w-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-[#0B1F3B] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#0F172A] dark:text-white flex items-center gap-2">
              <Truck className="h-5 w-5 text-[#0A5ED7]" />
              Add New Supplier
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Supplier Name</FormLabel>
                    <FormControl><Input placeholder="Gulf Auto Parts Co." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="contactPerson" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl><Input placeholder="Ali Hassan" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="contact@supplier.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input placeholder="+966 50 000 0000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([v, l]) => (
                          <SelectItem key={v} value={v}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl><Input placeholder="Street, city..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="country" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl><Input placeholder="Saudi Arabia" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="paymentTerms" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Terms</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="IMMEDIATE">Immediate</SelectItem>
                        <SelectItem value="NET15">Net 15</SelectItem>
                        <SelectItem value="NET30">Net 30</SelectItem>
                        <SelectItem value="NET60">Net 60</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="website" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Website (optional)</FormLabel>
                    <FormControl><Input placeholder="https://supplier.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl><Textarea placeholder="Additional notes..." rows={3} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0">
                  {createMutation.isPending ? "Adding..." : "Add Supplier"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StoresTab() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: "", ownerEmail: "", description: "", category: "SPARE_PARTS",
      country: "Saudi Arabia", city: "", commissionRate: 7, currency: "SAR",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: StoreFormData) => apiRequest("POST", "/api/platform-admin/stores", data),
    onSuccess: () => {
      toast({ title: "Store created", description: "The e-commerce store is now live on the platform." });
      setDialogOpen(false);
      form.reset();
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const statusColors: Record<string, string> = {
    active: "text-green-500 border-green-200 bg-green-50 dark:bg-green-900/20",
    pending: "text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20",
    suspended: "text-red-500 border-red-200 bg-red-50 dark:bg-red-900/20",
  };

  const catLabels: Record<string, string> = {
    SPARE_PARTS: "Spare Parts", TOOLS: "Tools", ACCESSORIES: "Accessories",
    TYRES: "Tyres", LUBRICANTS: "Lubricants", FULL_SERVICE: "Full Service",
  };

  const filtered = mockStores.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.owner.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <Input placeholder="Search stores..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-64 h-9" />
        </div>
        <Button onClick={() => setDialogOpen(true)} className="h-9 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Store
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        {[
          { label: "Total Stores", value: "52", icon: Store, color: BRAND_BLUE },
          { label: "Total Products Listed", value: "12,840", icon: Package, color: "#7c3aed" },
          { label: "Monthly Store Sales", value: "SAR 284K", icon: TrendingUp, color: "#059669" },
        ].map((s) => (
          <Card key={s.label} className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="pt-4 pb-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}15` }}>
                <s.icon className="h-5 w-5" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-xs text-[#64748B] dark:text-[#9BA4B0]">{s.label}</p>
                <p className="text-xl font-bold text-[#0F172A] dark:text-white">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36]">
        <Table>
          <TableHeader>
            <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
              <TableHead>Store</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Monthly Sales</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((store) => (
              <TableRow key={store.id} className="border-[#E2E8F0] dark:border-[#232A36]">
                <TableCell>
                  <div>
                    <p className="font-semibold text-sm text-[#0F172A] dark:text-white">{store.name}</p>
                    <p className="text-xs text-[#64748B] dark:text-[#9BA4B0]">{store.owner}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs text-[#0A5ED7] border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                    {catLabels[store.category] || store.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{store.products.toLocaleString()}</TableCell>
                <TableCell className="text-sm font-medium">SAR {store.sales.toLocaleString()}</TableCell>
                <TableCell className="text-sm">{store.commission}%</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColors[store.status] || ""}>
                    {store.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Edit className="h-3.5 w-3.5" /></Button>
                    {store.status === "pending" && (
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-green-500 hover:text-green-500 text-xs">
                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-[#0B1F3B] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#0F172A] dark:text-white flex items-center gap-2">
              <Store className="h-5 w-5 text-[#0A5ED7]" />
              Add New E-Commerce Store
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Name</FormLabel>
                    <FormControl><Input placeholder="AutoParts Express" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="ownerEmail" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Email</FormLabel>
                    <FormControl><Input type="email" placeholder="owner@store.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {Object.entries(catLabels).map(([v, l]) => (
                          <SelectItem key={v} value={v}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="commissionRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission Rate (%)</FormLabel>
                    <FormControl><Input type="number" min={0} max={50} step={0.5} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl><Input placeholder="Riyadh" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="country" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl><Input placeholder="Saudi Arabia" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="currency" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                        <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Store Description</FormLabel>
                    <FormControl><Textarea placeholder="Describe what this store sells..." rows={3} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0">
                  {createMutation.isPending ? "Creating..." : "Create Store"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SupportTab() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedTicket, setSelectedTicket] = useState<typeof mockSupportTickets[0] | null>(null);

  const priorityColors: Record<string, string> = {
    HIGH: "text-red-500 border-red-200 bg-red-50 dark:bg-red-900/20",
    MEDIUM: "text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20",
    LOW: "text-blue-500 border-blue-200 bg-blue-50 dark:bg-blue-900/20",
  };

  const statusColors: Record<string, string> = {
    open: "text-[#F97316] border-orange-200 bg-orange-50 dark:bg-orange-900/20",
    in_progress: "text-blue-500 border-blue-200 bg-blue-50 dark:bg-blue-900/20",
    resolved: "text-green-500 border-green-200 bg-green-50 dark:bg-green-900/20",
  };

  const filtered = mockSupportTickets.filter(t => {
    const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.garage.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
        {[
          { label: "Total Open", value: mockSupportTickets.filter(t => t.status === "open").length, color: BRAND_ORANGE },
          { label: "In Progress", value: mockSupportTickets.filter(t => t.status === "in_progress").length, color: BRAND_BLUE },
          { label: "Resolved Today", value: 3, color: "#059669" },
          { label: "Avg. Response", value: "2.4h", color: "#7c3aed" },
        ].map((s) => (
          <Card key={s.label} className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="pt-3 pb-3">
              <p className="text-xs text-[#64748B] dark:text-[#9BA4B0]">{s.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 items-center justify-between">
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
            <Input placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-64 h-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36]">
        <Table>
          <TableHeader>
            <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
              <TableHead>Ticket ID</TableHead>
              <TableHead>Garage</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((ticket) => (
              <TableRow key={ticket.id} className="border-[#E2E8F0] dark:border-[#232A36]">
                <TableCell className="font-mono text-xs font-bold text-[#0A5ED7]">{ticket.id}</TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium text-[#0F172A] dark:text-white">{ticket.garage}</p>
                    <p className="text-xs text-[#64748B] dark:text-[#9BA4B0]">{ticket.user}</p>
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px]">
                  <p className="text-sm truncate">{ticket.subject}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{ticket.type}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs ${priorityColors[ticket.priority]}`}>
                    {ticket.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs ${statusColors[ticket.status]}`}>
                    {ticket.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-[#64748B] dark:text-[#9BA4B0]">{ticket.created}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-[#0A5ED7]"
                    onClick={() => setSelectedTicket(ticket)}>
                    <Eye className="h-3.5 w-3.5 mr-1" /> View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        {selectedTicket && (
          <DialogContent className="max-w-2xl bg-white dark:bg-[#0B1F3B]">
            <DialogHeader>
              <DialogTitle className="text-[#0F172A] dark:text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#0A5ED7]" />
                Ticket {selectedTicket.id}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg p-3">
                  <p className="text-xs text-[#64748B] mb-1">Garage</p>
                  <p className="text-sm font-medium text-[#0F172A] dark:text-white">{selectedTicket.garage}</p>
                </div>
                <div className="bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg p-3">
                  <p className="text-xs text-[#64748B] mb-1">Submitted by</p>
                  <p className="text-sm font-medium text-[#0F172A] dark:text-white">{selectedTicket.user}</p>
                </div>
              </div>
              <div className="bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg p-3">
                <p className="text-xs text-[#64748B] mb-1">Subject</p>
                <p className="text-sm font-medium text-[#0F172A] dark:text-white">{selectedTicket.subject}</p>
              </div>
              <div className="bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg p-3">
                <p className="text-xs text-[#64748B] mb-2">Admin Response</p>
                <Textarea placeholder="Type your response to this ticket..." rows={4} className="bg-white dark:bg-[#0B1F3B]" />
              </div>
              <div className="flex gap-3 justify-end">
                <Select defaultValue={selectedTicket.status}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0">
                  Send Response
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

function SystemHealthTab() {
  const metrics = [
    { label: "API Latency", value: `${systemHealth.apiLatency}ms`, good: systemHealth.apiLatency < 200, icon: Wifi },
    { label: "DB Connections", value: systemHealth.dbConnections, good: systemHealth.dbConnections < 300, icon: Database },
    { label: "CPU Usage", value: `${systemHealth.cpuUsage}%`, good: systemHealth.cpuUsage < 80, icon: Cpu },
    { label: "Memory Usage", value: `${systemHealth.memoryUsage}%`, good: systemHealth.memoryUsage < 85, icon: HardDrive },
    { label: "Disk Usage", value: `${systemHealth.diskUsage}%`, good: systemHealth.diskUsage < 85, icon: HardDrive },
    { label: "Cache Hit Rate", value: `${systemHealth.cacheHitRate}%`, good: systemHealth.cacheHitRate > 90, icon: RefreshCw },
    { label: "Active WebSockets", value: systemHealth.activeWebSockets, good: true, icon: Activity },
    { label: "System Uptime", value: `${systemHealth.uptime}%`, good: systemHealth.uptime > 99, icon: Server },
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-green-500/10 to-green-400/5 border border-green-200 dark:border-green-900/40">
        <CardContent className="pt-4 pb-4 flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-500" />
          <div>
            <p className="font-bold text-[#0F172A] dark:text-white">All Systems Operational</p>
            <p className="text-xs text-[#64748B] dark:text-[#9BA4B0]">Last checked: {new Date().toLocaleTimeString()}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.label} className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-2">
                <m.icon className="h-4 w-4 text-[#64748B] dark:text-[#9BA4B0]" />
                <div className={`h-2 w-2 rounded-full ${m.good ? "bg-green-400" : "bg-[#F97316]"}`} />
              </div>
              <p className="text-xl font-bold text-[#0F172A] dark:text-white">{m.value}</p>
              <p className="text-xs text-[#64748B] dark:text-[#9BA4B0] mt-1">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-[#0F172A] dark:text-white">Service Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { service: "API Server", status: "operational", latency: "87ms" },
              { service: "PostgreSQL Database", status: "operational", latency: "12ms" },
              { service: "WebSocket Server", status: "operational", latency: "—" },
              { service: "File Storage (S3)", status: "operational", latency: "156ms" },
              { service: "Email Service (Gmail)", status: "operational", latency: "—" },
              { service: "SMS Service (Twilio)", status: "operational", latency: "—" },
              { service: "AI Services (OpenAI)", status: "operational", latency: "342ms" },
              { service: "ZATCA E-Invoice API", status: "operational", latency: "289ms" },
            ].map((svc) => (
              <div key={svc.service} className="flex items-center justify-between py-2 border-b border-[#E2E8F0] dark:border-[#232A36] last:border-0">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="text-sm text-[#0F172A] dark:text-[#E6EAF0]">{svc.service}</span>
                </div>
                <div className="flex items-center gap-3">
                  {svc.latency !== "—" && <span className="text-xs text-[#64748B] dark:text-[#9BA4B0]">{svc.latency}</span>}
                  <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50 dark:bg-green-900/20 text-xs">
                    {svc.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RBACTab() {
  const roles = [
    { name: "Platform Admin", code: "PLATFORM_ADMIN", users: 3, color: "#7c3aed", description: "Full platform control, all tenants, system settings" },
    { name: "System Administrator", code: "ADMIN", users: 142, color: BRAND_BLUE, description: "Full access within their garage/tenant" },
    { name: "Service Manager", code: "MANAGER", users: 384, color: "#059669", description: "Service operations, HR, limited finance" },
    { name: "Service Advisor", code: "ADVISOR", users: 612, color: "#d97706", description: "Customer intake, job cards, estimates" },
    { name: "Technician", code: "TECHNICIAN", users: 1840, color: "#64748b", description: "Assigned jobs, time clock, parts lookup" },
    { name: "Accountant", code: "ACCOUNTANT", users: 298, color: "#0891b2", description: "Finance, invoices, reports, accounting" },
    { name: "Purchase Agent", code: "PURCHASE_AGENT", users: 184, color: "#7c3aed", description: "Purchase orders, suppliers, inventory" },
    { name: "HR Manager", code: "HR_MANAGER", users: 97, color: "#be185d", description: "Staff, payroll, leave, performance" },
    { name: "Customer", code: "CUSTOMER", users: 1260, color: "#84cc16", description: "Customer portal, booking, vehicle history" },
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-[#0F172A] dark:text-white">Platform Roles & Permissions Matrix</CardTitle>
          <CardDescription className="text-xs text-[#64748B] dark:text-[#9BA4B0]">
            All roles across the platform. PLATFORM_ADMIN has unrestricted access to all tenants and settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {roles.map((role) => (
              <div key={role.code} className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7]/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: `${role.color}15` }}>
                    <Shield className="h-4 w-4" style={{ color: role.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-[#0F172A] dark:text-white">{role.name}</p>
                      <Badge variant="outline" className="text-xs font-mono">{role.code}</Badge>
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#9BA4B0]">{role.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#0F172A] dark:text-white">{role.users.toLocaleString()}</p>
                    <p className="text-xs text-[#64748B] dark:text-[#9BA4B0]">users</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <Settings className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PlatformAdmin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "garages", label: "Garages", icon: Building2 },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "suppliers", label: "Suppliers", icon: Truck },
    { id: "stores", label: "E-Commerce", icon: Store },
    { id: "support", label: "Help & Support", icon: MessageSquare },
    { id: "rbac", label: "Roles & RBAC", icon: Shield },
    { id: "system", label: "System Health", icon: Activity },
  ];

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#0A5ED7] to-[#0BB3FF] flex items-center justify-center shadow-lg">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#0B1F3B] dark:text-white">Platform Administration</h1>
            <p className="text-sm text-[#64748B] dark:text-[#9BA4B0]">
              SALIS AUTO · Super Admin Control Center
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0 px-3 py-1 text-xs font-semibold">
            PLATFORM ADMIN
          </Badge>
          <Button variant="outline" size="sm" className="h-9 gap-2 border-[#E2E8F0] dark:border-[#232A36]">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white dark:bg-[#0B1F3B] border border-[#E2E8F0] dark:border-[#232A36] h-auto flex-wrap gap-1 p-1">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2 text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white">
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6"><OverviewTab /></TabsContent>
        <TabsContent value="garages" className="mt-6"><GaragesTab /></TabsContent>
        <TabsContent value="billing" className="mt-6"><PlatformBillingTab /></TabsContent>
        <TabsContent value="suppliers" className="mt-6"><SuppliersTab /></TabsContent>
        {/* PlatformBillingTab is defined inline below */}
        <TabsContent value="stores" className="mt-6"><StoresTab /></TabsContent>
        <TabsContent value="support" className="mt-6"><SupportTab /></TabsContent>
        <TabsContent value="rbac" className="mt-6"><RBACTab /></TabsContent>
        <TabsContent value="system" className="mt-6"><SystemHealthTab /></TabsContent>
      </Tabs>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Billing tab — list every garage's subscription + allow platform admins
// to force-change the plan (bypass Stripe checkout in dev).
// ═══════════════════════════════════════════════════════════════════════

interface GarageSubscriptionRow {
  subscriptionId: string;
  garageId: string;
  garageName: string | null;
  plan: "STARTER" | "PRO" | "ENTERPRISE";
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAt: string | null;
  canceledAt: string | null;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  createdAt: string;
}

function PlatformBillingTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data = [], isLoading } = useQuery<GarageSubscriptionRow[]>({
    queryKey: ["/api/subscriptions/all"],
  });

  const planMutation = useMutation({
    mutationFn: async ({ garageId, plan }: { garageId: string; plan: string }) => {
      const res = await apiRequest("PATCH", `/api/subscriptions/${garageId}`, { plan });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/subscriptions/all"] });
      toast({ title: "Plan updated" });
    },
    onError: (err: Error) =>
      toast({ title: "Update failed", description: err.message, variant: "destructive" }),
  });

  const totals = data.reduce(
    (acc: Record<string, number>, row) => {
      acc[row.plan] = (acc[row.plan] ?? 0) + 1;
      return acc;
    },
    { STARTER: 0, PRO: 0, ENTERPRISE: 0 },
  );

  const planStyles: Record<string, string> = {
    STARTER: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
    PRO: "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white",
    ENTERPRISE: "bg-gradient-to-r from-[#7C5CFF] to-[#F97316] text-white",
  };
  const statusStyles: Record<string, string> = {
    active: "bg-emerald-500/15 text-emerald-600",
    trialing: "bg-sky-500/15 text-sky-600",
    past_due: "bg-amber-500/15 text-amber-600",
    canceled: "bg-red-500/15 text-red-600",
    unpaid: "bg-red-500/15 text-red-600",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["STARTER", "PRO", "ENTERPRISE"] as const).map((p) => (
          <Card key={p} className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#64748B] uppercase tracking-wide">{p} garages</div>
                  <div className="text-3xl font-extrabold text-[#0B1F3B] dark:text-white mt-1" data-testid={`count-${p}`}>
                    {totals[p]}
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${planStyles[p]}`}>{p}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">All garage subscriptions</CardTitle>
          <CardDescription className="text-[#64748B]">
            Override a garage's plan directly. In production this should require a refund flow when downgrading mid-cycle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-[#64748B]">Loading…</p>
          ) : data.length === 0 ? (
            <p className="text-[#64748B] text-sm">
              No subscriptions yet. Garages will appear here once they log in.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] dark:border-[#232A36] text-left text-[#64748B]">
                    <th className="py-2 px-2 font-medium">Garage</th>
                    <th className="py-2 px-2 font-medium">Plan</th>
                    <th className="py-2 px-2 font-medium">Status</th>
                    <th className="py-2 px-2 font-medium">Renews</th>
                    <th className="py-2 px-2 font-medium">Stripe</th>
                    <th className="py-2 px-2 font-medium">Override</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr
                      key={row.subscriptionId}
                      className="border-b border-[#E2E8F0]/40 dark:border-[#232A36]/60"
                      data-testid={`row-${row.garageId}`}
                    >
                      <td className="py-2 px-2">
                        <div className="font-semibold text-[#0B1F3B] dark:text-white">
                          {row.garageName ?? "Unnamed garage"}
                        </div>
                        <div className="text-xs text-[#64748B] font-mono">{row.garageId.slice(0, 8)}…</div>
                      </td>
                      <td className="py-2 px-2">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${planStyles[row.plan]}`}>
                          {row.plan}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <span
                          className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                            statusStyles[row.status] ?? "bg-slate-500/15 text-slate-500"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-[#64748B]">
                        {row.currentPeriodEnd ? new Date(row.currentPeriodEnd).toLocaleDateString() : "—"}
                        {row.cancelAt && (
                          <div className="text-xs text-red-500">
                            cancels {new Date(row.cancelAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-2 text-[#64748B] text-xs font-mono">
                        {row.stripeSubscriptionId ? `${row.stripeSubscriptionId.slice(0, 12)  }…` : "dev mode"}
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex gap-1">
                          {(["STARTER", "PRO", "ENTERPRISE"] as const).map((p) => (
                            <button
                              key={p}
                              data-testid={`set-${row.garageId}-${p}`}
                              disabled={p === row.plan || planMutation.isPending}
                              onClick={() => planMutation.mutate({ garageId: row.garageId, plan: p })}
                              className={`text-[10px] px-2 py-1 rounded-md transition-colors ${
                                p === row.plan
                                  ? "bg-[#0A5ED7]/10 text-[#0A5ED7] cursor-default"
                                  : "bg-[#F8FAFC] dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36] text-[#64748B] hover:border-[#0BB3FF]"
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
