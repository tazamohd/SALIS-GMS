import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { BookOpen, FolderPlus, Eye, ThumbsUp, Search } from "lucide-react";

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

type CategoryFormData = z.infer<typeof categorySchema>;
type ArticleFormData = z.infer<typeof articleSchema>;

export default function KnowledgeBase() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("articles");
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isArticleDialogOpen, setIsArticleDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<any[]>({
    queryKey: ["/api/knowledge-base/categories"],
  });

  const { data: articles = [], isLoading: articlesLoading } = useQuery<any[]>({
    queryKey: ["/api/knowledge-base/articles"],
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

  const createCategoryMutation = useMutation({
    mutationFn: (data: CategoryFormData) => apiRequest("POST", "/api/knowledge-base/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-base/categories"] });
      toast({ title: "Success", description: "Category created successfully" });
      setIsCategoryDialogOpen(false);
      categoryForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create category", variant: "destructive" });
    }
  });

  const createArticleMutation = useMutation({
    mutationFn: (data: ArticleFormData) => apiRequest("POST", "/api/knowledge-base/articles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-base/articles"] });
      toast({ title: "Success", description: "Article created successfully" });
      setIsArticleDialogOpen(false);
      articleForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create article", variant: "destructive" });
    }
  });

  const filteredArticles = articles.filter((article: any) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs: TabConfig[] = [
    {
      id: "articles",
      label: "Articles",
      icon: BookOpen,
      badge: articles.length,
      content: (
        <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
          <CardHeader>
            <CardTitle className="font-montserrat text-salis-black dark:text-white">Knowledge Articles</CardTitle>
            <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              All documentation and FAQ articles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {articlesLoading ? (
              <p className="text-salis-gray font-poppins" data-testid="text-loading">Loading articles...</p>
            ) : filteredArticles.length === 0 ? (
              <p className="text-salis-gray font-poppins" data-testid="text-no-articles">No articles found</p>
            ) : (
              <div className="grid gap-4">
                {filteredArticles.map((article: any) => (
                  <Card
                    key={article.id}
                    className="border-salis-gray-light dark:border-salis-gray-dark cursor-pointer hover:border-salis-gray dark:hover:border-salis-gray transition-colors"
                    onClick={() => setSelectedArticle(article)}
                    data-testid={`card-article-${article.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-montserrat font-medium text-salis-black dark:text-white" data-testid={`text-article-title-${article.id}`}>
                              {article.title}
                            </h3>
                            {article.isFeatured && (
                              <Badge className="bg-salis-black text-white" data-testid={`badge-featured-${article.id}`}>
                                Featured
                              </Badge>
                            )}
                            {article.isPublished ? (
                              <Badge className="bg-green-500 text-white" data-testid={`badge-published-${article.id}`}>
                                Published
                              </Badge>
                            ) : (
                              <Badge className="bg-salis-gray text-white" data-testid={`badge-draft-${article.id}`}>
                                Draft
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins mb-3" data-testid={`text-article-excerpt-${article.id}`}>
                            {article.excerpt || "No excerpt available"}
                          </p>
                          <div className="flex gap-4 text-sm text-salis-gray dark:text-salis-gray-light">
                            <span className="flex items-center gap-1" data-testid={`text-views-${article.id}`}>
                              <Eye className="h-4 w-4" /> {article.viewCount || 0} views
                            </span>
                            <span className="flex items-center gap-1" data-testid={`text-helpful-${article.id}`}>
                              <ThumbsUp className="h-4 w-4" /> {article.helpfulCount || 0} helpful
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
      id: "categories",
      label: "Categories",
      icon: FolderPlus,
      badge: categories.length,
      content: (
        <>
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => setIsCategoryDialogOpen(true)}
              className="bg-salis-black hover:bg-salis-gray-dark text-white font-poppins"
              data-testid="button-create-category"
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              Create Category
            </Button>
          </div>
          <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
            <CardHeader>
              <CardTitle className="font-montserrat text-salis-black dark:text-white">Article Categories</CardTitle>
              <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
                Organize articles into categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <p className="text-salis-gray font-poppins" data-testid="text-loading-categories">Loading categories...</p>
              ) : categories.length === 0 ? (
                <p className="text-salis-gray font-poppins" data-testid="text-no-categories">No categories found</p>
              ) : (
                <div className="grid gap-4">
                  {categories.map((category: any) => (
                    <Card key={category.id} className="border-salis-gray-light dark:border-salis-gray-dark" data-testid={`card-category-${category.id}`}>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-montserrat font-medium text-salis-black dark:text-white mb-2" data-testid={`text-category-name-${category.id}`}>
                          {category.categoryName}
                        </h3>
                        <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins" data-testid={`text-category-description-${category.id}`}>
                          {category.description || "No description"}
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
        title="Knowledge Base"
        description="Manage documentation articles and FAQ resources"
        icon={BookOpen}
        primaryAction={{
          label: "Create Article",
          onClick: () => setIsArticleDialogOpen(true),
          icon: BookOpen,
          testId: "button-create-article",
        }}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        headerContent={
          <div className="mb-6 relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-salis-gray" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        }
      />

      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="bg-white dark:bg-salis-black">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-salis-black dark:text-white">Create Category</DialogTitle>
            <DialogDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              Add a new article category
            </DialogDescription>
          </DialogHeader>
          <Form {...categoryForm}>
            <form onSubmit={categoryForm.handleSubmit((data) => createCategoryMutation.mutate(data))} className="space-y-4">
              <FormField
                control={categoryForm.control}
                name="categoryName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Getting Started" data-testid="input-category-name" />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Category description..." data-testid="input-category-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={categoryForm.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-sort-order"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createCategoryMutation.isPending} data-testid="button-submit-category">
                  {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isArticleDialogOpen} onOpenChange={setIsArticleDialogOpen}>
        <DialogContent className="bg-white dark:bg-salis-black max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-salis-black dark:text-white">Create Article</DialogTitle>
            <DialogDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              Add a new knowledge base article
            </DialogDescription>
          </DialogHeader>
          <Form {...articleForm}>
            <form onSubmit={articleForm.handleSubmit((data) => createArticleMutation.mutate(data))} className="space-y-4">
              <FormField
                control={articleForm.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.categoryName}
                          </SelectItem>
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
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="How to..." data-testid="input-title" />
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
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="how-to-example" data-testid="input-slug" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={articleForm.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Brief summary..." data-testid="input-excerpt" />
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
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Full article content..." rows={6} data-testid="input-content" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createArticleMutation.isPending} data-testid="button-submit-article">
                  {createArticleMutation.isPending ? "Creating..." : "Create Article"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
