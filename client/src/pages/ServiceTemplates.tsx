import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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
import { Plus, Clock, DollarSign, CheckCircle, XCircle, Eye, Pencil, Trash2, Wrench } from "lucide-react";
import { z } from "zod";
import { StandardPageLayout } from "@/components/layouts";

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
  const { t } = useTranslation();
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
      toast({ title: t('serviceTemplates.templateCreatedSuccessfully', 'Service template created successfully') });
      setCreateDialogOpen(false);
      form.reset();
      setTaskSteps([{ stepName: "", description: "", estimatedMinutes: 0 }]);
    },
    onError: (error: any) => {
      toast({
        title: t('serviceTemplates.errorCreatingTemplate', 'Error creating service template'),
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
      toast({ title: t('serviceTemplates.templateDeletedSuccessfully', 'Service template deleted successfully') });
      setDetailsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: t('serviceTemplates.errorDeletingTemplate', 'Error deleting service template'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
      maintenance: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      repair: "bg-gray-300 text-gray-900 dark:bg-gray-600 dark:text-gray-100",
      diagnostic: "bg-gray-400 text-gray-950 dark:bg-gray-500 dark:text-gray-50",
    };
    return variants[category] || variants.maintenance;
  };

  return (
    <StandardPageLayout
      title={t('serviceTemplates.title', 'Service Templates')}
      description={t('serviceTemplates.description', 'Create and manage reusable service templates')}
      icon={Wrench}
    >
      <>
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button data-testid="button-create-template">
            <Plus className="mr-2 h-4 w-4" /> {t('serviceTemplates.createTemplate', 'Create Template')}
          </Button>
        </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('serviceTemplates.createServiceTemplate', 'Create Service Template')}</DialogTitle>
              <DialogDescription>
                {t('serviceTemplates.createReusableTemplate', 'Create a reusable service template with predefined steps')}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="garageId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('serviceTemplates.garage', 'Garage')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-garage">
                            <SelectValue placeholder={t('serviceTemplates.selectGarage', 'Select garage')} />
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
                      <FormLabel>{t('serviceTemplates.templateName', 'Template Name')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('serviceTemplates.templateNamePlaceholder', 'e.g., Oil Change Service')} data-testid="input-name" />
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
                      <FormLabel>{t('common.category', 'Category')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder={t('serviceTemplates.selectCategory', 'Select category')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="maintenance">{t('serviceTemplates.maintenance', 'Maintenance')}</SelectItem>
                          <SelectItem value="repair">{t('serviceTemplates.repair', 'Repair')}</SelectItem>
                          <SelectItem value="diagnostic">{t('serviceTemplates.diagnostic', 'Diagnostic')}</SelectItem>
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
                      <FormLabel>{t('common.description', 'Description')}</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} placeholder={t('serviceTemplates.describeTemplate', 'Describe this service template...')} data-testid="input-description" />
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
                        <FormLabel>{t('serviceTemplates.estimatedHours', 'Estimated Hours')}</FormLabel>
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
                        <FormLabel>{t('serviceTemplates.standardCost', 'Standard Cost')}</FormLabel>
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
                    <FormLabel>{t('serviceTemplates.taskSteps', 'Task Steps')}</FormLabel>
                    <Button type="button" variant="outline" size="sm" onClick={addTaskStep} data-testid="button-add-step">
                      <Plus className="h-3 w-3 mr-1" /> {t('serviceTemplates.addStep', 'Add Step')}
                    </Button>
                  </div>
                  {taskSteps.map((step, index) => (
                    <Card key={index} className="p-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <Input
                            placeholder={t('serviceTemplates.stepName', 'Step name')}
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
                          placeholder={t('serviceTemplates.descriptionOptional', 'Description (optional)')}
                          value={step.description || ""}
                          onChange={(e) => updateTaskStep(index, "description", e.target.value)}
                          data-testid={`input-step-description-${index}`}
                        />
                        <Input
                          type="number"
                          placeholder={t('serviceTemplates.estimatedMinutes', 'Estimated minutes')}
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
                    {t('common.cancel', 'Cancel')}
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-create">
                    {createMutation.isPending ? t('common.creating', 'Creating...') : t('serviceTemplates.createTemplate', 'Create Template')}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

      <div className="flex gap-4">
        <Select value={selectedGarage} onValueChange={setSelectedGarage}>
          <SelectTrigger className="w-[200px]" data-testid="filter-garage">
            <SelectValue placeholder={t('serviceTemplates.allGarages', 'All Garages')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('serviceTemplates.allGarages', 'All Garages')}</SelectItem>
            {garages?.map((garage) => (
              <SelectItem key={garage.id} value={garage.id}>
                {garage.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]" data-testid="filter-category">
            <SelectValue placeholder={t('serviceTemplates.allCategories', 'All Categories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('serviceTemplates.allCategories', 'All Categories')}</SelectItem>
            <SelectItem value="maintenance">{t('serviceTemplates.maintenance', 'Maintenance')}</SelectItem>
            <SelectItem value="repair">{t('serviceTemplates.repair', 'Repair')}</SelectItem>
            <SelectItem value="diagnostic">{t('serviceTemplates.diagnostic', 'Diagnostic')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {activeLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-900 dark:text-white/60">{t('serviceTemplates.loadingTemplates', 'Loading templates...')}</p>
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
                    <p className="text-sm text-gray-900 dark:text-white/60 line-clamp-2">{template.description}</p>
                  )}
                  <div className="flex gap-4 text-sm text-gray-900 dark:text-white/60">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{template.estimatedHours || 0}{t('serviceTemplates.hoursAbbrev', 'h')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>${template.standardCost || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {template.isActive ? (
                      <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                        <CheckCircle className="h-3 w-3 mr-1" /> {t('common.active', 'Active')}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-300">
                        <XCircle className="h-3 w-3 mr-1" /> {t('common.inactive', 'Inactive')}
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
          <p className="text-gray-900 dark:text-white/60">{t('serviceTemplates.noTemplatesFound', 'No service templates found')}</p>
          <p className="text-sm text-gray-900 dark:text-white/60 mt-2">{t('serviceTemplates.createFirstTemplate', 'Create your first template to get started')}</p>
        </div>
      )}

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
            <DialogDescription>{t('serviceTemplates.templateDetails', 'Service template details')}</DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">{t('common.category', 'Category')}</h4>
                <Badge className={getCategoryBadge(selectedTemplate.category)}>{selectedTemplate.category}</Badge>
              </div>
              {selectedTemplate.description && (
                <div>
                  <h4 className="font-semibold mb-2">{t('common.description', 'Description')}</h4>
                  <p className="text-sm text-gray-900 dark:text-white/60">{selectedTemplate.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">{t('serviceTemplates.estimatedHours', 'Estimated Hours')}</h4>
                  <p className="text-sm">{selectedTemplate.estimatedHours || 0} {t('serviceTemplates.hours', 'hours')}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{t('serviceTemplates.standardCost', 'Standard Cost')}</h4>
                  <p className="text-sm">${selectedTemplate.standardCost || 0}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">{t('serviceTemplates.taskSteps', 'Task Steps')}</h4>
                <div className="space-y-2">
                  {Array.isArray(selectedTemplate.taskSteps) && selectedTemplate.taskSteps.length > 0 ? (
                    (selectedTemplate.taskSteps as any[]).map((step: any, index: number) => (
                      <Card key={index} className="p-3">
                        <p className="font-medium">{index + 1}. {step.stepName}</p>
                        {step.description && <p className="text-sm text-gray-900 dark:text-white/60 mt-1">{step.description}</p>}
                        {step.estimatedMinutes && <p className="text-xs text-gray-900 dark:text-white/60 mt-1">~{step.estimatedMinutes} {t('serviceTemplates.minutes', 'minutes')}</p>}
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-gray-900 dark:text-white/60">{t('serviceTemplates.noTaskStepsDefined', 'No task steps defined')}</p>
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
                  {deleteMutation.isPending ? t('common.deleting', 'Deleting...') : t('serviceTemplates.deleteTemplate', 'Delete Template')}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </>
    </StandardPageLayout>
  );
}
