import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { JobCard } from "@shared/schema";
import { z } from "zod";

interface TaskDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: JobCard | null;
}

const updateTaskSchema = z.object({
  status: z.enum(["pending", "in_progress", "completed", "delivered", "cancelled"]),
  priority: z.enum(["low", "medium", "high"]),
  description: z.string().optional(),
  estimatedHours: z.number().nullable().optional(),
});

type UpdateTaskData = z.infer<typeof updateTaskSchema>;

export function TaskDetailsDialog({ open, onOpenChange, task }: TaskDetailsDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string>("pending");
  const [priority, setPriority] = useState<string>("medium");
  const [description, setDescription] = useState<string>("");
  const [estimatedTime, setEstimatedTime] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (task) {
      setStatus(task.status || "pending");
      setPriority(task.priority || "medium");
      setDescription(task.description || "");
      setEstimatedTime(task.estimatedHours?.toString() || "");
      setShowSuccess(false);
    }
  }, [task]);

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, data }: { taskId: number; data: UpdateTaskData }) => {
      return apiRequest('PATCH', `/api/job-cards/${taskId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-cards'] });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onOpenChange(false);
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const handleUpdate = () => {
    if (!task?.id) return;

    const parsedEstimatedHours = estimatedTime.trim() === "" 
      ? null 
      : parseFloat(estimatedTime);

    if (estimatedTime.trim() !== "" && isNaN(parsedEstimatedHours as number)) {
      toast({
        title: "Invalid Input",
        description: "Estimated time must be a valid number",
        variant: "destructive",
      });
      return;
    }

    const updateData: UpdateTaskData = {
      status: status as "pending" | "in_progress" | "completed" | "delivered" | "cancelled",
      priority: priority as "low" | "medium" | "high",
      description,
      estimatedHours: parsedEstimatedHours,
    };

    const validated = updateTaskSchema.safeParse(updateData);
    if (!validated.success) {
      toast({
        title: "Validation Error",
        description: validated.error.errors[0]?.message || "Invalid form data",
        variant: "destructive",
      });
      return;
    }

    updateTaskMutation.mutate({ taskId: task.id, data: validated.data });
  };

  const handleDialogChange = (newOpen: boolean) => {
    if (!newOpen) {
      setShowSuccess(false);
      if (task) {
        setStatus(task.status || "pending");
        setPriority(task.priority || "medium");
        setDescription(task.description || "");
        setEstimatedTime(task.estimatedHours?.toString() || "");
      }
    }
    onOpenChange(newOpen);
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-task-details">
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-['Poppins',Helvetica] font-bold text-2xl text-gray-900 dark:text-white mb-2">Done!</h3>
            <p className="font-['Poppins',Helvetica] font-normal text-sm text-gray-500 dark:text-gray-500">
              The task status is updated successfully
            </p>
            <Button 
              onClick={() => onOpenChange(false)} 
              className="mt-6"
              data-testid="button-success-home"
            >
              Home
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="font-['Poppins',Helvetica] font-semibold text-xl text-gray-900 dark:text-white">
                  Task ID #{task.id}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  View and update task details including status, priority, and description
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Status */}
              <div>
                <Label className="font-['Poppins',Helvetica] font-medium text-sm text-gray-900 dark:text-white mb-2 block">
                  Status
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger data-testid="select-task-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">check-in</SelectItem>
                    <SelectItem value="in_progress">Repair</SelectItem>
                    <SelectItem value="completed">Quality Check</SelectItem>
                    <SelectItem value="delivered">completion</SelectItem>
                    <SelectItem value="cancelled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Service Type */}
              <div>
                <h3 className="font-['Poppins',Helvetica] font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  {task.serviceType}
                </h3>
                <p className="font-['Poppins',Helvetica] font-medium text-sm text-gray-900 dark:text-white">
                  Task description
                </p>
              </div>

              {/* Description */}
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="border-gray-200 dark:border-salis-gray-dark resize-none"
                placeholder="Enter task description..."
                data-testid="textarea-task-description"
              />

              {/* Priority */}
              <div>
                <Label className="font-['Poppins',Helvetica] font-medium text-sm text-gray-900 dark:text-white mb-2 block">
                  Priority
                </Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger data-testid="select-task-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Estimated Time */}
              <div>
                <Label className="font-['Poppins',Helvetica] font-medium text-sm text-gray-900 dark:text-white mb-2 block">
                  Estimated time required
                </Label>
                <Input
                  type="text"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  placeholder="2 - 3 hours"
                  className="border-gray-200 dark:border-salis-gray-dark"
                  data-testid="input-estimated-time"
                />
              </div>


              {/* Update Button */}
              <Button
                onClick={handleUpdate}
                className="w-full bg-gray-800 dark:bg-gray-200 hover:bg-gray-900 dark:hover:bg-gray-300 text-white dark:text-black"
                disabled={updateTaskMutation.isPending}
                data-testid="button-update-task"
              >
                {updateTaskMutation.isPending ? "Updating..." : "Update"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
