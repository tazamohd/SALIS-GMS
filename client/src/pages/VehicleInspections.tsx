import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { TabsPageLayout, type TabConfig } from "@/components/layouts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ClipboardList, FileCheck, Plus, Pencil, Trash2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { 
  insertInspectionTemplateSchema, 
  insertVehicleInspectionSchema, 
  type InspectionTemplate, 
  type VehicleInspection 
} from "@shared/schema";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";

const templateFormSchema = insertInspectionTemplateSchema.extend({
  templateName: z.string().min(1, "Template name is required"),
  checklistItemsText: z.string().min(1, "At least one checklist item is required"),
});

const inspectionFormSchema = insertVehicleInspectionSchema.extend({
  vehicleId: z.string().min(1, "Vehicle is required"),
  customerId: z.string().min(1, "Customer is required"),
  inspectorId: z.string().min(1, "Inspector is required"),
  inspectionType: z.string().min(1, "Inspection type is required"),
  findingsText: z.string().optional(),
});

type TemplateFormData = z.infer<typeof templateFormSchema>;
type InspectionFormData = z.infer<typeof inspectionFormSchema>;

export default function VehicleInspections() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("templates");
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isInspectionDialogOpen, setIsInspectionDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<InspectionTemplate | null>(null);

  const { data: templates = [], isLoading: templatesLoading } = useQuery<InspectionTemplate[]>({
    queryKey: ["/api/inspection-templates"],
  });

  const { data: inspections = [], isLoading: inspectionsLoading } = useQuery<VehicleInspection[]>({
    queryKey: ["/api/vehicle-inspections"],
  });

  const { data: vehicles = [] } = useQuery<any[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  const { data: currentUser } = useQuery<any>({
    queryKey: ["/api/user"],
  });

  const templateForm = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      garageId: "",
      templateName: "",
      description: "",
      category: "general",
      vehicleTypes: [],
      checklistItems: [],
      estimateRules: [],
      isDefault: false,
      isActive: true,
      checklistItemsText: "",
    },
  });

  const inspectionForm = useForm<InspectionFormData>({
    resolver: zodResolver(inspectionFormSchema),
    defaultValues: {
      garageId: "",
      vehicleId: "",
      customerId: "",
      inspectorId: "",
      inspectionType: "general",
      overallStatus: "in_progress",
      findings: [],
      recommendations: [],
      estimateGenerated: false,
      customerNotified: false,
      findingsText: "",
    },
  });

  useEffect(() => {
    if (currentUser?.garageId) {
      templateForm.setValue("garageId", currentUser.garageId);
      inspectionForm.setValue("garageId", currentUser.garageId);
    }
  }, [currentUser]);

  const createTemplateMutation = useMutation({
    mutationFn: async (data: TemplateFormData) => {
      if (!currentUser?.garageId) {
        throw new Error(t('vehicles.userGarageNotFound', 'User garage not found. Please try again.'));
      }

      const checklistItems = data.checklistItemsText
        .split("\n")
        .filter(item => item.trim())
        .map((item, idx) => ({
          id: idx + 1,
          section: t('vehicles.general', 'General'),
          item: item.trim(),
          type: "checkbox",
          required: true,
          passCriteria: t('vehicles.pass', 'Pass'),
        }));

      const payload = {
        ...data,
        garageId: currentUser.garageId,
        createdBy: currentUser.id,
        checklistItems,
        vehicleTypes: data.vehicleTypes || [],
        estimateRules: data.estimateRules || [],
        checklistItemsText: undefined,
      };

      return await apiRequest("POST", "/api/inspection-templates", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspection-templates"] });
      setIsTemplateDialogOpen(false);
      templateForm.reset({
        garageId: currentUser?.garageId || "",
        templateName: "",
        description: "",
        category: "general",
        vehicleTypes: [],
        checklistItems: [],
        estimateRules: [],
        isDefault: false,
        isActive: true,
        checklistItemsText: "",
      });
      toast({ title: t('common.success', 'Success'), description: t('vehicles.templateCreatedSuccessfully', 'Template created successfully') });
    },
    onError: (error: Error) => {
      toast({ title: t('common.error', 'Error'), description: error.message, variant: "destructive" });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/inspection-templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspection-templates"] });
      toast({ title: t('common.success', 'Success'), description: t('vehicles.templateDeletedSuccessfully', 'Template deleted successfully') });
    },
    onError: (error: Error) => {
      toast({ title: t('common.error', 'Error'), description: error.message, variant: "destructive" });
    },
  });

  const createInspectionMutation = useMutation({
    mutationFn: async (data: InspectionFormData) => {
      if (!currentUser?.garageId) {
        throw new Error(t('vehicles.userGarageNotFound', 'User garage not found. Please try again.'));
      }

      const findings = data.findingsText
        ? data.findingsText.split("\n").filter(f => f.trim()).map((finding, idx) => ({
            id: idx + 1,
            item: finding.trim(),
            status: "pending",
            severity: "medium",
            notes: "",
            photoUrls: [],
          }))
        : [];

      const payload = {
        ...data,
        garageId: currentUser.garageId,
        findings,
        recommendations: data.recommendations || [],
        findingsText: undefined,
      };

      return await apiRequest("POST", "/api/vehicle-inspections", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-inspections"] });
      setIsInspectionDialogOpen(false);
      inspectionForm.reset({
        garageId: currentUser?.garageId || "",
        vehicleId: "",
        customerId: "",
        inspectorId: "",
        inspectionType: "general",
        overallStatus: "in_progress",
        findings: [],
        recommendations: [],
        estimateGenerated: false,
        customerNotified: false,
        findingsText: "",
      });
      toast({ title: t('common.success', 'Success'), description: t('vehicles.inspectionCreatedSuccessfully', 'Inspection created successfully') });
    },
    onError: (error: Error) => {
      toast({ title: t('common.error', 'Error'), description: error.message, variant: "destructive" });
    },
  });

  const deleteInspectionMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/vehicle-inspections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-inspections"] });
      toast({ title: t('common.success', 'Success'), description: t('vehicles.inspectionDeletedSuccessfully', 'Inspection deleted successfully') });
    },
    onError: (error: Error) => {
      toast({ title: t('common.error', 'Error'), description: error.message, variant: "destructive" });
    },
  });

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    templateForm.reset({
      garageId: currentUser?.garageId || "",
      templateName: "",
      description: "",
      category: "general",
      vehicleTypes: [],
      checklistItems: [],
      estimateRules: [],
      isDefault: false,
      isActive: true,
      checklistItemsText: "",
    });
    setIsTemplateDialogOpen(true);
  };

  const handleCreateInspection = () => {
    inspectionForm.reset({
      garageId: currentUser?.garageId || "",
      vehicleId: "",
      customerId: "",
      inspectorId: "",
      inspectionType: "general",
      overallStatus: "in_progress",
      findings: [],
      recommendations: [],
      estimateGenerated: false,
      customerNotified: false,
      findingsText: "",
    });
    setIsInspectionDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Badge className="bg-[#0A5ED7]/10 text-[#0A5ED7] border-0">{t('common.inProgress', 'In Progress')}</Badge>;
      case "completed":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-0">{t('common.completed', 'Completed')}</Badge>;
      case "passed":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-0">{t('common.passed', 'Passed')}</Badge>;
      case "failed":
        return <Badge className="bg-red-500/10 text-red-600 border-0">{t('common.failed', 'Failed')}</Badge>;
      default:
        return <Badge className="bg-[#64748B]/10 text-[#64748B] border-0">{status}</Badge>;
    }
  };

  const templatesTabContent = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-[#0B1F3B] dark:text-white">{t('vehicles.inspectionTemplates', 'Inspection Templates')}</h2>
          <p className="text-sm text-[#64748B]">{t('vehicles.manageReusableInspectionChecklists', 'Manage reusable inspection checklists')}</p>
        </div>
        <Button 
          onClick={handleCreateTemplate} 
          data-testid="button-create-template"
          className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952C1] hover:to-[#0AA3E8] text-white border-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('vehicles.createTemplate', 'Create Template')}
        </Button>
      </div>

      {templatesLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0A5ED7]/20 to-[#0BB3FF]/20 flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="h-8 w-8 text-[#0A5ED7]" />
            </div>
            <p className="text-[#64748B]">{t('vehicles.noTemplatesYet', 'No templates yet. Create your first inspection template.')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{template.templateName}</CardTitle>
                    {template.description && (
                      <CardDescription className="mt-1 text-[#64748B]">{template.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {template.isDefault && (
                      <Badge className="bg-[#0A5ED7]/10 text-[#0A5ED7] border-0">{t('vehicles.default', 'Default')}</Badge>
                    )}
                    {!template.isActive && (
                      <Badge className="bg-[#64748B]/10 text-[#64748B] border-0">{t('common.inactive', 'Inactive')}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#64748B]">{t('common.category', 'Category')}:</span>
                    <Badge className="bg-[#0A5ED7]/10 text-[#0A5ED7] border-0">{template.category || t('vehicles.general', 'General')}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#64748B]">{t('vehicles.items', 'Items')}:</span>
                    <span className="font-semibold text-[#0B1F3B] dark:text-white">
                      {Array.isArray(template.checklistItems) ? template.checklistItems.length : 0}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      className="flex-1 border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10 bg-transparent" 
                      variant="outline"
                      data-testid={`button-delete-template-${template.id}`} 
                      onClick={() => deleteTemplateMutation.mutate(template.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      {t('common.delete', 'Delete')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const inspectionsTabContent = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-[#0B1F3B] dark:text-white">{t('vehicles.vehicleInspections', 'Vehicle Inspections')}</h2>
          <p className="text-sm text-[#64748B]">{t('vehicles.trackInspectionResults', 'Track inspection results')}</p>
        </div>
        <Button 
          onClick={handleCreateInspection} 
          data-testid="button-create-inspection"
          className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952C1] hover:to-[#0AA3E8] text-white border-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('vehicles.newInspection', 'New Inspection')}
        </Button>
      </div>

      {inspectionsLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : inspections.length === 0 ? (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0A5ED7]/20 to-[#0BB3FF]/20 flex items-center justify-center mx-auto mb-4">
              <FileCheck className="h-8 w-8 text-[#0A5ED7]" />
            </div>
            <p className="text-[#64748B]">{t('vehicles.noInspectionsYet', 'No inspections yet. Create your first inspection.')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {inspections.map((inspection) => (
            <Card key={inspection.id} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#0B1F3B] dark:text-white">
                        {inspection.inspectionNumber || `${t('vehicles.inspection', 'Inspection')} #${inspection.id.substring(0, 8)}`}
                      </h3>
                      {getStatusBadge(inspection.overallStatus || "in_progress")}
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-[#64748B]">
                      <p>{t('common.type', 'Type')}: {inspection.inspectionType}</p>
                      <p>{t('common.date', 'Date')}: {inspection.inspectionDate ? new Date(inspection.inspectionDate).toLocaleDateString() : t('common.notAvailable', 'N/A')}</p>
                      {inspection.currentMileage && <p>{t('vehicles.mileage', 'Mileage')}: {inspection.currentMileage.toLocaleString()} km</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {inspection.estimateGenerated && (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-0">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t('vehicles.estimate', 'Estimate')}
                      </Badge>
                    )}
                    {inspection.customerNotified && (
                      <Badge className="bg-[#0A5ED7]/10 text-[#0A5ED7] border-0">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t('vehicles.notified', 'Notified')}
                      </Badge>
                    )}
                    <Button 
                      size="sm" 
                      className="border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10 bg-transparent"
                      variant="outline"
                      data-testid={`button-delete-inspection-${inspection.id}`}
                      onClick={() => deleteInspectionMutation.mutate(inspection.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const tabs: TabConfig[] = [
    {
      id: "templates",
      label: t('vehicles.templates', 'Templates'),
      icon: ClipboardList,
      content: templatesTabContent,
    },
    {
      id: "inspections",
      label: t('vehicles.inspections', 'Inspections'),
      icon: FileCheck,
      content: inspectionsTabContent,
    },
  ];

  return (
    <>
      <TabsPageLayout
        title={t('vehicles.vehicleInspections', 'Vehicle Inspections')}
        description={t('vehicles.manageInspectionTemplatesAndTrack', 'Manage inspection templates and track vehicle inspections')}
        icon={ClipboardList}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{selectedTemplate ? t('vehicles.editTemplate', 'Edit Template') : t('vehicles.createTemplate', 'Create Template')}</DialogTitle>
            <DialogDescription className="text-[#64748B]">
              {selectedTemplate ? t('vehicles.updateInspectionTemplate', 'Update inspection template') : t('vehicles.createNewInspectionTemplate', 'Create a new inspection template')}
            </DialogDescription>
          </DialogHeader>
          <Form {...templateForm}>
            <form onSubmit={templateForm.handleSubmit((data) => createTemplateMutation.mutate(data))} className="space-y-4">
              <FormField
                control={templateForm.control}
                name="templateName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.templateName', 'Template Name')}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder={t('vehicles.prePurchaseInspection', 'e.g., Pre-Purchase Inspection')} 
                        data-testid="input-template-name"
                        className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={templateForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.description', 'Description')}</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        value={field.value || ""} 
                        placeholder={t('vehicles.optionalDescription', 'Optional description')} 
                        data-testid="input-template-description"
                        className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={templateForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.category', 'Category')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger data-testid="select-template-category" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white">
                          <SelectValue placeholder={t('vehicles.selectCategory', 'Select category')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                        <SelectItem value="general">{t('vehicles.general', 'General')}</SelectItem>
                        <SelectItem value="pre_purchase">{t('vehicles.prePurchase', 'Pre-Purchase')}</SelectItem>
                        <SelectItem value="seasonal">{t('vehicles.seasonal', 'Seasonal')}</SelectItem>
                        <SelectItem value="safety">{t('vehicles.safety', 'Safety')}</SelectItem>
                        <SelectItem value="state_inspection">{t('vehicles.stateInspection', 'State Inspection')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={templateForm.control}
                name="checklistItemsText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.checklistItemsOnePerLine', 'Checklist Items (one per line)')}</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder={t('vehicles.checklistPlaceholder', 'Check tire pressure\nInspect brake pads\nCheck engine oil level')} 
                        rows={6}
                        data-testid="input-template-checklist"
                        className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={templateForm.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-template-default"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.setAsDefaultTemplate', 'Set as default template')}</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsTemplateDialogOpen(false)}
                  className="border-[#E2E8F0] dark:border-[#232A36] text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]"
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button 
                  type="submit" 
                  disabled={createTemplateMutation.isPending}
                  className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952C1] hover:to-[#0AA3E8] text-white border-0"
                >
                  {createTemplateMutation.isPending ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isInspectionDialogOpen} onOpenChange={setIsInspectionDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('vehicles.newInspection', 'New Inspection')}</DialogTitle>
            <DialogDescription className="text-[#64748B]">
              {t('vehicles.createNewVehicleInspection', 'Create a new vehicle inspection')}
            </DialogDescription>
          </DialogHeader>
          <Form {...inspectionForm}>
            <form onSubmit={inspectionForm.handleSubmit((data) => createInspectionMutation.mutate(data))} className="space-y-4">
              <FormField
                control={inspectionForm.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.vehicle', 'Vehicle')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger data-testid="select-vehicle" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white">
                          <SelectValue placeholder={t('vehicles.selectVehicle', 'Select vehicle')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={inspectionForm.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.customer', 'Customer')}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder={t('vehicles.customerId', 'Customer ID')} 
                        data-testid="input-customer-id"
                        className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={inspectionForm.control}
                name="inspectorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.inspector', 'Inspector')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger data-testid="select-inspector" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white">
                          <SelectValue placeholder={t('vehicles.selectInspector', 'Select inspector')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.fullName || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={inspectionForm.control}
                name="inspectionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.inspectionType', 'Inspection Type')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger data-testid="select-inspection-type" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white">
                          <SelectValue placeholder={t('vehicles.selectInspectionType', 'Select type')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                        <SelectItem value="general">{t('vehicles.general', 'General')}</SelectItem>
                        <SelectItem value="pre_purchase">{t('vehicles.prePurchase', 'Pre-Purchase')}</SelectItem>
                        <SelectItem value="safety">{t('vehicles.safety', 'Safety')}</SelectItem>
                        <SelectItem value="emissions">{t('vehicles.emissions', 'Emissions')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={inspectionForm.control}
                name="findingsText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('vehicles.findings', 'Findings')} ({t('common.optional', 'Optional')})</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder={t('vehicles.findingsPlaceholder', 'Enter findings, one per line')} 
                        rows={4}
                        data-testid="input-findings"
                        className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsInspectionDialogOpen(false)}
                  className="border-[#E2E8F0] dark:border-[#232A36] text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]"
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button 
                  type="submit" 
                  disabled={createInspectionMutation.isPending}
                  className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952C1] hover:to-[#0AA3E8] text-white border-0"
                >
                  {createInspectionMutation.isPending ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
