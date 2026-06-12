import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Tool, Garage } from "@shared/schema";

const transferFormSchema = z.object({
  toolId: z.string().min(1, "Please select a tool"),
  fromBranch: z.string().min(1, "Please select source branch"),
  toBranch: z.string().min(1, "Please select destination branch"),
  scheduledDate: z.string().min(1, "Please select transfer date"),
  scheduledTime: z.string().min(1, "Please select transfer time"),
});

type TransferFormData = z.infer<typeof transferFormSchema>;

interface CrossBranchTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CrossBranchTransferDialog({ open, onOpenChange }: CrossBranchTransferDialogProps) {
  const { toast } = useToast();

  const { data: tools = [] } = useQuery<Tool[]>({
    queryKey: ['/api/tools'],
  });

  const { data: garages = [] } = useQuery<Garage[]>({
    queryKey: ['/api/garages'],
  });

  // Mock branches - in production this would come from /api/branches
  const mockBranches = [
    { id: "branch-1", name: "Main Branch", garageId: garages[0]?.id },
    { id: "branch-2", name: "Service Branch", garageId: garages[0]?.id },
    { id: "branch-3", name: "Downtown Branch", garageId: garages[1]?.id },
  ];

  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      toolId: "",
      fromBranch: "",
      toBranch: "",
      scheduledDate: "",
      scheduledTime: "",
    },
  });

  const transferMutation = useMutation({
    mutationFn: async (data: TransferFormData) => {
      // In production, this would call /api/tools/transfer
      return await apiRequest('/api/tool-transfers', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tool-availability'] });
      toast({
        title: "Transfer Scheduled",
        description: "Tool transfer has been scheduled successfully.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Transfer Failed",
        description: "Could not schedule transfer. This feature requires backend implementation.",
        variant: "destructive",
      });
      console.error("Transfer error:", error);
    },
  });

  const onSubmit = (data: TransferFormData) => {
    transferMutation.mutate(data);
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-['Poppins',Helvetica] font-semibold text-xl text-[#222029] flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            Cross-Branch Tool Transfer
          </DialogTitle>
          <DialogDescription className="font-['Poppins',Helvetica] text-sm text-[#999999]">
            Schedule a tool transfer between branches
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="toolId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Tool</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-transfer-tool">
                        <SelectValue placeholder="Select tool to transfer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tools.map((tool) => (
                        <SelectItem key={tool.id} value={tool.id}>
                          {tool.name} ({tool.toolType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-3">
              <FormField
                control={form.control}
                name="fromBranch"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>From Branch</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-from-branch">
                          <SelectValue placeholder="Source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockBranches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ArrowRight className="w-5 h-5 text-gray-400 mt-8" />

              <FormField
                control={form.control}
                name="toBranch"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>To Branch</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-to-branch">
                          <SelectValue placeholder="Destination" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockBranches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
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
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transfer Date</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        min={getTodayDate()}
                        data-testid="input-transfer-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transfer Time</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="time"
                        data-testid="input-transfer-time"
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
                data-testid="button-cancel-transfer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={transferMutation.isPending}
                data-testid="button-schedule-transfer"
                className="bg-[#4f46e5] hover:bg-[#4338ca]"
              >
                {transferMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  'Schedule Transfer'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
