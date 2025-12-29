import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TabsPageLayout } from "@/components/layouts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Folder, AlertTriangle, Archive } from "lucide-react";
import { format } from "date-fns";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  iconName: z.string().optional(),
  colorCode: z.string().optional(),
});

const documentSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  documentName: z.string().min(1, "Document name is required"),
  documentType: z.string().min(1, "Document type is required"),
  documentUrl: z.string().min(1, "Document URL is required"),
  relatedType: z.enum(["customer", "vehicle", "job_card", "invoice", "general"]),
  relatedId: z.string().optional(),
  expirationDate: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["active", "archived", "expired"]).default("active"),
});

type CategoryFormData = z.infer<typeof categorySchema>;
type DocumentFormData = z.infer<typeof documentSchema>;

export default function DocumentManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("documents");
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] = useState(false);
  const [isCreateDocumentDialogOpen, setIsCreateDocumentDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<any[]>({
    queryKey: ["/api/document-categories"],
  });

  const { data: documents = [], isLoading: documentsLoading } = useQuery<any[]>({
    queryKey: ["/api/documents", categoryFilter, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (categoryFilter) params.append("categoryId", categoryFilter);
      if (statusFilter) params.append("status", statusFilter);
      return fetch(`/api/documents?${params}`).then(r => r.json());
    }
  });

  const { data: expiringDocuments = [] } = useQuery<any[]>({
    queryKey: ["/api/documents/expiring"],
    queryFn: () => fetch("/api/documents/expiring?daysAhead=30").then(r => r.json()),
  });

  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      iconName: "FileText",
      colorCode: "#010101",
    }
  });

  const documentForm = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      categoryId: "",
      documentName: "",
      documentType: "",
      documentUrl: "",
      relatedType: "general",
      relatedId: "",
      expirationDate: "",
      description: "",
      status: "active",
    }
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: CategoryFormData) => apiRequest("POST", "/api/document-categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/document-categories"] });
      toast({ title: t('common.success', 'Success'), description: t('documents.categoryCreated', 'Category created successfully') });
      setIsCreateCategoryDialogOpen(false);
      categoryForm.reset();
    },
    onError: () => {
      toast({ title: t('common.error', 'Error'), description: t('documents.categoryCreateFailed', 'Failed to create category'), variant: "destructive" });
    }
  });

  const createDocumentMutation = useMutation({
    mutationFn: (data: DocumentFormData) => apiRequest("POST", "/api/documents", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: t('common.success', 'Success'), description: t('documents.documentCreated', 'Document created successfully') });
      setIsCreateDocumentDialogOpen(false);
      documentForm.reset();
    },
    onError: () => {
      toast({ title: t('common.error', 'Error'), description: t('documents.documentCreateFailed', 'Failed to create document'), variant: "destructive" });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/document-categories/${id}`, undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/document-categories"] });
      toast({ title: t('common.success', 'Success'), description: t('documents.categoryDeleted', 'Category deleted successfully') });
    }
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/documents/${id}`, undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: t('common.success', 'Success'), description: t('documents.documentDeleted', 'Document deleted successfully') });
    }
  });

  const onSubmitCategory = (data: CategoryFormData) => {
    createCategoryMutation.mutate(data);
  };

  const onSubmitDocument = (data: DocumentFormData) => {
    createDocumentMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-salis-black text-white",
      archived: "bg-salis-gray text-white",
      expired: "bg-salis-gray-light text-salis-black",
    };
    return colors[status] || "bg-salis-gray text-white";
  };

  const isExpiringSoon = (expirationDate: string | null) => {
    if (!expirationDate) return false;
    const expDate = new Date(expirationDate);
    const daysUntilExpiry = Math.ceil((expDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  const tabs = [
    {
      id: "documents",
      label: t('documents.documents', 'Documents'),
      icon: FileText,
      content: (
        <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
          <CardHeader>
            <CardTitle className="font-montserrat text-salis-black dark:text-white">{t('documents.documentLibrary', 'Document Library')}</CardTitle>
            <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              {t('documents.manageDocuments', 'Manage all your documents in one place')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]" data-testid="select-category-filter">
                  <SelectValue placeholder={t('documents.filterByCategory', 'Filter by category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('documents.allCategories', 'All Categories')}</SelectItem>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]" data-testid="select-status-filter">
                  <SelectValue placeholder={t('documents.filterByStatus', 'Filter by status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('documents.allStatuses', 'All Statuses')}</SelectItem>
                  <SelectItem value="active">{t('common.active', 'Active')}</SelectItem>
                  <SelectItem value="archived">{t('documents.archived', 'Archived')}</SelectItem>
                  <SelectItem value="expired">{t('documents.expired', 'Expired')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {documentsLoading ? (
              <p className="text-salis-gray font-poppins" data-testid="text-loading">{t('documents.loadingDocuments', 'Loading documents...')}</p>
            ) : documents.length === 0 ? (
              <p className="text-salis-gray font-poppins" data-testid="text-no-documents">{t('documents.noDocuments', 'No documents found')}</p>
            ) : (
              <div className="grid gap-4">
                {documents.map((doc: any) => (
                  <Card 
                    key={doc.id} 
                    className="border-salis-gray-light dark:border-salis-gray-dark hover:border-salis-gray dark:hover:border-salis-gray transition-colors"
                    data-testid={`card-document-${doc.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText className="h-5 w-5 text-salis-gray dark:text-salis-gray-light" />
                            <h3 className="text-lg font-montserrat font-medium text-salis-black dark:text-white" data-testid={`text-document-name-${doc.id}`}>
                              {doc.documentName}
                            </h3>
                            <Badge className={getStatusColor(doc.status)} data-testid={`badge-status-${doc.id}`}>
                              {doc.status}
                            </Badge>
                            {isExpiringSoon(doc.expirationDate) && (
                              <Badge className="bg-salis-gray-light text-salis-black" data-testid={`badge-expiring-${doc.id}`}>
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {t('documents.expiringSoon', 'Expiring Soon')}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins mb-3" data-testid={`text-document-type-${doc.id}`}>
                            {doc.documentType}
                          </p>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-salis-gray dark:text-salis-gray-light font-poppins">{t('documents.relatedTo', 'Related To')}</p>
                              <p className="font-semibold text-salis-black dark:text-white" data-testid={`text-related-type-${doc.id}`}>
                                {doc.relatedType}
                              </p>
                            </div>
                            <div>
                              <p className="text-salis-gray dark:text-salis-gray-light font-poppins">{t('documents.uploaded', 'Uploaded')}</p>
                              <p className="font-semibold text-salis-black dark:text-white" data-testid={`text-created-${doc.id}`}>
                                {doc.createdAt ? format(new Date(doc.createdAt), "MMM dd, yyyy") : "N/A"}
                              </p>
                            </div>
                            {doc.expirationDate && (
                              <div>
                                <p className="text-salis-gray dark:text-salis-gray-light font-poppins">{t('documents.expires', 'Expires')}</p>
                                <p className="font-semibold text-salis-black dark:text-white" data-testid={`text-expiration-${doc.id}`}>
                                  {format(new Date(doc.expirationDate), "MMM dd, yyyy")}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(doc.documentUrl, "_blank")}
                            className="border-salis-gray-light dark:border-salis-gray-dark"
                            data-testid={`button-view-${doc.id}`}
                          >
                            {t('common.view', 'View')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm(t('documents.confirmDeleteDocument', 'Delete this document?'))) {
                                deleteDocumentMutation.mutate(doc.id);
                              }
                            }}
                            className="border-salis-gray-light dark:border-salis-gray-dark"
                            data-testid={`button-delete-${doc.id}`}
                          >
                            {t('common.delete', 'Delete')}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ),
    },
    {
      id: "categories",
      label: t('documents.categories', 'Categories'),
      icon: Folder,
      content: (
        <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
          <CardHeader>
            <CardTitle className="font-montserrat text-salis-black dark:text-white">{t('documents.documentCategories', 'Document Categories')}</CardTitle>
            <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              {t('documents.organizeDocuments', 'Organize documents into categories')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categoriesLoading ? (
              <p className="text-salis-gray font-poppins" data-testid="text-loading-categories">{t('documents.loadingCategories', 'Loading categories...')}</p>
            ) : categories.length === 0 ? (
              <p className="text-salis-gray font-poppins" data-testid="text-no-categories">{t('documents.noCategories', 'No categories found')}</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category: any) => (
                  <Card 
                    key={category.id} 
                    className="border-salis-gray-light dark:border-salis-gray-dark hover:border-salis-gray dark:hover:border-salis-gray transition-colors"
                    data-testid={`card-category-${category.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Folder className="h-6 w-6 text-salis-gray dark:text-salis-gray-light" />
                          <div>
                            <h3 className="font-medium text-salis-black dark:text-white" data-testid={`text-category-name-${category.id}`}>
                              {category.name}
                            </h3>
                            <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins" data-testid={`text-category-description-${category.id}`}>
                              {category.description || t('documents.noDescription', 'No description')}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(t('documents.confirmDeleteCategory', 'Delete this category?'))) {
                              deleteCategoryMutation.mutate(category.id);
                            }
                          }}
                          data-testid={`button-delete-category-${category.id}`}
                        >
                          {t('common.delete', 'Delete')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ),
    },
    {
      id: "expiring",
      label: t('documents.expiring', 'Expiring'),
      icon: AlertTriangle,
      badge: expiringDocuments.length,
      content: (
        <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
          <CardHeader>
            <CardTitle className="font-montserrat text-salis-black dark:text-white">{t('documents.expiringDocuments', 'Expiring Documents')}</CardTitle>
            <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              {t('documents.documentsExpiringWithin30Days', 'Documents expiring within the next 30 days')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expiringDocuments.length === 0 ? (
              <p className="text-salis-gray font-poppins" data-testid="text-no-expiring">{t('documents.noExpiringDocuments', 'No expiring documents')}</p>
            ) : (
              <div className="grid gap-4">
                {expiringDocuments.map((doc: any) => {
                  const daysUntilExpiry = Math.ceil((new Date(doc.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <Card 
                      key={doc.id} 
                      className="border-salis-gray-light dark:border-salis-gray-dark"
                      data-testid={`card-expiring-${doc.id}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <AlertTriangle className="h-6 w-6 text-salis-gray dark:text-salis-gray-light" />
                            <div>
                              <p className="font-semibold text-salis-black dark:text-white" data-testid={`text-expiring-name-${doc.id}`}>
                                {doc.documentName}
                              </p>
                              <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins">
                                {t('documents.expiresIn', 'Expires in')} {daysUntilExpiry} {t('documents.days', 'days')} ({format(new Date(doc.expirationDate), "MMM dd, yyyy")})
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => window.open(doc.documentUrl, "_blank")}
                            className="bg-salis-black hover:bg-salis-gray-dark text-white"
                            data-testid={`button-view-expiring-${doc.id}`}
                          >
                            {t('common.view', 'View')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <>
      <TabsPageLayout
        title={t('documents.title', 'Document Management')}
        description={t('documents.pageDescription', 'Centralized document storage with expiration tracking and access logging')}
        icon={FileText}
        tabs={tabs}
        defaultTab="documents"
        activeTab={selectedTab}
        onTabChange={setSelectedTab}
        secondaryActions={[
          {
            label: t('documents.newCategory', 'New Category'),
            icon: Folder,
            onClick: () => setIsCreateCategoryDialogOpen(true),
            variant: "outline",
            testId: "button-create-category",
          },
          {
            label: t('documents.uploadDocument', 'Upload Document'),
            icon: FileText,
            onClick: () => setIsCreateDocumentDialogOpen(true),
            variant: "default",
            testId: "button-create-document",
          },
        ]}
      />

      <Dialog open={isCreateCategoryDialogOpen} onOpenChange={setIsCreateCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#010101] border-salis-gray-light dark:border-salis-gray-dark">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-salis-black dark:text-white">{t('documents.createDocumentCategory', 'Create Document Category')}</DialogTitle>
            <DialogDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              {t('documents.createCategoryDescription', 'Create a new category to organize your documents')}
            </DialogDescription>
          </DialogHeader>
          <Form {...categoryForm}>
            <form onSubmit={categoryForm.handleSubmit(onSubmitCategory)} className="space-y-4">
              <FormField
                control={categoryForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white font-poppins">{t('documents.categoryName', 'Category Name')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('documents.categoryNamePlaceholder', 'Insurance Documents')} data-testid="input-category-name" className="bg-white dark:bg-[#010101]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={categoryForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white font-poppins">{t('common.description', 'Description')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t('documents.descriptionPlaceholder', 'For storing insurance-related documents...')} rows={3} data-testid="input-category-description" className="bg-white dark:bg-[#010101]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateCategoryDialogOpen(false)}
                  className="border-salis-gray-light dark:border-salis-gray-dark"
                  data-testid="button-cancel-category"
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={createCategoryMutation.isPending}
                  className="bg-salis-black hover:bg-salis-gray-dark text-white"
                  data-testid="button-submit-category"
                >
                  {createCategoryMutation.isPending ? t('documents.creating', 'Creating...') : t('documents.createCategory', 'Create Category')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateDocumentDialogOpen} onOpenChange={setIsCreateDocumentDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-[#010101] border-salis-gray-light dark:border-salis-gray-dark">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-salis-black dark:text-white">{t('documents.uploadDocument', 'Upload Document')}</DialogTitle>
            <DialogDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              {t('documents.addDocumentDescription', 'Add a new document to your library')}
            </DialogDescription>
          </DialogHeader>
          <Form {...documentForm}>
            <form onSubmit={documentForm.handleSubmit(onSubmitDocument)} className="space-y-4">
              <FormField
                control={documentForm.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white font-poppins">{t('common.category', 'Category')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-document-category">
                          <SelectValue placeholder={t('documents.selectCategory', 'Select category')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={documentForm.control}
                name="documentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white font-poppins">{t('documents.documentName', 'Document Name')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('documents.documentNamePlaceholder', 'Vehicle Insurance Certificate')} data-testid="input-document-name" className="bg-white dark:bg-[#010101]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={documentForm.control}
                  name="documentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white font-poppins">{t('documents.documentType', 'Document Type')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('documents.documentTypePlaceholder', 'PDF, Image, etc.')} data-testid="input-document-type" className="bg-white dark:bg-[#010101]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={documentForm.control}
                  name="expirationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-salis-black dark:text-white font-poppins">{t('documents.expirationDate', 'Expiration Date')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-expiration-date" className="bg-white dark:bg-[#010101]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={documentForm.control}
                name="documentUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white font-poppins">{t('documents.documentUrl', 'Document URL')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." data-testid="input-document-url" className="bg-white dark:bg-[#010101]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={documentForm.control}
                name="relatedType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-salis-black dark:text-white font-poppins">{t('documents.relatedTo', 'Related To')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-related-type">
                          <SelectValue placeholder={t('documents.selectType', 'Select type')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">{t('documents.general', 'General')}</SelectItem>
                        <SelectItem value="customer">{t('documents.customer', 'Customer')}</SelectItem>
                        <SelectItem value="vehicle">{t('documents.vehicle', 'Vehicle')}</SelectItem>
                        <SelectItem value="job_card">{t('documents.jobCard', 'Job Card')}</SelectItem>
                        <SelectItem value="invoice">{t('documents.invoice', 'Invoice')}</SelectItem>
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
                  onClick={() => setIsCreateDocumentDialogOpen(false)}
                  className="border-salis-gray-light dark:border-salis-gray-dark"
                  data-testid="button-cancel-document"
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={createDocumentMutation.isPending}
                  className="bg-salis-black hover:bg-salis-gray-dark text-white"
                  data-testid="button-submit-document"
                >
                  {createDocumentMutation.isPending ? t('documents.uploading', 'Uploading...') : t('documents.uploadDocument', 'Upload Document')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
