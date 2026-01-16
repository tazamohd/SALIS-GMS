import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { taskAssignments, type InsertTaskAssignment, type JobCard, type User } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";

// Create insert schema from Drizzle table
const insertTaskAssignmentSchema = createInsertSchema(taskAssignments);

// Form schema for task assignment
const taskAssignmentFormSchema = z.object({
  taskName: z.string().min(1, "Task name is required"),
  taskType: z.enum(["diagnostic", "repair", "assembly", "disassembly", "cleaning", "inspection"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  assignedTo: z.string().min(1, "Please select a technician"),
  userType: z.enum(["technician", "assistant", "both"]),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  estimatedMinutes: z.preprocess(
    (val) => val === "" || val === null || val === undefined ? undefined : val,
    z.coerce.number().min(1).optional()
  ),
});

type TaskAssignmentFormData = z.infer<typeof taskAssignmentFormSchema>;

interface TaskAssignmentDialogProps {
  jobCard: JobCard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskAssignmentDialog({ jobCard, open, onOpenChange }: TaskAssignmentDialogProps) {
  const { toast } = useToast();
  const { t } = useTranslation();

  // For now, we'll use mock technicians since there's no users API endpoint yet
  // In production, this would fetch from /api/users?userType=technician
  const mockTechnicians = [
    { id: "tech-1", fullName: "Ahmad Rasheed", userType: "technician" },
    { id: "tech-2", fullName: "Sarah Johnson", userType: "technician" },
    { id: "tech-3", fullName: "Mike Chen", userType: "assistant" },
    { id: "tech-4", fullName: "Lisa Anderson", userType: "assistant" },
  ];

  const form = useForm<TaskAssignmentFormData>({
    resolver: zodResolver(taskAssignmentFormSchema),
    defaultValues: {
      taskName: "",
      taskType: "repair",
      description: "",
      assignedTo: "",
      userType: "technician",
      priority: "medium",
      estimatedMinutes: undefined,
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskAssignmentFormData) => {
      return await apiRequest(`/api/job-cards/${jobCard.id}/tasks`, 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-cards', jobCard.id, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/job-cards'] });
      toast({
        title: "Task Assigned",
        description: "Task has been successfully assigned to the technician.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to assign task. Please try again.",
        variant: "destructive",
      });
      console.error("Task assignment error:", error);
    },
  });

  const onSubmit = (data: TaskAssignmentFormData) => {
    createTaskMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-['Poppins',Helvetica] font-semibold text-xl text-[#222029]">
            Assign Task to Technician
          </DialogTitle>
          <DialogDescription className="font-['Poppins',Helvetica] text-sm text-[#999999]">
            Assign a specific task for job card: {jobCard.jobNumber}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="taskName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('taskAssignment.taskName', 'Task Name')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('taskAssignment.taskNamePlaceholder', 'e.g., Oil Change')} data-testid="input-task-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taskType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('taskAssignment.taskType', 'Task Type')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-task-type">
                          <SelectValue placeholder={t('taskAssignment.selectType', 'Select type')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="diagnostic">{t('taskAssignment.types.diagnostic', 'Diagnostic')}</SelectItem>
                        <SelectItem value="repair">{t('taskAssignment.types.repair', 'Repair')}</SelectItem>
                        <SelectItem value="assembly">{t('taskAssignment.types.assembly', 'Assembly')}</SelectItem>
                        <SelectItem value="disassembly">{t('taskAssignment.types.disassembly', 'Disassembly')}</SelectItem>
                        <SelectItem value="cleaning">{t('taskAssignment.types.cleaning', 'Cleaning')}</SelectItem>
                        <SelectItem value="inspection">{t('taskAssignment.types.inspection', 'Inspection')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common.description', 'Description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('taskAssignment.descriptionPlaceholder', 'Describe the task requirements...')}
                      rows={3}
                      data-testid="textarea-task-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('taskAssignment.assignTo', 'Assign To')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-assigned-to">
                          <SelectValue placeholder={t('taskAssignment.selectTechnician', 'Select technician')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockTechnicians.map((tech) => (
                          <SelectItem key={tech.id} value={tech.id}>
                            {tech.fullName} ({tech.userType})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('taskAssignment.userType', 'User Type')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-user-type">
                          <SelectValue placeholder={t('taskAssignment.selectType', 'Select type')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="technician">{t('taskAssignment.userTypes.technician', 'Technician')}</SelectItem>
                        <SelectItem value="assistant">{t('taskAssignment.userTypes.assistant', 'Assistant')}</SelectItem>
                        <SelectItem value="both">{t('taskAssignment.userTypes.both', 'Both')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('taskAssignment.priority', 'Priority')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-task-priority">
                          <SelectValue placeholder={t('taskAssignment.selectPriority', 'Select priority')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">{t('taskAssignment.priorities.low', 'Low')}</SelectItem>
                        <SelectItem value="medium">{t('taskAssignment.priorities.medium', 'Medium')}</SelectItem>
                        <SelectItem value="high">{t('taskAssignment.priorities.high', 'High')}</SelectItem>
                        <SelectItem value="urgent">{t('taskAssignment.priorities.urgent', 'Urgent')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('taskAssignment.estimatedMinutes', 'Estimated Minutes')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        type="number"
                        min="1"
                        placeholder="60"
                        data-testid="input-estimated-minutes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-task"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTaskMutation.isPending}
                data-testid="button-assign-task"
                className="bg-[#4f46e5] hover:bg-[#4338ca]"
              >
                {createTaskMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  'Assign Task'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
