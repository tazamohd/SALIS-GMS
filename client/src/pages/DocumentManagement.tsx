import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DashboardPage } from "@/components/layouts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  Upload,
  FolderOpen,
  Search,
  Download,
  Trash2,
  HardDrive,
  Files,
  Clock,
  X,
} from "lucide-react";
import { format } from "date-fns";

// ── Types ────────────────────────────────────────────────────────────

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  size: number;
  uploadedBy: string;
  date: string;
  tags: string[];
  description: string;
}

interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
  documentCount: number;
  totalSize: number;
  totalSizeFormatted: string;
  recentUploads: { id: string; name: string; date: string }[];
}

interface Stats {
  totalDocuments: number;
  totalStorage: number;
  totalStorageFormatted: string;
  byCategory: {
    category: string;
    label: string;
    count: number;
    size: number;
    sizeFormatted: string;
  }[];
}

// ── Helpers ──────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getTypeIcon(type: string) {
  switch (type.toLowerCase()) {
    case "pdf":
      return <FileText className="h-4 w-4 text-red-500" />;
    case "docx":
    case "doc":
      return <FileText className="h-4 w-4 text-blue-500" />;
    case "xlsx":
    case "xls":
      return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
    case "png":
    case "jpg":
    case "jpeg":
      return <FileImage className="h-4 w-4 text-purple-500" />;
    default:
      return <File className="h-4 w-4 text-gray-500" />;
  }
}

function getCategoryBadgeColor(category: string): string {
  const colors: Record<string, string> = {
    invoices: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    contracts: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    insurance: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    "vehicle-docs": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    "employee-docs": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    compliance: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  };
  return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    invoices: "Invoices",
    contracts: "Contracts",
    insurance: "Insurance",
    "vehicle-docs": "Vehicle Docs",
    "employee-docs": "Employee Docs",
    compliance: "Compliance",
  };
  return labels[category] || category;
}

// ── Component ────────────────────────────────────────────────────────

export default function DocumentManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Upload form state
  const [uploadName, setUploadName] = useState("");
  const [uploadType, setUploadType] = useState("pdf");
  const [uploadCategory, setUploadCategory] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadTags, setUploadTags] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  // ── Queries ──────────────────────────────────────────────────────

  const { data: documents = [], isLoading: docsLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents", searchQuery, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (categoryFilter && categoryFilter !== "all") params.append("category", categoryFilter);
      const res = await fetch(`/api/documents?${params}`);
      if (!res.ok) throw new Error("Failed to fetch documents");
      return res.json();
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/documents/categories"],
  });

  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/documents/stats"],
  });

  // ── Mutations ────────────────────────────────────────────────────

  const uploadMutation = useMutation({
    mutationFn: (data: Partial<Document>) => apiRequest("POST", "/api/documents", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents/stats"] });
      toast({ title: "Document uploaded", description: "Document metadata saved successfully." });
      // Reset form
      setUploadName("");
      setUploadType("pdf");
      setUploadCategory("");
      setUploadDescription("");
      setUploadTags("");
      setUploadedFileName("");
    },
    onError: () => {
      toast({ title: "Upload failed", description: "Failed to save document metadata.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/documents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents/stats"] });
      toast({ title: "Document deleted", description: "Document has been removed." });
    },
  });

  // ── Drag & Drop Handlers (UI only) ──────────────────────────────

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      if (!uploadName) setUploadName(file.name.replace(/\.[^.]+$/, ""));
      const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
      setUploadType(ext);
    }
  }, [uploadName]);

  const handleUploadSubmit = () => {
    if (!uploadName || !uploadCategory) {
      toast({ title: "Missing fields", description: "Name and category are required.", variant: "destructive" });
      return;
    }
    uploadMutation.mutate({
      name: uploadName,
      type: uploadType,
      category: uploadCategory,
      size: Math.floor(Math.random() * 2_000_000) + 100_000, // stub size
      tags: uploadTags.split(",").map((t) => t.trim()).filter(Boolean),
      description: uploadDescription,
    });
  };

  // ── Metrics ──────────────────────────────────────────────────────

  const metrics = [
    {
      label: "Total Documents",
      value: stats?.totalDocuments ?? documents.length,
      icon: Files,
      color: "primary",
    },
    {
      label: "Storage Used",
      value: stats?.totalStorageFormatted ?? "0 B",
      icon: HardDrive,
      color: "secondary",
    },
    {
      label: "Categories",
      value: categories.length,
      icon: FolderOpen,
      color: "tertiary",
    },
    {
      label: "Recent Uploads",
      value: documents.filter(
        (d) => new Date(d.date).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
      ).length,
      icon: Clock,
      color: "muted",
    },
  ];

  // ── Render ───────────────────────────────────────────────────────

  return (
    <DashboardPage
      title="Document Management"
      description="Centralized document storage, categorization, and management"
      icon={FileText}
      metrics={metrics}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white dark:bg-[#151A23] border border-[#E2E8F0] dark:border-[#232A36]">
          <TabsTrigger value="all" className="data-[state=active]:bg-[#0A5ED7] data-[state=active]:text-white">
            <Files className="h-4 w-4 mr-2" />
            All Documents
          </TabsTrigger>
          <TabsTrigger value="upload" className="data-[state=active]:bg-[#0A5ED7] data-[state=active]:text-white">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-[#0A5ED7] data-[state=active]:text-white">
            <FolderOpen className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
        </TabsList>

        {/* ── All Documents Tab ────────────────────────────────────── */}
        <TabsContent value="all" className="space-y-4">
          <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div>
                  <CardTitle className="text-[#0B1F3B] dark:text-white">All Documents</CardTitle>
                  <CardDescription className="text-[#64748B]">
                    Browse and manage all uploaded documents
                  </CardDescription>
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                    <Input
                      placeholder="Search documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-44 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="invoices">Invoices</SelectItem>
                      <SelectItem value="contracts">Contracts</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="vehicle-docs">Vehicle Docs</SelectItem>
                      <SelectItem value="employee-docs">Employee Docs</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {docsLoading ? (
                <p className="text-[#64748B] py-8 text-center">Loading documents...</p>
              ) : documents.length === 0 ? (
                <p className="text-[#64748B] py-8 text-center">No documents found.</p>
              ) : (
                <div className="rounded-md border border-[#E2E8F0] dark:border-[#232A36] overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#F8FAFC] dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                        <TableHead className="text-[#64748B] font-semibold">Name</TableHead>
                        <TableHead className="text-[#64748B] font-semibold">Type</TableHead>
                        <TableHead className="text-[#64748B] font-semibold">Category</TableHead>
                        <TableHead className="text-[#64748B] font-semibold">Size</TableHead>
                        <TableHead className="text-[#64748B] font-semibold">Uploaded By</TableHead>
                        <TableHead className="text-[#64748B] font-semibold">Date</TableHead>
                        <TableHead className="text-[#64748B] font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => (
                        <TableRow
                          key={doc.id}
                          className="border-[#E2E8F0] dark:border-[#232A36] hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]/50"
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-[#0B1F3B] dark:text-white">
                                {doc.name}
                              </span>
                            </div>
                            {doc.tags.length > 0 && (
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {doc.tags.slice(0, 3).map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="text-[10px] px-1.5 py-0 border-[#E2E8F0] dark:border-[#232A36] text-[#64748B]"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {getTypeIcon(doc.type)}
                              <span className="uppercase text-xs font-medium text-[#64748B]">
                                {doc.type}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getCategoryBadgeColor(doc.category)}>
                              {getCategoryLabel(doc.category)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[#64748B]">{formatBytes(doc.size)}</TableCell>
                          <TableCell className="text-[#0B1F3B] dark:text-white">{doc.uploadedBy}</TableCell>
                          <TableCell className="text-[#64748B]">
                            {format(new Date(doc.date), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-[#0A5ED7] hover:text-[#0A5ED7] hover:bg-[#0A5ED7]/10"
                                title="Download"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Delete"
                                onClick={() => {
                                  if (confirm(`Delete "${doc.name}"?`)) {
                                    deleteMutation.mutate(doc.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Upload Tab ───────────────────────────────────────────── */}
        <TabsContent value="upload" className="space-y-4">
          <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">Upload Document</CardTitle>
              <CardDescription className="text-[#64748B]">
                Drag and drop files or fill in document metadata
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Drag & Drop Zone (UI only) */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-lg p-10 text-center transition-colors cursor-pointer
                  ${isDragOver
                    ? "border-[#0A5ED7] bg-[#0A5ED7]/5 dark:bg-[#0A5ED7]/10"
                    : "border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7]/50"
                  }
                `}
                onClick={() => {
                  // Stub: clicking would open file picker
                  toast({ title: "File Upload", description: "File upload is a UI stub. Fill in the metadata fields below." });
                }}
              >
                <Upload className={`h-10 w-10 mx-auto mb-3 ${isDragOver ? "text-[#0A5ED7]" : "text-[#64748B]"}`} />
                {uploadedFileName ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-5 w-5 text-[#0A5ED7]" />
                    <span className="text-[#0B1F3B] dark:text-white font-medium">{uploadedFileName}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFileName("");
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-[#0B1F3B] dark:text-white font-medium">
                      Drag & drop your file here
                    </p>
                    <p className="text-sm text-[#64748B] mt-1">
                      or click to browse. Supports PDF, DOCX, XLSX, PNG, JPG
                    </p>
                  </>
                )}
              </div>

              {/* Metadata Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#0B1F3B] dark:text-white">
                    Document Name *
                  </label>
                  <Input
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    placeholder="e.g. Invoice #2024-0200"
                    className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#0B1F3B] dark:text-white">
                    Category *
                  </label>
                  <Select value={uploadCategory} onValueChange={setUploadCategory}>
                    <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                      <SelectItem value="invoices">Invoices</SelectItem>
                      <SelectItem value="contracts">Contracts</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="vehicle-docs">Vehicle Documents</SelectItem>
                      <SelectItem value="employee-docs">Employee Documents</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#0B1F3B] dark:text-white">
                    File Type
                  </label>
                  <Select value={uploadType} onValueChange={setUploadType}>
                    <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="docx">DOCX</SelectItem>
                      <SelectItem value="xlsx">XLSX</SelectItem>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="jpg">JPG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#0B1F3B] dark:text-white">
                    Tags
                  </label>
                  <Input
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    placeholder="comma-separated, e.g. invoice, toyota, service"
                    className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0B1F3B] dark:text-white">
                  Description
                </label>
                <Textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Brief description of the document..."
                  rows={3}
                  className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleUploadSubmit}
                  disabled={uploadMutation.isPending}
                  className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white px-8"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadMutation.isPending ? "Uploading..." : "Upload Document"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Categories Tab ───────────────────────────────────────── */}
        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Card
                key={cat.id}
                className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23] hover:border-[#0A5ED7] dark:hover:border-[#0A5ED7] transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${cat.color}15` }}
                    >
                      <FolderOpen className="h-5 w-5" style={{ color: cat.color }} />
                    </div>
                    <div>
                      <CardTitle className="text-base text-[#0B1F3B] dark:text-white">
                        {cat.label}
                      </CardTitle>
                      <CardDescription className="text-[#64748B] text-sm">
                        {cat.documentCount} document{cat.documentCount !== 1 ? "s" : ""}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#64748B]">Total Size</span>
                    <span className="font-semibold text-[#0B1F3B] dark:text-white">
                      {cat.totalSizeFormatted}
                    </span>
                  </div>

                  {cat.recentUploads.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide mb-2">
                        Recent Uploads
                      </p>
                      <div className="space-y-1.5">
                        {cat.recentUploads.map((upload) => (
                          <div
                            key={upload.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-[#0B1F3B] dark:text-white truncate max-w-[180px]">
                              {upload.name}
                            </span>
                            <span className="text-xs text-[#64748B]">
                              {format(new Date(upload.date), "MMM dd")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-[#E2E8F0] dark:border-[#232A36] text-[#0A5ED7]"
                    onClick={() => {
                      setCategoryFilter(cat.id);
                      setActiveTab("all");
                    }}
                  >
                    View Documents
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardPage>
  );
}
