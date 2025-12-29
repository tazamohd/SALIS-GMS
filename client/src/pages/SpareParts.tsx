import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSparePartSchema, type SparePart } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import {
  Plus,
  Package,
  Warehouse,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import { StandardPageLayout } from "@/components/layouts/StandardPageLayout";
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

const getCategoriesWithTranslation = (t: any) => [
  { value: "engine", label: t('inventory.categoryEngine', 'Engine') },
  { value: "brakes", label: t('inventory.categoryBrakes', 'Brakes') },
  { value: "electrical", label: t('inventory.categoryElectrical', 'Electrical') },
  { value: "fluids", label: t('inventory.categoryFluids', 'Fluids') },
  { value: "filters", label: t('inventory.categoryFilters', 'Filters') },
];

const getPartTypesWithTranslation = (t: any) => [
  { value: "oem", label: t('inventory.partTypeOEM', 'OEM') },
  { value: "generic", label: t('inventory.partTypeGeneric', 'Generic') },
  { value: "consumable", label: t('inventory.partTypeConsumable', 'Consumable') },
];

export default function SpareParts() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: spareParts = [], isLoading, error } = useQuery<SparePart[]>({
    queryKey: ["/api/spare-parts"],
  });

  const CATEGORIES = getCategoriesWithTranslation(t);
  const PART_TYPES = getPartTypesWithTranslation(t);

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
        title: t('common.success', 'Success'),
        description: t('inventory.sparePartCreated', 'Spare part created successfully'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error', 'Error'),
        description: error.message || t('inventory.failedToCreateSparePart', 'Failed to create spare part'),
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
        title: t('common.success', 'Success'),
        description: t('inventory.sparePartDeleted', 'Spare part deleted successfully'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error', 'Error'),
        description: error.message || t('inventory.failedToDeleteSparePart', 'Failed to delete spare part'),
        variant: "destructive",
      });
    },
  });

  const handleCreate = (data: CreateFormData) => {
    createMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('inventory.confirmDeleteSparePart', 'Are you sure you want to delete this spare part?'))) {
      deleteMutation.mutate(id);
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      engine: "bg-gray-300 text-gray-800",
      brakes: "bg-gray-200 text-gray-700",
      electrical: "bg-gray-300 text-gray-800",
      fluids: "bg-gray-400 text-gray-900",
      filters: "bg-gray-200 text-gray-700",
    };
    return colors[category] || "bg-gray-100 dark:bg-salis-gray-dark text-gray-800 dark:text-gray-200";
  };

  const getPartTypeBadgeColor = (partType: string) => {
    const colors: Record<string, string> = {
      oem: "bg-gray-300 text-gray-800",
      generic: "bg-gray-200 text-gray-700",
      consumable: "bg-gray-400 text-gray-900",
    };
    return colors[partType] || "bg-gray-100 dark:bg-salis-gray-dark text-gray-800 dark:text-gray-200";
  };

  return (
    <StandardPageLayout
      title={t('inventory.sparePartsInventory', 'Spare Parts & Inventory')}
      description={t('inventory.manageSparePartsDesc', 'Manage spare parts and inventory levels')}
      icon={Package}
      actions={[
        {
          label: t('inventory.addSparePart', 'Add Spare Part'),
          icon: Plus,
          onClick: () => setIsCreateOpen(true),
        },
      ]}
    >
      <div className="flex gap-4 items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder={t('inventory.searchByNameSku', 'Search by name, SKU, or brand...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-3"
            data-testid="input-search"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]" data-testid="select-category-filter">
            <SelectValue placeholder={t('inventory.filterByCategory', 'Filter by category')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('inventory.allCategories', 'All Categories')}</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg font-medium mb-2">{t('inventory.failedToLoadSpareParts', 'Failed to load spare parts')}</p>
            <p className="text-gray-900 dark:text-white/60 mb-4">
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/spare-parts"] })} data-testid="button-retry">
              {t('common.retry', 'Retry')}
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
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-900 dark:text-white/60 mb-4" />
            <p className="text-lg font-medium mb-2">{t('inventory.noSparePartsFound', 'No spare parts found')}</p>
            <p className="text-gray-900 dark:text-white/60 mb-4">
              {searchQuery || categoryFilter !== "all" 
                ? t('inventory.tryAdjustingFilters', 'Try adjusting your filters') 
                : t('inventory.getStartedAddingSparePart', 'Get started by adding your first spare part')}
            </p>
            {!searchQuery && categoryFilter === "all" && (
              <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-first">
                <Plus className="mr-2 h-4 w-4" />
                {t('inventory.addSparePart', 'Add Spare Part')}
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
                        {t('common.view', 'View Details')}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-gray-800 dark:text-gray-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(part.id);
                        }}
                        data-testid={`button-delete-${part.id}`}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('common.delete', 'Delete')}
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
                  <p className="text-sm text-gray-900 dark:text-white/60 line-clamp-2">
                    {part.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-900 dark:text-white/60">
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

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('inventory.addSparePart', 'Add Spare Part')}</DialogTitle>
            <DialogDescription>
              {t('inventory.createSparePartDesc', 'Create a new spare part for your inventory')}
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
                      <FormLabel>{t('inventory.partName', 'Part Name')} *</FormLabel>
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
                      <FormLabel>{t('inventory.sku', 'SKU')} *</FormLabel>
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
                    <FormLabel>{t('common.description', 'Description')}</FormLabel>
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
                      <FormLabel>{t('common.category', 'Category')} *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder={t('inventory.selectCategory', 'Select category')} />
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
                      <FormLabel>{t('inventory.subcategory', 'Subcategory')}</FormLabel>
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
                      <FormLabel>{t('inventory.partType', 'Part Type')} *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-part-type">
                            <SelectValue placeholder={t('inventory.selectType', 'Select type')} />
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
                      <FormLabel>{t('inventory.unitOfMeasure', 'Unit of Measure')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger data-testid="select-unit">
                            <SelectValue placeholder={t('inventory.selectUnit', 'Select unit')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pcs">{t('inventory.pieces', 'Pieces')}</SelectItem>
                          <SelectItem value="liters">{t('inventory.liters', 'Liters')}</SelectItem>
                          <SelectItem value="kg">{t('inventory.kilograms', 'Kilograms')}</SelectItem>
                          <SelectItem value="boxes">{t('inventory.boxes', 'Boxes')}</SelectItem>
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
                      <FormLabel>{t('inventory.brand', 'Brand')}</FormLabel>
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
                      <FormLabel>{t('inventory.manufacturer', 'Manufacturer')}</FormLabel>
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
                    <FormLabel>{t('inventory.barcode', 'Barcode')}</FormLabel>
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
                    <FormLabel>{t('common.notes', 'Notes')}</FormLabel>
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
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  data-testid="button-submit"
                >
                  {createMutation.isPending ? t('common.creating', 'Creating...') : t('inventory.createSparePart', 'Create Spare Part')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
                  <p className="text-sm font-medium text-gray-900 dark:text-white/60">Name</p>
                  <p className="text-sm" data-testid="detail-name">{selectedPart.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white/60">SKU</p>
                  <p className="text-sm" data-testid="detail-sku">{selectedPart.sku}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white/60">Category</p>
                  <Badge className={getCategoryBadgeColor(selectedPart.category)}>
                    {selectedPart.category}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white/60">Part Type</p>
                  <Badge className={getPartTypeBadgeColor(selectedPart.partType)}>
                    {selectedPart.partType}
                  </Badge>
                </div>
              </div>

              {selectedPart.description && (
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white/60">Description</p>
                  <p className="text-sm" data-testid="detail-description">{selectedPart.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedPart.brand && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white/60">Brand</p>
                    <p className="text-sm">{selectedPart.brand}</p>
                  </div>
                )}
                {selectedPart.manufacturer && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white/60">Manufacturer</p>
                    <p className="text-sm">{selectedPart.manufacturer}</p>
                  </div>
                )}
                {selectedPart.barcode && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white/60">Barcode</p>
                    <p className="text-sm">{selectedPart.barcode}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white/60">Unit of Measure</p>
                  <p className="text-sm">{selectedPart.unitOfMeasure}</p>
                </div>
              </div>

              {selectedPart.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white/60">Notes</p>
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
    </StandardPageLayout>
  );
}
