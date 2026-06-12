import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { TabsPageLayout, type TabConfig } from "@/components/layouts";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  BookOpen, 
  FolderPlus, 
  Eye, 
  ThumbsUp, 
  Search, 
  FileText, 
  Download, 
  File, 
  FileImage, 
  FileSpreadsheet,
  FilePlus,
  Trash2,
  Calendar
} from "lucide-react";

const categorySchema = z.object({
  categoryName: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().min(0).default(0),
});

const articleSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

const documentSchema = z.object({
  categoryId: z.string().optional(),
  documentName: z.string().min(1, "Document name is required"),
  description: z.string().optional(),
  fileUrl: z.string().min(1, "File URL is required"),
  fileName: z.string().min(1, "File name is required"),
  mimeType: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;
type ArticleFormData = z.infer<typeof articleSchema>;
type DocumentFormData = z.infer<typeof documentSchema>;

const getFileIcon = (mimeType: string | undefined) => {
  if (!mimeType) return File;
  if (mimeType.includes("image")) return FileImage;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return FileSpreadsheet;
  if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")) return FileText;
  return File;
};

const formatFileSize = (bytes: number | undefined) => {
  if (!bytes) return "Unknown";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "Unknown";
  return new Date(dateString).toLocaleDateString();
};

export default function KnowledgeBase() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("articles");
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isArticleDialogOpen, setIsArticleDialogOpen] = useState(false);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [documentSearchQuery, setDocumentSearchQuery] = useState("");

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<any[]>({
    queryKey: ["/api/knowledge-base/categories"],
  });

  const { data: articles = [], isLoading: articlesLoading } = useQuery<any[]>({
    queryKey: ["/api/knowledge-base/articles"],
  });

  const { data: documents = [], isLoading: documentsLoading } = useQuery<any[]>({
    queryKey: ["/api/documents"],
  });

  const { data: documentCategories = [] } = useQuery<any[]>({
    queryKey: ["/api/document-categories"],
  });

  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      categoryName: "",
      description: "",
      icon: "",
      sortOrder: 0,
    }
  });

  const articleForm = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      categoryId: "",
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      tags: [],
      isPublished: true,
      isFeatured: false,
    }
  });

  const documentForm = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      categoryId: "",
      documentName: "",
      description: "",
      fileUrl: "",
      fileName: "",
      mimeType: "",
      tags: [],
    }
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: CategoryFormData) => apiRequest("POST", "/api/knowledge-base/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-base/categories"] });
      toast({ title: t('common.success', 'Success'), description: t('knowledgeBase.categoryCreated', 'Category created successfully') });
      setIsCategoryDialogOpen(false);
      categoryForm.reset();
    },
    onError: () => {
      toast({ title: t('common.error', 'Error'), description: t('knowledgeBase.categoryCreateFailed', 'Failed to create category'), variant: "destructive" });
    }
  });

  const createArticleMutation = useMutation({
    mutationFn: (data: ArticleFormData) => apiRequest("POST", "/api/knowledge-base/articles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-base/articles"] });
      toast({ title: t('common.success', 'Success'), description: t('knowledgeBase.articleCreated', 'Article created successfully') });
      setIsArticleDialogOpen(false);
      articleForm.reset();
    },
    onError: () => {
      toast({ title: t('common.error', 'Error'), description: t('knowledgeBase.articleCreateFailed', 'Failed to create article'), variant: "destructive" });
    }
  });

  const createDocumentMutation = useMutation({
    mutationFn: (data: DocumentFormData) => apiRequest("POST", "/api/documents", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: t('common.success', 'Success'), description: t('knowledgeBase.documentAdded', 'Document added successfully') });
      setIsDocumentDialogOpen(false);
      documentForm.reset();
    },
    onError: () => {
      toast({ title: t('common.error', 'Error'), description: t('knowledgeBase.documentAddFailed', 'Failed to add document'), variant: "destructive" });
    }
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/documents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: t('common.success', 'Success'), description: t('knowledgeBase.documentDeleted', 'Document deleted successfully') });
    },
    onError: () => {
      toast({ title: t('common.error', 'Error'), description: t('knowledgeBase.documentDeleteFailed', 'Failed to delete document'), variant: "destructive" });
    }
  });

  const filteredArticles = articles.filter((article: any) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDocuments = documents.filter((doc: any) =>
    doc.documentName?.toLowerCase().includes(documentSearchQuery.toLowerCase()) ||
    doc.description?.toLowerCase().includes(documentSearchQuery.toLowerCase()) ||
    doc.fileName?.toLowerCase().includes(documentSearchQuery.toLowerCase())
  );

  const tabs: TabConfig[] = [
    {
      id: "articles",
      label: t('knowledgeBase.articles', 'Articles'),
      icon: BookOpen,
      badge: articles.length,
      content: (
        <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('knowledgeBase.knowledgeArticles', 'Knowledge Articles')}</CardTitle>
            <CardDescription className="text-[#64748B]">
              {t('knowledgeBase.articlesDescription', 'All documentation and FAQ articles')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {articlesLoading ? (
              <p className="text-[#64748B]" data-testid="text-loading">{t('knowledgeBase.loadingArticles', 'Loading articles...')}</p>
            ) : filteredArticles.length === 0 ? (
              <p className="text-[#64748B]" data-testid="text-no-articles">{t('knowledgeBase.noArticlesFound', 'No articles found')}</p>
            ) : (
              <div className="grid gap-4">
                {filteredArticles.map((article: any) => (
                  <Card
                    key={article.id}
                    className="border-[#E2E8F0] dark:border-[#232A36] cursor-pointer hover:border-[#0A5ED7] dark:hover:border-[#0A5ED7] transition-colors bg-white dark:bg-[#151A23]"
                    onClick={() => setSelectedArticle(article)}
                    data-testid={`card-article-${article.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-medium text-[#0B1F3B] dark:text-white" data-testid={`text-article-title-${article.id}`}>
                              {article.title}
                            </h3>
                            {article.isFeatured && (
                              <Badge className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" data-testid={`badge-featured-${article.id}`}>
                                {t('knowledgeBase.featured', 'Featured')}
                              </Badge>
                            )}
                            {article.isPublished ? (
                              <Badge className="bg-green-600 text-white" data-testid={`badge-published-${article.id}`}>
                                {t('knowledgeBase.published', 'Published')}
                              </Badge>
                            ) : (
                              <Badge className="bg-[#64748B] text-white" data-testid={`badge-draft-${article.id}`}>
                                {t('common.draft', 'Draft')}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-[#64748B] mb-3" data-testid={`text-article-excerpt-${article.id}`}>
                            {article.excerpt || t('knowledgeBase.noExcerpt', 'No excerpt available')}
                          </p>
                          <div className="flex gap-4 text-sm text-[#64748B]">
                            <span className="flex items-center gap-1" data-testid={`text-views-${article.id}`}>
                              <Eye className="h-4 w-4" /> {article.viewCount || 0} {t('knowledgeBase.views', 'views')}
                            </span>
                            <span className="flex items-center gap-1" data-testid={`text-helpful-${article.id}`}>
                              <ThumbsUp className="h-4 w-4" /> {article.helpfulCount || 0} {t('knowledgeBase.helpful', 'helpful')}
                            </span>
                          </div>
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
      id: "library",
      label: t('knowledgeBase.documentLibrary', 'Document Library'),
      icon: FileText,
      badge: documents.length,
      content: (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="relative max-w-md flex-1 mr-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <Input
                placeholder={t('knowledgeBase.searchDocuments', 'Search documents...')}
                value={documentSearchQuery}
                onChange={(e) => setDocumentSearchQuery(e.target.value)}
                className="pl-10 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="input-search-documents"
              />
            </div>
            <Button
              onClick={() => setIsDocumentDialogOpen(true)}
              className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
              data-testid="button-add-document"
            >
              <FilePlus className="mr-2 h-4 w-4" />
              {t('knowledgeBase.addDocument', 'Add Document')}
            </Button>
          </div>
          <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('knowledgeBase.documentLibrary', 'Document Library')}</CardTitle>
              <CardDescription className="text-[#64748B]">
                {t('knowledgeBase.documentLibraryDescription', 'Manage and organize your documents, manuals, and files')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <p className="text-[#64748B]" data-testid="text-loading-documents">{t('knowledgeBase.loadingDocuments', 'Loading documents...')}</p>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-[#E2E8F0] dark:text-[#232A36] mb-4" />
                  <p className="text-[#64748B]" data-testid="text-no-documents">{t('knowledgeBase.noDocumentsFound', 'No documents found')}</p>
                  <p className="text-sm text-[#64748B] mt-1">
                    {t('knowledgeBase.addFirstDocument', 'Add your first document to get started')}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                      <TableHead className="text-[#64748B]">{t('knowledgeBase.document', 'Document')}</TableHead>
                      <TableHead className="text-[#64748B]">{t('common.type', 'Type')}</TableHead>
                      <TableHead className="text-[#64748B]">{t('knowledgeBase.size', 'Size')}</TableHead>
                      <TableHead className="text-[#64748B]">{t('knowledgeBase.uploaded', 'Uploaded')}</TableHead>
                      <TableHead className="text-[#64748B]">{t('common.status', 'Status')}</TableHead>
                      <TableHead className="text-[#64748B] text-right">{t('common.actions', 'Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc: any) => {
                      const FileIcon = getFileIcon(doc.mimeType);
                      return (
                        <TableRow 
                          key={doc.id} 
                          className="border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]"
                          data-testid={`row-document-${doc.id}`}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <FileIcon className="h-5 w-5 text-[#64748B]" />
                              <div>
                                <p className="font-medium text-[#0B1F3B] dark:text-white" data-testid={`text-doc-name-${doc.id}`}>
                                  {doc.documentName}
                                </p>
                                {doc.description && (
                                  <p className="text-xs text-[#64748B]">
                                    {doc.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs border-[#E2E8F0] dark:border-[#232A36]">
                              {doc.mimeType?.split("/")[1]?.toUpperCase() || "FILE"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[#64748B] text-sm">
                            {formatFileSize(doc.fileSize)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-[#64748B] text-sm">
                              <Calendar className="h-3 w-3" />
                              {formatDate(doc.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={doc.status === "active" ? "bg-green-600 text-white" : "bg-[#64748B] text-white"}
                            >
                              {doc.status || t('common.active', 'Active')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {doc.fileUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(doc.fileUrl, "_blank")}
                                  className="text-[#64748B] hover:text-[#0A5ED7] border-[#E2E8F0] dark:border-[#232A36]"
                                  data-testid={`button-download-${doc.id}`}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteDocumentMutation.mutate(doc.id)}
                                className="text-[#F97316] hover:text-red-700 hover:border-red-300 border-[#E2E8F0] dark:border-[#232A36]"
                                data-testid={`button-delete-${doc.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      ),
    },
    {
      id: "categories",
      label: t('knowledgeBase.categories', 'Categories'),
      icon: FolderPlus,
      badge: categories.length,
      content: (
        <>
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => setIsCategoryDialogOpen(true)}
              className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
              data-testid="button-create-category"
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              {t('knowledgeBase.createCategory', 'Create Category')}
            </Button>
          </div>
          <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('knowledgeBase.articleCategories', 'Article Categories')}</CardTitle>
              <CardDescription className="text-[#64748B]">
                {t('knowledgeBase.organizeArticles', 'Organize articles into categories')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <p className="text-[#64748B]" data-testid="text-loading-categories">{t('knowledgeBase.loadingCategories', 'Loading categories...')}</p>
              ) : categories.length === 0 ? (
                <p className="text-[#64748B]" data-testid="text-no-categories">{t('knowledgeBase.noCategoriesFound', 'No categories found')}</p>
              ) : (
                <div className="grid gap-4">
                  {categories.map((category: any) => (
                    <Card key={category.id} className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]" data-testid={`card-category-${category.id}`}>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-medium text-[#0B1F3B] dark:text-white mb-2" data-testid={`text-category-name-${category.id}`}>
                          {category.categoryName}
                        </h3>
                        <p className="text-sm text-[#64748B]" data-testid={`text-category-description-${category.id}`}>
                          {category.description || t('knowledgeBase.noDescription', 'No description')}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ),
    },
  ];

  return (
    <>
      <TabsPageLayout
        title={t('knowledgeBase.title', 'Knowledge Base & Library')}
        description={t('knowledgeBase.pageDescription', 'Manage documentation articles, FAQ resources, and document library')}
        icon={BookOpen}
        primaryAction={{
          label: t('knowledgeBase.createArticle', 'Create Article'),
          onClick: () => setIsArticleDialogOpen(true),
          icon: BookOpen,
          testId: "button-create-article",
        }}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        headerContent={
          activeTab === "articles" ? (
            <div className="mb-6 relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <Input
                placeholder={t('knowledgeBase.searchArticles', 'Search articles...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="input-search"
              />
            </div>
          ) : undefined
        }
      />

      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('knowledgeBase.createCategory', 'Create Category')}</DialogTitle>
            <DialogDescription className="text-[#64748B]">
              {t('knowledgeBase.createCategoryDescription', 'Create a new category for knowledge base articles')}
            </DialogDescription>
          </DialogHeader>
          <Form {...categoryForm}>
            <form onSubmit={categoryForm.handleSubmit((data) => createCategoryMutation.mutate(data))} className="space-y-4">
              <FormField
                control={categoryForm.control}
                name="categoryName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('knowledgeBase.categoryName', 'Category Name')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('knowledgeBase.categoryNamePlaceholder', 'Getting Started')} data-testid="input-category-name" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" />
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
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.description', 'Description')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t('knowledgeBase.descriptionPlaceholder', 'Category description...')} rows={3} data-testid="input-category-description" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCategoryDialogOpen(false)} className="border-[#E2E8F0] dark:border-[#232A36]">
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" disabled={createCategoryMutation.isPending} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" data-testid="button-submit-category">
                  {createCategoryMutation.isPending ? t('common.creating', 'Creating...') : t('common.create', 'Create')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isArticleDialogOpen} onOpenChange={setIsArticleDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('knowledgeBase.createArticle', 'Create Article')}</DialogTitle>
            <DialogDescription className="text-[#64748B]">
              {t('knowledgeBase.createArticleDescription', 'Create a new knowledge base article')}
            </DialogDescription>
          </DialogHeader>
          <Form {...articleForm}>
            <form onSubmit={articleForm.handleSubmit((data) => createArticleMutation.mutate(data))} className="space-y-4">
              <FormField
                control={articleForm.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('knowledgeBase.category', 'Category')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-article-category" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                          <SelectValue placeholder={t('knowledgeBase.selectCategory', 'Select a category')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                        {categories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>{category.categoryName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={articleForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('knowledgeBase.title', 'Title')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('knowledgeBase.titlePlaceholder', 'Article title')} data-testid="input-article-title" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={articleForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('knowledgeBase.slug', 'Slug')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('knowledgeBase.slugPlaceholder', 'article-slug')} data-testid="input-article-slug" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={articleForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('knowledgeBase.content', 'Content')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t('knowledgeBase.contentPlaceholder', 'Article content...')} rows={6} data-testid="input-article-content" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsArticleDialogOpen(false)} className="border-[#E2E8F0] dark:border-[#232A36]">
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" disabled={createArticleMutation.isPending} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" data-testid="button-submit-article">
                  {createArticleMutation.isPending ? t('common.creating', 'Creating...') : t('common.create', 'Create')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('knowledgeBase.addDocument', 'Add Document')}</DialogTitle>
            <DialogDescription className="text-[#64748B]">
              {t('knowledgeBase.addDocumentDescription', 'Add a new document to the library')}
            </DialogDescription>
          </DialogHeader>
          <Form {...documentForm}>
            <form onSubmit={documentForm.handleSubmit((data) => createDocumentMutation.mutate(data))} className="space-y-4">
              <FormField
                control={documentForm.control}
                name="documentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('knowledgeBase.documentName', 'Document Name')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('knowledgeBase.documentNamePlaceholder', 'Document name')} data-testid="input-document-name" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={documentForm.control}
                name="fileUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('knowledgeBase.fileUrl', 'File URL')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('knowledgeBase.fileUrlPlaceholder', 'https://...')} data-testid="input-file-url" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={documentForm.control}
                name="fileName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('knowledgeBase.fileName', 'File Name')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('knowledgeBase.fileNamePlaceholder', 'document.pdf')} data-testid="input-file-name" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDocumentDialogOpen(false)} className="border-[#E2E8F0] dark:border-[#232A36]">
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" disabled={createDocumentMutation.isPending} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" data-testid="button-submit-document">
                  {createDocumentMutation.isPending ? t('common.adding', 'Adding...') : t('common.add', 'Add')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedArticle !== null} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="sm:max-w-[700px] bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          {selectedArticle && (
            <>
              <DialogHeader>
                <DialogTitle className="text-[#0B1F3B] dark:text-white">{selectedArticle.title}</DialogTitle>
              </DialogHeader>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-[#64748B]">{selectedArticle.content}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
