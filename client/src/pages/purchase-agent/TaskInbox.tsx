import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Inbox,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  User,
  Building2,
  Calendar,
  FileText,
  ArrowRight,
  MessageSquare,
  Eye,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PurchaseTask {
  id: number;
  taskNumber: string;
  title: string;
  description: string;
  sourceType: "procurement" | "store_keeper";
  sourceName: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  storeLocation: string;
  partsRequired: {
    partNumber: string;
    partName: string;
    quantity: number;
    urgency: string;
  }[];
  dueDate: string;
  createdAt: string;
  notes: string;
  guidanceNotes: string;
}

const mockTasks: PurchaseTask[] = [
  {
    id: 1,
    taskNumber: "PT-2024-001",
    title: "Urgent Brake Pads Order",
    description: "Order brake pads for Toyota Camry job card #JC-456",
    sourceType: "store_keeper",
    sourceName: "Ahmed Al-Hassan",
    priority: "urgent",
    status: "pending",
    storeLocation: "Main Warehouse - Riyadh",
    partsRequired: [
      { partNumber: "BP-TOY-001", partName: "Front Brake Pads - Toyota", quantity: 4, urgency: "urgent" },
      { partNumber: "BP-TOY-002", partName: "Rear Brake Pads - Toyota", quantity: 4, urgency: "high" },
    ],
    dueDate: "2024-12-16",
    createdAt: "2024-12-15T09:00:00Z",
    notes: "Customer waiting for vehicle",
    guidanceNotes: "Preferred supplier: AutoParts Plus. Check for bulk discount.",
  },
  {
    id: 2,
    taskNumber: "PT-2024-002",
    title: "Monthly Oil Filter Restock",
    description: "Restock oil filters for routine maintenance",
    sourceType: "procurement",
    sourceName: "Mohammed Al-Faisal",
    priority: "medium",
    status: "in_progress",
    storeLocation: "Branch Store - Jeddah",
    partsRequired: [
      { partNumber: "OF-UNI-001", partName: "Universal Oil Filter", quantity: 50, urgency: "medium" },
      { partNumber: "OF-BMW-001", partName: "BMW Oil Filter", quantity: 20, urgency: "medium" },
    ],
    dueDate: "2024-12-20",
    createdAt: "2024-12-14T14:30:00Z",
    notes: "Standard monthly order",
    guidanceNotes: "Compare prices from at least 3 suppliers before ordering.",
  },
  {
    id: 3,
    taskNumber: "PT-2024-003",
    title: "Engine Parts for Repair",
    description: "Specialty engine parts for Mercedes repair",
    sourceType: "store_keeper",
    sourceName: "Khalid Al-Rashid",
    priority: "high",
    status: "pending",
    storeLocation: "Main Warehouse - Riyadh",
    partsRequired: [
      { partNumber: "EP-MER-001", partName: "Mercedes Engine Gasket Set", quantity: 1, urgency: "high" },
      { partNumber: "EP-MER-002", partName: "Mercedes Timing Chain Kit", quantity: 1, urgency: "high" },
    ],
    dueDate: "2024-12-18",
    createdAt: "2024-12-15T11:00:00Z",
    notes: "OEM parts required, no aftermarket",
    guidanceNotes: "Contact Mercedes authorized dealer. Verify part compatibility with VIN.",
  },
  {
    id: 4,
    taskNumber: "PT-2024-004",
    title: "Tire Inventory Replenishment",
    description: "Restock popular tire sizes",
    sourceType: "procurement",
    sourceName: "Saad Al-Mutairi",
    priority: "low",
    status: "completed",
    storeLocation: "Branch Store - Dammam",
    partsRequired: [
      { partNumber: "TR-205-55-16", partName: "Michelin 205/55R16", quantity: 20, urgency: "low" },
      { partNumber: "TR-225-45-17", partName: "Bridgestone 225/45R17", quantity: 16, urgency: "low" },
    ],
    dueDate: "2024-12-25",
    createdAt: "2024-12-10T08:00:00Z",
    notes: "Regular stock replenishment",
    guidanceNotes: "Check seasonal promotions from tire distributors.",
  },
];

export default function TaskInbox() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<PurchaseTask | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const { toast } = useToast();

  const tasks = mockTasks;

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.taskNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.sourceName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && task.status === "pending") ||
      (activeTab === "in_progress" && task.status === "in_progress") ||
      (activeTab === "completed" && task.status === "completed");
    
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;

    return matchesSearch && matchesTab && matchesPriority;
  });

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
      low: { variant: "outline", className: "text-gray-600 border-gray-400" },
      medium: { variant: "secondary", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
      high: { variant: "default", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
      urgent: { variant: "destructive", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
    };
    const { variant, className } = config[priority] || config.low;
    return <Badge variant={variant} className={className}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      in_progress: { variant: "default", label: "In Progress" },
      completed: { variant: "outline", label: "Completed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    const { variant, label } = config[status] || { variant: "secondary", label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getSourceIcon = (sourceType: string) => {
    return sourceType === "procurement" ? (
      <Building2 className="h-4 w-4 text-blue-500" />
    ) : (
      <Package className="h-4 w-4 text-green-500" />
    );
  };

  const handleAcceptTask = (task: PurchaseTask) => {
    toast({
      title: "Task Accepted",
      description: `You've accepted task ${task.taskNumber}. Redirecting to quotation management...`,
    });
  };

  const stats = [
    { label: "Pending Tasks", value: tasks.filter(t => t.status === "pending").length, icon: Clock, color: "text-orange-500" },
    { label: "In Progress", value: tasks.filter(t => t.status === "in_progress").length, icon: ArrowRight, color: "text-blue-500" },
    { label: "Completed Today", value: tasks.filter(t => t.status === "completed").length, icon: CheckCircle, color: "text-green-500" },
    { label: "Urgent", value: tasks.filter(t => t.priority === "urgent").length, icon: AlertTriangle, color: "text-red-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Task Inbox
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Receive and manage procurement tasks from Procurement Department and Store Keepers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="h-5 w-5" />
                Incoming Tasks
              </CardTitle>
              <CardDescription>Tasks assigned to you for procurement</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                  data-testid="input-search-tasks"
                />
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32" data-testid="select-priority-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all" data-testid="tab-all">All Tasks</TabsTrigger>
              <TabsTrigger value="pending" data-testid="tab-pending">Pending</TabsTrigger>
              <TabsTrigger value="in_progress" data-testid="tab-in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed" data-testid="tab-completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <Inbox className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No tasks found</p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="border rounded-lg p-4 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
                    data-testid={`task-${task.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-sm text-gray-500">{task.taskNumber}</span>
                          {getPriorityBadge(task.priority)}
                          {getStatusBadge(task.status)}
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            {getSourceIcon(task.sourceType)}
                            <span>{task.sourceType === "procurement" ? "Procurement" : "Store Keeper"}: {task.sourceName}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Building2 className="h-4 w-4" />
                            <span>{task.storeLocation}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Calendar className="h-4 w-4" />
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-2">Parts Required ({task.partsRequired.length}):</p>
                          <div className="flex flex-wrap gap-2">
                            {task.partsRequired.slice(0, 3).map((part, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {part.partName} x{part.quantity}
                              </Badge>
                            ))}
                            {task.partsRequired.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{task.partsRequired.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        {task.guidanceNotes && (
                          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5" />
                              <div>
                                <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Guidance Notes:</p>
                                <p className="text-blue-600 dark:text-blue-300">{task.guidanceNotes}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedTask(task)}
                              data-testid={`button-view-task-${task.id}`}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Task Details - {task.taskNumber}</DialogTitle>
                              <DialogDescription>{task.title}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-500">Source</p>
                                  <p className="font-medium">{task.sourceType === "procurement" ? "Procurement Department" : "Store Keeper"}</p>
                                  <p className="text-sm text-gray-600">{task.sourceName}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Store Location</p>
                                  <p className="font-medium">{task.storeLocation}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Due Date</p>
                                  <p className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Priority</p>
                                  {getPriorityBadge(task.priority)}
                                </div>
                              </div>
                              
                              <div>
                                <p className="text-sm text-gray-500 mb-2">Parts Required</p>
                                <div className="border rounded-lg overflow-hidden">
                                  <table className="w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                      <tr>
                                        <th className="px-3 py-2 text-left">Part Number</th>
                                        <th className="px-3 py-2 text-left">Part Name</th>
                                        <th className="px-3 py-2 text-center">Qty</th>
                                        <th className="px-3 py-2 text-center">Urgency</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {task.partsRequired.map((part, idx) => (
                                        <tr key={idx} className="border-t">
                                          <td className="px-3 py-2 font-mono">{part.partNumber}</td>
                                          <td className="px-3 py-2">{part.partName}</td>
                                          <td className="px-3 py-2 text-center">{part.quantity}</td>
                                          <td className="px-3 py-2 text-center">
                                            <Badge variant="outline" className="text-xs">{part.urgency}</Badge>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {task.notes && (
                                <div>
                                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                                  <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">{task.notes}</p>
                                </div>
                              )}

                              {task.guidanceNotes && (
                                <div>
                                  <p className="text-sm text-gray-500 mb-1">Guidance Notes</p>
                                  <p className="text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-blue-700 dark:text-blue-300">{task.guidanceNotes}</p>
                                </div>
                              )}

                              <div className="flex justify-end gap-2 pt-4">
                                {task.status === "pending" && (
                                  <Button onClick={() => handleAcceptTask(task)} data-testid="button-accept-task">
                                    Accept & Start Quotation
                                  </Button>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {task.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => handleAcceptTask(task)}
                            data-testid={`button-accept-${task.id}`}
                          >
                            Accept
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
