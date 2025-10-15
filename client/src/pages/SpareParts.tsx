import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSparePartSchema, type SparePart } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import {
  Plus,
  Package,
  DollarSign,
  Warehouse,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const createSchema = insertSparePartSchema.extend({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Category is required"),
  partType: z.string().min(1, "Part type is required"),
});

type CreateFormData = z.infer<typeof createSchema>;

const CATEGORIES = [
  { value: "engine", label: "Engine" },
  { value: "brakes", label: "Brakes" },
  { value: "electrical", label: "Electrical" },
  { value: "fluids", label: "Fluids" },
  { value: "filters", label: "Filters" },
];

const PART_TYPES = [
  { value: "oem", label: "OEM" },
  { value: "generic", label: "Generic" },
  { value: "consumable", label: "Consumable" },
];

export default function SpareParts() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: spareParts = [], isLoading, error } = useQuery<SparePart[]>({
    queryKey: ["/api/spare-parts"],
  });

  const filteredParts = spareParts.filter((part) => {
    const matchesCategory = categoryFilter === "all" || part.category === categoryFilter;
    const matchesSearch = searchQuery === "" ||
      part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const createForm = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      subcategory: "",
      brand: "",
      manufacturer: "",
      sku: "",
      barcode: "",
      partType: "generic",
      unitOfMeasure: "pcs",
      visibility: "private",
      editableBy: "garage_admin",
      isGlobal: false,
      isActive: true,
      compatibleVehicles: [],
      linkedServiceIds: [],
      linkedToolIds: [],
      tags: [],
      media: [],
      documents: [],
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateFormData) => {
      return await apiRequest("/api/spare-parts", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spare-parts"] });
      setIsCreateOpen(false);
      createForm.reset();
      toast({
        title: "Success",
        description: "Spare part created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create spare part",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/spare-parts/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spare-parts"] });
      setIsDetailsOpen(false);
      toast({
        title: "Success",
        description: "Spare part deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete spare part",
        variant: "destructive",
      });
    },
  });

  const handleCreate = (data: CreateFormData) => {
    createMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this spare part?")) {
      deleteMutation.mutate(id);
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      engine: "bg-red-100 text-red-800",
      brakes: "bg-yellow-100 text-yellow-800",
      electrical: "bg-blue-100 text-blue-800",
      fluids: "bg-purple-100 text-purple-800",
      filters: "bg-green-100 text-green-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getPartTypeBadgeColor = (partType: string) => {
    const colors: Record<string, string> = {
      oem: "bg-indigo-100 text-indigo-800",
      generic: "bg-slate-100 text-slate-800",
      consumable: "bg-orange-100 text-orange-800",
    };
    return colors[partType] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">Spare Parts & Inventory</h1>
          <p className="text-muted-foreground">Manage spare parts and inventory levels</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-part">
              <Plus className="mr-2 h-4 w-4" />
              Add Spare Part
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Spare Part</DialogTitle>
              <DialogDescription>
                Create a new spare part for your inventory
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Part Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Oil Filter" {...field} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU *</FormLabel>
                        <FormControl>
                          <Input placeholder="OF-12345" {...field} data-testid="input-sku" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the spare part..." 
                          {...field} 
                          value={field.value ?? ""}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="subcategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcategory</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter subcategory" 
                            {...field} 
                            value={field.value ?? ""}
                            data-testid="input-subcategory"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="partType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Part Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-part-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PART_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="unitOfMeasure"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit of Measure</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                          <FormControl>
                            <SelectTrigger data-testid="select-unit">
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pcs">Pieces</SelectItem>
                            <SelectItem value="liters">Liters</SelectItem>
                            <SelectItem value="kg">Kilograms</SelectItem>
                            <SelectItem value="boxes">Boxes</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter brand" 
                            {...field} 
                            value={field.value || ""}
                            data-testid="input-brand"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="manufacturer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manufacturer</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter manufacturer" 
                            {...field} 
                            value={field.value || ""}
                            data-testid="input-manufacturer"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createForm.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barcode</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter barcode" 
                          {...field} 
                          value={field.value || ""}
                          data-testid="input-barcode"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional notes..." 
                          {...field} 
                          value={field.value || ""}
                          data-testid="input-notes"
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
                    onClick={() => setIsCreateOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                    data-testid="button-submit"
                  >
                    {createMutation.isPending ? "Creating..." : "Create Spare Part"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, SKU, or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]" data-testid="select-category-filter">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg font-medium mb-2">Failed to load spare parts</p>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/spare-parts"] })} data-testid="button-retry">
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse" data-testid={`skeleton-card-${i}`}>
              <CardHeader className="pb-3">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredParts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No spare parts found</p>
            <p className="text-muted-foreground mb-4">
              {searchQuery || categoryFilter !== "all" 
                ? "Try adjusting your filters" 
                : "Get started by adding your first spare part"}
            </p>
            {!searchQuery && categoryFilter === "all" && (
              <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-first">
                <Plus className="mr-2 h-4 w-4" />
                Add Spare Part
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredParts.map((part) => (
            <Card 
              key={part.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedPart(part);
                setIsDetailsOpen(true);
              }}
              data-testid={`card-part-${part.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg" data-testid={`text-name-${part.id}`}>
                      {part.name}
                    </CardTitle>
                    <CardDescription data-testid={`text-sku-${part.id}`}>
                      SKU: {part.sku}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" data-testid={`button-menu-${part.id}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPart(part);
                        setIsDetailsOpen(true);
                      }}>
                        <Edit className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(part.id);
                        }}
                        data-testid={`button-delete-${part.id}`}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Badge className={getCategoryBadgeColor(part.category)} data-testid={`badge-category-${part.id}`}>
                    {part.category}
                  </Badge>
                  <Badge className={getPartTypeBadgeColor(part.partType)} data-testid={`badge-type-${part.id}`}>
                    {part.partType}
                  </Badge>
                </div>
                {part.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {part.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {part.brand && (
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      <span>{part.brand}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Warehouse className="h-3 w-3" />
                    <span>{part.unitOfMeasure}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle data-testid="dialog-details-title">Spare Part Details</DialogTitle>
            <DialogDescription>View detailed information about this spare part</DialogDescription>
          </DialogHeader>
          {selectedPart && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-sm" data-testid="detail-name">{selectedPart.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">SKU</p>
                  <p className="text-sm" data-testid="detail-sku">{selectedPart.sku}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <Badge className={getCategoryBadgeColor(selectedPart.category)}>
                    {selectedPart.category}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Part Type</p>
                  <Badge className={getPartTypeBadgeColor(selectedPart.partType)}>
                    {selectedPart.partType}
                  </Badge>
                </div>
              </div>

              {selectedPart.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm" data-testid="detail-description">{selectedPart.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedPart.brand && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Brand</p>
                    <p className="text-sm">{selectedPart.brand}</p>
                  </div>
                )}
                {selectedPart.manufacturer && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Manufacturer</p>
                    <p className="text-sm">{selectedPart.manufacturer}</p>
                  </div>
                )}
                {selectedPart.barcode && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Barcode</p>
                    <p className="text-sm">{selectedPart.barcode}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unit of Measure</p>
                  <p className="text-sm">{selectedPart.unitOfMeasure}</p>
                </div>
              </div>

              {selectedPart.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="text-sm">{selectedPart.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsOpen(false)}
                  data-testid="button-close-details"
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedPart.id)}
                  disabled={deleteMutation.isPending}
                  data-testid="button-delete-details"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete Part"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
