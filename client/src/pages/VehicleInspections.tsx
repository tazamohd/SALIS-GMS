import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TabsPageLayout, type TabConfig } from "@/components/layouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ClipboardList, FileCheck, Plus, Pencil, Trash2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { z } from "zod";

const inspectionTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  checkpoints: z.string().min(1, "Checkpoints are required"),
  vehicleType: z.string().optional(),
});

const vehicleInspectionSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  templateId: z.string().min(1, "Template is required"),
  inspectorId: z.string().min(1, "Inspector is required"),
  status: z.enum(["pending", "in_progress", "completed", "failed"]).default("pending"),
  findings: z.string().optional(),
  passedCheckpoints: z.number().optional(),
  totalCheckpoints: z.number().optional(),
});

type InspectionTemplate = z.infer<typeof inspectionTemplateSchema> & { id: string };
type VehicleInspection = z.infer<typeof vehicleInspectionSchema> & { id: string; inspectedAt?: string };

export default function VehicleInspections() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("templates");
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isInspectionDialogOpen, setIsInspectionDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<InspectionTemplate | null>(null);
  const [selectedInspection, setSelectedInspection] = useState<VehicleInspection | null>(null);

  const { data: templates = [] } = useQuery<InspectionTemplate[]>({
    queryKey: ["/api/inspection-templates"],
  });

  const { data: inspections = [] } = useQuery<VehicleInspection[]>({
    queryKey: ["/api/vehicle-inspections"],
  });

  const templateForm = useForm<z.infer<typeof inspectionTemplateSchema>>({
    resolver: zodResolver(inspectionTemplateSchema),
    defaultValues: {
      name: "",
      description: "",
      checkpoints: "",
      vehicleType: "",
    },
  });

  const inspectionForm = useForm<z.infer<typeof vehicleInspectionSchema>>({
    resolver: zodResolver(vehicleInspectionSchema),
    defaultValues: {
      vehicleId: "",
      templateId: "",
      inspectorId: "",
      status: "pending",
      findings: "",
      passedCheckpoints: 0,
      totalCheckpoints: 0,
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof inspectionTemplateSchema>) => {
      return await apiRequest("POST", "/api/inspection-templates", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspection-templates"] });
      setIsTemplateDialogOpen(false);
      templateForm.reset();
      toast({ title: "Success", description: "Template created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof inspectionTemplateSchema> & { id: string }) => {
      return await apiRequest("PATCH", `/api/inspection-templates/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspection-templates"] });
      setIsTemplateDialogOpen(false);
      setSelectedTemplate(null);
      templateForm.reset();
      toast({ title: "Success", description: "Template updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/inspection-templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspection-templates"] });
      toast({ title: "Success", description: "Template deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createInspectionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof vehicleInspectionSchema>) => {
      return await apiRequest("POST", "/api/vehicle-inspections", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-inspections"] });
      setIsInspectionDialogOpen(false);
      inspectionForm.reset();
      toast({ title: "Success", description: "Inspection created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateInspectionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof vehicleInspectionSchema> & { id: string }) => {
      return await apiRequest("PATCH", `/api/vehicle-inspections/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-inspections"] });
      setIsInspectionDialogOpen(false);
      setSelectedInspection(null);
      inspectionForm.reset();
      toast({ title: "Success", description: "Inspection updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleEditTemplate = (template: InspectionTemplate) => {
    setSelectedTemplate(template);
    templateForm.reset({
      name: template.name,
      description: template.description || "",
      checkpoints: template.checkpoints,
      vehicleType: template.vehicleType || "",
    });
    setIsTemplateDialogOpen(true);
  };

  const handleEditInspection = (inspection: VehicleInspection) => {
    setSelectedInspection(inspection);
    inspectionForm.reset({
      vehicleId: inspection.vehicleId,
      templateId: inspection.templateId,
      inspectorId: inspection.inspectorId,
      status: inspection.status,
      findings: inspection.findings || "",
      passedCheckpoints: inspection.passedCheckpoints || 0,
      totalCheckpoints: inspection.totalCheckpoints || 0,
    });
    setIsInspectionDialogOpen(true);
  };

  const handleSubmitTemplate = (data: z.infer<typeof inspectionTemplateSchema>) => {
    if (selectedTemplate) {
      updateTemplateMutation.mutate({ ...data, id: selectedTemplate.id });
    } else {
      createTemplateMutation.mutate(data);
    }
  };

  const handleSubmitInspection = (data: z.infer<typeof vehicleInspectionSchema>) => {
    if (selectedInspection) {
      updateInspectionMutation.mutate({ ...data, id: selectedInspection.id });
    } else {
      createInspectionMutation.mutate(data);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; icon: any }> = {
      pending: { variant: "secondary", icon: AlertCircle },
      in_progress: { variant: "default", icon: AlertCircle },
      completed: { variant: "default", icon: CheckCircle },
      failed: { variant: "destructive", icon: XCircle },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const templatesTabContent = (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => {
          setSelectedTemplate(null);
          templateForm.reset();
          setIsTemplateDialogOpen(true);
        }} data-testid="button-create-template">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid={`template-card-${template.id}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-white">{template.name}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEditTemplate(template)} data-testid={`button-edit-template-${template.id}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteTemplateMutation.mutate(template.id)} data-testid={`button-delete-template-${template.id}`}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{template.description}</p>
              {template.vehicleType && (
                <Badge variant="secondary" className="mb-2">{template.vehicleType}</Badge>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {template.checkpoints.split('\n').length} checkpoints
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-12 text-center">
            <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No inspection templates yet</p>
            <Button className="mt-4" onClick={() => setIsTemplateDialogOpen(true)} data-testid="button-create-first-template">
              <Plus className="h-4 w-4 mr-2" />
              Create First Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const inspectionsTabContent = (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => {
          setSelectedInspection(null);
          inspectionForm.reset();
          setIsInspectionDialogOpen(true);
        }} data-testid="button-create-inspection">
          <Plus className="h-4 w-4 mr-2" />
          Create Inspection
        </Button>
      </div>

      <div className="space-y-3">
        {inspections.map((inspection) => (
          <Card key={inspection.id} className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid={`inspection-card-${inspection.id}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Vehicle ID: {inspection.vehicleId}</h3>
                    {getStatusBadge(inspection.status)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Template ID: {inspection.templateId}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Inspector ID: {inspection.inspectorId}
                  </p>
                  {inspection.passedCheckpoints !== undefined && inspection.totalCheckpoints !== undefined && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Progress: {inspection.passedCheckpoints}/{inspection.totalCheckpoints} checkpoints
                    </p>
                  )}
                  {inspection.findings && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 italic">{inspection.findings}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEditInspection(inspection)} data-testid={`button-edit-inspection-${inspection.id}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {inspections.length === 0 && (
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-12 text-center">
            <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No inspections yet</p>
            <Button className="mt-4" onClick={() => setIsInspectionDialogOpen(true)} data-testid="button-create-first-inspection">
              <Plus className="h-4 w-4 mr-2" />
              Create First Inspection
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const tabs: TabConfig[] = [
    {
      id: "templates",
      label: "Templates",
      icon: ClipboardList,
      content: templatesTabContent,
    },
    {
      id: "inspections",
      label: "Inspections",
      icon: FileCheck,
      content: inspectionsTabContent,
    },
  ];

  return (
    <>
      <TabsPageLayout
        title="Vehicle Inspections"
        description="Manage inspection templates and vehicle inspections"
        icon={ClipboardList}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTemplate ? "Edit Template" : "Create Template"}</DialogTitle>
            <DialogDescription>
              {selectedTemplate ? "Update the inspection template" : "Create a new inspection template"}
            </DialogDescription>
          </DialogHeader>
          <Form {...templateForm}>
            <form onSubmit={templateForm.handleSubmit(handleSubmitTemplate)} className="space-y-4">
              <FormField
                control={templateForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Pre-Purchase Inspection" data-testid="input-template-name" />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Template description" rows={2} data-testid="input-template-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={templateForm.control}
                name="vehicleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Type</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Sedan, SUV, Truck, etc." data-testid="input-template-vehicle-type" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={templateForm.control}
                name="checkpoints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Checkpoints (one per line) *</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Tire condition&#10;Brake pads&#10;Engine oil level" rows={6} data-testid="input-template-checkpoints" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsTemplateDialogOpen(false);
                  setSelectedTemplate(null);
                  templateForm.reset();
                }} data-testid="button-cancel-template">
                  Cancel
                </Button>
                <Button type="submit" disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending} data-testid="button-submit-template">
                  {selectedTemplate ? "Update" : "Create"} Template
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isInspectionDialogOpen} onOpenChange={setIsInspectionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedInspection ? "Edit Inspection" : "Create Inspection"}</DialogTitle>
            <DialogDescription>
              {selectedInspection ? "Update the vehicle inspection" : "Create a new vehicle inspection"}
            </DialogDescription>
          </DialogHeader>
          <Form {...inspectionForm}>
            <form onSubmit={inspectionForm.handleSubmit(handleSubmitInspection)} className="space-y-4">
              <FormField
                control={inspectionForm.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle ID *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Vehicle ID" data-testid="input-inspection-vehicle-id" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={inspectionForm.control}
                name="templateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-inspection-template">
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
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
                name="inspectorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inspector ID *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Inspector ID" data-testid="input-inspection-inspector-id" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={inspectionForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-inspection-status">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={inspectionForm.control}
                  name="passedCheckpoints"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passed Checkpoints</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} data-testid="input-inspection-passed-checkpoints" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={inspectionForm.control}
                  name="totalCheckpoints"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Checkpoints</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} data-testid="input-inspection-total-checkpoints" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={inspectionForm.control}
                name="findings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Findings</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Inspection findings and notes" rows={4} data-testid="input-inspection-findings" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsInspectionDialogOpen(false);
                  setSelectedInspection(null);
                  inspectionForm.reset();
                }} data-testid="button-cancel-inspection">
                  Cancel
                </Button>
                <Button type="submit" disabled={createInspectionMutation.isPending || updateInspectionMutation.isPending} data-testid="button-submit-inspection">
                  {selectedInspection ? "Update" : "Create"} Inspection
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
