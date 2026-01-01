import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { StandardPageLayout } from "@/components/layouts/StandardPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { insertToolSchema, type Tool } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Plus, Wrench, CheckCircle, XCircle } from "lucide-react";
import { z } from "zod";

const formSchema = insertToolSchema.extend({
  name: z.string().min(1, "Tool name is required"),
  toolType: z.string().min(1, "Tool type is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function Tools() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedToolType, setSelectedToolType] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const { data: tools, isLoading, isError, error } = useQuery<Tool[]>({
    queryKey: ["/api/tools"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      toolType: "mechanical",
      brand: "",
      manufacturer: "",
      tags: [],
      compatibleVehicles: [],
      linkedServiceIds: [],
      linkedPartIds: [],
      media: [],
      documents: [],
      isGlobal: false,
      visibility: "private",
      editableBy: "garage_admin",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest("/api/tools", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      toast({ title: t('inventory.toolCreatedSuccessfully', 'Tool created successfully') });
      setCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: t('inventory.errorCreatingTool', 'Error creating tool'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredTools = tools?.filter((tool) => {
    if (selectedToolType !== "all" && tool.toolType !== selectedToolType) return false;
    return true;
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  const openDetailsDialog = (tool: Tool) => {
    setSelectedTool(tool);
    setDetailsDialogOpen(true);
  };

  const getToolTypeBadge = (toolType: string) => {
    const variants: Record<string, string> = {
      diagnostic: "bg-[#0A5ED7]/10 text-[#0A5ED7] dark:bg-[#0A5ED7]/20 dark:text-[#0BB3FF]",
      mechanical: "bg-[#64748B]/10 text-[#64748B] dark:bg-[#64748B]/20 dark:text-[#9BA4B0]",
      electrical: "bg-[#F97316]/10 text-[#F97316] dark:bg-[#F97316]/20 dark:text-[#F97316]",
    };
    return variants[toolType] || variants.mechanical;
  };

  return (
    <StandardPageLayout
      title={t('inventory.toolsManagement', 'Tools Management')}
      description={t('inventory.manageToolsDesc', 'Manage tools and equipment inventory')}
      icon={Wrench}
      actions={[
        {
          label: t('inventory.addTool', 'Add Tool'),
          icon: Plus,
          onClick: () => setCreateDialogOpen(true),
        },
      ]}
    >
      <div className="flex gap-4 mb-6">
        <Select value={selectedToolType} onValueChange={setSelectedToolType}>
          <SelectTrigger className="w-[200px] bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="filter-tool-type">
            <SelectValue placeholder={t('inventory.allToolTypes', 'All Tool Types')} />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <SelectItem value="all">{t('inventory.allToolTypes', 'All Tool Types')}</SelectItem>
            <SelectItem value="diagnostic">{t('inventory.diagnostic', 'Diagnostic')}</SelectItem>
            <SelectItem value="mechanical">{t('inventory.mechanical', 'Mechanical')}</SelectItem>
            <SelectItem value="electrical">{t('inventory.electrical', 'Electrical')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12" data-testid="loading-state">
          <p className="text-[#64748B]">{t('inventory.loadingTools', 'Loading tools...')}</p>
        </div>
      ) : isError ? (
        <div className="text-center py-12" data-testid="error-state">
          <p className="text-[#0B1F3B] dark:text-white font-semibold">{t('inventory.errorLoadingTools', 'Error loading tools')}</p>
          <p className="text-sm text-[#64748B] mt-2">{error instanceof Error ? error.message : t('common.tryAgainLater', 'Please try again later')}</p>
        </div>
      ) : filteredTools && filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => (
            <Card key={tool.id} className="cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid={`card-tool-${tool.id}`}>
              <CardContent className="p-6" onClick={() => openDetailsDialog(tool)}>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-[#0A5ED7]" />
                      <h3 className="font-semibold text-lg text-[#0B1F3B] dark:text-white" data-testid={`text-tool-name-${tool.id}`}>{tool.name}</h3>
                    </div>
                    <Badge className={getToolTypeBadge(tool.toolType)} data-testid={`badge-tool-type-${tool.id}`}>
                      {tool.toolType}
                    </Badge>
                  </div>
                  {tool.description && (
                    <p className="text-sm text-[#64748B] line-clamp-2" data-testid={`text-description-${tool.id}`}>{tool.description}</p>
                  )}
                  <div className="flex flex-col gap-2 text-sm text-[#64748B]">
                    {tool.brand && (
                      <div className="flex justify-between" data-testid={`text-brand-${tool.id}`}>
                        <span className="font-medium text-[#0B1F3B] dark:text-white">{t('inventory.brand', 'Brand')}:</span>
                        <span>{tool.brand}</span>
                      </div>
                    )}
                    {tool.manufacturer && (
                      <div className="flex justify-between" data-testid={`text-manufacturer-${tool.id}`}>
                        <span className="font-medium text-[#0B1F3B] dark:text-white">{t('inventory.manufacturer', 'Manufacturer')}:</span>
                        <span>{tool.manufacturer}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {tool.isActive ? (
                      <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" /> {t('common.active', 'Active')}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-[#F8FAFC] dark:bg-[#0E1117] text-[#64748B] border-[#E2E8F0] dark:border-[#232A36]">
                        <XCircle className="h-3 w-3 mr-1" /> {t('common.inactive', 'Inactive')}
                      </Badge>
                    )}
                    {tool.isGlobal && (
                      <Badge variant="outline" className="bg-[#0A5ED7]/10 text-[#0A5ED7] dark:bg-[#0A5ED7]/20 dark:text-[#0BB3FF] border-[#0A5ED7]/30">
                        {t('inventory.global', 'Global')}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12" data-testid="empty-state">
          <p className="text-[#64748B]">{t('inventory.noToolsFound', 'No tools found')}</p>
          <p className="text-sm text-[#64748B] mt-2">{t('inventory.addFirstTool', 'Add your first tool to get started')}</p>
        </div>
      )}

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('inventory.addNewTool', 'Add New Tool')}</DialogTitle>
            <DialogDescription className="text-[#64748B]">
              {t('inventory.addToolDesc', 'Add a new tool or equipment to the inventory')}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">Tool Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., OBD-II Scanner" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="toolType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">Tool Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-tool-type">
                          <SelectValue placeholder="Select tool type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                        <SelectItem value="diagnostic">Diagnostic</SelectItem>
                        <SelectItem value="mechanical">Mechanical</SelectItem>
                        <SelectItem value="electrical">Electrical</SelectItem>
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
                    <FormLabel className="text-[#0B1F3B] dark:text-white">Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} placeholder="Describe the tool..." className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">Brand</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} placeholder="e.g., Bosch" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-brand" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="manufacturer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">Manufacturer</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} placeholder="Manufacturer name" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-manufacturer" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">Visibility</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-visibility">
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="shared">Shared</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  className="border-[#E2E8F0] dark:border-[#232A36]"
                  data-testid="button-cancel-create"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" data-testid="button-submit-create">
                  {createMutation.isPending ? "Adding..." : "Add Tool"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{selectedTool?.name}</DialogTitle>
            <DialogDescription className="text-[#64748B]">Tool details and information</DialogDescription>
          </DialogHeader>
          {selectedTool && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-[#0B1F3B] dark:text-white">Tool Type</h4>
                <Badge className={getToolTypeBadge(selectedTool.toolType)}>{selectedTool.toolType}</Badge>
              </div>
              {selectedTool.description && (
                <div>
                  <h4 className="font-semibold mb-2 text-[#0B1F3B] dark:text-white">Description</h4>
                  <p className="text-sm text-[#64748B]">{selectedTool.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {selectedTool.brand && (
                  <div>
                    <h4 className="font-semibold mb-2 text-[#0B1F3B] dark:text-white">Brand</h4>
                    <p className="text-sm text-[#64748B]">{selectedTool.brand}</p>
                  </div>
                )}
                {selectedTool.manufacturer && (
                  <div>
                    <h4 className="font-semibold mb-2 text-[#0B1F3B] dark:text-white">Manufacturer</h4>
                    <p className="text-sm text-[#64748B]">{selectedTool.manufacturer}</p>
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-[#0B1F3B] dark:text-white">Status</h4>
                <div className="flex gap-2">
                  {selectedTool.isActive ? (
                    <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" /> Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-[#F8FAFC] dark:bg-[#0E1117] text-[#64748B] border-[#E2E8F0] dark:border-[#232A36]">
                      <XCircle className="h-3 w-3 mr-1" /> Inactive
                    </Badge>
                  )}
                  {selectedTool.isGlobal && (
                    <Badge variant="outline" className="bg-[#0A5ED7]/10 text-[#0A5ED7] dark:bg-[#0A5ED7]/20 dark:text-[#0BB3FF] border-[#0A5ED7]/30">
                      Global
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-[#E2E8F0] dark:border-[#232A36] text-[#64748B]">{selectedTool.visibility}</Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </StandardPageLayout>
  );
}
