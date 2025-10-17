import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertServiceTemplateSchema, type ServiceTemplate } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Plus, Clock, DollarSign, CheckCircle, XCircle, Eye, Pencil, Trash2 } from "lucide-react";
import { z } from "zod";

const formSchema = insertServiceTemplateSchema.extend({
  garageId: z.string().min(1, "Garage is required"),
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  taskSteps: z.array(z.object({
    stepName: z.string(),
    description: z.string().optional(),
    estimatedMinutes: z.number().optional(),
  })).min(1, "At least one task step is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function ServiceTemplates() {
  const { toast } = useToast();
  const [selectedGarage, setSelectedGarage] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ServiceTemplate | null>(null);
  const [taskSteps, setTaskSteps] = useState<Array<{ stepName: string; description?: string; estimatedMinutes?: number }>>([
    { stepName: "", description: "", estimatedMinutes: 0 }
  ]);

  const { data: garages } = useQuery<any[]>({
    queryKey: ["/api/garages"],
  });

  const { data: templates, isLoading } = useQuery<ServiceTemplate[]>({
    queryKey: ["/api/service-templates", { garage_id: selectedGarage !== "all" ? selectedGarage : garages?.[0]?.id }],
    enabled: !!garages && garages.length > 0 && selectedGarage !== "all",
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      garageId: "",
      name: "",
      category: "maintenance",
      description: "",
      estimatedHours: "0",
      standardCost: "0",
      taskSteps: [{ stepName: "", description: "", estimatedMinutes: 0 }],
      requiredSkills: [],
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest("/api/service-templates", "POST", {
        ...data,
        taskSteps: data.taskSteps,
        requiredSkills: data.requiredSkills || [],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return key === "/api/service-templates" || key === "/api/service-templates/all";
        }
      });
      toast({ title: "Service template created successfully" });
      setCreateDialogOpen(false);
      form.reset();
      setTaskSteps([{ stepName: "", description: "", estimatedMinutes: 0 }]);
    },
    onError: (error: any) => {
      toast({
        title: "Error creating service template",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/service-templates/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return key === "/api/service-templates" || key === "/api/service-templates/all";
        }
      });
      toast({ title: "Service template deleted successfully" });
      setDetailsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting service template",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch all templates when "all" is selected
  const { data: allTemplates, isLoading: allIsLoading } = useQuery<ServiceTemplate[]>({
    queryKey: ["/api/service-templates/all"],
    enabled: !!garages && garages.length > 0 && selectedGarage === "all",
  });

  const displayTemplates = selectedGarage === "all" ? allTemplates : templates;
  const activeLoading = selectedGarage === "all" ? allIsLoading : isLoading;

  const filteredTemplates = displayTemplates?.filter((template) => {
    if (selectedGarage !== "all" && template.garageId !== selectedGarage) return false;
    if (selectedCategory !== "all" && template.category !== selectedCategory) return false;
    return true;
  });

  const addTaskStep = () => {
    setTaskSteps([...taskSteps, { stepName: "", description: "", estimatedMinutes: 0 }]);
  };

  const removeTaskStep = (index: number) => {
    setTaskSteps(taskSteps.filter((_, i) => i !== index));
  };

  const updateTaskStep = (index: number, field: string, value: any) => {
    const updated = [...taskSteps];
    updated[index] = { ...updated[index], [field]: value };
    setTaskSteps(updated);
  };

  const onSubmit = (data: FormData) => {
    createMutation.mutate({ ...data, taskSteps });
  };

  const openDetailsDialog = (template: ServiceTemplate) => {
    setSelectedTemplate(template);
    setDetailsDialogOpen(true);
  };

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, string> = {
      maintenance: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      repair: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      diagnostic: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    };
    return variants[category] || variants.maintenance;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-['Poppins',Helvetica] font-bold text-3xl text-chrome-silver">Service Templates</h1>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-template">
              <Plus className="mr-2 h-4 w-4" /> Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Service Template</DialogTitle>
              <DialogDescription>
                Create a reusable service template with predefined steps
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="garageId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Garage</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-garage">
                            <SelectValue placeholder="Select garage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {garages?.map((garage) => (
                            <SelectItem key={garage.id} value={garage.id}>
                              {garage.name}
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Oil Change Service" data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="repair">Repair</SelectItem>
                          <SelectItem value="diagnostic">Diagnostic</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} placeholder="Describe this service template..." data-testid="input-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="estimatedHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Hours</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.25" {...field} value={field.value || ""} data-testid="input-estimated-hours" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="standardCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Standard Cost</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} value={field.value || ""} data-testid="input-standard-cost" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <FormLabel>Task Steps</FormLabel>
                    <Button type="button" variant="outline" size="sm" onClick={addTaskStep} data-testid="button-add-step">
                      <Plus className="h-3 w-3 mr-1" /> Add Step
                    </Button>
                  </div>
                  {taskSteps.map((step, index) => (
                    <Card key={index} className="p-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <Input
                            placeholder="Step name"
                            value={step.stepName}
                            onChange={(e) => updateTaskStep(index, "stepName", e.target.value)}
                            data-testid={`input-step-name-${index}`}
                          />
                          {taskSteps.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTaskStep(index)}
                              data-testid={`button-remove-step-${index}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <Input
                          placeholder="Description (optional)"
                          value={step.description || ""}
                          onChange={(e) => updateTaskStep(index, "description", e.target.value)}
                          data-testid={`input-step-description-${index}`}
                        />
                        <Input
                          type="number"
                          placeholder="Estimated minutes"
                          value={step.estimatedMinutes || 0}
                          onChange={(e) => updateTaskStep(index, "estimatedMinutes", parseInt(e.target.value))}
                          data-testid={`input-step-minutes-${index}`}
                        />
                      </div>
                    </Card>
                  ))}
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    data-testid="button-cancel-create"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-create">
                    {createMutation.isPending ? "Creating..." : "Create Template"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={selectedGarage} onValueChange={setSelectedGarage}>
          <SelectTrigger className="w-[200px]" data-testid="filter-garage">
            <SelectValue placeholder="All Garages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Garages</SelectItem>
            {garages?.map((garage) => (
              <SelectItem key={garage.id} value={garage.id}>
                {garage.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]" data-testid="filter-category">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="repair">Repair</SelectItem>
            <SelectItem value="diagnostic">Diagnostic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      {activeLoading ? (
        <div className="text-center py-12">
          <p className="text-chrome-silver/60">Loading templates...</p>
        </div>
      ) : filteredTemplates && filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow" data-testid={`card-template-${template.id}`}>
              <CardContent className="p-6" onClick={() => openDetailsDialog(template)}>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg" data-testid={`text-template-name-${template.id}`}>{template.name}</h3>
                    <Badge className={getCategoryBadge(template.category)} data-testid={`badge-category-${template.id}`}>
                      {template.category}
                    </Badge>
                  </div>
                  {template.description && (
                    <p className="text-sm text-chrome-silver/60 line-clamp-2">{template.description}</p>
                  )}
                  <div className="flex gap-4 text-sm text-chrome-silver/60">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{template.estimatedHours || 0}h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>${template.standardCost || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {template.isActive ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                        <CheckCircle className="h-3 w-3 mr-1" /> Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-dark-steel/20 text-gray-700 dark:bg-gray-950 dark:text-gray-300">
                        <XCircle className="h-3 w-3 mr-1" /> Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-chrome-silver/60">No service templates found</p>
          <p className="text-sm text-chrome-silver/60 mt-2">Create your first template to get started</p>
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
            <DialogDescription>Service template details</DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Category</h4>
                <Badge className={getCategoryBadge(selectedTemplate.category)}>{selectedTemplate.category}</Badge>
              </div>
              {selectedTemplate.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-chrome-silver/60">{selectedTemplate.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Estimated Hours</h4>
                  <p className="text-sm">{selectedTemplate.estimatedHours || 0} hours</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Standard Cost</h4>
                  <p className="text-sm">${selectedTemplate.standardCost || 0}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Task Steps</h4>
                <div className="space-y-2">
                  {Array.isArray(selectedTemplate.taskSteps) && selectedTemplate.taskSteps.length > 0 ? (
                    (selectedTemplate.taskSteps as any[]).map((step: any, index: number) => (
                      <Card key={index} className="p-3">
                        <p className="font-medium">{index + 1}. {step.stepName}</p>
                        {step.description && <p className="text-sm text-chrome-silver/60 mt-1">{step.description}</p>}
                        {step.estimatedMinutes && <p className="text-xs text-chrome-silver/60 mt-1">~{step.estimatedMinutes} minutes</p>}
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-chrome-silver/60">No task steps defined</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={() => selectedTemplate && deleteMutation.mutate(selectedTemplate.id)}
                  disabled={deleteMutation.isPending}
                  data-testid="button-delete-template"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete Template"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
