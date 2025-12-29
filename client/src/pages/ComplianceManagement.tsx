import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TabsPageLayout, TabConfig } from "@/components/layouts/TabsPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, FileText, ClipboardCheck, CheckCircle } from "lucide-react";

const policySchema = z.object({
  policyName: z.string().min(1, "Policy name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  effectiveDate: z.string(),
  expirationDate: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
});

const auditSchema = z.object({
  policyId: z.string().min(1, "Policy is required"),
  auditDate: z.string(),
  auditorName: z.string().min(1, "Auditor name is required"),
  findings: z.string().optional(),
  complianceScore: z.number().min(0).max(100).optional(),
  status: z.enum(["scheduled", "in_progress", "completed", "failed"]).default("scheduled"),
});

const taskSchema = z.object({
  policyId: z.string().min(1, "Policy is required"),
  taskName: z.string().min(1, "Task name is required"),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
  dueDate: z.string(),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  status: z.enum(["pending", "in_progress", "completed", "overdue"]).default("pending"),
});

type PolicyFormData = z.infer<typeof policySchema>;
type AuditFormData = z.infer<typeof auditSchema>;
type TaskFormData = z.infer<typeof taskSchema>;

export default function ComplianceManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("policies");
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false);
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);

  const { data: policies = [], isLoading: policiesLoading } = useQuery<any[]>({
    queryKey: ["/api/compliance/policies"],
  });

  const { data: audits = [], isLoading: auditsLoading } = useQuery<any[]>({
    queryKey: ["/api/compliance/audits"],
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<any[]>({
    queryKey: ["/api/compliance/tasks"],
  });

  const policyForm = useForm<PolicyFormData>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      policyName: "",
      category: "",
      description: "",
      requirements: [],
      effectiveDate: new Date().toISOString().split('T')[0],
      expirationDate: "",
      status: "draft",
    }
  });

  const auditForm = useForm<AuditFormData>({
    resolver: zodResolver(auditSchema),
    defaultValues: {
      policyId: "",
      auditDate: new Date().toISOString().split('T')[0],
      auditorName: "",
      findings: "",
      complianceScore: 0,
      status: "scheduled",
    }
  });

  const taskForm = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      policyId: "",
      taskName: "",
      description: "",
      assignedTo: "",
      dueDate: new Date().toISOString().split('T')[0],
      priority: "medium",
      status: "pending",
    }
  });

  const createPolicyMutation = useMutation({
    mutationFn: (data: PolicyFormData) => apiRequest("POST", "/api/compliance/policies", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/policies"] });
      toast({ title: t('common.success', 'Success'), description: t('compliance.policyCreated', 'Compliance policy created') });
      setIsPolicyDialogOpen(false);
      policyForm.reset();
    },
    onError: () => {
      toast({ title: t('common.error', 'Error'), description: t('compliance.policyCreateFailed', 'Failed to create policy'), variant: "destructive" });
    }
  });

  const createAuditMutation = useMutation({
    mutationFn: (data: AuditFormData) => apiRequest("POST", "/api/compliance/audits", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/audits"] });
      toast({ title: t('common.success', 'Success'), description: t('compliance.auditScheduled', 'Audit scheduled successfully') });
      setIsAuditDialogOpen(false);
      auditForm.reset();
    },
    onError: () => {
      toast({ title: t('common.error', 'Error'), description: t('compliance.auditScheduleFailed', 'Failed to schedule audit'), variant: "destructive" });
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: TaskFormData) => apiRequest("POST", "/api/compliance/tasks", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/tasks"] });
      toast({ title: t('common.success', 'Success'), description: t('compliance.taskCreated', 'Compliance task created') });
      setIsTaskDialogOpen(false);
      taskForm.reset();
    },
    onError: () => {
      toast({ title: t('common.error', 'Error'), description: t('compliance.taskCreateFailed', 'Failed to create task'), variant: "destructive" });
    }
  });

  const completeTaskMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/compliance/tasks/${id}/complete`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/tasks"] });
      toast({ title: t('common.success', 'Success'), description: t('compliance.taskCompleted', 'Task marked as complete') });
    },
  });

  const tabs: TabConfig[] = [
    {
      id: "policies",
      label: t('compliance.policies', 'Policies'),
      icon: Shield,
      content: (
        <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
          <CardHeader>
            <CardTitle className="font-montserrat text-salis-black dark:text-white">{t('compliance.compliancePolicies', 'Compliance Policies')}</CardTitle>
            <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              {t('compliance.policiesDescription', 'Regulatory and internal compliance policies')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {policiesLoading ? (
              <p className="text-salis-gray font-poppins" data-testid="text-loading">{t('common.loading', 'Loading')}...</p>
            ) : policies.length === 0 ? (
              <p className="text-salis-gray font-poppins" data-testid="text-no-policies">{t('compliance.noPolicies', 'No policies found')}</p>
            ) : (
              <div className="grid gap-4">
                {policies.map((policy: any) => (
                  <Card key={policy.id} className="border-salis-gray-light dark:border-salis-gray-dark" data-testid={`card-policy-${policy.id}`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-montserrat font-medium text-salis-black dark:text-white" data-testid={`text-policy-name-${policy.id}`}>
                              {policy.policyName}
                            </h3>
                            <Badge className={policy.status === "active" ? "bg-green-500 text-white" : policy.status === "draft" ? "bg-yellow-500 text-white" : "bg-salis-gray text-white"} data-testid={`badge-policy-status-${policy.id}`}>
                              {String(t(`common.${policy.status}`, policy.status))}
                            </Badge>
                          </div>
                          <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins mb-2" data-testid={`text-policy-category-${policy.id}`}>
                            {t('common.category', 'Category')}: {policy.category}
                          </p>
                          <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins mb-2" data-testid={`text-policy-description-${policy.id}`}>
                            {policy.description || t('common.noDescription', 'No description')}
                          </p>
                          <div className="flex gap-4 text-sm text-salis-gray dark:text-salis-gray-light">
                            <span data-testid={`text-effective-date-${policy.id}`}>
                              {t('compliance.effective', 'Effective')}: {new Date(policy.effectiveDate).toLocaleDateString()}
                            </span>
                            {policy.expirationDate && (
                              <span data-testid={`text-expiration-date-${policy.id}`}>
                                {t('compliance.expires', 'Expires')}: {new Date(policy.expirationDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )
    },
    {
      id: "audits",
      label: t('compliance.audits', 'Audits'),
      icon: ClipboardCheck,
      content: (
        <div className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => setIsAuditDialogOpen(true)}
              className="bg-salis-black hover:bg-salis-gray-dark text-white font-poppins"
              data-testid="button-schedule-audit"
            >
              <ClipboardCheck className="mr-2 h-4 w-4" />
              {t('compliance.scheduleAudit', 'Schedule Audit')}
            </Button>
          </div>
          <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
            <CardHeader>
              <CardTitle className="font-montserrat text-salis-black dark:text-white">{t('compliance.complianceAudits', 'Compliance Audits')}</CardTitle>
              <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
                {t('compliance.auditsDescription', 'Scheduled and completed compliance audits')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditsLoading ? (
                <p className="text-salis-gray font-poppins" data-testid="text-loading-audits">{t('compliance.loadingAudits', 'Loading audits')}...</p>
              ) : audits.length === 0 ? (
                <p className="text-salis-gray font-poppins" data-testid="text-no-audits">{t('compliance.noAudits', 'No audits found')}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('compliance.auditDate', 'Audit Date')}</TableHead>
                      <TableHead>{t('compliance.auditor', 'Auditor')}</TableHead>
                      <TableHead>{t('compliance.score', 'Score')}</TableHead>
                      <TableHead>{t('common.status', 'Status')}</TableHead>
                      <TableHead>{t('compliance.findings', 'Findings')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {audits.map((audit: any) => (
                      <TableRow key={audit.id} data-testid={`row-audit-${audit.id}`}>
                        <TableCell data-testid={`text-audit-date-${audit.id}`}>
                          {new Date(audit.auditDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium" data-testid={`text-auditor-${audit.id}`}>{audit.auditorName}</TableCell>
                        <TableCell data-testid={`text-score-${audit.id}`}>
                          {audit.complianceScore !== null && audit.complianceScore !== undefined ? `${audit.complianceScore}%` : t('common.na', 'N/A')}
                        </TableCell>
                        <TableCell>
                          <Badge className={audit.status === "completed" ? "bg-green-500 text-white" : audit.status === "failed" ? "bg-red-500 text-white" : "bg-yellow-500 text-white"} data-testid={`badge-audit-status-${audit.id}`}>
                            {String(t(`common.${audit.status}`, audit.status))}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate" data-testid={`text-findings-${audit.id}`}>
                          {audit.findings || t('compliance.noFindings', 'No findings')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: "tasks",
      label: t('compliance.tasks', 'Tasks'),
      icon: FileText,
      content: (
        <div className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => setIsTaskDialogOpen(true)}
              className="bg-salis-black hover:bg-salis-gray-dark text-white font-poppins"
              data-testid="button-create-task"
            >
              <FileText className="mr-2 h-4 w-4" />
              {t('compliance.createTask', 'Create Task')}
            </Button>
          </div>
          <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
            <CardHeader>
              <CardTitle className="font-montserrat text-salis-black dark:text-white">{t('compliance.complianceTasks', 'Compliance Tasks')}</CardTitle>
              <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
                {t('compliance.tasksDescription', 'Ongoing compliance tasks and action items')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <p className="text-salis-gray font-poppins" data-testid="text-loading-tasks">{t('compliance.loadingTasks', 'Loading tasks')}...</p>
              ) : tasks.length === 0 ? (
                <p className="text-salis-gray font-poppins" data-testid="text-no-tasks">{t('compliance.noTasks', 'No tasks found')}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('compliance.taskName', 'Task Name')}</TableHead>
                      <TableHead>{t('compliance.assignedTo', 'Assigned To')}</TableHead>
                      <TableHead>{t('compliance.dueDate', 'Due Date')}</TableHead>
                      <TableHead>{t('compliance.priority', 'Priority')}</TableHead>
                      <TableHead>{t('common.status', 'Status')}</TableHead>
                      <TableHead>{t('common.actions', 'Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task: any) => (
                      <TableRow key={task.id} data-testid={`row-task-${task.id}`}>
                        <TableCell className="font-medium" data-testid={`text-task-name-${task.id}`}>{task.taskName}</TableCell>
                        <TableCell data-testid={`text-assigned-to-${task.id}`}>{task.assignedTo || t('compliance.unassigned', 'Unassigned')}</TableCell>
                        <TableCell data-testid={`text-due-date-${task.id}`}>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={task.priority === "critical" ? "bg-red-600 text-white" : task.priority === "high" ? "bg-orange-500 text-white" : "bg-yellow-500 text-white"} data-testid={`badge-priority-${task.id}`}>
                            {String(t(`compliance.priority_${task.priority}`, task.priority))}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={task.status === "completed" ? "bg-green-500 text-white" : task.status === "overdue" ? "bg-red-500 text-white" : "bg-yellow-500 text-white"} data-testid={`badge-task-status-${task.id}`}>
                            {String(t(`common.${task.status}`, task.status))}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {task.status !== "completed" && (
                            <Button
                              size="sm"
                              onClick={() => completeTaskMutation.mutate(task.id)}
                              className="bg-green-500 hover:bg-green-600 text-white"
                              data-testid={`button-complete-task-${task.id}`}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  return (
    <>
      <TabsPageLayout
        title={t('compliance.title', 'Compliance Management')}
        description={t('compliance.description', 'Manage compliance policies, audits, and tasks')}
        icon={Shield}
        primaryAction={{
          label: t('compliance.createPolicy', 'Create Policy'),
          icon: Shield,
          onClick: () => setIsPolicyDialogOpen(true),
          testId: "button-create-policy"
        }}
        tabs={tabs}
        activeTab={selectedTab}
        onTabChange={setSelectedTab}
      />

      <Dialog open={isPolicyDialogOpen} onOpenChange={setIsPolicyDialogOpen}>
        <DialogContent className="bg-white dark:bg-salis-black">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-salis-black dark:text-white">{t('compliance.createCompliancePolicy', 'Create Compliance Policy')}</DialogTitle>
            <DialogDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              {t('compliance.addNewPolicy', 'Add a new compliance policy')}
            </DialogDescription>
          </DialogHeader>
          <Form {...policyForm}>
            <form onSubmit={policyForm.handleSubmit((data) => createPolicyMutation.mutate(data))} className="space-y-4">
              <FormField
                control={policyForm.control}
                name="policyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('compliance.policyName', 'Policy Name')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('compliance.policyNamePlaceholder', 'OSHA Compliance')} data-testid="input-policy-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={policyForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.category', 'Category')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('compliance.categoryPlaceholder', 'Safety')} data-testid="input-category" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={policyForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.description', 'Description')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t('compliance.descriptionPlaceholder', 'Policy description...')} data-testid="input-policy-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={policyForm.control}
                  name="effectiveDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('compliance.effectiveDate', 'Effective Date')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-effective-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={policyForm.control}
                  name="expirationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('compliance.expirationDateOptional', 'Expiration Date (optional)')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-expiration-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createPolicyMutation.isPending} data-testid="button-submit-policy">
                  {createPolicyMutation.isPending ? t('common.creating', 'Creating...') : t('compliance.createPolicy', 'Create Policy')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAuditDialogOpen} onOpenChange={setIsAuditDialogOpen}>
        <DialogContent className="bg-white dark:bg-salis-black">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-salis-black dark:text-white">{t('compliance.scheduleComplianceAudit', 'Schedule Compliance Audit')}</DialogTitle>
            <DialogDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              {t('compliance.scheduleNewAudit', 'Schedule a new compliance audit')}
            </DialogDescription>
          </DialogHeader>
          <Form {...auditForm}>
            <form onSubmit={auditForm.handleSubmit((data) => createAuditMutation.mutate(data))} className="space-y-4">
              <FormField
                control={auditForm.control}
                name="policyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('compliance.policy', 'Policy')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-audit-policy">
                          <SelectValue placeholder={t('compliance.selectPolicy', 'Select policy')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {policies.map((policy: any) => (
                          <SelectItem key={policy.id} value={policy.id}>
                            {policy.policyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={auditForm.control}
                name="auditorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('compliance.auditorName', 'Auditor Name')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('compliance.auditorPlaceholder', 'John Doe')} data-testid="input-auditor-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={auditForm.control}
                name="auditDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('compliance.auditDate', 'Audit Date')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" data-testid="input-audit-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createAuditMutation.isPending} data-testid="button-submit-audit">
                  {createAuditMutation.isPending ? t('common.scheduling', 'Scheduling...') : t('compliance.scheduleAudit', 'Schedule Audit')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="bg-white dark:bg-salis-black">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-salis-black dark:text-white">{t('compliance.createComplianceTask', 'Create Compliance Task')}</DialogTitle>
            <DialogDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              {t('compliance.createNewTask', 'Create a new compliance task')}
            </DialogDescription>
          </DialogHeader>
          <Form {...taskForm}>
            <form onSubmit={taskForm.handleSubmit((data) => createTaskMutation.mutate(data))} className="space-y-4">
              <FormField
                control={taskForm.control}
                name="policyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('compliance.policy', 'Policy')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-task-policy">
                          <SelectValue placeholder={t('compliance.selectPolicy', 'Select policy')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {policies.map((policy: any) => (
                          <SelectItem key={policy.id} value={policy.id}>
                            {policy.policyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={taskForm.control}
                name="taskName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('compliance.taskName', 'Task Name')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('compliance.taskNamePlaceholder', 'Review policy')} data-testid="input-task-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={taskForm.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('compliance.dueDate', 'Due Date')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" data-testid="input-due-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createTaskMutation.isPending} data-testid="button-submit-task">
                  {createTaskMutation.isPending ? t('common.creating', 'Creating...') : t('compliance.createTask', 'Create Task')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
