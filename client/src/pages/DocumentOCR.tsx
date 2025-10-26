import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Edit,
  Save,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DocumentOCR() {
  const { toast } = useToast();
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("invoice");
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<any>({});

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["/api/ai/ocr-documents"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { documentType: string; fileName: string }) => {
      return await apiRequest("/api/ai/ocr-documents/upload", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/ocr-documents"] });
      toast({
        title: "Document uploaded",
        description: "OCR processing started. Results will appear shortly.",
      });
      setUploadFile(null);
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Failed to upload document for OCR processing.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest(`/api/ai/ocr-documents/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/ocr-documents"] });
      toast({
        title: "Document updated",
        description: "Extracted data has been saved successfully.",
      });
      setEditMode(false);
      setSelectedDoc(null);
    },
  });

  const handleUpload = () => {
    if (!uploadFile) return;
    
    uploadMutation.mutate({
      documentType,
      fileName: uploadFile.name,
    });
  };

  const handleSaveEdits = () => {
    if (!selectedDoc) return;
    
    updateMutation.mutate({
      id: selectedDoc.id,
      data: {
        extractedData: editedData,
        status: "approved",
      },
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "processing":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: "secondary",
      processing: "default",
      completed: "default",
      approved: "default",
      error: "destructive",
    };
    return (
      <Badge variant={variants[status] || "secondary"} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white">
            📄 Document OCR
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Automatically extract data from invoices and receipts using AI
          </p>
        </div>
      </div>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Document
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="file-upload">Select File</Label>
              <Input
                id="file-upload"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                data-testid="input-file-upload"
              />
              {uploadFile && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Selected: {uploadFile.name}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="doc-type">Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger id="doc-type" data-testid="select-document-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="receipt">Receipt</SelectItem>
                  <SelectItem value="purchase_order">Purchase Order</SelectItem>
                  <SelectItem value="estimate">Estimate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={handleUpload}
            disabled={!uploadFile || uploadMutation.isPending}
            data-testid="button-upload-document"
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload & Process"}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Processed Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No documents uploaded yet. Upload your first document to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc: any) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  data-testid={`card-document-${doc.id}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    {getStatusIcon(doc.status)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {doc.fileName || "Untitled Document"}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {doc.documentType} • {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                      {doc.extractedData?.total && (
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                          Total: ${doc.extractedData.total}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(doc.status)}
                  </div>
                  <div className="flex gap-2">
                    {doc.status === "completed" || doc.status === "approved" ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedDoc(doc);
                            setEditedData(doc.extractedData || {});
                            setEditMode(false);
                          }}
                          data-testid={`button-view-${doc.id}`}
                        >
                          View
                        </Button>
                        {doc.fileUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(doc.fileUrl, "_blank")}
                            data-testid={`button-download-${doc.id}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={selectedDoc !== null} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Extracted Data</span>
              {!editMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(true)}
                  data-testid="button-edit-data"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedDoc && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Document Type</Label>
                  <p className="text-sm font-medium capitalize">{selectedDoc.documentType}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div>{getStatusBadge(selectedDoc.status)}</div>
                </div>
              </div>

              {editMode ? (
                <div className="space-y-4 border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-vendor">Vendor/Supplier</Label>
                      <Input
                        id="edit-vendor"
                        value={editedData.vendor || ""}
                        onChange={(e) =>
                          setEditedData({ ...editedData, vendor: e.target.value })
                        }
                        data-testid="input-edit-vendor"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-date">Date</Label>
                      <Input
                        id="edit-date"
                        type="date"
                        value={editedData.date || ""}
                        onChange={(e) =>
                          setEditedData({ ...editedData, date: e.target.value })
                        }
                        data-testid="input-edit-date"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-invoice-number">Invoice/Receipt Number</Label>
                      <Input
                        id="edit-invoice-number"
                        value={editedData.invoiceNumber || ""}
                        onChange={(e) =>
                          setEditedData({ ...editedData, invoiceNumber: e.target.value })
                        }
                        data-testid="input-edit-invoice-number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-total">Total Amount</Label>
                      <Input
                        id="edit-total"
                        type="number"
                        step="0.01"
                        value={editedData.total || ""}
                        onChange={(e) =>
                          setEditedData({ ...editedData, total: e.target.value })
                        }
                        data-testid="input-edit-total"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-items">Line Items (JSON)</Label>
                    <Textarea
                      id="edit-items"
                      value={JSON.stringify(editedData.items || [], null, 2)}
                      onChange={(e) => {
                        try {
                          const items = JSON.parse(e.target.value);
                          setEditedData({ ...editedData, items });
                        } catch {}
                      }}
                      rows={6}
                      data-testid="textarea-edit-items"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-notes">Notes</Label>
                    <Textarea
                      id="edit-notes"
                      value={editedData.notes || ""}
                      onChange={(e) =>
                        setEditedData({ ...editedData, notes: e.target.value })
                      }
                      rows={3}
                      data-testid="textarea-edit-notes"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 border-t pt-4">
                  <div>
                    <Label>Vendor/Supplier</Label>
                    <p className="text-sm font-medium" data-testid="text-vendor">
                      {selectedDoc.extractedData?.vendor || "N/A"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date</Label>
                      <p className="text-sm font-medium" data-testid="text-date">
                        {selectedDoc.extractedData?.date || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label>Invoice/Receipt Number</Label>
                      <p className="text-sm font-medium" data-testid="text-invoice-number">
                        {selectedDoc.extractedData?.invoiceNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label>Total Amount</Label>
                    <p className="text-lg font-bold text-gray-900 dark:text-white" data-testid="text-total">
                      ${selectedDoc.extractedData?.total || "0.00"}
                    </p>
                  </div>
                  {selectedDoc.extractedData?.items?.length > 0 && (
                    <div>
                      <Label>Line Items</Label>
                      <div className="mt-2 space-y-2">
                        {selectedDoc.extractedData.items.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm border-b pb-1"
                            data-testid={`item-${idx}`}
                          >
                            <span>{item.description}</span>
                            <span className="font-medium">${item.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedDoc.extractedData?.notes && (
                    <div>
                      <Label>Notes</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400" data-testid="text-notes">
                        {selectedDoc.extractedData.notes}
                      </p>
                    </div>
                  )}
                  {selectedDoc.confidence && (
                    <div>
                      <Label>OCR Confidence</Label>
                      <p className="text-sm font-medium">{selectedDoc.confidence}%</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {editMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditMode(false);
                    setEditedData(selectedDoc?.extractedData || {});
                  }}
                  data-testid="button-cancel-edit"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdits}
                  disabled={updateMutation.isPending}
                  data-testid="button-save-edits"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isPending ? "Saving..." : "Save & Approve"}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setSelectedDoc(null)} data-testid="button-close">
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
