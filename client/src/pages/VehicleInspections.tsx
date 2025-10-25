import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Plus,
  Pencil,
  Trash2,
  ClipboardList,
  FileCheck,
} from "lucide-react";
import { format } from "date-fns";
import {
  insertInspectionTemplateSchema,
  insertVehicleInspectionSchema,
  type InspectionTemplate,
  type VehicleInspection,
  type Vehicle,
  type User,
} from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

const templateFormSchema = insertInspectionTemplateSchema.extend({
  templateName: z.string().min(1, "Template name required"),
  checklistItems: z.string().min(1, "Checklist items required").transform(val => {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }),
  estimateRules: z.string().optional().transform(val => {
    if (!val || val === "") return [];
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  }),
  vehicleTypes: z.string().optional().transform(val => {
    if (!val || val === "") return [];
    try {
      return JSON.parse(val);
    } catch {
      return val.split(",").map(s => s.trim()).filter(Boolean);
    }
  }),
});

const inspectionFormSchema = insertVehicleInspectionSchema.extend({
  templateId: z.string().optional(),
  vehicleId: z.string().min(1, "Vehicle required"),
  customerId: z.string().min(1, "Customer required"),
  inspectorId: z.string().min(1, "Inspector required"),
  inspectionType: z.string().min(1, "Inspection type required"),
  currentMileage: z.string().optional().transform(val => val && val !== "" ? parseInt(val) : undefined),
  findings: z.string().min(1, "Findings required").transform(val => {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }),
  recommendations: z.string().optional().transform(val => {
    if (!val || val === "") return [];
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  }),
  estimatedCost: z.string().optional().transform(val => val && val !== "" ? parseFloat(val) : undefined),
  inspectionDate: z.string().optional(),
});

type TemplateFormData = z.input<typeof templateFormSchema>;
type InspectionFormData = z.input<typeof inspectionFormSchema>;

export default function VehicleInspections() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("templates");
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isInspectionDialogOpen, setIsInspectionDialogOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingInspectionId, setEditingInspectionId] = useState<string | null>(null);

  const { data: templates = [], isLoading: templatesLoading } = useQuery<InspectionTemplate[]>({
    queryKey: ["/api/inspection-templates"],
    enabled: selectedTab === "templates",
  });

  const { data: inspections = [], isLoading: inspectionsLoading } = useQuery<VehicleInspection[]>({
    queryKey: ["/api/vehicle-inspections"],
    enabled: selectedTab === "inspections",
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
    enabled: isInspectionDialogOpen,
  });

  const { data: customers = [] } = useQuery<User[]>({
    queryKey: ["/api/customers"],
    enabled: isInspectionDialogOpen,
  });

  const templateForm = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      templateName: "",
      description: "",
      category: "general",
      vehicleTypes: "",
      checklistItems: "",
      estimateRules: "",
      isDefault: false,
      isActive: true,
    },
  });

  const inspectionForm = useForm<InspectionFormData>({
    resolver: zodResolver(inspectionFormSchema),
    defaultValues: {
      inspectionNumber: "",
      templateId: "",
      vehicleId: "",
      customerId: "",
      inspectorId: (user as any)?.id || "",
      currentMileage: "",
      inspectionType: "",
      overallStatus: "in_progress",
      findings: "",
      recommendations: "",
      estimatedCost: "",
      estimateGenerated: false,
      estimateId: "",
      customerNotified: false,
    },
  });

  const templateMutation = useMutation({
    mutationFn: async (data: TemplateFormData) => {
      const parsed = templateFormSchema.parse(data);
      const payload = {
        ...parsed,
        garageId: (user as any)?.garageId,
        createdBy: (user as any)?.id,
      };
      if (editingTemplateId) {
        return await apiRequest("PATCH", `/api/inspection-templates/${editingTemplateId}`, payload);
      }
      return await apiRequest("POST", "/api/inspection-templates", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspection-templates"] });
      setIsTemplateDialogOpen(false);
      setEditingTemplateId(null);
      templateForm.reset();
      toast({
        title: editingTemplateId ? "Template Updated" : "Template Created",
        description: "Changes saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save template",
        variant: "destructive",
      });
    },
  });

  const inspectionMutation = useMutation({
    mutationFn: async (data: InspectionFormData) => {
      const parsed = inspectionFormSchema.parse(data);
      const payload = {
        ...parsed,
        garageId: (user as any)?.garageId,
        inspectorId: (user as any)?.id,
      };
      if (editingInspectionId) {
        return await apiRequest("PATCH", `/api/vehicle-inspections/${editingInspectionId}`, payload);
      }
      return await apiRequest("POST", "/api/vehicle-inspections", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-inspections"] });
      setIsInspectionDialogOpen(false);
      setEditingInspectionId(null);
      inspectionForm.reset();
      toast({
        title: editingInspectionId ? "Inspection Updated" : "Inspection Created",
        description: "Changes saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save inspection",
        variant: "destructive",
      });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/inspection-templates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspection-templates"] });
      toast({ title: "Template Deleted", description: "Template removed successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete template",
        variant: "destructive",
      });
    },
  });

  const deleteInspectionMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/vehicle-inspections/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicle-inspections"] });
      toast({ title: "Inspection Deleted", description: "Inspection removed successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete inspection",
        variant: "destructive",
      });
    },
  });

  const handleEditTemplate = (template: InspectionTemplate) => {
    setEditingTemplateId(template.id);
    templateForm.reset({
      templateName: template.templateName,
      description: template.description ?? "",
      category: (template.category as any) ?? "general",
      vehicleTypes: JSON.stringify(template.vehicleTypes ?? []),
      checklistItems: JSON.stringify(template.checklistItems, null, 2),
      estimateRules: JSON.stringify(template.estimateRules ?? [], null, 2),
      isDefault: template.isDefault ?? false,
      isActive: template.isActive ?? true,
    });
    setIsTemplateDialogOpen(true);
  };

  const handleEditInspection = (inspection: VehicleInspection) => {
    setEditingInspectionId(inspection.id);
    inspectionForm.reset({
      inspectionNumber: inspection.inspectionNumber ?? "",
      templateId: inspection.templateId ?? "",
      vehicleId: inspection.vehicleId,
      customerId: inspection.customerId,
      inspectorId: inspection.inspectorId,
      currentMileage: inspection.currentMileage?.toString() ?? "",
      inspectionType: inspection.inspectionType,
      overallStatus: (inspection.overallStatus as any) ?? "in_progress",
      findings: JSON.stringify(inspection.findings, null, 2),
      recommendations: JSON.stringify(inspection.recommendations ?? [], null, 2),
      estimatedCost: inspection.estimatedCost?.toString() ?? "",
      estimateGenerated: inspection.estimateGenerated ?? false,
      estimateId: inspection.estimateId ?? "",
      customerNotified: inspection.customerNotified ?? false,
    });
    setIsInspectionDialogOpen(true);
  };

  const getStatusBadge = (status: string, id: string) => {
    const statusColors: Record<string, string> = {
      in_progress: "bg-salis-gray dark:bg-salis-gray-light",
      completed: "bg-salis-black dark:bg-white",
      passed: "bg-salis-black dark:bg-white",
      failed: "bg-salis-gray dark:bg-salis-gray-light",
    };
    
    return (
      <Badge className={`${statusColors[status] || "bg-salis-gray"} text-white dark:text-salis-black`} data-testid={`badge-inspection-status-${id}`}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-white dark:bg-salis-black min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-montserrat font-semibold text-salis-black dark:text-white">
            Vehicle Inspections
          </h1>
          <p className="text-sm text-salis-gray mt-1">
            Manage inspection templates and conduct vehicle inspections
          </p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="bg-salis-gray-light dark:bg-salis-gray-dark">
          <TabsTrigger value="templates" data-testid="tab-templates" className="data-[state=active]:bg-salis-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-salis-black">
            <ClipboardList className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="inspections" data-testid="tab-inspections" className="data-[state=active]:bg-salis-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-salis-black">
            <FileCheck className="h-4 w-4 mr-2" />
            Inspections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-salis-black dark:text-white">Inspection Templates</h2>
            <Button
              onClick={() => {
                setEditingTemplateId(null);
                templateForm.reset();
                setIsTemplateDialogOpen(true);
              }}
              className="bg-salis-black dark:bg-white text-white dark:text-salis-black hover:bg-salis-gray-dark dark:hover:bg-salis-gray-light"
              data-testid="button-create-template"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          <div className="border border-salis-gray-light dark:border-salis-gray rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-salis-gray-light dark:bg-salis-gray-dark">
                <TableRow>
                  <TableHead className="text-salis-black dark:text-white">Template Name</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Category</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Vehicle Types</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Items Count</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Status</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templatesLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-salis-gray">
                      Loading templates...
                    </TableCell>
                  </TableRow>
                ) : templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-salis-gray">
                      No templates found. Create your first template to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((template) => (
                    <TableRow key={template.id} data-testid={`row-template-${template.id}`} className="border-b border-salis-gray-light dark:border-salis-gray">
                      <TableCell className="font-medium text-salis-black dark:text-white">
                        {template.templateName}
                        {template.isDefault && (
                          <Badge variant="outline" className="ml-2">Default</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-salis-black dark:text-white">
                        {template.category || "N/A"}
                      </TableCell>
                      <TableCell className="text-salis-black dark:text-white">
                        {Array.isArray(template.vehicleTypes) 
                          ? template.vehicleTypes.join(", ") 
                          : "All"}
                      </TableCell>
                      <TableCell className="text-salis-black dark:text-white">
                        {Array.isArray(template.checklistItems) 
                          ? template.checklistItems.length 
                          : 0}
                      </TableCell>
                      <TableCell>
                        <Badge className={template.isActive ? "bg-salis-black dark:bg-white text-white dark:text-salis-black" : "bg-salis-gray dark:bg-salis-gray-light text-white dark:text-salis-black"}>
                          {template.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTemplate(template)}
                            data-testid={`button-edit-template-${template.id}`}
                            className="text-salis-black dark:text-white hover:bg-salis-gray-light dark:hover:bg-salis-gray"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTemplateMutation.mutate(template.id)}
                            data-testid={`button-delete-template-${template.id}`}
                            className="text-salis-gray hover:bg-salis-gray-light dark:hover:bg-salis-gray"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="inspections" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-salis-black dark:text-white">Vehicle Inspections</h2>
            <Button
              onClick={() => {
                setEditingInspectionId(null);
                inspectionForm.reset({
                  inspectionNumber: "",
                  templateId: "",
                  vehicleId: "",
                  customerId: "",
                  inspectorId: (user as any)?.id || "",
                  currentMileage: "",
                  inspectionType: "",
                  overallStatus: "in_progress",
                  findings: "",
                  recommendations: "",
                  estimatedCost: "",
                  estimateGenerated: false,
                  estimateId: "",
                  customerNotified: false,
                });
                setIsInspectionDialogOpen(true);
              }}
              className="bg-salis-black dark:bg-white text-white dark:text-salis-black hover:bg-salis-gray-dark dark:hover:bg-salis-gray-light"
              data-testid="button-create-inspection"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Inspection
            </Button>
          </div>

          <div className="border border-salis-gray-light dark:border-salis-gray rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-salis-gray-light dark:bg-salis-gray-dark">
                <TableRow>
                  <TableHead className="text-salis-black dark:text-white">Inspection #</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Vehicle</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Customer</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Inspector</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Type</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Overall Status</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Inspection Date</TableHead>
                  <TableHead className="text-salis-black dark:text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inspectionsLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-salis-gray">
                      Loading inspections...
                    </TableCell>
                  </TableRow>
                ) : inspections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-salis-gray">
                      No inspections found. Create your first inspection to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  inspections.map((inspection) => (
                    <TableRow key={inspection.id} data-testid={`row-inspection-${inspection.id}`} className="border-b border-salis-gray-light dark:border-salis-gray">
                      <TableCell className="font-medium text-salis-black dark:text-white">
                        {inspection.inspectionNumber || "N/A"}
                      </TableCell>
                      <TableCell className="text-salis-black dark:text-white">
                        {inspection.vehicleId}
                      </TableCell>
                      <TableCell className="text-salis-black dark:text-white">
                        {inspection.customerId}
                      </TableCell>
                      <TableCell className="text-salis-black dark:text-white">
                        {inspection.inspectorId}
                      </TableCell>
                      <TableCell className="text-salis-black dark:text-white">
                        {inspection.inspectionType}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(inspection.overallStatus || "in_progress", inspection.id)}
                      </TableCell>
                      <TableCell className="text-salis-black dark:text-white">
                        {inspection.inspectionDate 
                          ? format(new Date(inspection.inspectionDate), "MMM dd, yyyy")
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditInspection(inspection)}
                            data-testid={`button-edit-inspection-${inspection.id}`}
                            className="text-salis-black dark:text-white hover:bg-salis-gray-light dark:hover:bg-salis-gray"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteInspectionMutation.mutate(inspection.id)}
                            data-testid={`button-delete-inspection-${inspection.id}`}
                            className="text-salis-gray hover:bg-salis-gray-light dark:hover:bg-salis-gray"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-salis-black border-salis-gray-light dark:border-salis-gray max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-salis-black dark:text-white">
              {editingTemplateId ? "Edit Template" : "Create Template"}
            </DialogTitle>
            <DialogDescription className="text-salis-gray">
              {editingTemplateId ? "Update inspection template details" : "Create a new inspection template"}
            </DialogDescription>
          </DialogHeader>
          <Form {...templateForm}>
            <form onSubmit={templateForm.handleSubmit((data) => templateMutation.mutate(data))} className="space-y-4">
              <FormField
                control={templateForm.control}
                name="templateName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white">Template Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Pre-Purchase Inspection"
                        data-testid="input-template-name"
                        className="bg-white dark:bg-salis-gray-dark text-salis-black dark:text-white border-salis-gray-light dark:border-salis-gray"
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
                    <FormLabel className="text-salis-black dark:text-white">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Template description"
                        data-testid="input-description"
                        className="bg-white dark:bg-salis-gray-dark text-salis-black dark:text-white border-salis-gray-light dark:border-salis-gray"
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
                    <FormLabel className="text-salis-black dark:text-white">Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category" className="bg-white dark:bg-salis-gray-dark text-salis-black dark:text-white border-salis-gray-light dark:border-salis-gray">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray">
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
                name="vehicleTypes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white">Vehicle Types</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='["car", "truck", "motorcycle"] or comma-separated'
                        data-testid="input-vehicle-types"
                        className="bg-white dark:bg-salis-gray-dark text-salis-black dark:text-white border-salis-gray-light dark:border-salis-gray"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={templateForm.control}
                name="checklistItems"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white">Checklist Items (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder='[{"section": "Engine", "item": "Oil Level", "type": "check", "required": true, "passCriteria": "Within range"}]'
                        rows={6}
                        data-testid="input-checklist-items"
                        className="font-mono text-sm bg-white dark:bg-salis-gray-dark text-salis-black dark:text-white border-salis-gray-light dark:border-salis-gray"
                      />
                    </FormControl>
                    <p className="text-xs text-salis-gray">Add checklist items (section, item, type, required, passCriteria)</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={templateForm.control}
                name="estimateRules"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white">Estimate Rules (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder='[{"condition": "failed", "itemType": "brake_pads", "estimatedCost": 150}]'
                        rows={4}
                        data-testid="input-estimate-rules"
                        className="font-mono text-sm bg-white dark:bg-salis-gray-dark text-salis-black dark:text-white border-salis-gray-light dark:border-salis-gray"
                      />
                    </FormControl>
                    <p className="text-xs text-salis-gray">Auto-generate estimate rules</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={templateForm.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-is-default"
                        className="border-salis-gray-light dark:border-salis-gray"
                      />
                    </FormControl>
                    <FormLabel className="text-salis-black dark:text-white !mt-0">Set as Default Template</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={templateForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? true}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-is-active"
                        className="border-salis-gray-light dark:border-salis-gray"
                      />
                    </FormControl>
                    <FormLabel className="text-salis-black dark:text-white !mt-0">Active</FormLabel>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsTemplateDialogOpen(false)}
                  className="border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={templateMutation.isPending}
                  className="bg-salis-black dark:bg-white text-white dark:text-salis-black hover:bg-salis-gray-dark dark:hover:bg-salis-gray-light"
                  data-testid="button-save-template"
                >
                  {templateMutation.isPending ? "Saving..." : editingTemplateId ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isInspectionDialogOpen} onOpenChange={setIsInspectionDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-salis-black border-salis-gray-light dark:border-salis-gray max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-salis-black dark:text-white">
              {editingInspectionId ? "Edit Inspection" : "Create Inspection"}
            </DialogTitle>
            <DialogDescription className="text-salis-gray">
              {editingInspectionId ? "Update vehicle inspection details" : "Create a new vehicle inspection"}
            </DialogDescription>
          </DialogHeader>
          <Form {...inspectionForm}>
            <form onSubmit={inspectionForm.handleSubmit((data) => inspectionMutation.mutate(data))} className="space-y-4">
              <FormField
                control={inspectionForm.control}
                name="inspectionNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white">Inspection Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Auto-generated"
                        readOnly={!editingInspectionId}
                        data-testid="input-inspection-number"
                        className="bg-white dark:bg-salis-gray-dark text-salis-black dark:text-white border-salis-gray-light dark:border-salis-gray"
                      />
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
                    <FormLabel className="text-salis-black dark:text-white">Template (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-template" className="bg-white dark:bg-salis-gray-dark text-salis-black dark:text-white border-salis-gray-light dark:border-salis-gray">
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray">
                        <SelectItem value="">None</SelectItem>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.templateName}
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
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white">Vehicle</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-vehicle" className="bg-white dark:bg-salis-gray-dark text-salis-black dark:text-white border-salis-gray-light dark:border-salis-gray">
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray">
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
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
                    <FormLabel className="text-salis-black dark:text-white">Customer</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-customer" className="bg-white dark:bg-salis-gray-dark text-salis-black dark:text-white border-salis-gray-light dark:border-salis-gray">
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray">
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.fullName || customer.email}
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
                    <FormLabel className="text-salis-black dark:text-white">Inspector</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly
                        data-testid="input-inspector"
                        className="bg-salis-gray-light dark:bg-salis-gray text-salis-black dark:text-white border-salis-gray-light dark:border-salis-gray"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={inspectionForm.control}
                name="currentMileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white">Current Mileage</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="e.g., 45000"
                        data-testid="input-current-mileage"
                        className="bg-white dark:bg-salis-gray-dark text-salis-black dark:text-white border-salis-gray-light dark:border-salis-gray"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={inspectionForm.control}
                name="inspectionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white">Inspection Type</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Pre-Purchase, Annual, Safety"
                        data-testid="input-inspection-type"
                        className="bg-white dark:bg-salis-gray-dark text-salis-black dark:text-white border-salis-gray-light dark:border-salis-gray"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={inspectionForm.control}
                name="overallStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white">Overall Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-overall-status" className="bg-white dark:bg-salis-gray-dark text-salis-black dark:text-white border-salis-gray-light dark:border-salis-gray">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-salis-gray-dark border-salis-gray-light dark:border-salis-gray">
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="passed">Passed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={inspectionForm.control}
                name="findings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white">Findings (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder='[{"item": "Brake Pads", "status": "worn", "severity": "medium", "notes": "Replace soon", "photoUrls": []}]'
                        rows={6}
                        data-testid="input-findings"
                        className="font-mono text-sm bg-white dark:bg-salis-gray-dark text-salis-black dark:text-white border-salis-gray-light dark:border-salis-gray"
                      />
                    </FormControl>
                    <p className="text-xs text-salis-gray">Inspection findings (item, status, severity, notes, photoUrls)</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={inspectionForm.control}
                name="recommendations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white">Recommendations (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder='[{"service": "Brake Replacement", "priority": "high", "estimatedCost": 350}]'
                        rows={4}
                        data-testid="input-recommendations"
                        className="font-mono text-sm bg-white dark:bg-salis-gray-dark text-salis-black dark:text-white border-salis-gray-light dark:border-salis-gray"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={inspectionForm.control}
                name="estimatedCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white">Estimated Cost</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="e.g., 250.00"
                        data-testid="input-estimated-cost"
                        className="bg-white dark:bg-salis-gray-dark text-salis-black dark:text-white border-salis-gray-light dark:border-salis-gray"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={inspectionForm.control}
                name="estimateGenerated"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-estimate-generated"
                        className="border-salis-gray-light dark:border-salis-gray"
                      />
                    </FormControl>
                    <FormLabel className="text-salis-black dark:text-white !mt-0">Estimate Generated</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={inspectionForm.control}
                name="estimateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white">Estimate ID (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="UUID if linked to estimate"
                        data-testid="input-estimate-id"
                        className="bg-white dark:bg-salis-gray-dark text-salis-black dark:text-white border-salis-gray-light dark:border-salis-gray"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={inspectionForm.control}
                name="customerNotified"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-customer-notified"
                        className="border-salis-gray-light dark:border-salis-gray"
                      />
                    </FormControl>
                    <FormLabel className="text-salis-black dark:text-white !mt-0">Customer Notified</FormLabel>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsInspectionDialogOpen(false)}
                  className="border-salis-gray-light dark:border-salis-gray text-salis-black dark:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={inspectionMutation.isPending}
                  className="bg-salis-black dark:bg-white text-white dark:text-salis-black hover:bg-salis-gray-dark dark:hover:bg-salis-gray-light"
                  data-testid="button-save-inspection"
                >
                  {inspectionMutation.isPending ? "Saving..." : editingInspectionId ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
