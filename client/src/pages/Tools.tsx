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
import { insertToolSchema, type Tool } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Plus, Wrench, Eye, CheckCircle, XCircle } from "lucide-react";
import { z } from "zod";

const formSchema = insertToolSchema.extend({
  name: z.string().min(1, "Tool name is required"),
  toolType: z.string().min(1, "Tool type is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function Tools() {
  const { toast } = useToast();
  const [selectedToolType, setSelectedToolType] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const { data: garages } = useQuery<any[]>({
    queryKey: ["/api/garages"],
  });

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
      toast({ title: "Tool created successfully" });
      setCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating tool",
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
      diagnostic: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      mechanical: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      electrical: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    };
    return variants[toolType] || variants.mechanical;
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <h1 className="font-['Poppins',Helvetica] font-bold text-3xl text-chrome-silver">Tools Management</h1>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-tool">
              <Plus className="mr-2 h-4 w-4" /> Add Tool
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Tool</DialogTitle>
              <DialogDescription>
                Add a new tool or equipment to the inventory
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tool Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., OBD-II Scanner" data-testid="input-name" />
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
                      <FormLabel>Tool Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-tool-type">
                            <SelectValue placeholder="Select tool type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} placeholder="Describe the tool..." data-testid="input-description" />
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
                        <FormLabel>Brand</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="e.g., Bosch" data-testid="input-brand" />
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
                        <FormLabel>Manufacturer</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="Manufacturer name" data-testid="input-manufacturer" />
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
                      <FormLabel>Visibility</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger data-testid="select-visibility">
                            <SelectValue placeholder="Select visibility" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                    data-testid="button-cancel-create"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-create">
                    {createMutation.isPending ? "Adding..." : "Add Tool"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={selectedToolType} onValueChange={setSelectedToolType}>
          <SelectTrigger className="w-[200px]" data-testid="filter-tool-type">
            <SelectValue placeholder="All Tool Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tool Types</SelectItem>
            <SelectItem value="diagnostic">Diagnostic</SelectItem>
            <SelectItem value="mechanical">Mechanical</SelectItem>
            <SelectItem value="electrical">Electrical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tools Grid */}
      {isLoading ? (
        <div className="text-center py-12" data-testid="loading-state">
          <p className="text-chrome-silver/60">Loading tools...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-12" data-testid="error-state">
          <p className="text-red-600 font-semibold">Error loading tools</p>
          <p className="text-sm text-chrome-silver/60 mt-2">{error instanceof Error ? error.message : "Please try again later"}</p>
        </div>
      ) : filteredTools && filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => (
            <Card key={tool.id} className="cursor-pointer hover:shadow-lg transition-shadow" data-testid={`card-tool-${tool.id}`}>
              <CardContent className="p-6" onClick={() => openDetailsDialog(tool)}>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-lg" data-testid={`text-tool-name-${tool.id}`}>{tool.name}</h3>
                    </div>
                    <Badge className={getToolTypeBadge(tool.toolType)} data-testid={`badge-tool-type-${tool.id}`}>
                      {tool.toolType}
                    </Badge>
                  </div>
                  {tool.description && (
                    <p className="text-sm text-chrome-silver/60 line-clamp-2" data-testid={`text-description-${tool.id}`}>{tool.description}</p>
                  )}
                  <div className="flex flex-col gap-2 text-sm text-chrome-silver/60">
                    {tool.brand && (
                      <div className="flex justify-between" data-testid={`text-brand-${tool.id}`}>
                        <span className="font-medium">Brand:</span>
                        <span>{tool.brand}</span>
                      </div>
                    )}
                    {tool.manufacturer && (
                      <div className="flex justify-between" data-testid={`text-manufacturer-${tool.id}`}>
                        <span className="font-medium">Manufacturer:</span>
                        <span>{tool.manufacturer}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {tool.isActive ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                        <CheckCircle className="h-3 w-3 mr-1" /> Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-dark-steel/20 text-gray-700 dark:bg-gray-950 dark:text-gray-300">
                        <XCircle className="h-3 w-3 mr-1" /> Inactive
                      </Badge>
                    )}
                    {tool.isGlobal && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        Global
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
          <p className="text-chrome-silver/60">No tools found</p>
          <p className="text-sm text-chrome-silver/60 mt-2">Add your first tool to get started</p>
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTool?.name}</DialogTitle>
            <DialogDescription>Tool details and information</DialogDescription>
          </DialogHeader>
          {selectedTool && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Tool Type</h4>
                <Badge className={getToolTypeBadge(selectedTool.toolType)}>{selectedTool.toolType}</Badge>
              </div>
              {selectedTool.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-chrome-silver/60">{selectedTool.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {selectedTool.brand && (
                  <div>
                    <h4 className="font-semibold mb-2">Brand</h4>
                    <p className="text-sm">{selectedTool.brand}</p>
                  </div>
                )}
                {selectedTool.manufacturer && (
                  <div>
                    <h4 className="font-semibold mb-2">Manufacturer</h4>
                    <p className="text-sm">{selectedTool.manufacturer}</p>
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-semibold mb-2">Status</h4>
                <div className="flex gap-2">
                  {selectedTool.isActive ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" /> Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-dark-steel/20 text-gray-700">
                      <XCircle className="h-3 w-3 mr-1" /> Inactive
                    </Badge>
                  )}
                  {selectedTool.isGlobal && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      Global
                    </Badge>
                  )}
                  <Badge variant="outline">{selectedTool.visibility}</Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
