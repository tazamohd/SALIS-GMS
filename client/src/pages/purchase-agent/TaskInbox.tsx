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
  id: string;
  taskNumber: string;
  title: string;
  description: string;
  sourceType: "procurement" | "store_keeper";
  sourceName: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  storeLocation: string;
  dueDate: string;
  createdAt: string;
  notes: string;
  guidanceNotes: string;
}

interface PurchaseTaskPart {
  id: string;
  taskId: string;
  partNumber: string;
  partName: string;
  quantity: number;
  urgency: string;
}

export default function TaskInbox() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<PurchaseTask | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: tasks = [], isLoading } = useQuery<PurchaseTask[]>({
    queryKey: ["/api/purchase-tasks"],
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/purchase-tasks/${data.id}`, { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-tasks"] });
      toast({ title: "Task Updated", description: "Task status has been updated." });
    },
  });

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
      low: { variant: "outline", className: "text-[#64748B] border-[#E2E8F0] dark:border-[#232A36]" },
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
      <Building2 className="h-4 w-4 text-[#0A5ED7]" />
    ) : (
      <Package className="h-4 w-4 text-green-500" />
    );
  };

  const handleAcceptTask = (task: PurchaseTask) => {
    updateTaskMutation.mutate({ id: task.id, status: "in_progress" });
    toast({
      title: "Task Accepted",
      description: `You've accepted task ${task.taskNumber}. Redirecting to quotation management...`,
    });
  };

  const stats = [
    { label: "Pending Tasks", value: tasks.filter(t => t.status === "pending").length, icon: Clock, color: "text-[#F97316]" },
    { label: "In Progress", value: tasks.filter(t => t.status === "in_progress").length, icon: ArrowRight, color: "text-[#0A5ED7]" },
    { label: "Completed Today", value: tasks.filter(t => t.status === "completed").length, icon: CheckCircle, color: "text-green-500" },
    { label: "Urgent", value: tasks.filter(t => t.priority === "urgent").length, icon: AlertTriangle, color: "text-red-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">
          Task Inbox
        </h1>
        <p className="text-[#64748B] mt-1">
          Receive and manage procurement tasks from Procurement Department and Store Keepers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{stat.value}</p>
                  <p className="text-sm text-[#64748B]">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <Inbox className="h-5 w-5 text-[#0A5ED7]" />
                Incoming Tasks
              </CardTitle>
              <CardDescription className="text-[#64748B]">Tasks assigned to you for procurement</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-9 w-64 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                  data-testid="input-search-tasks"
                />
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-priority-filter">
                  <Filter className="h-4 w-4 me-2" />
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
                  <Inbox className="h-12 w-12 text-[#64748B] mx-auto mb-4" />
                  <p className="text-[#64748B]">No tasks found</p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg p-4 hover:border-[#0A5ED7] dark:hover:border-[#0A5ED7] transition-colors bg-[#F8FAFC] dark:bg-[#0E1117]"
                    data-testid={`task-${task.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-sm text-[#64748B]">{task.taskNumber}</span>
                          {getPriorityBadge(task.priority)}
                          {getStatusBadge(task.status)}
                        </div>
                        <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{task.title}</h3>
                        <p className="text-sm text-[#64748B] mt-1">{task.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-1 text-[#64748B]">
                            {getSourceIcon(task.sourceType)}
                            <span>{task.sourceType === "procurement" ? "Procurement" : "Store Keeper"}: {task.sourceName}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[#64748B]">
                            <Building2 className="h-4 w-4" />
                            <span>{task.storeLocation}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[#64748B]">
                            <Calendar className="h-4 w-4" />
                            <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}</span>
                          </div>
                        </div>

                        {task.guidanceNotes && (
                          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="h-4 w-4 text-[#0A5ED7] mt-0.5" />
                              <div>
                                <p className="text-xs font-medium text-[#0A5ED7]">Guidance Notes:</p>
                                <p className="text-[#0A5ED7]">{task.guidanceNotes}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ms-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-[#E2E8F0] dark:border-[#232A36]"
                              onClick={() => setSelectedTask(task)}
                              data-testid={`button-view-task-${task.id}`}
                            >
                              <Eye className="h-4 w-4 me-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl bg-white dark:bg-[#151A23]">
                            <DialogHeader>
                              <DialogTitle className="text-[#0B1F3B] dark:text-white">Task Details - {task.taskNumber}</DialogTitle>
                              <DialogDescription className="text-[#64748B]">{task.title}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-[#64748B]">Source</p>
                                  <p className="font-medium text-[#0B1F3B] dark:text-white">{task.sourceType === "procurement" ? "Procurement Department" : "Store Keeper"}</p>
                                  <p className="text-sm text-[#64748B]">{task.sourceName}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-[#64748B]">Store Location</p>
                                  <p className="font-medium text-[#0B1F3B] dark:text-white">{task.storeLocation}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-[#64748B]">Due Date</p>
                                  <p className="font-medium text-[#0B1F3B] dark:text-white">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-[#64748B]">Priority</p>
                                  {getPriorityBadge(task.priority)}
                                </div>
                              </div>

                              {task.notes && (
                                <div>
                                  <p className="text-sm text-[#64748B] mb-1">Notes</p>
                                  <p className="text-sm bg-[#F8FAFC] dark:bg-[#0E1117] p-3 rounded text-[#0B1F3B] dark:text-white">{task.notes}</p>
                                </div>
                              )}

                              {task.guidanceNotes && (
                                <div>
                                  <p className="text-sm text-[#64748B] mb-1">Guidance Notes</p>
                                  <p className="text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-[#0A5ED7]">{task.guidanceNotes}</p>
                                </div>
                              )}

                              <div className="flex justify-end gap-2 pt-4">
                                {task.status === "pending" && (
                                  <Button
                                    onClick={() => handleAcceptTask(task)}
                                    className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white"
                                    data-testid="button-accept-task"
                                  >
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
                            className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white"
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
