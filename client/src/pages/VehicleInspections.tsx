import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

// Extend shared schemas with UI-specific validations
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

  // Supporting data for dropdowns
  const { data: vehicles = [] } = useQuery<any[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  // Get current user for garageId
  const { data: currentUser } = useQuery<any>({
    queryKey: ["/api/user"],
  });

  const templateForm = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      garageId: "", // Should be set from user context
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
      garageId: "", // Should be set from user context
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

  const createTemplateMutation = useMutation({
    mutationFn: async (data: TemplateFormData) => {
      // Ensure garageId is set from current user
      if (!currentUser?.garageId) {
        throw new Error("User garage not found. Please try again.");
      }

      // Transform textarea to JSON array
      const checklistItems = data.checklistItemsText
        .split("\n")
        .filter(item => item.trim())
        .map((item, idx) => ({
          id: idx + 1,
          section: "General",
          item: item.trim(),
          type: "checkbox",
          required: true,
          passCriteria: "Pass",
        }));

      const payload = {
        ...data,
        garageId: currentUser.garageId,
        createdBy: currentUser.id,
        checklistItems,
        vehicleTypes: data.vehicleTypes || [],
        estimateRules: data.estimateRules || [],
        checklistItemsText: undefined, // Remove UI-only field
      };

      return await apiRequest("POST", "/api/inspection-templates", payload);
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
    mutationFn: async (data: InspectionFormData) => {
      // Ensure garageId is set from current user
      if (!currentUser?.garageId) {
        throw new Error("User garage not found. Please try again.");
      }

      // Transform textarea to JSON array
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
        findingsText: undefined, // Remove UI-only field
      };

      return await apiRequest("POST", "/api/vehicle-inspections", payload);
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

  const deleteInspectionMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/vehicle-inspections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-inspections"] });
      toast({ title: "Success", description: "Inspection deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    templateForm.reset();
    setIsTemplateDialogOpen(true);
  };

  const handleCreateInspection = () => {
    inspectionForm.reset();
    setIsInspectionDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      in_progress: "bg-blue-500",
      completed: "bg-green-500",
      failed: "bg-red-500",
      passed: "bg-green-500",
    };
    return statusColors[status] || "bg-gray-500";
  };

  const templatesTabContent = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Inspection Templates</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage reusable inspection checklists</p>
        </div>
        <Button onClick={handleCreateTemplate} data-testid="button-create-template">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {templatesLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-12 text-center">
            <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No templates yet. Create your first inspection template.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.templateName}</CardTitle>
                    {template.description && (
                      <CardDescription className="mt-1">{template.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {template.isDefault && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                    {!template.isActive && (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Category:</span>
                    <Badge variant="outline">{template.category || "General"}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Items:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {Array.isArray(template.checklistItems) ? template.checklistItems.length : 0}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1" data-testid={`button-delete-template-${template.id}`} onClick={() => deleteTemplateMutation.mutate(template.id)}>
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Vehicle Inspections</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Track inspection results</p>
        </div>
        <Button onClick={handleCreateInspection} data-testid="button-create-inspection">
          <Plus className="h-4 w-4 mr-2" />
          New Inspection
        </Button>
      </div>

      {inspectionsLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : inspections.length === 0 ? (
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-12 text-center">
            <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No inspections yet. Create your first inspection.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {inspections.map((inspection) => (
            <Card key={inspection.id} className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {inspection.inspectionNumber || `Inspection #${inspection.id.substring(0, 8)}`}
                      </h3>
                      <Badge className={getStatusBadge(inspection.overallStatus || "in_progress")}>
                        {inspection.overallStatus || "In Progress"}
                      </Badge>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p>Type: {inspection.inspectionType}</p>
                      <p>Date: {inspection.inspectionDate ? new Date(inspection.inspectionDate).toLocaleDateString() : "N/A"}</p>
                      {inspection.currentMileage && <p>Mileage: {inspection.currentMileage.toLocaleString()} km</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {inspection.estimateGenerated && (
                      <Badge variant="secondary">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Estimate
                      </Badge>
                    )}
                    {inspection.customerNotified && (
                      <Badge variant="secondary">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Notified
                      </Badge>
                    )}
                    <Button 
                      size="sm" 
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
        description="Manage inspection templates and track vehicle inspections"
        icon={ClipboardList}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Template Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800 sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedTemplate ? "Edit Template" : "Create Template"}</DialogTitle>
            <DialogDescription>
              {selectedTemplate ? "Update inspection template" : "Create a new inspection template"}
            </DialogDescription>
          </DialogHeader>
          <Form {...templateForm}>
            <form onSubmit={templateForm.handleSubmit((data) => createTemplateMutation.mutate(data))} className="space-y-4">
              <FormField
                control={templateForm.control}
                name="templateName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Pre-Purchase Inspection" data-testid="input-template-name" />
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
                      <Textarea {...field} placeholder="Optional description" data-testid="input-template-description" />
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
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-template-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="pre_purchase">Pre-Purchase</SelectItem>
                        <SelectItem value="seasonal">Seasonal</SelectItem>
                        <SelectItem value="safety">Safety</SelectItem>
                        <SelectItem value="state_inspection">State Inspection</SelectItem>
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
                    <FormLabel>Checklist Items (one per line)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Check tire pressure&#10;Inspect brake pads&#10;Check engine oil level" 
                        rows={6}
                        data-testid="input-template-checklist"
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
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-template-default"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Set as default template</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsTemplateDialogOpen(false)} data-testid="button-cancel-template">
                  Cancel
                </Button>
                <Button type="submit" disabled={createTemplateMutation.isPending} data-testid="button-save-template">
                  {createTemplateMutation.isPending ? "Saving..." : "Save Template"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Inspection Dialog */}
      <Dialog open={isInspectionDialogOpen} onOpenChange={setIsInspectionDialogOpen}>
        <DialogContent className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800 sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Inspection</DialogTitle>
            <DialogDescription>Start a new vehicle inspection</DialogDescription>
          </DialogHeader>
          <Form {...inspectionForm}>
            <form onSubmit={inspectionForm.handleSubmit((data) => createInspectionMutation.mutate(data))} className="space-y-4">
              <FormField
                control={inspectionForm.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-inspection-vehicle">
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.make} {vehicle.model} ({vehicle.year})
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
                    <FormLabel>Customer</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-inspection-customer">
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.filter(u => u.role === 'customer').map((user) => (
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
                name="inspectorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inspector</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-inspection-inspector">
                          <SelectValue placeholder="Select inspector" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.filter(u => u.role === 'technician' || u.role === 'admin').map((user) => (
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
                    <FormLabel>Inspection Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-inspection-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="pre_purchase">Pre-Purchase</SelectItem>
                        <SelectItem value="seasonal">Seasonal</SelectItem>
                        <SelectItem value="safety">Safety</SelectItem>
                        <SelectItem value="state_inspection">State Inspection</SelectItem>
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
                    <FormLabel>Initial Findings (optional, one per line)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Enter findings..." 
                        rows={4}
                        data-testid="input-inspection-findings"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsInspectionDialogOpen(false)} data-testid="button-cancel-inspection">
                  Cancel
                </Button>
                <Button type="submit" disabled={createInspectionMutation.isPending} data-testid="button-save-inspection">
                  {createInspectionMutation.isPending ? "Creating..." : "Create Inspection"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
